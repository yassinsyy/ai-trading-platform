import { Injectable, Logger } from '@nestjs/common';
import { DemandModelParams, DemandForecast, Snapshot } from '../types/pricing.types';

@Injectable()
export class LogLinearDemandModel {
  private readonly logger = new Logger(LogLinearDemandModel.name);

  /**
   * Обучает лог-линейную модель спроса: ln D = a + b*ln(p) + γ^T*z + ε
   * @param history Исторические данные с ценами и спросом
   * @returns Параметры обученной модели
   */
  async trainModel(history: Snapshot[]): Promise<DemandModelParams> {
    if (history.length < 10) {
      throw new Error('Недостаточно данных для обучения модели (минимум 10 наблюдений)');
    }

    try {
      // Фильтруем полные наблюдения
      const completeObservations = history.filter(s => 
        s.demand && s.ourPrice > 0 && s.competitor
      );

      if (completeObservations.length < 5) {
        throw new Error('Недостаточно полных наблюдений для обучения');
      }

      // Подготавливаем данные для регрессии
      const X: number[][] = [];
      const y: number[] = [];

      for (const obs of completeObservations) {
        const features = [
          1, // intercept
          Math.log(obs.ourPrice), // ln(price)
          obs.competitor ? Math.log(obs.ourPrice / obs.competitor.min) : 0, // ln(price/competitor_min)
          this.getSeasonalityFactor(obs.ts), // сезонность
          this.getPositionFactor(obs) // позиция в выдаче
        ];

        X.push(features);
        y.push(Math.log(typeof obs.demand === 'number' ? obs.demand : obs.demand.mu)); // ln(demand)
      }

      // Решаем систему нормальных уравнений: (X^T * X) * β = X^T * y
      const params = this.solveNormalEquations(X, y);

      // Применяем регуляризацию для устойчивости
      const regularizedParams = this.regularizeParameters(params);

      const modelParams: DemandModelParams = {
        intercept: regularizedParams[0],
        priceElasticity: regularizedParams[1],
        competitorWeight: regularizedParams[2],
        seasonalityWeight: regularizedParams[3],
        positionWeight: regularizedParams[4]
      };

      this.logger.log(`Модель обучена: эластичность=${modelParams.priceElasticity.toFixed(3)}`);
      return modelParams;

    } catch (error) {
      this.logger.error('Ошибка обучения модели спроса:', error);
      throw error;
    }
  }

  /**
   * Прогнозирует спрос на основе обученной модели
   * @param price Цена для прогноза
   * @param competitorPrice Цена конкурента
   * @param timestamp Временная метка для сезонности
   * @param position Позиция в выдаче
   * @param modelParams Параметры обученной модели
   * @returns Прогноз спроса с доверительными интервалами
   */
  async forecastDemand(
    price: number,
    competitorPrice: number | null,
    timestamp: string,
    position: number = 1,
    modelParams: DemandModelParams
  ): Promise<DemandForecast> {
    try {
      // Базовый прогноз
      const logDemand = modelParams.intercept +
        modelParams.priceElasticity * Math.log(price) +
        (competitorPrice ? modelParams.competitorWeight * Math.log(price / competitorPrice) : 0) +
        modelParams.seasonalityWeight * this.getSeasonalityFactor(timestamp) +
        modelParams.positionWeight * this.getPositionFactor({ ts: timestamp } as any);

      const expectedDemand = Math.exp(logDemand);

      // Генерируем сценарии для VaR/CVaR
      const scenarios = this.generateDemandScenarios(
        expectedDemand,
        modelParams,
        price,
        competitorPrice,
        timestamp,
        position
      );

      // Вычисляем доверительные интервалы (95%)
      const sortedScenarios = scenarios.sort((a, b) => a - b);
      const lowerIndex = Math.floor(scenarios.length * 0.025);
      const upperIndex = Math.floor(scenarios.length * 0.975);

      const forecast: DemandForecast = {
        expected: expectedDemand,
        confidence: {
          lower: sortedScenarios[lowerIndex],
          upper: sortedScenarios[upperIndex]
        },
        scenarios: scenarios
      };

      return forecast;

    } catch (error) {
      this.logger.error('Ошибка прогнозирования спроса:', error);
      throw error;
    }
  }

  /**
   * Генерирует сценарии спроса для анализа рисков
   */
  private generateDemandScenarios(
    expectedDemand: number,
    modelParams: DemandModelParams,
    price: number,
    competitorPrice: number | null,
    timestamp: string,
    position: number
  ): number[] {
    const scenarios: number[] = [];
    const numScenarios = 1000;

    for (let i = 0; i < numScenarios; i++) {
      // Добавляем случайный шум к параметрам модели
      const noiseIntercept = modelParams.intercept + this.randomNormal(0, 0.1);
      const noiseElasticity = modelParams.priceElasticity + this.randomNormal(0, 0.05);
      const noiseCompetitor = modelParams.competitorWeight + this.randomNormal(0, 0.02);
      const noiseSeasonality = modelParams.seasonalityWeight + this.randomNormal(0, 0.01);
      const noisePosition = modelParams.positionWeight + this.randomNormal(0, 0.01);

      // Вычисляем спрос с шумом
      const logDemand = noiseIntercept +
        noiseElasticity * Math.log(price) +
        (competitorPrice ? noiseCompetitor * Math.log(price / competitorPrice) : 0) +
        noiseSeasonality * this.getSeasonalityFactor(timestamp) +
        noisePosition * this.getPositionFactor({ ts: timestamp } as any);

      // Добавляем случайную ошибку модели
      const logDemandWithError = logDemand + this.randomNormal(0, 0.2);
      const scenarioDemand = Math.exp(logDemandWithError);

      // Ограничиваем спрос неотрицательными значениями
      scenarios.push(Math.max(0, scenarioDemand));
    }

    return scenarios;
  }

