import { Injectable, Logger } from '@nestjs/common';
import { PricingInputs, PricePolicy, CostSpec, FeeSpec } from '../ai/types/pricing.types';

@Injectable()
export class GuardrailsService {
  private readonly logger = new Logger(GuardrailsService.name);

  /**
   * Применяет guardrails в строгом порядке согласно §4
   * 1. Quiet hours
   * 2. Floor/Ceiling prices
   * 3. Max daily price delta
   * 4. Min margin percentage
   * 5. Anti-churn
   */
  async applyGuardrails(
    inputs: PricingInputs,
    candidatePrice: number
  ): Promise<{ price: number; applied: string[] }> {
    const applied: string[] = [];
    let finalPrice = candidatePrice;

    // 1. Quiet hours - блокируем изменения в тихие часы
    if (this.isInQuietHours(inputs.policy.quietHours)) {
      if (inputs.lastAppliedPrice) {
        finalPrice = inputs.lastAppliedPrice.value;
        applied.push('quiet_hours');
        this.logger.log(`Тихие часы для ${inputs.offerId}, цена заблокирована: ${finalPrice} тг`);
      }
    }

    // 2. Floor/Ceiling prices - жесткие ограничения
    const floorPrice = inputs.policy.floorPrice || this.calculateFloorPrice(inputs.cost, inputs.fee);
    const ceilingPrice = inputs.policy.ceilingPrice || this.calculateCeilingPrice(inputs.latest, inputs.cost, inputs.fee);

    if (finalPrice < floorPrice) {
      finalPrice = floorPrice;
      applied.push('floor_price');
      this.logger.log(`Цена ${inputs.offerId} ограничена минимальной: ${floorPrice} тг`);
    }

    if (finalPrice > ceilingPrice) {
      finalPrice = ceilingPrice;
      applied.push('ceiling_price');
      this.logger.log(`Цена ${inputs.offerId} ограничена максимальной: ${ceilingPrice} тг`);
    }

    // 3. Max daily price delta - ограничение изменения цены в день
    if (inputs.lastAppliedPrice) {
      const maxDeltaPct = inputs.policy.maxPriceDeltaPctDay || 0.1; // 10% по умолчанию
      const currentDelta = Math.abs(finalPrice - inputs.lastAppliedPrice.value) / inputs.lastAppliedPrice.value;

      if (currentDelta > maxDeltaPct) {
        const maxDelta = inputs.lastAppliedPrice.value * maxDeltaPct;
        if (finalPrice > inputs.lastAppliedPrice.value) {
          finalPrice = inputs.lastAppliedPrice.value + maxDelta;
        } else {
          finalPrice = inputs.lastAppliedPrice.value - maxDelta;
        }
        applied.push('max_daily_delta');
        this.logger.log(`Изменение цены ${inputs.offerId} ограничено: ${(maxDeltaPct * 100).toFixed(1)}%`);
      }
    }

    // 4. Min margin percentage - минимальная маржа
    const minMarginPct = inputs.policy.minMarginPct || 0.15; // 15% по умолчанию
    const currentMarginPct = this.calculateMarginPct(finalPrice, inputs.cost, inputs.fee);

    if (currentMarginPct < minMarginPct) {
      // Ищем минимальную цену с требуемой маржей
      const minPriceForMargin = this.findMinPriceForMargin(inputs, minMarginPct);
      if (minPriceForMargin && minPriceForMargin > finalPrice) {
        finalPrice = minPriceForMargin;
        applied.push('min_margin');
        this.logger.log(`Цена ${inputs.offerId} повышена для минимальной маржи: ${(minMarginPct * 100).toFixed(1)}%`);
      }
    }

    // 5. Anti-churn - предотвращение частых изменений цены
    if (inputs.lastAppliedPrice) {
      const timeSinceLastChange = Date.now() - new Date(inputs.lastAppliedPrice.ts).getTime();
      const minChangeInterval = 6 * 60 * 60 * 1000; // 6 часов

      if (timeSinceLastChange < minChangeInterval) {
        finalPrice = inputs.lastAppliedPrice.value;
        applied.push('anti_churn');
        this.logger.log(`Изменение цены ${inputs.offerId} заблокировано (anti-churn): ${finalPrice} тг`);
      }
    }

    return {
      price: finalPrice,
      applied
    };
  }

  /**
   * Проверяет, находятся ли текущие часы в тихом периоде
   */
  private isInQuietHours(quietHours?: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // минуты с начала дня

    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      // Обычный случай: 09:00 - 18:00
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Переход через полночь: 22:00 - 06:00
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Вычисляет минимальную цену на основе затрат и комиссий
   */
  private calculateFloorPrice(cost: CostSpec, fee: FeeSpec): number {
    const totalCost = cost.buy + cost.logistics + (cost.other || 0);
    const minMargin = 0.05; // 5% минимальная маржа
    return totalCost / (1 - fee.pct - minMargin);
  }

  /**
   * Вычисляет максимальную цену на основе рыночных условий
   */
  private calculateCeilingPrice(latest: any, cost: CostSpec, fee: FeeSpec): number {
    const competitorPrice = latest.competitor?.max;
    if (competitorPrice) {
      // Максимум 20% выше конкурента
      return Math.min(competitorPrice * 1.2, competitorPrice + 100);
    }

    // Fallback: 3x от затрат
    const totalCost = cost.buy + cost.logistics + (cost.other || 0);
    return totalCost * 3;
  }

  /**
   * Вычисляет процент маржи
   */
  private calculateMarginPct(price: number, cost: CostSpec, fee: FeeSpec): number {
    const totalCost = cost.buy + cost.logistics + (cost.other || 0);
    const revenue = price * (1 - fee.pct);
    return (revenue - totalCost) / revenue;
  }

  /**
   * Находит минимальную цену с требуемой маржей
   */
  private findMinPriceForMargin(inputs: PricingInputs, minMarginPct: number): number | null {
    const totalCost = inputs.cost.buy + inputs.cost.logistics + (inputs.cost.other || 0);
    
    // Решаем уравнение: (price * (1 - fee.pct) - totalCost) / (price * (1 - fee.pct)) >= minMarginPct
    // price * (1 - fee.pct) * (1 - minMarginPct) >= totalCost
    // price >= totalCost / ((1 - fee.pct) * (1 - minMarginPct))
    
    const denominator = (1 - inputs.fee.pct) * (1 - minMarginPct);
    if (denominator <= 0) {
      return null;
    }

    const minPrice = totalCost / denominator;
    return Math.ceil(minPrice / 10) * 10; // Округляем до 10 тг
  }
}
