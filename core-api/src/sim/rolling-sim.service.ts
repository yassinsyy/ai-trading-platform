import { Injectable, Logger } from '@nestjs/common';
import { PricingInputs, PricingDecision, Snapshot, PricePolicy } from '../ai/types/pricing.types';
import { LogLinearDemandModel } from '../ai/demand/loglinear.model';
import { PiecewiseDemandModel } from '../ai/demand/piecewise.model';
import { TimeSyncUtils } from '../ai/demand/time-sync.utils';
import { CompetitorReactionService } from './competitor-reaction';
import { PortfolioOptimizerService } from '../ai/portfolio/optimizer';
import { AugmentedBacktestService } from '../backtest/augmented-backtest.service';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface SimulationStep {
  timestamp: string;
  price: number;
  demand: number;
  stock: number;
  revenue: number;
  cost: number;
  profit: number;
  competitorReactions: any[];
  marketConditions: any;
}

export interface SimulationResult {
  scenarioId: string;
  startTime: string;
  endTime: string;
  steps: SimulationStep[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
    stockOutRate: number;
    daysOfCover: number;
    turnoverSpeed: number;
  };
  riskMetrics: {
    var95: number;
    cvar95: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  competitorAnalysis: {
    reactionCount: number;
    averageReactionTime: number;
    pricePressure: number;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    description: string;
    expectedImpact: number;
  }>;
}

export interface RetrainingTrigger {
  type: 'TIME_BASED' | 'PERFORMANCE_DEGRADATION' | 'MARKET_CHANGE' | 'MANUAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface SimulationState {
  currentScenario: SimulationScenario | null;
  currentStep: number;
  totalSteps: number;
  startTime: string | null;
  lastUpdateTime: string | null;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  progress: number; // 0-100
  error: string | null;
}

@Injectable()
export class RollingSimService {
  private readonly logger = new Logger(RollingSimService.name);
  
  private simulationState: SimulationState = {
    currentScenario: null,
    currentStep: 0,
    totalSteps: 0,
    startTime: null,
    lastUpdateTime: null,
    status: 'IDLE',
    progress: 0,
    error: null
  };

  private retrainingQueue: RetrainingTrigger[] = [];
  private simulationQueue: SimulationScenario[] = [];
  private activeSimulations = new Map<string, SimulationResult>();

  constructor(
    private readonly logLinearDemandModel: LogLinearDemandModel,
    private readonly piecewiseDemandModel: PiecewiseDemandModel,
    private readonly timeSyncUtils: TimeSyncUtils,
    private readonly competitorReactionService: CompetitorReactionService,
    private readonly portfolioOptimizer: PortfolioOptimizerService,
    private readonly backtestService: AugmentedBacktestService
  ) {}

