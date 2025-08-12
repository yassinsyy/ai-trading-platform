import { Injectable, Logger } from '@nestjs/common';
import { Snapshot } from '../types/pricing.types';

@Injectable()
export class TimeSyncUtils {
  private readonly logger = new Logger(TimeSyncUtils.name);

  // Константы для синхронизации времени
  private readonly TIME_WINDOW_MINUTES = 15; // Дискретное окно времени
  private readonly MAX_API_LAG_SECONDS = 300; // Максимальный лаг API (5 минут)

  /**
   * Нормализует временные метки к UTC и проверяет полноту данных
   * @param snapshots Массив снапшотов для проверки
   * @returns Нормализованные снапшоты с флагом полноты
   */
  normalizeAndValidateSnapshots(snapshots: Snapshot[]): Array<Snapshot & { incomplete: boolean }> {
    return snapshots.map(snapshot => {
      try {
        // Нормализуем к UTC
        const normalizedTs = this.normalizeTimestamp(snapshot.ts);
        
        // Проверяем полноту данных
        const incomplete = this.isIncompleteSnapshot(snapshot);
        
        return {
          ...snapshot,
          ts: normalizedTs,
          incomplete
        };
      } catch (error) {
        this.logger.warn(`Ошибка нормализации снапшота: ${error.message}`);
        return {
          ...snapshot,
          incomplete: true
        };
      }
    });
  }

