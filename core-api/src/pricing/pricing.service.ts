import { Injectable, Logger } from '@nestjs/common';
import { 
  PricingInputs, 
  PricingDecision, 
  PricePolicy,
  CostSpec,
  FeeSpec,
  Snapshot
} from '../ai/types/pricing.types';
import { LogLinearDemandModel } from '../ai/demand/loglinear.model';
import { PiecewiseDemandModel } from '../ai/demand/piecewise.model';
import { TimeSyncUtils } from '../ai/demand/time-sync.utils';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  
  // Константы
  private readonly PRICE_GRID_STEP = 10; // Шаг сетки цен в тенге
  private readonly DEFAULT_MAX_DELTA_PCT_DAY = 0.1; // 10% по умолчанию
  private readonly DEFAULT_MIN_MARGIN_PCT = 0.15; // 15% по умолчанию

  constructor(
    private readonly logLinearDemandModel: LogLinearDemandModel,
    private readonly piecewiseDemandModel: PiecewiseDemandModel,
    private readonly timeSyncUtils: TimeSyncUtils
  ) {}

  /**
   * Основная функция вычисления цены согласно §11.1
   */
  async computePricing(inputs: PricingInputs): Promise<PricingDecision> {
    try {
      this.logger.log(`Вычисление цены для оффера ${inputs.offerId}`);

      // Синхронизируем время и валидируем данные
      const normalizedHistory = this.timeSyncUtils.normalizeAndValidateSnapshots(inputs.history);
      const timeSyncQuality = this.timeSyncUtils.validateTimeSync(normalizedHistory);
      
      if (timeSyncQuality.dataQuality === 'poor') {
        this.logger.warn(`Низкое качество данных для оффера ${inputs.offerId}: ${timeSyncQuality.recommendations.join(', ')}`);
      }

      // Строим сетку цен
      const priceGrid = this.buildPriceGrid(
        inputs.policy.floorPrice || this.calculateFloorPrice(inputs.cost, inputs.fee),
        inputs.policy.ceilingPrice || this.calculateCeilingPrice(inputs.latest, inputs.cost, inputs.fee)
      );

      // Выбираем кандидата по политике
      const candidate = await this.chooseCandidateByPolicy(inputs, priceGrid, normalizedHistory);
      
      // Применяем guardrails
      const guarded = await this.applyGuardrails(inputs, candidate.price);
      
      // Оцениваем KPI
      const kpis = await this.estimateKPIs(inputs, guarded.price, normalizedHistory);
      
      // Формируем решение
      const decision: PricingDecision = {
        offerId: inputs.offerId,
        recommendedPrice: guarded.price,
        reasons: candidate.reasons,
        guardrailsApplied: guarded.applied,
        kpis
      };

      this.logger.log(`Рекомендуемая цена для ${inputs.offerId}: ${guarded.price} тг (${guarded.applied.join(', ')})`);
      
      return decision;

    } catch (error) {
      this.logger.error(`Ошибка вычисления цены для ${inputs.offerId}:`, error);
      throw error;
    }
  }

  /**
   * Строит сетку цен для оптимизации
   */
  private buildPriceGrid(floorPrice: number, ceilingPrice: number): number[] {
    const grid: number[] = [];
    
    for (let price = floorPrice; price <= ceilingPrice; price += this.PRICE_GRID_STEP) {
      grid.push(price);
    }
    
    // Добавляем ceiling если не попали в сетку
    if (grid[grid.length - 1] !== ceilingPrice) {
      grid.push(ceilingPrice);
    }
    
    return grid;
  }

  /**
   * Выбирает кандидата по политике согласно §11.2
   */
  private async chooseCandidateByPolicy(
    inputs: PricingInputs,
    priceGrid: number[],
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{ price: number; reasons: string[] }> {
    switch (inputs.policy.mode) {
      case 'FOLLOW_MIN_COMPETITOR':
        return await this.followMinCompetitor(inputs, priceGrid);
      case 'MARGIN_TARGET':
        return await this.marginTarget(inputs, priceGrid, history);
      case 'STOCK_SENSITIVE':
        return await this.stockSensitive(inputs, priceGrid, history);
      case 'CLEARANCE':
        return await this.stockSensitive(inputs, priceGrid, history);
      case 'AI':
        return await this.portfolioAware(inputs, priceGrid, history);
      case 'MANUAL':
      default:
        return this.manualOrFallback(inputs);
    }
  }

  /**
   * Стратегия FOLLOW_MIN_COMPETITOR согласно §3.1
   */
  private async followMinCompetitor(inputs: PricingInputs, priceGrid: number[]): Promise<{ price: number; reasons: string[] }> {
    const competitorPrice = inputs.latest.competitor?.min;
    
    if (!competitorPrice) {
      this.logger.warn(`Нет данных о конкурентах для ${inputs.offerId}, используем fallback`);
      return await this.marginTarget(inputs, priceGrid, []);
    }

    // Цена чуть ниже конкурента
    const targetPrice = Math.max(
      competitorPrice - 10, // 10 тг ниже
      inputs.policy.floorPrice || this.calculateFloorPrice(inputs.cost, inputs.fee)
    );

    // Находим ближайшую цену в сетке
    const recommendedPrice = this.findNearestPrice(targetPrice, priceGrid);

    return {
      price: recommendedPrice,
      reasons: [
        `Следование минимальной цене конкурента: ${competitorPrice} тг`,
        `Целевая цена: ${targetPrice} тг`,
        `Рекомендуемая цена: ${recommendedPrice} тг`
      ]
    };
  }

  /**
   * Стратегия MARGIN_TARGET согласно §3.2
   */
  private async marginTarget(
    inputs: PricingInputs,
    priceGrid: number[],
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{ price: number; reasons: string[] }> {
    const minMarginPct = inputs.policy.minMarginPct || this.DEFAULT_MIN_MARGIN_PCT;
    let bestPrice = priceGrid[0];
    let bestProfit = -Infinity;

    // Сканируем сетку цен
    for (const price of priceGrid) {
      const marginPct = this.calculateMarginPct(price, inputs.cost, inputs.fee);
      
      if (marginPct >= minMarginPct) {
        const profit = await this.calculateExpectedProfit(inputs, price, history);
        
        if (profit > bestProfit) {
          bestProfit = profit;
          bestPrice = price;
        }
      }
    }

    if (bestProfit === -Infinity) {
      this.logger.warn(`Не удалось найти цену с минимальной маржей ${minMarginPct * 100}% для ${inputs.offerId}`);
      // Fallback на минимальную цену с требуемой маржей
      bestPrice = this.findMinPriceForMargin(inputs, minMarginPct);
    }

    return {
      price: bestPrice,
      reasons: [
        `Целевая маржа: ${(minMarginPct * 100).toFixed(1)}%`,
        `Ожидаемая прибыль: ${bestProfit.toFixed(2)} тг`,
        `Оптимальная цена: ${bestPrice} тг`
      ]
    };
  }

  /**
   * Стратегия STOCK_SENSITIVE согласно §3.3
   */
  private async stockSensitive(
    inputs: PricingInputs,
    priceGrid: number[],
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{ price: number; reasons: string[] }> {
    const stockLevel = typeof inputs.latest.stock === 'number' ? inputs.latest.stock : inputs.latest.stock.onHand;
    const demandForecast = await this.forecastDemand(inputs.latest.ourPrice, inputs.latest.competitor?.min || null, inputs.latest.ts, history);
    
    // Вычисляем Days of Cover (DoC)
    const daysOfCover = stockLevel / demandForecast.expected;
    const targetDoC = 30; // Целевой запас на 30 дней
    
    let bestPrice = priceGrid[0];
    let bestScore = -Infinity;
    const lambda = 0.1; // Вес штрафа за высокий DoC

    for (const price of priceGrid) {
      const profit = await this.calculateExpectedProfit(inputs, price, history);
      const demandAtPrice = await this.forecastDemand(price, inputs.latest.competitor?.min || null, inputs.latest.ts, history);
      const docAtPrice = stockLevel / demandAtPrice.expected;
      
      // Штраф за высокий DoC
      const docPenalty = Math.max(0, docAtPrice - targetDoC) * lambda;
      const score = profit - docPenalty;

      if (score > bestScore) {
        bestScore = score;
        bestPrice = price;
      }
    }

    return {
      price: bestPrice,
      reasons: [
        `Текущий DoC: ${daysOfCover.toFixed(1)} дней`,
        `Целевой DoC: ${targetDoC} дней`,
        `Оптимизированная цена: ${bestPrice} тг`,
        `Ожидаемый DoC: ${(stockLevel / (await this.forecastDemand(bestPrice, inputs.latest.competitor?.min || null, inputs.latest.ts, history)).expected).toFixed(1)} дней`
      ]
    };
  }

  /**
   * AI-режим с портфельной оптимизацией (заглушка для §5)
   */
  private async portfolioAware(
    inputs: PricingInputs,
    priceGrid: number[],
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{ price: number; reasons: string[] }> {
    // TODO: Реализовать портфельную оптимизацию
    this.logger.log(`AI режим для ${inputs.offerId} - используем stock-sensitive как fallback`);
    return this.stockSensitive(inputs, priceGrid, history);
  }

  /**
   * Fallback для ручного режима
   */
  private manualOrFallback(inputs: PricingInputs): { price: number; reasons: string[] } {
    const lastPrice = inputs.lastAppliedPrice?.value || inputs.latest.ourPrice;
    
    return {
      price: lastPrice,
      reasons: [
        'Ручной режим - цена не изменяется',
        `Текущая цена: ${lastPrice} тг`
      ]
    };
  }

  /**
   * Применение guardrails согласно §4 и §11.3
   */
  private async applyGuardrails(
    inputs: PricingInputs,
    candidatePrice: number
  ): Promise<{ price: number; applied: string[] }> {
    const applied: string[] = [];
    let price = candidatePrice;

    // 1. Quiet hours
    if (this.isInQuietHours(inputs.policy.quietHours)) {
      const lastPrice = inputs.lastAppliedPrice?.value || inputs.latest.ourPrice;
      this.logger.log(`Quiet hours для ${inputs.offerId}, откладываем изменение цены`);
      return {
        price: lastPrice,
        applied: ['quiet_hours_defer']
      };
    }

    // 2. Floor/Ceiling
    const floorPrice = inputs.policy.floorPrice || this.calculateFloorPrice(inputs.cost, inputs.fee);
    const ceilingPrice = inputs.policy.ceilingPrice || this.calculateCeilingPrice(inputs.latest, inputs.cost, inputs.fee);
    
    if (price < floorPrice) {
      price = floorPrice;
      applied.push('clip_floor');
    } else if (price > ceilingPrice) {
      price = ceilingPrice;
      applied.push('clip_ceiling');
    }

    // 3. Max delta/day
    const lastPrice = inputs.lastAppliedPrice?.value || inputs.latest.ourPrice;
    const maxDeltaPct = inputs.policy.maxPriceDeltaPctDay || this.DEFAULT_MAX_DELTA_PCT_DAY;
    
    if (Math.abs(price - lastPrice) / lastPrice > maxDeltaPct) {
      const direction = price > lastPrice ? 1 : -1;
      price = lastPrice * (1 + direction * maxDeltaPct);
      applied.push('max_delta_limit');
    }

    // 4. Min margin pct
    const minMarginPct = inputs.policy.minMarginPct || this.DEFAULT_MIN_MARGIN_PCT;
    const currentMarginPct = this.calculateMarginPct(price, inputs.cost, inputs.fee);
    
    if (currentMarginPct < minMarginPct) {
      const minPriceForMargin = this.findMinPriceForMargin(inputs, minMarginPct);
      
      if (minPriceForMargin && minPriceForMargin <= ceilingPrice) {
        price = Math.max(price, minPriceForMargin);
        applied.push('raise_to_min_margin');
      } else {
        this.logger.warn(`Не удается достичь минимальной маржи ${(minMarginPct * 100).toFixed(1)}% для ${inputs.offerId}`);
        applied.push('min_margin_block');
        // Возвращаем последнюю примененную цену
        price = lastPrice;
      }
    }

    // 5. Anti-churn (минимальный шаг)
    const minStep = 5; // 5 тг
    if (Math.abs(price - lastPrice) < minStep) {
      price = lastPrice;
      applied.push('anti_churn_min_step');
    }

    return { price, applied };
  }

  /**
   * Оценка KPI согласно §11.4
   */
  private async estimateKPIs(
    inputs: PricingInputs,
    price: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{
    marginPct: number;
    expectedUnits: number;
    expectedProfit: number;
  }> {
    // Прогнозируем спрос
    const demandForecast = await this.forecastDemand(price, inputs.latest.competitor?.min || null, inputs.latest.ts, history);
    
    // Ограничиваем продажи наличием на складе
    const expectedUnits = Math.min(demandForecast.expected, typeof inputs.latest.stock === 'number' ? inputs.latest.stock : inputs.latest.stock.onHand);
    
    // Вычисляем маржу и прибыль
    const marginPct = this.calculateMarginPct(price, inputs.cost, inputs.fee);
    const marginUnit = price * (1 - inputs.fee.pct) - (inputs.cost.buy + inputs.cost.logistics + (inputs.fee.perOrderFixed || 0));
    const expectedProfit = expectedUnits * marginUnit;
    
    // Штраф за хранение
    const holdingCost = (inputs.fee.storagePerUnitDay || 0) * this.estimateHoldingDays(inputs, expectedUnits);
    const netProfit = expectedProfit - holdingCost;

    return {
      marginPct: marginPct * 100,
      expectedUnits,
      expectedProfit: netProfit
    };
  }

  /**
   * Вспомогательные методы
   */
  private calculateFloorPrice(cost: CostSpec, fee: FeeSpec): number {
    const totalCost = cost.buy + cost.logistics + (cost.other || 0);
    const minMarginPct = this.DEFAULT_MIN_MARGIN_PCT;
    return totalCost / (1 - fee.pct - minMarginPct);
  }

  private calculateCeilingPrice(latest: Snapshot, cost: CostSpec, fee: FeeSpec): number {
    const competitorPrice = latest.competitor?.max;
    if (competitorPrice) {
      return competitorPrice * 1.2; // 20% выше максимальной цены конкурента
    }
    return this.calculateFloorPrice(cost, fee) * 3; // 3x от минимальной цены
  }

  private calculateMarginPct(price: number, cost: CostSpec, fee: FeeSpec): number {
    const totalCost = cost.buy + cost.logistics + (cost.other || 0);
    const margin = price * (1 - fee.pct) - totalCost;
    return margin / price;
  }

  private findMinPriceForMargin(inputs: PricingInputs, minMarginPct: number): number | null {
    const totalCost = inputs.cost.buy + inputs.cost.logistics + (inputs.cost.other || 0);
    const minPrice = totalCost / (1 - inputs.fee.pct - minMarginPct);
    
    if (minPrice <= (inputs.policy.ceilingPrice || Infinity)) {
      return minPrice;
    }
    
    return null;
  }

  private findNearestPrice(targetPrice: number, priceGrid: number[]): number {
    let nearest = priceGrid[0];
    let minDiff = Math.abs(targetPrice - nearest);
    
    for (const price of priceGrid) {
      const diff = Math.abs(targetPrice - price);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = price;
      }
    }
    
    return nearest;
  }

  private isInQuietHours(quietHours?: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours?.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes <= endMinutes) {
      return currentTime >= startMinutes && currentTime <= endMinutes;
    } else {
      // Переход через полночь
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
  }

  private async forecastDemand(
    price: number,
    competitorPrice: number | null,
    timestamp: string,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{ expected: number }> {
    try {
      // Пытаемся использовать лог-линейную модель
      if (history.length >= 10) {
        const modelParams = await this.logLinearDemandModel.trainModel(history.map(h => ({ ...h, demand: h.demand || { mu: 0, sigma: 0 } })));
        const forecast = await this.logLinearDemandModel.forecastDemand(price, competitorPrice, timestamp, 1, modelParams);
        return { expected: forecast.expected };
      }
      
      // Fallback на кусочную модель
      if (this.piecewiseDemandModel.isSuitable(history)) {
        const forecast = await this.piecewiseDemandModel.forecastDemand(price, history.map(h => ({ ...h, demand: h.demand || { mu: 0, sigma: 0 } })));
        return { expected: forecast.expected };
      }
      
      // Простой fallback
      return { expected: 1.0 };
      
    } catch (error) {
      this.logger.warn(`Ошибка прогнозирования спроса: ${error.message}, используем fallback`);
      return { expected: 1.0 };
    }
  }

  private async calculateExpectedProfit(
    inputs: PricingInputs,
    price: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<number> {
    const demandForecast = await this.forecastDemand(price, inputs.latest.competitor?.min || null, inputs.latest.ts, history);
    const units = Math.min(demandForecast.expected, typeof inputs.latest.stock === 'number' ? inputs.latest.stock : inputs.latest.stock.onHand);
    const marginUnit = price * (1 - inputs.fee.pct) - (inputs.cost.buy + inputs.cost.logistics + (inputs.fee.perOrderFixed || 0));
    
    return units * marginUnit;
  }

  private estimateHoldingDays(inputs: PricingInputs, expectedUnits: number): number {
    const stockLevel = typeof inputs.latest.stock === 'number' ? inputs.latest.stock : inputs.latest.stock.onHand;
    if (expectedUnits === 0) return 0;
    
    // Оценка дней хранения на основе текущего спроса
    const dailyDemand = expectedUnits / 30; // Предполагаем месячный горизонт
    
    if (dailyDemand <= 0) return 0;
    
    return stockLevel / dailyDemand;
  }

  /**
   * Получает рекомендации по ценообразованию для оффера
   */
  async getPricingRecommendations(offerId: string): Promise<any> {
    // Заглушка для совместимости
    return {
      recommendedPrice: 1000,
      confidence: 0.8,
      reasons: ['Базовая рекомендация']
    };
  }

  /**
   * Вычисляет и применяет новую цену для оффера
   */
  async computeAndApply(offerId: string, applyPricingDto: any): Promise<any> {
    this.logger.log(`Применение цены для оффера ${offerId}: ${applyPricingDto.newPrice} тг`);

    // TODO: Получить реальные данные оффера из БД
    // Пока используем mock данные для демонстрации
    const mockOffer = {
      id: offerId,
      currentPrice: 1500,
      product: {
        name: 'Тестовый товар',
        sku: 'TEST-001'
      }
    };

    const oldPrice = mockOffer.currentPrice;
    const newPrice = applyPricingDto.newPrice;
    const priceChange = newPrice - oldPrice;
    const priceChangePercent = ((newPrice - oldPrice) / oldPrice) * 100;

    // Вычисляем KPI
    const margin = newPrice * 0.15; // 15% маржа
    const marginPercent = 15;
    const roi = (margin / oldPrice) * 100;

    const result = {
      ok: true,
      offerId,
      oldPrice,
      newPrice,
      priceChange,
      priceChangePercent,
      reason: applyPricingDto.reason || 'Manual adjustment',
      priority: applyPricingDto.priority || 3,
      guardrailsApplied: ['min_price', 'max_price'],
      kpis: {
        margin,
        marginPercent,
        roi
      },
      appliedAt: new Date().toISOString()
    };

    this.logger.log(`Цена применена: ${oldPrice} → ${newPrice} тг (${priceChangePercent.toFixed(1)}%)`);

    // TODO: Emit WebSocket event
    // this.pricingGateway.emit('price.updated', { offerId, oldPrice, newPrice });

    return result;
  }
}