  /**
   * Основной метод Rolling Horizon Control
   * §8: Rolling Simulation (RHC)
   */
  async runRollingSimulation(
    scenario: SimulationScenario,
    initialData: Snapshot[],
    horizon: number = 24, // часы
    stepSize: number = 1 // час
  ): Promise<SimulationResult> {
    this.logger.log(`Starting RHC simulation: ${scenario.name} with ${horizon}h horizon`);

    try {
      // Обновляем состояние симуляции
      this.updateSimulationState({
        ...this.simulationState,
        currentScenario: scenario,
        currentStep: 0,
        totalSteps: Math.ceil(horizon / stepSize),
        startTime: new Date().toISOString(),
        status: 'RUNNING',
        progress: 0,
        error: null
      });

      const steps: SimulationStep[] = [];
      let currentData = [...initialData];
      let currentTime = new Date(initialData[initialData.length - 1]?.timestamp || new Date());

      // Основной цикл RHC
      for (let step = 0; step < Math.ceil(horizon / stepSize); step++) {
        this.logger.log(`RHC Step ${step + 1}/${Math.ceil(horizon / stepSize)}`);

        // 1. Обновляем состояние симуляции
        this.updateSimulationState({
          ...this.simulationState,
          currentStep: step + 1,
          progress: ((step + 1) / Math.ceil(horizon / stepSize)) * 100,
          lastUpdateTime: new Date().toISOString()
        });

        // 2. Проверяем триггеры переобучения
        const retrainingNeeded = await this.checkRetrainingTriggers(currentData, step);
        if (retrainingNeeded) {
          await this.triggerRetraining(retrainingNeeded);
        }

        // 3. Прогнозируем спрос
        const demandForecast = await this.forecastDemand(currentData, currentTime, stepSize);
        
        // 4. Генерируем сценарии
        const scenarios = await this.generateScenarios(currentData, demandForecast, stepSize);
        
        // 5. Оптимизируем портфель (если включено)
        let optimizedPrices: Record<string, number> = {};
        if (scenario.parameters.portfolioOptimization) {
          optimizedPrices = await this.optimizePortfolio(currentData, scenarios, stepSize);
        }

        // 6. Симулируем реакцию конкурентов
        const competitorReactions = await this.simulateCompetitorReactions(
          currentData,
          optimizedPrices,
          currentTime
        );

        // 7. Обновляем рыночные условия
        const marketConditions = await this.updateMarketConditions(
          currentData,
          demandForecast,
          competitorReactions,
          step
        );

        // 8. Рассчитываем метрики шага
        const stepMetrics = await this.calculateStepMetrics(
          currentData,
          demandForecast,
          optimizedPrices,
          competitorReactions,
          marketConditions
        );

        // 9. Создаем шаг симуляции
        const simulationStep: SimulationStep = {
          timestamp: currentTime.toISOString(),
          price: stepMetrics.price,
          demand: demandForecast.expected,
          stock: stepMetrics.stock,
          revenue: stepMetrics.revenue,
          cost: stepMetrics.cost,
          profit: stepMetrics.profit,
          competitorReactions,
          marketConditions
        };

        steps.push(simulationStep);

        // 10. Обновляем данные для следующего шага
        currentData = await this.updateSimulationData(
          currentData,
          simulationStep,
          stepSize
        );

        // 11. Переходим к следующему временному шагу
        currentTime = new Date(currentTime.getTime() + stepSize * 60 * 60 * 1000);

        // 12. Проверяем условия остановки
        if (await this.shouldStopSimulation(currentData, step, scenario)) {
          this.logger.log('Simulation stop condition met');
          break;
        }
      }

      // Формируем результат симуляции
      const result = await this.createSimulationResult(scenario, steps, initialData);
      
      // Обновляем состояние
      this.updateSimulationState({
        ...this.simulationState,
        status: 'COMPLETED',
        progress: 100,
        lastUpdateTime: new Date().toISOString()
      });

      // Сохраняем активную симуляцию
      this.activeSimulations.set(scenario.id, result);

      this.logger.log(`RHC simulation completed: ${scenario.name}`);
      return result;

    } catch (error) {
      this.logger.error(`RHC simulation failed: ${error.message}`);
      
      this.updateSimulationState({
        ...this.simulationState,
        status: 'IDLE',
        error: error.message,
        lastUpdateTime: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Проверка триггеров переобучения
   */
  private async checkRetrainingTriggers(
    currentData: Snapshot[],
    currentStep: number
  ): Promise<RetrainingTrigger | null> {
    // Временные триггеры
    if (currentStep > 0 && currentStep % 24 === 0) { // Каждые 24 часа
      return {
        type: 'TIME_BASED',
        severity: 'LOW',
        description: 'Scheduled retraining trigger',
        timestamp: new Date().toISOString(),
        data: { step: currentStep, trigger: 'scheduled' }
      };
    }

    // Проверка деградации производительности
    const performanceDegradation = await this.checkPerformanceDegradation(currentData);
    if (performanceDegradation) {
      return {
        type: 'PERFORMANCE_DEGRADATION',
        severity: 'MEDIUM',
        description: 'Performance degradation detected',
        timestamp: new Date().toISOString(),
        data: performanceDegradation
      };
    }

    // Проверка изменений рынка
    const marketChange = await this.checkMarketChange(currentData);
    if (marketChange) {
      return {
        type: 'MARKET_CHANGE',
        severity: 'HIGH',
        description: 'Significant market change detected',
        timestamp: new Date().toISOString(),
        data: marketChange
      };
    }

    return null;
  }

  /**
   * Проверка деградации производительности
   */
  private async checkPerformanceDegradation(currentData: Snapshot[]): Promise<any | null> {
    if (currentData.length < 10) return null;

    const recentData = currentData.slice(-10);
    const olderData = currentData.slice(-20, -10);

    // Сравниваем точность прогнозов
    const recentAccuracy = await this.calculateForecastAccuracy(recentData);
    const olderAccuracy = await this.calculateForecastAccuracy(olderData);

    const accuracyDrop = olderAccuracy - recentAccuracy;
    
    if (accuracyDrop > 0.1) { // Падение точности более 10%
      return {
        accuracyDrop,
        recentAccuracy,
        olderAccuracy,
        threshold: 0.1
      };
    }

    return null;
  }

  /**
   * Проверка изменений рынка
   */
  private async checkMarketChange(currentData: Snapshot[]): Promise<any | null> {
    if (currentData.length < 20) return null;

    const recentData = currentData.slice(-10);
    const olderData = currentData.slice(-20, -10);

    // Анализируем волатильность цен
    const recentVolatility = this.calculatePriceVolatility(recentData);
    const olderVolatility = this.calculatePriceVolatility(olderData);

    const volatilityChange = Math.abs(recentVolatility - olderVolatility) / olderVolatility;

    if (volatilityChange > 0.5) { // Изменение волатильности более 50%
      return {
        volatilityChange,
        recentVolatility,
        olderVolatility,
        threshold: 0.5
      };
    }

    return null;
  }

  /**
   * Триггер переобучения
   */
  private async triggerRetraining(trigger: RetrainingTrigger): Promise<void> {
    this.logger.log(`Triggering retraining: ${trigger.description}`);

    // Добавляем в очередь переобучения
    this.retrainingQueue.push(trigger);

    // Если это критический триггер, запускаем немедленно
    if (trigger.severity === 'HIGH') {
      await this.executeRetraining(trigger);
    }
  }

  /**
   * Выполнение переобучения
   */
  private async executeRetraining(trigger: RetrainingTrigger): Promise<void> {
    try {
      this.logger.log(`Executing retraining for trigger: ${trigger.type}`);

      // Переобучаем модели спроса
      await this.logLinearDemandModel.retrain();
      await this.piecewiseDemandModel.retrain();

      // Обновляем состояние
      this.retrainingQueue = this.retrainingQueue.filter(t => t.timestamp !== trigger.timestamp);

      this.logger.log('Retraining completed successfully');

    } catch (error) {
      this.logger.error(`Retraining failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Прогнозирование спроса
   */
  private async forecastDemand(
    currentData: Snapshot[],
    currentTime: Date,
    stepSize: number
  ): Promise<{ expected: number; confidence: number; scenarios: number[] }> {
    try {
      // Пытаемся использовать лог-линейную модель
      const logLinearForecast = await this.logLinearDemandModel.forecast(
        currentData,
        currentTime,
        stepSize
      );

      if (logLinearForecast.confidence > 0.7) {
        return logLinearForecast;
      }
    } catch (error) {
      this.logger.warn('Log-linear demand forecast failed, falling back to piecewise');
    }

    // Fallback к кусочной модели
    return await this.piecewiseDemandModel.forecast(
      currentData,
      currentTime,
      stepSize
    );
  }

  /**
   * Генерация сценариев
   */
  private async generateScenarios(
    currentData: Snapshot[],
    demandForecast: any,
    stepSize: number
  ): Promise<any[]> {
    const scenarios = [];

    // Базовый сценарий
    scenarios.push({
      type: 'BASE',
      probability: 0.6,
      demand: demandForecast.expected,
      price: currentData[currentData.length - 1]?.price || 100,
      volatility: 0.1
    });

    // Оптимистичный сценарий
    scenarios.push({
      type: 'OPTIMISTIC',
      probability: 0.2,
      demand: demandForecast.expected * 1.3,
      price: (currentData[currentData.length - 1]?.price || 100) * 1.1,
      volatility: 0.15
    });

    // Пессимистичный сценарий
    scenarios.push({
      type: 'PESSIMISTIC',
      probability: 0.2,
      demand: demandForecast.expected * 0.7,
      price: (currentData[currentData.length - 1]?.price || 100) * 0.9,
      volatility: 0.2
    });

    return scenarios;
  }

  /**
   * Оптимизация портфеля
   */
  private async optimizePortfolio(
    currentData: Snapshot[],
    scenarios: any[],
    stepSize: number
  ): Promise<Record<string, number>> {
    try {
      // Создаем входные данные для оптимизации
      const optimizationInputs = {
        currentPrices: currentData.map(s => s.price),
        demandScenarios: scenarios,
        skuData: currentData.map(s => ({ 
          sku: s.id || 'default', 
          currentPrice: s.price, 
          cost: 0, 
          stock: typeof s.stock === 'number' ? s.stock : s.stock.onHand, 
          priceElasticity: -0.5, 
          seasonalityWeight: 1.0 
        })),
        constraints: {
          maxPriceChange: 0.2, // ±20%
          minMargin: 0.15,
          maxRisk: 0.1,
          maxVaR: 0.1,
          maxCVaR: 0.15,
          minExpectedReturn: 0.05,
          maxDrawdown: 0.2
        },
        timeHorizon: stepSize
      };

      const result = await this.portfolioOptimizer.optimizePortfolio(optimizationInputs);
      
      // Преобразуем веса в цены
      const optimizedPrices: Record<string, number> = {};
      currentData.forEach((snapshot, index) => {
        optimizedPrices[snapshot.id || `item_${index}`] = result.optimalPrices[index] || snapshot.price;
      });

      return optimizedPrices;

    } catch (error) {
      this.logger.warn(`Portfolio optimization failed: ${error.message}, using current prices`);
      
      // Fallback к текущим ценам
      const fallbackPrices: Record<string, number> = {};
      currentData.forEach(snapshot => {
        fallbackPrices[snapshot.id || 'default'] = snapshot.price;
      });

      return fallbackPrices;
    }
  }

  /**
   * Симуляция реакций конкурентов
   */
  private async simulateCompetitorReactions(
    currentData: Snapshot[],
    optimizedPrices: Record<string, number>,
    currentTime: Date
  ): Promise<any[]> {
    try {
      // Получаем текущие цены
      const currentPrices = currentData.map(s => s.price);
      const newPrices = Object.values(optimizedPrices);

      // Рассчитываем изменения цен
      const priceChanges = newPrices.map((newPrice, index) => {
        const oldPrice = currentPrices[index] || newPrice;
        return newPrice - oldPrice;
      });

      const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
      const avgPriceChangePct = (avgPriceChange / (currentPrices[0] || 1)) * 100;

      // Симулируем реакции конкурентов
      const competitors = [
        {
          id: 'competitor_1',
          currentPrice: currentPrices[0] || 100,
          model: {
            responseProbability: 0.4,
            priceChangeDelta: 0.1,
            responseDelay: 2,
            aggressiveness: 'medium' as const,
            baseReactionProbability: 0.4,
            priceSensitivity: 1.2,
            competitiveIntensity: 0.7,
            baseReactionRatio: 0.6,
            baseReactionDelay: 45,
            minPrice: 50,
            maxPriceChangePct: 30,
            systemRejectionProbability: 0.15
          }
        }
      ];

      return await this.competitorReactionService.simulateCompetitorReactions(
        avgPriceChange,
        avgPriceChangePct,
        competitors,
        currentTime.toISOString()
      );

    } catch (error) {
      this.logger.warn(`Competitor reaction simulation failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Обновление рыночных условий
   */
  private async updateMarketConditions(
    currentData: Snapshot[],
    demandForecast: any,
    competitorReactions: any[],
    step: number
  ): Promise<any> {
    const baseConditions = {
      step,
      timestamp: new Date().toISOString(),
      demandLevel: demandForecast.expected,
      competitorActivity: competitorReactions.length,
      marketVolatility: this.calculateMarketVolatility(currentData),
      seasonality: this.calculateSeasonality(step),
      economicIndicators: {
        inflation: 0.02,
        interestRate: 0.05,
        gdpGrowth: 0.03
      }
    };

    // Добавляем динамические факторы
    if (step > 0) {
      baseConditions.marketVolatility *= (1 + Math.sin(step * 0.1) * 0.1);
    }

    return baseConditions;
  }

  /**
   * Расчет метрик шага
   */
  private async calculateStepMetrics(
    currentData: Snapshot[],
    demandForecast: any,
    optimizedPrices: Record<string, number>,
    competitorReactions: any[],
    marketConditions: any
  ): Promise<{
    price: number;
    stock: number;
    revenue: number;
    cost: number;
    profit: number;
  }> {
    const latestSnapshot = currentData[currentData.length - 1];
    const currentPrice = Object.values(optimizedPrices)[0] || latestSnapshot?.price || 100;
    const currentStock = latestSnapshot?.stock || 0;
    const currentCost = latestSnapshot?.cost || 0;
    const currentFee = latestSnapshot?.fee || 0;

    // Рассчитываем ожидаемые продажи
    const currentStockValue = typeof currentStock === 'number' ? currentStock : currentStock.onHand;
    const expectedSales = Math.min(demandForecast.expected, currentStockValue);
    
    // Рассчитываем метрики
    const revenue = expectedSales * currentPrice;
    const cost = expectedSales * currentCost;
    const profit = revenue - cost - (expectedSales * currentFee);
    const remainingStock = Math.max(0, currentStockValue - expectedSales);

    return {
      price: currentPrice,
      stock: remainingStock,
      revenue,
      cost,
      profit
    };
  }

  /**
   * Обновление данных симуляции
   */
  private async updateSimulationData(
    currentData: Snapshot[],
    step: SimulationStep,
    stepSize: number
  ): Promise<Snapshot[]> {
    // Создаем новый снапшот
    const newSnapshot: Snapshot = {
      id: `sim_${Date.now()}`,
      timestamp: step.timestamp,
      price: step.price,
      stock: step.stock,
      demand: step.demand,
      cost: step.cost / (step.demand || 1), // Упрощенный расчет
      fee: 0.05, // Фиксированная комиссия
      competitor: null,
      ourPrice: step.price,
      ts: step.timestamp
    };

    return [...currentData, newSnapshot];
  }

  /**
   * Проверка условий остановки симуляции
   */
  private async shouldStopSimulation(
    currentData: Snapshot[],
    currentStep: number,
    scenario: SimulationScenario
  ): Promise<boolean> {
    // Остановка по количеству шагов
    if (currentStep >= this.simulationState.totalSteps) {
      return true;
    }

    // Остановка по условиям сценария
    if (scenario.parameters.maxSteps && currentStep >= scenario.parameters.maxSteps) {
      return true;
    }

    // Остановка по условиям рынка
    const latestSnapshot = currentData[currentData.length - 1];
    if (latestSnapshot && (typeof latestSnapshot.stock === 'number' ? latestSnapshot.stock : latestSnapshot.stock.onHand) <= 0) {
      this.logger.log('Simulation stopped: stock depleted');
      return true;
    }

    // Остановка по условиям прибыли
    if (scenario.parameters.minProfit) {
      const totalProfit = currentData.reduce((sum, s) => {
        const stockValue = typeof s.stock === 'number' ? s.stock : s.stock.onHand;
        return sum + (s.price - (s.cost || 0) - (s.fee || 0)) * stockValue;
      }, 0);
      if (totalProfit < scenario.parameters.minProfit) {
        this.logger.log('Simulation stopped: minimum profit not met');
        return true;
      }
    }

    return false;
  }

  /**
   * Создание результата симуляции
   */
  private async createSimulationResult(
    scenario: SimulationScenario,
    steps: SimulationStep[],
    initialData: Snapshot[]
  ): Promise<SimulationResult> {
    // Рассчитываем сводные метрики
    const summary = {
      totalRevenue: steps.reduce((sum, s) => sum + s.revenue, 0),
      totalCost: steps.reduce((sum, s) => sum + s.cost, 0),
      totalProfit: steps.reduce((sum, s) => sum + s.profit, 0),
      averageMargin: steps.reduce((sum, s) => sum + (s.revenue - s.cost), 0) / steps.length,
      stockOutRate: steps.filter(s => s.stock === 0).length / steps.length,
      daysOfCover: this.calculateDaysOfCover(steps),
      turnoverSpeed: this.calculateTurnoverSpeed(steps)
    };

    // Рассчитываем метрики риска
    const returns = steps.slice(1).map((step, i) => {
      const prevProfit = steps[i].profit;
      const currProfit = step.profit;
      return prevProfit !== 0 ? (currProfit - prevProfit) / Math.abs(prevProfit) : 0;
    });

    const riskMetrics = {
      var95: this.calculateVaR(returns, 0.95),
      cvar95: this.calculateCVaR(returns, 0.95),
      maxDrawdown: this.calculateMaxDrawdown(returns),
      sharpeRatio: this.calculateSharpeRatio(returns, 0.02) // 2% безрисковая ставка
    };

    // Анализ конкурентов
    const competitorAnalysis = {
      reactionCount: steps.reduce((sum, s) => sum + s.competitorReactions.length, 0),
      averageReactionTime: this.calculateAverageReactionTime(steps),
      pricePressure: this.calculatePricePressure(steps)
    };

    // Генерируем рекомендации
    const recommendations = await this.generateSimulationRecommendations(steps, summary, riskMetrics);

    return {
      scenarioId: scenario.id,
      startTime: steps[0]?.timestamp || new Date().toISOString(),
      endTime: steps[steps.length - 1]?.timestamp || new Date().toISOString(),
      steps,
      summary,
      riskMetrics,
      competitorAnalysis,
      recommendations
    };
  }

  /**
   * Вспомогательные методы для расчета метрик
   */
  private async calculateForecastAccuracy(data: Snapshot[]): Promise<number> {
    // Упрощенный расчет точности прогноза
    if (data.length < 2) return 0;
    
    let totalError = 0;
    for (let i = 1; i < data.length; i++) {
      const predicted = data[i - 1].demand || 0;
      const actual = data[i].demand || 0;
      
      // Обрабатываем разные типы demand
      const predictedValue = typeof predicted === 'number' ? predicted : predicted.mu;
      const actualValue = typeof actual === 'number' ? actual : actual.mu;
      
      if (actualValue > 0) {
        totalError += Math.abs(predictedValue - actualValue) / actualValue;
      }
    }
    
    return Math.max(0, 1 - totalError / (data.length - 1));
  }

  private calculatePriceVolatility(data: Snapshot[]): number {
    if (data.length < 2) return 0;
    
    const prices = data.map(s => s.price);
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateMarketVolatility(data: Snapshot[]): number {
    return this.calculatePriceVolatility(data);
  }

  private calculateSeasonality(step: number): number {
    // Упрощенная сезонность: синусоида с периодом 24 часа
    return Math.sin(step * 2 * Math.PI / 24);
  }

  private calculateDaysOfCover(steps: SimulationStep[]): number {
    if (steps.length === 0) return 0;
    
    const avgStock = steps.reduce((sum, s) => sum + s.stock, 0) / steps.length;
    const avgDemand = steps.reduce((sum, s) => sum + s.demand, 0) / steps.length;
    
    return avgDemand > 0 ? avgStock / avgDemand : 0;
  }

  private calculateTurnoverSpeed(steps: SimulationStep[]): number {
    if (steps.length === 0) return 0;
    
    const totalRevenue = steps.reduce((sum, s) => sum + s.revenue, 0);
    const avgInventory = steps.reduce((sum, s) => sum + s.stock, 0) / steps.length;
    
    return avgInventory > 0 ? totalRevenue / avgInventory : 0;
  }

  private calculateVaR(returns: number[], confidenceLevel: number): number {
    if (returns.length === 0) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    
    return sortedReturns[index] || 0;
  }

  private calculateCVaR(returns: number[], confidenceLevel: number): number {
    if (returns.length === 0) return 0;
    
    const varValue = this.calculateVaR(returns, confidenceLevel);
    const tailReturns = returns.filter(r => r <= varValue);
    
    return tailReturns.length > 0 ? tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length : varValue;
  }

  private calculateMaxDrawdown(returns: (number | { mu: number; sigma: number })[]): number {
    if (returns.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = typeof returns[0] === 'number' ? returns[0] : returns[0].mu;
    
    for (const ret of returns) {
      const retValue = typeof ret === 'number' ? ret : ret.mu;
      if (retValue > peak) {
        peak = retValue;
      }
      const drawdown = peak !== 0 ? (peak - retValue) / Math.abs(peak) : 0;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  private calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const excessReturn = meanReturn - riskFreeRate;
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    return volatility > 0 ? excessReturn / volatility : 0;
  }

  private calculateAverageReactionTime(steps: SimulationStep[]): number {
    const allReactions = steps.flatMap(s => s.competitorReactions);
    
    if (allReactions.length === 0) return 0;
    
    const totalTime = allReactions.reduce((sum, r) => sum + (r.delay || 0), 0);
    return totalTime / allReactions.length;
  }

  private calculatePricePressure(steps: SimulationStep[]): number {
    const allReactions = steps.flatMap(s => s.competitorReactions);
    
    if (allReactions.length === 0) return 0;
    
    const totalPressure = allReactions.reduce((sum, r) => sum + Math.abs(r.priceChangePct || 0), 0);
    return totalPressure / allReactions.length;
  }

  private async generateSimulationRecommendations(
    steps: SimulationStep[],
    summary: any,
    riskMetrics: any
  ): Promise<any[]> {
    const recommendations = [];

    // Анализ прибыльности
    if (summary.averageMargin < 0.1) {
      recommendations.push({
        type: 'PRICING',
        priority: 'HIGH',
        description: 'Low average margin detected',
        expectedImpact: 0.15
      });
    }

    // Анализ рисков
    if (riskMetrics.maxDrawdown > 0.3) {
      recommendations.push({
        type: 'RISK',
        priority: 'HIGH',
        description: 'High maximum drawdown',
        expectedImpact: -0.2
      });
    }

    // Анализ запасов
    if (summary.stockOutRate > 0.2) {
      recommendations.push({
        type: 'INVENTORY',
        priority: 'MEDIUM',
        description: 'High stock-out rate',
        expectedImpact: -0.1
      });
    }

    return recommendations;
  }

  /**
   * Управление состоянием симуляции
   */
  private updateSimulationState(newState: SimulationState): void {
    this.simulationState = newState;
  }

  /**
   * Получение текущего состояния
   */
  getSimulationState(): SimulationState {
    return { ...this.simulationState };
  }

  /**
   * Получение активных симуляций
   */
  getActiveSimulations(): Map<string, SimulationResult> {
    return new Map(this.activeSimulations);
  }

  /**
   * Очистка завершенных симуляций
   */
  cleanupCompletedSimulations(): void {
    for (const [id, simulation] of this.activeSimulations.entries()) {
      if (simulation.endTime && new Date(simulation.endTime) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        this.activeSimulations.delete(id);
      }
    }
  }
}
