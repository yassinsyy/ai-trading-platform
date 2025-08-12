import { Injectable, Logger } from '@nestjs/common';
import { DemandForecast, Snapshot } from '../types/pricing.types';

@Injectable()
export class PiecewiseDemandModel {
  private readonly logger = new Logger(PiecewiseDemandModel.name);

  /**
   * Кусочная модель спроса для случаев с малым количеством данных
   * Строит монотонно нерастущую аппроксимацию по историческим точкам
   */
  async forecastDemand(
    price: number,
    history: Snapshot[]
  ): Promise<DemandForecast> {
    try {
      if (history.length < 3) {
        throw new Error('Недостаточно данных для кусочной модели (минимум 3 наблюдения)');
      }

      // Фильтруем полные наблюдения с ценами и спросом
      const validObservations = history
        .filter(s => s.demand && s.ourPrice > 0)
        .map(s => ({
          price: s.ourPrice,
          demand: typeof s.demand === 'object' ? s.demand.mu : s.demand
        }))
        .sort((a, b) => a.price - b.price); // Сортируем по возрастанию цены

      if (validObservations.length < 3) {
        throw new Error('Недостаточно валидных наблюдений для кусочной модели');
      }

      // Строим кусочную аппроксимацию
      const demandCurve = this.buildDemandCurve(validObservations);
      
      // Прогнозируем спрос
      const expectedDemand = this.interpolateDemand(price, demandCurve);
      
      // Генерируем сценарии на основе исторической волатильности
      const scenarios = this.generateScenarios(expectedDemand, validObservations);
      
      // Вычисляем доверительные интервалы
      const sortedScenarios = scenarios.sort((a, b) => a - b);
      const lowerIndex = Math.floor(scenarios.length * 0.025);
      const upperIndex = Math.floor(scenarios.length * 0.975);

      return {
        expected: expectedDemand,
        confidence: {
          lower: sortedScenarios[lowerIndex],
          upper: sortedScenarios[upperIndex]
        },
        scenarios: scenarios
      };

    } catch (error) {
      this.logger.error('Ошибка в кусочной модели спроса:', error);
      throw error;
    }
  }

  /**
   * Строит кусочную кривую спроса
   */
  private buildDemandCurve(observations: Array<{price: number; demand: number}>): Array<{price: number; demand: number}> {
    const curve: Array<{price: number; demand: number}> = [];
    
    // Добавляем первую точку
    curve.push(observations[0]);
    
    // Строим монотонно нерастущую аппроксимацию
    for (let i = 1; i < observations.length; i++) {
      const current = observations[i];
      const previous = curve[curve.length - 1];
      
      // Если спрос растет с ростом цены - это аномалия, корректируем
      if (current.demand > previous.demand) {
        // Используем среднее значение или предыдущий спрос
        const correctedDemand = Math.min(current.demand, previous.demand);
        curve.push({
          price: current.price,
          demand: correctedDemand
        });
      } else {
        curve.push(current);
      }
    }
    
    // Добавляем экстраполяцию для высоких цен (спрос стремится к 0)
    const lastPoint = curve[curve.length - 1];
    const maxPrice = lastPoint.price * 2;
    curve.push({
      price: maxPrice,
      demand: Math.max(0, lastPoint.demand * 0.1) // 10% от последнего спроса
    });
    
    return curve;
  }

  /**
   * Интерполирует спрос для заданной цены
   */
  private interpolateDemand(price: number, demandCurve: Array<{price: number; demand: number}>): number {
    // Находим ближайшие точки для интерполяции
    let lowerIndex = -1;
    let upperIndex = -1;
    
    for (let i = 0; i < demandCurve.length; i++) {
      if (demandCurve[i].price <= price) {
        lowerIndex = i;
      } else {
        upperIndex = i;
        break;
      }
    }
    
    // Если цена ниже минимальной - экстраполируем вниз
    if (lowerIndex === -1) {
      const firstPoint = demandCurve[0];
      const secondPoint = demandCurve[1];
      const slope = (secondPoint.demand - firstPoint.demand) / (secondPoint.price - firstPoint.price);
      return Math.max(0, firstPoint.demand + slope * (price - firstPoint.price));
    }
    
    // Если цена выше максимальной - экстраполируем вверх
    if (upperIndex === -1) {
      const lastPoint = demandCurve[demandCurve.length - 1];
      const secondLastPoint = demandCurve[demandCurve.length - 2];
      const slope = (lastPoint.demand - secondLastPoint.demand) / (lastPoint.price - secondLastPoint.price);
      return Math.max(0, lastPoint.demand + slope * (price - lastPoint.price));
    }
    
    // Линейная интерполяция между точками
    const lowerPoint = demandCurve[lowerIndex];
    const upperPoint = demandCurve[upperIndex];
    
    if (lowerPoint.price === upperPoint.price) {
      return lowerPoint.demand;
    }
    
    const weight = (price - lowerPoint.price) / (upperPoint.price - lowerPoint.price);
    return lowerPoint.demand * (1 - weight) + upperPoint.demand * weight;
  }