  /**
   * Нормализует временную метку к UTC
   */
  private normalizeTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      throw new Error(`Невалидная временная метка: ${timestamp}`);
    }
    
    // Приводим к UTC
    const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    // Округляем до ближайшего временного окна
    const roundedDate = this.roundToTimeWindow(utcDate);
    
    return roundedDate.toISOString();
  }

  /**
   * Округляет время до ближайшего временного окна
   */
  private roundToTimeWindow(date: Date): Date {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / this.TIME_WINDOW_MINUTES) * this.TIME_WINDOW_MINUTES;
    
    const roundedDate = new Date(date);
    roundedDate.setMinutes(roundedMinutes, 0, 0);
    
    return roundedDate;
  }

  /**
   * Проверяет полноту снапшота
   */
  private isIncompleteSnapshot(snapshot: Snapshot): boolean {
    // Проверяем наличие обязательных полей
    if (!snapshot.ourPrice || snapshot.ourPrice <= 0) {
      return true;
    }
    
    if (!snapshot.stock || (typeof snapshot.stock === 'object' && typeof snapshot.stock.onHand !== 'number')) {
      return true;
    }
    
    // Конкурентные данные могут отсутствовать, но это не делает снапшот неполным
    // Спрос может отсутствовать на начальных этапах
    
    return false;
  }

  /**
   * Группирует снапшоты по временным окнам
   */
  groupSnapshotsByTimeWindow(
    snapshots: Array<Snapshot & { incomplete: boolean }>
  ): Map<string, Array<Snapshot & { incomplete: boolean }>> {
    const grouped = new Map<string, Array<Snapshot & { incomplete: boolean }>>();
    
    for (const snapshot of snapshots) {
      const timeWindow = this.getTimeWindowKey(snapshot.ts);
      
      if (!grouped.has(timeWindow)) {
        grouped.set(timeWindow, []);
      }
      
      grouped.get(timeWindow)!.push(snapshot);
    }
    
    return grouped;
  }

  /**
   * Получает ключ временного окна
   */
  private getTimeWindowKey(timestamp: string): string {
    const date = new Date(timestamp);
    const minutes = Math.floor(date.getMinutes() / this.TIME_WINDOW_MINUTES) * this.TIME_WINDOW_MINUTES;
    
    const windowDate = new Date(date);
    windowDate.setMinutes(minutes, 0, 0);
    
    return windowDate.toISOString();
  }

  /**
   * Агрегирует данные за день, используя только полные наблюдения
   */
  aggregateDailyData(
    snapshots: Array<Snapshot & { incomplete: boolean }>
  ): {
    date: string;
    avgPrice: number;
    avgStock: number;
    competitorData: {
      min: number;
      avg: number;
      max: number;
    } | null;
    demandData: {
      mu: number;
      sigma: number;
    } | null;
    completeObservations: number;
    totalObservations: number;
  } {
    // Фильтруем только полные наблюдения
    const completeSnapshots = snapshots.filter(s => !s.incomplete);
    
    if (completeSnapshots.length === 0) {
      throw new Error('Нет полных наблюдений для агрегации');
    }

    // Группируем по дням
    const dailyGroups = new Map<string, Array<Snapshot & { incomplete: boolean }>>();
    
    for (const snapshot of completeSnapshots) {
      const dateKey = snapshot.ts.split('T')[0]; // YYYY-MM-DD
      
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, []);
      }
      
      dailyGroups.get(dateKey)!.push(snapshot);
    }

    // Агрегируем данные для каждого дня
    const aggregatedData: Array<{
      date: string;
      avgPrice: number;
      avgStock: number;
      competitorData: {
        min: number;
        avg: number;
        max: number;
      } | null;
      demandData: {
        mu: number;
        sigma: number;
      } | null;
      completeObservations: number;
      totalObservations: number;
    }> = [];

    for (const [dateKey, daySnapshots] of dailyGroups) {
      const prices = daySnapshots.map(s => s.ourPrice);
      const stocks = daySnapshots.map(s => typeof s.stock === 'object' ? s.stock.onHand : s.stock);
      
      // Агрегируем цены
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      // Агрегируем остатки
      const avgStock = stocks.reduce((a, b) => a + b, 0) / stocks.length;
      
      // Агрегируем конкурентные данные
      const competitorSnapshots = daySnapshots.filter(s => s.competitor);
      let competitorData = null;
      
      if (competitorSnapshots.length > 0) {
        const competitorPrices = competitorSnapshots.flatMap(s => [
          s.competitor!.min,
          s.competitor!.avg,
          s.competitor!.max
        ]);
        
        competitorData = {
          min: Math.min(...competitorPrices),
          avg: competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length,
          max: Math.max(...competitorPrices)
        };
      }
      
      // Агрегируем данные о спросе
      const demandSnapshots = daySnapshots.filter(s => s.demand);
      let demandData = null;
      
      if (demandSnapshots.length > 0) {
        const demands = demandSnapshots.map(s => typeof s.demand === 'object' ? s.demand.mu : s.demand);
        const mu = demands.reduce((a, b) => a + b, 0) / demands.length;
        
        // Вычисляем стандартное отклонение
        const variance = demands.reduce((sum, d) => sum + Math.pow(d - mu, 2), 0) / demands.length;
        const sigma = Math.sqrt(variance);
        
        demandData = { mu, sigma };
      }
      
      aggregatedData.push({
        date: dateKey,
        avgPrice,
        avgStock,
        competitorData,
        demandData,
        completeObservations: daySnapshots.length,
        totalObservations: snapshots.filter(s => s.ts.startsWith(dateKey)).length
      });
    }

    // Возвращаем данные для первого дня (или можно вернуть все дни)
    return aggregatedData[0];
  }

  /**
   * Компенсирует лаги API, сдвигая временные метки
   */
  compensateApiLag(snapshots: Snapshot[], estimatedLagSeconds: number): Snapshot[] {
    if (estimatedLagSeconds <= 0 || estimatedLagSeconds > this.MAX_API_LAG_SECONDS) {
      this.logger.warn(`Подозрительный лаг API: ${estimatedLagSeconds}s, используем исходные данные`);
      return snapshots;
    }

    return snapshots.map(snapshot => {
      const originalDate = new Date(snapshot.ts);
      const compensatedDate = new Date(originalDate.getTime() + (estimatedLagSeconds * 1000));
      
      return {
        ...snapshot,
        ts: compensatedDate.toISOString()
      };
    });
  }

  /**
   * Проверяет качество временной синхронизации
   */
  validateTimeSync(snapshots: Array<Snapshot & { incomplete: boolean }>): {
    totalSnapshots: number;
    completeSnapshots: number;
    incompleteSnapshots: number;
    timeCoverage: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const totalSnapshots = snapshots.length;
    const completeSnapshots = snapshots.filter(s => !s.incomplete).length;
    const incompleteSnapshots = totalSnapshots - completeSnapshots;
    
    // Вычисляем покрытие времени
    const timeCoverage = this.calculateTimeCoverage(snapshots);
    
    // Оцениваем качество данных
    const completenessRatio = completeSnapshots / totalSnapshots;
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (completenessRatio >= 0.9) dataQuality = 'excellent';
    else if (completenessRatio >= 0.7) dataQuality = 'good';
    else if (completenessRatio >= 0.5) dataQuality = 'fair';
    else dataQuality = 'poor';
    
    // Формируем рекомендации
    const recommendations: string[] = [];
    
    if (completenessRatio < 0.7) {
      recommendations.push('Низкое качество данных: рассмотрите увеличение частоты сбора данных');
    }
    
    if (timeCoverage < 0.8) {
      recommendations.push('Пробелы во времени: проверьте стабильность API и расписание сбора данных');
    }
    
    if (incompleteSnapshots > totalSnapshots * 0.3) {
      recommendations.push('Много неполных наблюдений: проверьте API endpoints и валидацию данных');
    }
    
    return {
      totalSnapshots,
      completeSnapshots,
      incompleteSnapshots,
      timeCoverage,
      dataQuality,
      recommendations
    };
  }

  /**
   * Вычисляет покрытие времени
   */
  private calculateTimeCoverage(snapshots: Array<Snapshot & { incomplete: boolean }>): number {
    if (snapshots.length < 2) return 1.0;
    
    const sortedSnapshots = snapshots
      .filter(s => !s.incomplete)
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    
    if (sortedSnapshots.length < 2) return 0.0;
    
    const startTime = new Date(sortedSnapshots[0].ts).getTime();
    const endTime = new Date(sortedSnapshots[sortedSnapshots.length - 1].ts).getTime();
    const totalDuration = endTime - startTime;
    
    if (totalDuration === 0) return 1.0;
    
    // Вычисляем общую длительность временных окон
    const windowDuration = this.TIME_WINDOW_MINUTES * 60 * 1000; // в миллисекундах
    const expectedWindows = Math.ceil(totalDuration / windowDuration);
    
    // Подсчитываем уникальные временные окна
    const uniqueWindows = new Set<string>();
    for (const snapshot of sortedSnapshots) {
      uniqueWindows.add(this.getTimeWindowKey(snapshot.ts));
    }
    
    return uniqueWindows.size / expectedWindows;
  }

  /**
   * Создает временные ряды с равномерными интервалами
   */
  createUniformTimeSeries(
    snapshots: Array<Snapshot & { incomplete: boolean }>,
    intervalMinutes: number = this.TIME_WINDOW_MINUTES
  ): Array<{
    timestamp: string;
    data: (Snapshot & { incomplete: boolean }) | null;
    interpolated: boolean;
  }> {
    if (snapshots.length === 0) return [];
    
    const sortedSnapshots = snapshots
      .filter(s => !s.incomplete)
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    
    if (sortedSnapshots.length === 0) return [];
    
    const startTime = new Date(sortedSnapshots[0].ts);
    const endTime = new Date(sortedSnapshots[sortedSnapshots.length - 1].ts);
    
    const timeSeries: Array<{
      timestamp: string;
      data: (Snapshot & { incomplete: boolean }) | null;
      interpolated: boolean;
    }> = [];
    
    let currentTime = new Date(startTime);
    
    while (currentTime <= endTime) {
      const timestamp = currentTime.toISOString();
      
      // Ищем ближайший снапшот
      const nearestSnapshot = this.findNearestSnapshot(currentTime, sortedSnapshots);
      
      if (nearestSnapshot && this.isWithinTimeWindow(currentTime, nearestSnapshot.ts, intervalMinutes)) {
        timeSeries.push({
          timestamp,
          data: nearestSnapshot,
          interpolated: false
        });
      } else {
        // Интерполируем данные
        const interpolatedData = this.interpolateSnapshot(currentTime, sortedSnapshots);
        timeSeries.push({
          timestamp,
          data: interpolatedData,
          interpolated: true
        });
      }
      
      // Переходим к следующему временному окну
      currentTime = new Date(currentTime.getTime() + (intervalMinutes * 60 * 1000));
    }
    
    return timeSeries;
  }

  /**
   * Находит ближайший снапшот по времени
   */
  private findNearestSnapshot(
    targetTime: Date,
    snapshots: Array<Snapshot & { incomplete: boolean }>
  ): (Snapshot & { incomplete: boolean }) | null {
    if (snapshots.length === 0) return null;
    
    let nearest = snapshots[0];
    let minDiff = Math.abs(targetTime.getTime() - new Date(nearest.ts).getTime());
    
    for (const snapshot of snapshots) {
      const diff = Math.abs(targetTime.getTime() - new Date(snapshot.ts).getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearest = snapshot;
      }
    }
    
    return nearest;
  }

  /**
   * Проверяет, находится ли время в пределах временного окна
   */
  private isWithinTimeWindow(
    time1: Date,
    time2: string,
    windowMinutes: number
  ): boolean {
    const diff = Math.abs(time1.getTime() - new Date(time2).getTime());
    return diff <= (windowMinutes * 60 * 1000);
  }

  /**
   * Интерполирует снапшот для заданного времени
   */
  private interpolateSnapshot(
    targetTime: Date,
    snapshots: Array<Snapshot & { incomplete: boolean }>
  ): (Snapshot & { incomplete: boolean }) | null {
    if (snapshots.length < 2) return null;
    
    // Находим два ближайших снапшота
    const sortedSnapshots = snapshots.sort((a, b) => 
      new Date(a.ts).getTime() - new Date(b.ts).getTime()
    );
    
    let beforeSnapshot: (Snapshot & { incomplete: boolean }) | null = null;
    let afterSnapshot: (Snapshot & { incomplete: boolean }) | null = null;
    
    for (let i = 0; i < sortedSnapshots.length - 1; i++) {
      const current = sortedSnapshots[i];
      const next = sortedSnapshots[i + 1];
      
      const currentTime = new Date(current.ts).getTime();
      const nextTime = new Date(next.ts).getTime();
      const targetTimeMs = targetTime.getTime();
      
      if (currentTime <= targetTimeMs && targetTimeMs <= nextTime) {
        beforeSnapshot = current;
        afterSnapshot = next;
        break;
      }
    }
    
    if (!beforeSnapshot || !afterSnapshot) return null;
    
    // Линейная интерполяция
    const beforeTime = new Date(beforeSnapshot.ts).getTime();
    const afterTime = new Date(afterSnapshot.ts).getTime();
    const targetTimeMs = targetTime.getTime();
    const weight = (targetTimeMs - beforeTime) / (afterTime - beforeTime);
    
    const interpolatedSnapshot: Snapshot & { incomplete: boolean } = {
      ts: targetTime.toISOString(),
      ourPrice: this.interpolateValue(
        beforeSnapshot.ourPrice,
        afterSnapshot.ourPrice,
        weight
      ),
      competitor: beforeSnapshot.competitor && afterSnapshot.competitor ? {
        min: this.interpolateValue(
          beforeSnapshot.competitor.min,
          afterSnapshot.competitor.min,
          weight
        ),
        avg: this.interpolateValue(
          beforeSnapshot.competitor.avg,
          afterSnapshot.competitor.avg,
          weight
        ),
        max: this.interpolateValue(
          beforeSnapshot.competitor.max,
          afterSnapshot.competitor.max,
          weight
        )
      } : null,
      stock: {
        onHand: this.interpolateValue(
          typeof beforeSnapshot.stock === 'number' ? beforeSnapshot.stock : beforeSnapshot.stock.onHand,
          typeof afterSnapshot.stock === 'number' ? afterSnapshot.stock : afterSnapshot.stock.onHand,
          weight
        ),
        reserved: this.interpolateValue(
          typeof beforeSnapshot.stock === 'number' ? 0 : beforeSnapshot.stock.reserved,
          typeof afterSnapshot.stock === 'number' ? 0 : afterSnapshot.stock.reserved,
          weight
        ),
        city: (typeof beforeSnapshot.stock === 'number' ? undefined : beforeSnapshot.stock.city) || 
              (typeof afterSnapshot.stock === 'number' ? undefined : afterSnapshot.stock.city)
      },
      demand: beforeSnapshot.demand && afterSnapshot.demand ? {
        mu: this.interpolateValue(
          typeof beforeSnapshot.demand === 'number' ? beforeSnapshot.demand : beforeSnapshot.demand.mu,
          typeof afterSnapshot.demand === 'number' ? afterSnapshot.demand : afterSnapshot.demand.mu,
          weight
        ),
        sigma: this.interpolateValue(
          typeof beforeSnapshot.demand === 'number' ? 0 : beforeSnapshot.demand.sigma,
          typeof afterSnapshot.demand === 'number' ? 0 : afterSnapshot.demand.sigma,
          weight
        )
      } : undefined,
      incomplete: false
    };
    
    return interpolatedSnapshot;
  }

  /**
   * Интерполирует числовое значение
   */
  private interpolateValue(value1: number, value2: number, weight: number): number {
    return value1 * (1 - weight) + value2 * weight;
  }
}