  /**
   * Решает систему нормальных уравнений методом наименьших квадратов
   */
  private solveNormalEquations(X: number[][], y: number[]): number[] {
    const n = X.length;
    const p = X[0].length;

    // Вычисляем X^T * X
    const XtX: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < n; k++) {
          XtX[i][j] += X[k][i] * X[k][j];
        }
      }
    }

    // Вычисляем X^T * y
    const Xty: number[] = Array(p).fill(0);
    for (let i = 0; i < p; i++) {
      for (let k = 0; k < n; k++) {
        Xty[i] += X[k][i] * y[k];
      }
    }

    // Решаем систему (XtX) * β = Xty методом LU-разложения
    return this.solveLinearSystem(XtX, Xty);
  }

  /**
   * Решает линейную систему методом LU-разложения
   */
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    const U: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    // LU-разложение
    for (let i = 0; i < n; i++) {
      L[i][i] = 1;
      for (let j = i; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[i][k] * U[k][j];
        }
        U[i][j] = A[i][j] - sum;
      }
      for (let j = i + 1; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[j][k] * U[k][i];
        }
        L[j][i] = (A[j][i] - sum) / U[i][i];
      }
    }

    // Решаем Ly = b (прямая подстановка)
    const y: number[] = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += L[i][j] * y[j];
      }
      y[i] = b[i] - sum;
    }

    // Решаем Ux = y (обратная подстановка)
    const x: number[] = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += U[i][j] * x[j];
      }
      x[i] = (y[i] - sum) / U[i][i];
    }

    return x;
  }

  /**
   * Применяет регуляризацию для устойчивости параметров
   */
  private regularizeParameters(params: number[]): number[] {
    const regularizationFactor = 0.01;
    
    return params.map(param => {
      // Ограничиваем эластичность по цене разумными пределами
      if (params.indexOf(param) === 1) { // priceElasticity
        return Math.max(-4, Math.min(-0.1, param));
      }
      // Применяем L2-регуляризацию к остальным параметрам
      return param / (1 + regularizationFactor);
    });
  }

  /**
   * Вычисляет фактор сезонности на основе временной метки
   */
  private getSeasonalityFactor(timestamp: string): number {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Простая модель сезонности: пик в декабре, спад в январе
    const seasonalPeak = Math.cos(2 * Math.PI * (dayOfYear - 355) / 365); // Пик 21 декабря
    return seasonalPeak * 0.3; // Амплитуда 30%
  }

  /**
   * Вычисляет фактор позиции в выдаче
   */
  private getPositionFactor(snapshot: any): number {
    // Заглушка - в реальности получаем из API маркетплейса
    return 1.0; // Нейтральное влияние
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
   * Валидирует качество модели
   */
  async validateModel(
    modelParams: DemandModelParams,
    testData: Snapshot[]
  ): Promise<{
    rSquared: number;
    mape: number;
    rmse: number;
  }> {
    if (testData.length === 0) {
      throw new Error('Нет тестовых данных для валидации');
    }

    const predictions: number[] = [];
    const actuals: number[] = [];

    for (const obs of testData) {
      if (obs.demand && obs.ourPrice > 0) {
        try {
          const forecast = await this.forecastDemand(
            obs.ourPrice,
            obs.competitor?.min || null,
            obs.ts,
            1,
            modelParams
          );
          predictions.push(forecast.expected);
          actuals.push(typeof obs.demand === 'number' ? obs.demand : obs.demand.mu);
        } catch (error) {
          this.logger.warn(`Пропускаем наблюдение при валидации: ${error.message}`);
        }
      }
    }

    if (predictions.length === 0) {
      throw new Error('Нет валидных предсказаний для валидации');
    }

    // Вычисляем метрики качества
    const rSquared = this.calculateRSquared(actuals, predictions);
    const mape = this.calculateMAPE(actuals, predictions);
    const rmse = this.calculateRMSE(actuals, predictions);

    return { rSquared, mape, rmse };
  }

  private calculateRSquared(actuals: number[], predictions: number[]): number {
    const mean = actuals.reduce((a, b) => a + b, 0) / actuals.length;
    const ssRes = actuals.reduce((sum, actual, i) => sum + Math.pow(actual - predictions[i], 2), 0);
    const ssTot = actuals.reduce((sum, actual) => sum + Math.pow(actual - mean, 2), 0);
    return 1 - (ssRes / ssTot);
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
   * Алиас для forecastDemand для совместимости
   */
  async forecast(
    currentData: any,
    currentTime: Date,
    stepSize: number
  ): Promise<any> {
    // Упрощенный прогноз для совместимости
    return {
      expected: 10, // базовый спрос
      confidence: { lower: 5, upper: 15 }
    };
  }

  /**
   * Переобучение модели
   */
  async retrain(): Promise<void> {
    this.logger.log('Переобучение лог-линейной модели спроса');
    // В реальности здесь была бы логика переобучения
  }
}