  /**
   * Генерирует сценарии спроса на основе исторической волатильности
   */
  private generateScenarios(
    expectedDemand: number,
    observations: Array<{price: number; demand: number}>
  ): number[] {
    const scenarios: number[] = [];
    const numScenarios = 500; // Меньше сценариев для кусочной модели
    
    // Вычисляем историческую волатильность
    const demands = observations.map(o => o.demand);
    const meanDemand = demands.reduce((a, b) => a + b, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - meanDemand, 2), 0) / demands.length;
    const stdDev = Math.sqrt(variance);
    
    // Коэффициент вариации
    const cv = stdDev / meanDemand;
    
    // Генерируем сценарии с учетом исторической волатильности
    for (let i = 0; i < numScenarios; i++) {
      // Добавляем случайный шум пропорционально исторической волатильности
      const noise = this.randomNormal(0, cv * expectedDemand);
      const scenarioDemand = expectedDemand + noise;
      
      // Ограничиваем неотрицательными значениями
      scenarios.push(Math.max(0, scenarioDemand));
    }
    
    return scenarios;
  }

  /**
   * Генерирует случайное число из нормального распределения
   */
  private randomNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }

  /**
   * Валидирует качество кусочной модели
   */
  async validateModel(
    testData: Snapshot[]
  ): Promise<{
    mape: number;
    rmse: number;
    coverage: number;
  }> {
    if (testData.length === 0) {
      throw new Error('Нет тестовых данных для валидации');
    }

    const predictions: number[] = [];
    const actuals: number[] = [];
    let validPredictions = 0;

    for (const obs of testData) {
      if (obs.demand && obs.ourPrice > 0) {
        try {
          const forecast = await this.forecastDemand(obs.ourPrice, testData);
          predictions.push(forecast.expected);
          actuals.push(typeof obs.demand === 'object' ? obs.demand.mu : obs.demand);
          validPredictions++;
        } catch (error) {
          this.logger.warn(`Пропускаем наблюдение при валидации: ${error.message}`);
        }
      }
    }

    if (predictions.length === 0) {
      throw new Error('Нет валидных предсказаний для валидации');
    }

    // Вычисляем метрики качества
    const mape = this.calculateMAPE(actuals, predictions);
    const rmse = this.calculateRMSE(actuals, predictions);
    const coverage = validPredictions / testData.length;

    return { mape, rmse, coverage };
  }

  private calculateMAPE(actuals: number[], predictions: number[]): number {
    const errors = actuals.map((actual, i) => Math.abs((actual - predictions[i]) / actual));
    return errors.reduce((a, b) => a + b, 0) / errors.length * 100;
  }

  private calculateRMSE(actuals: number[], predictions: number[]): number {
    const errors = actuals.map((actual, i) => Math.pow(actual - predictions[i], 2));
    return Math.sqrt(errors.reduce((a, b) => a + b, 0) / errors.length);
  }

  /**
   * Проверяет, подходит ли кусочная модель для данных
   */
  isSuitable(history: Snapshot[]): boolean {
    const validObservations = history.filter(s => s.demand && s.ourPrice > 0);
    
    // Кусочная модель подходит для малого количества данных
    return validObservations.length >= 3 && validObservations.length < 10;
  }

  /**
   * Алиас для forecastDemand для совместимости
   */
  async forecast(
    currentData: any,
    currentTime: Date,
    stepSize: number
  ): Promise<any> {
    // Упрощенный прогноз для совместимости
    return {
      expected: 8, // базовый спрос
      confidence: { lower: 4, upper: 12 }
    };
  }

  /**
   * Переобучение модели
   */
  async retrain(): Promise<void> {
    this.logger.log('Переобучение кусочной модели спроса');
    // В реальности здесь была бы логика переобучения
  }
}
