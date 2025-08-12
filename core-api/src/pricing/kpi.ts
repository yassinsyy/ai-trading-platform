import { Injectable, Logger } from '@nestjs/common';
import { PricingInputs, CostSpec, FeeSpec, Snapshot } from '../ai/types/pricing.types';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);

  /**
   * Оценивает KPI для ценообразования согласно §2.2 и §11.4
   */
  async estimateKPIs(
    inputs: PricingInputs,
    price: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{
    marginPct: number;
    expectedUnits: number;
    expectedProfit: number;
    daysOfCover: number;
    turnoverSpeed: number;
    riskMetrics: {
      var95: number;
      cvar95: number;
      maxDrawdown: number;
    };
  }> {
    // 1. Базовая маржа
    const marginPct = this.calculateMarginPct(price, inputs.cost, inputs.fee);
    
    // 2. Ожидаемые продажи (ограничены остатком)
    const expectedUnits = await this.estimateExpectedUnits(inputs, price, history);
    const constrainedUnits = Math.min(expectedUnits, typeof inputs.latest.stock === 'object' ? inputs.latest.stock.onHand : inputs.latest.stock);
    
    // 3. Ожидаемая прибыль
    const expectedProfit = await this.calculateExpectedProfit(inputs, price, constrainedUnits, history);
    
    // 4. Days of Cover (DoC)
    const daysOfCover = (typeof inputs.latest.stock === 'object' ? inputs.latest.stock.onHand : inputs.latest.stock) / expectedUnits;
    
    // 5. Скорость оборачиваемости
    const turnoverSpeed = this.calculateTurnoverSpeed(inputs, expectedUnits);
    
    // 6. Метрики риска
    const riskMetrics = await this.calculateRiskMetrics(inputs, price, history);

    return {
      marginPct,
      expectedUnits: constrainedUnits,
      expectedProfit,
      daysOfCover,
      turnoverSpeed,
      riskMetrics
    };
  }

  /**
   * Вычисляет процент маржи согласно §2.2
   */
  private calculateMarginPct(price: number, cost: CostSpec, fee: FeeSpec): number {
    const totalCost = cost.buy + cost.logistics + (cost.other || 0);
    const revenue = price * (1 - fee.pct);
    return (revenue - totalCost) / revenue;
  }

  /**
   * Оценивает ожидаемые продажи с учетом спроса и остатков
   */
  private async estimateExpectedUnits(
    inputs: PricingInputs,
    price: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<number> {
    // Упрощенная оценка спроса на основе исторических данных
    const recentHistory = history
      .filter(s => !s.incomplete)
      .slice(-30); // Последние 30 наблюдений

    if (recentHistory.length === 0) {
      return (typeof inputs.latest.stock === 'object' ? inputs.latest.stock.onHand : inputs.latest.stock) * 0.1; // 10% от остатка как fallback
    }

    // Агрегируем данные по дням
    const dailyData = new Map<string, { demand: number; count: number }>();
    
    for (const snapshot of recentHistory) {
      const date = snapshot.ts.split('T')[0];
      const current = dailyData.get(date) || { demand: 0, count: 0 };
      
      // Оцениваем спрос на основе изменения остатков
      const currentStock = typeof snapshot.stock === 'object' ? snapshot.stock.onHand : snapshot.stock;
      const latestStock = typeof inputs.latest.stock === 'object' ? inputs.latest.stock.onHand : inputs.latest.stock;
      if (currentStock < latestStock) {
        current.demand += latestStock - currentStock;
      }
      current.count++;
      
      dailyData.set(date, current);
    }

    // Вычисляем средний дневной спрос
    let totalDemand = 0;
    let totalDays = 0;
    
    for (const { demand, count } of dailyData.values()) {
      if (count > 0) {
        totalDemand += demand / count;
        totalDays++;
      }
    }

    const avgDailyDemand = totalDays > 0 ? totalDemand / totalDays : 0;
    
    // Корректируем спрос на основе цены (эластичность)
    const priceElasticity = -0.5; // Примерная эластичность
    const basePrice = inputs.latest.ourPrice;
    const priceRatio = price / basePrice;
    const demandMultiplier = Math.pow(priceRatio, priceElasticity);
    
    return avgDailyDemand * demandMultiplier;
  }

  /**
   * Вычисляет ожидаемую прибыль согласно §2.2
   */
  private async calculateExpectedProfit(
    inputs: PricingInputs,
    price: number,
    units: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<number> {
    const totalCost = inputs.cost.buy + inputs.cost.logistics + (inputs.cost.other || 0);
    const revenue = price * units * (1 - inputs.fee.pct);
    const cost = totalCost * units;
    
    // Учитываем комиссии маркетплейса
    const marketplaceFees = price * units * inputs.fee.pct;
    
    // Учитываем стоимость хранения
    const holdingDays = this.estimateHoldingDays(inputs, units);
    const storageCost = (inputs.fee.storagePerUnitDay || 0) * units * holdingDays;
    
    // Учитываем фиксированные комиссии за заказ
    const orderFees = (inputs.fee.perOrderFixed || 0) * Math.ceil(units / 10); // Предполагаем 10 единиц на заказ
    
    return revenue - cost - marketplaceFees - storageCost - orderFees;
  }

  /**
   * Оценивает время хранения товара
   */
  private estimateHoldingDays(inputs: PricingInputs, expectedUnits: number): number {
    const stockLevel = typeof inputs.latest.stock === 'object' ? inputs.latest.stock.onHand : inputs.latest.stock;
    const dailyDemand = expectedUnits / 30; // Предполагаем месячный горизонт
    
    if (dailyDemand <= 0) {
      return 365; // Год если нет спроса
    }
    
    return stockLevel / dailyDemand;
  }

  /**
   * Вычисляет скорость оборачиваемости
   */
  private calculateTurnoverSpeed(inputs: PricingInputs, expectedUnits: number): number {
    const stockLevel = typeof inputs.latest.stock === 'object' ? inputs.latest.stock.onHand : inputs.latest.stock;
    const monthlyDemand = expectedUnits * 30 / 30; // Месячный спрос
    
    if (monthlyDemand <= 0) {
      return 0;
    }
    
    return monthlyDemand / stockLevel; // Оборотов в месяц
  }

  /**
   * Вычисляет метрики риска (VaR, CVaR, Max Drawdown)
   */
  private async calculateRiskMetrics(
    inputs: PricingInputs,
    price: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<{
    var95: number;
    cvar95: number;
    maxDrawdown: number;
  }> {
    // Генерируем сценарии прибыли
    const profitScenarios = await this.generateProfitScenarios(inputs, price, history);
    
    // Сортируем сценарии по убыванию
    profitScenarios.sort((a, b) => b - a);
    
    // Вычисляем VaR (95%)
    const varIndex = Math.floor(profitScenarios.length * 0.05);
    const var95 = profitScenarios[varIndex] || 0;
    
    // Вычисляем CVaR (95%) - среднее значение в хвосте
    const tailScenarios = profitScenarios.slice(0, varIndex);
    const cvar95 = tailScenarios.length > 0 
      ? tailScenarios.reduce((sum, val) => sum + val, 0) / tailScenarios.length 
      : 0;
    
    // Вычисляем максимальную просадку
    const maxDrawdown = this.calculateMaxDrawdown(profitScenarios);
    
    return {
      var95,
      cvar95,
      maxDrawdown
    };
  }

  /**
   * Генерирует сценарии прибыли для анализа рисков
   */
  private async generateProfitScenarios(
    inputs: PricingInputs,
    price: number,
    history: Array<Snapshot & { incomplete: boolean }>
  ): Promise<number[]> {
    const scenarios: number[] = [];
    const numScenarios = 1000;
    
    // Базовые параметры
    const baseUnits = await this.estimateExpectedUnits(inputs, price, history);
    const baseProfit = await this.calculateExpectedProfit(inputs, price, baseUnits, history);
    
    for (let i = 0; i < numScenarios; i++) {
      // Генерируем случайные отклонения
      const demandShock = this.randomNormal(1, 0.3); // ±30% отклонение спроса
      const priceShock = this.randomNormal(1, 0.1); // ±10% отклонение цены
      const costShock = this.randomNormal(1, 0.15); // ±15% отклонение затрат
      
      // Применяем шоки
      const adjustedUnits = baseUnits * demandShock;
      const adjustedPrice = price * priceShock;
      const adjustedCost = {
        ...inputs.cost,
        buy: inputs.cost.buy * costShock,
        logistics: inputs.cost.logistics * costShock
      };
      
      // Вычисляем прибыль для сценария
      const scenarioProfit = await this.calculateExpectedProfit(
        { ...inputs, cost: adjustedCost },
        adjustedPrice,
        adjustedUnits,
        history
      );
      
      scenarios.push(scenarioProfit);
    }
    
    return scenarios;
  }

  /**
   * Вычисляет максимальную просадку
   */
  private calculateMaxDrawdown(scenarios: number[]): number {
    let maxDrawdown = 0;
    let peak = -Infinity;
    
    for (const value of scenarios) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  /**
   * Генерирует случайное число с нормальным распределением
   */
  private randomNormal(mean: number, stdDev: number): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}
