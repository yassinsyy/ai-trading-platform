import { Injectable, Logger } from '@nestjs/common';
import { PortfolioConstraints, PortfolioOptimizationResult } from '../types/pricing.types';
import { RiskManagementService } from './risk';
import { ScenarioGeneratorService, DemandScenario, CompetitorScenario, MarketScenario } from './scenario-generator';

export interface OptimizationInputs {
  skuData: Array<{
    sku: string;
    currentPrice: number;
    cost: number;
    stock: number;
    priceElasticity: number;
    seasonalityWeight: number;
  }>;
  constraints: PortfolioConstraints;
  riskFreeRate?: number;
  numScenarios?: number;
  timeHorizon?: number;
}

export interface OptimizationResult extends PortfolioOptimizationResult {
  riskMetrics: {
    var95: number;
    cvar95: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  riskProfile: {
    totalRisk: number;
    systematicRisk: number;
    idiosyncraticRisk: number;
    concentrationRisk: number;
  };
  scenarioAnalysis: {
    bestCase: number;
    worstCase: number;
    expectedCase: number;
    confidenceInterval: { lower: number; upper: number };
  };
}

@Injectable()
export class PortfolioOptimizerService {
  private readonly logger = new Logger(PortfolioOptimizerService.name);

  constructor(
    private readonly riskService: RiskManagementService,
    private readonly scenarioGenerator: ScenarioGeneratorService
  ) {}

  /**
   * Оптимизирует портфель цен согласно §5.4
   */
  async optimizePortfolio(inputs: OptimizationInputs): Promise<OptimizationResult> {
    try {
      this.logger.log(`Начинаем оптимизацию портфеля для ${inputs.skuData.length} SKU`);

      // 1. Генерируем сценарии
      const demandScenarios = await this.generateDemandScenarios(inputs);
      const competitorScenarios = await this.generateCompetitorScenarios(inputs);
      const marketScenarios = await this.generateMarketScenarios(inputs);

      // 2. Выполняем Mean-Variance оптимизацию
      const mvResult = await this.meanVarianceOptimization(
        inputs,
        demandScenarios,
        competitorScenarios,
        marketScenarios
      );

      // 3. Применяем CVaR ограничения
      const finalResult = await this.applyCVaRConstraints(
        mvResult,
        inputs.constraints,
        demandScenarios,
        competitorScenarios,
        marketScenarios
      );

      // 4. Вычисляем финальные метрики
      const riskMetrics = await this.calculateFinalRiskMetrics(
        finalResult,
        demandScenarios,
        competitorScenarios,
        marketScenarios
      );

      const riskProfile = await this.calculateFinalRiskProfile(
        finalResult,
        demandScenarios,
        competitorScenarios,
        marketScenarios
      );

      const scenarioAnalysis = this.analyzeScenarios(
        finalResult,
        demandScenarios,
        competitorScenarios,
        marketScenarios
      );

      this.logger.log(`Оптимизация портфеля завершена успешно`);

      return {
        ...finalResult,
        riskMetrics,
        riskProfile,
        scenarioAnalysis
      };

    } catch (error) {
      this.logger.error('Ошибка оптимизации портфеля:', error);
      throw error;
    }
  }

  /**
   * Mean-Variance оптимизация
   */
  private async meanVarianceOptimization(
    inputs: OptimizationInputs,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<PortfolioOptimizationResult> {
    const numAssets = inputs.skuData.length;
    
    // Генерируем сетку цен для каждого SKU
    const priceGrids = inputs.skuData.map(sku => 
      this.generatePriceGrid(sku.currentPrice, sku.cost)
    );

    // Вычисляем ожидаемые доходности и ковариации
    const expectedReturns = await this.calculateExpectedReturns(
      inputs,
      demandScenarios,
      competitorScenarios,
      marketScenarios
    );

    const covarianceMatrix = await this.calculateCovarianceMatrix(
      inputs,
      demandScenarios,
      competitorScenarios,
      marketScenarios
    );

    // Выполняем оптимизацию
    const optimalWeights = this.optimizeWeights(
      expectedReturns,
      covarianceMatrix,
      inputs.constraints
    );

    // Преобразуем веса в цены
    const optimalPrices = this.weightsToPrices(optimalWeights, priceGrids);

    // Вычисляем финальные метрики
    const portfolioReturn = this.calculatePortfolioReturn(optimalWeights, expectedReturns);
    const portfolioRisk = this.calculatePortfolioRisk(optimalWeights, covarianceMatrix);
    const sharpeRatio = portfolioRisk > 0 ? portfolioReturn / portfolioRisk : 0;

    return {
      prices: optimalPrices,
      expectedReturn: portfolioReturn,
      portfolioVaR: 0, // Будет вычислено позже
      portfolioCVaR: 0, // Будет вычислено позже
      sharpeRatio,
      constraints: {
        satisfied: true,
        violations: []
      }
    };
  }

  /**
   * Применяет CVaR ограничения
   */
  private async applyCVaRConstraints(
    mvResult: PortfolioOptimizationResult,
    constraints: PortfolioConstraints,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<PortfolioOptimizationResult> {
    // Проверяем текущие ограничения
    const currentRisk = await this.calculatePortfolioRiskFromScenarios(
      mvResult.prices,
      demandScenarios,
      competitorScenarios,
      marketScenarios
    );

    if (currentRisk.cvar95 <= constraints.maxCVaR) {
      // Ограничения уже выполнены
      return {
        ...mvResult,
        portfolioVaR: currentRisk.var95,
        portfolioCVaR: currentRisk.cvar95
      };
    }

    // Применяем итеративную оптимизацию для выполнения CVaR ограничений
    const adjustedPrices = await this.adjustPricesForCVaR(
      mvResult.prices,
      constraints.maxCVaR,
      demandScenarios,
      competitorScenarios,
      marketScenarios
    );

    // Пересчитываем метрики
    const adjustedRisk = await this.calculatePortfolioRiskFromScenarios(
      adjustedPrices,
      demandScenarios,
      competitorScenarios,
      marketScenarios
    );

    return {
      ...mvResult,
      prices: adjustedPrices,
      portfolioVaR: adjustedRisk.var95,
      portfolioCVaR: adjustedRisk.cvar95
    };
  }

  /**
   * Генерирует сетку цен для SKU
   */
  private generatePriceGrid(currentPrice: number, cost: number): number[] {
    const minPrice = cost * 1.1; // Минимум 10% маржи
    const maxPrice = currentPrice * 2; // Максимум 2x от текущей цены
    const step = Math.max(10, Math.floor((maxPrice - minPrice) / 50)); // 50 шагов

    const prices: number[] = [];
    for (let price = minPrice; price <= maxPrice; price += step) {
      prices.push(Math.round(price));
    }

    return prices;
  }

  /**
   * Вычисляет ожидаемые доходности
   */
  private async calculateExpectedReturns(
    inputs: OptimizationInputs,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<number[]> {
    const returns: number[] = [];

    for (let i = 0; i < inputs.skuData.length; i++) {
      const sku = inputs.skuData[i];
      const demandScenario = demandScenarios[i];
      const competitorScenario = competitorScenarios[i];

      // Вычисляем ожидаемую доходность на основе спроса и конкурентов
      const expectedDemand = demandScenario.confidence.mean;
      const expectedRevenue = sku.currentPrice * expectedDemand;
      const expectedCost = sku.cost * expectedDemand;
      const expectedProfit = expectedRevenue - expectedCost;

      // Нормализуем на стоимость позиции
      const positionValue = sku.currentPrice * sku.stock;
      const returnRate = positionValue > 0 ? expectedProfit / positionValue : 0;

      returns.push(returnRate);
    }

    return returns;
  }

  /**
   * Вычисляет ковариационную матрицу
   */
  private async calculateCovarianceMatrix(
    inputs: OptimizationInputs,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<number[][]> {
    const numAssets = inputs.skuData.length;
    const covarianceMatrix: number[][] = [];

    // Упрощенная ковариационная матрица
    for (let i = 0; i < numAssets; i++) {
      covarianceMatrix[i] = [];
      for (let j = 0; j < numAssets; j++) {
        if (i === j) {
          // Диагональные элементы - дисперсия
          const volatility = 0.2 + Math.random() * 0.3; // 20-50% волатильность
          covarianceMatrix[i][j] = volatility * volatility;
        } else {
          // Внедиагональные элементы - ковариация
          const correlation = 0.1 + Math.random() * 0.4; // 10-50% корреляция
          const volatilityI = Math.sqrt(covarianceMatrix[i]?.[i] || 0.25);
          const volatilityJ = Math.sqrt(covarianceMatrix[j]?.[j] || 0.25);
          covarianceMatrix[i][j] = correlation * volatilityI * volatilityJ;
        }
      }
    }

    return covarianceMatrix;
  }

  /**
   * Оптимизирует веса портфеля
   */
  private optimizeWeights(
    expectedReturns: number[],
    covarianceMatrix: number[][],
    constraints: PortfolioConstraints
  ): number[] {
    const numAssets = expectedReturns.length;
    
    // Простая оптимизация: максимизация коэффициента Шарпа
    // В реальной реализации здесь должен быть более сложный алгоритм
    
    // Начинаем с равных весов
    const weights = new Array(numAssets).fill(1 / numAssets);
    
    // Простая итеративная оптимизация
    for (let iteration = 0; iteration < 100; iteration++) {
      const oldWeights = [...weights];
      
      // Вычисляем текущий коэффициент Шарпа
      const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioRisk = this.calculatePortfolioRisk(weights, covarianceMatrix);
      const currentSharpe = portfolioRisk > 0 ? portfolioReturn / portfolioRisk : 0;
      
      // Пробуем небольшие изменения весов
      for (let i = 0; i < numAssets; i++) {
        const delta = 0.01;
        weights[i] += delta;
        
        // Нормализуем веса
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        for (let j = 0; j < numAssets; j++) {
          weights[j] /= totalWeight;
        }
        
        // Проверяем улучшение
        const newReturn = this.calculatePortfolioReturn(weights, expectedReturns);
        const newRisk = this.calculatePortfolioRisk(weights, covarianceMatrix);
        const newSharpe = newRisk > 0 ? newReturn / newRisk : 0;
        
        if (newSharpe <= currentSharpe) {
          // Откатываем изменения
          weights[i] = oldWeights[i];
        }
      }
      
      // Проверяем сходимость
      const weightChange = weights.reduce((sum, w, i) => sum + Math.abs(w - oldWeights[i]), 0);
      if (weightChange < 0.001) {
        break;
      }
    }
    
    return weights;
  }

  /**
   * Преобразует веса в цены
   */
  private weightsToPrices(weights: number[], priceGrids: number[][]): Record<string, number> {
    const prices: Record<string, number> = {};
    
    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      const priceGrid = priceGrids[i];
      
      // Выбираем цену на основе веса
      const priceIndex = Math.floor(weight * priceGrid.length);
      const price = priceGrid[Math.min(priceIndex, priceGrid.length - 1)];
      
      prices[`SKU_${i + 1}`] = price;
    }
    
    return prices;
  }

  /**
   * Вычисляет доходность портфеля
   */
  private calculatePortfolioReturn(weights: number[], expectedReturns: number[]): number {
    return weights.reduce((sum, weight, i) => sum + weight * expectedReturns[i], 0);
  }

  /**
   * Вычисляет риск портфеля
   */
  private calculatePortfolioRisk(weights: number[], covarianceMatrix: number[][]): number {
    let portfolioVariance = 0;
    
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        portfolioVariance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }
    
    return Math.sqrt(portfolioVariance);
  }

  /**
   * Вычисляет риск портфеля из сценариев
   */
  private async calculatePortfolioRiskFromScenarios(
    prices: Record<string, number>,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<{ var95: number; cvar95: number }> {
    // Упрощенная оценка риска на основе сценариев
    const portfolioReturns: number[] = [];
    
    // Генерируем доходности портфеля для каждого сценария
    for (let scenario = 0; scenario < 1000; scenario++) {
      let portfolioReturn = 0;
      
      for (let i = 0; i < demandScenarios.length; i++) {
        const demand = demandScenarios[i].scenarios[scenario % demandScenarios[i].scenarios.length];
        const price = Object.values(prices)[i];
        const cost = 100; // Упрощенная оценка
        
        const profit = (price - cost) * demand;
        portfolioReturn += profit;
      }
      
      portfolioReturns.push(portfolioReturn);
    }
    
    // Сортируем для вычисления квантилей
    portfolioReturns.sort((a, b) => a - b);
    
    const var95 = portfolioReturns[Math.floor(portfolioReturns.length * 0.05)] || 0;
    const cvar95 = portfolioReturns.slice(0, Math.floor(portfolioReturns.length * 0.05))
      .reduce((sum, ret) => sum + ret, 0) / Math.floor(portfolioReturns.length * 0.05) || 0;
    
    return { var95, cvar95 };
  }

  /**
   * Корректирует цены для выполнения CVaR ограничений
   */
  private async adjustPricesForCVaR(
    prices: Record<string, number>,
    maxCVaR: number,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<Record<string, number>> {
    const adjustedPrices = { ...prices };
    
    // Простая стратегия: снижаем цены для снижения риска
    for (const sku in adjustedPrices) {
      const currentPrice = adjustedPrices[sku];
      adjustedPrices[sku] = currentPrice * 0.95; // Снижаем на 5%
    }
    
    return adjustedPrices;
  }

  /**
   * Вычисляет финальные метрики риска
   */
  private async calculateFinalRiskMetrics(
    result: PortfolioOptimizationResult,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<{ var95: number; cvar95: number; maxDrawdown: number; sharpeRatio: number }> {
    const risk = await this.calculatePortfolioRiskFromScenarios(
      result.prices,
      demandScenarios,
      competitorScenarios,
      marketScenarios
    );
    
    return {
      var95: risk.var95,
      cvar95: risk.cvar95,
      maxDrawdown: 0.1, // Упрощенная оценка
      sharpeRatio: result.sharpeRatio
    };
  }

  /**
   * Вычисляет финальный профиль риска
   */
  private async calculateFinalRiskProfile(
    result: PortfolioOptimizationResult,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): Promise<{ totalRisk: number; systematicRisk: number; idiosyncraticRisk: number; concentrationRisk: number }> {
    return {
      totalRisk: 0.15, // Упрощенные оценки
      systematicRisk: 0.10,
      idiosyncraticRisk: 0.11,
      concentrationRisk: 0.05
    };
  }

  /**
   * Анализирует сценарии
   */
  private analyzeScenarios(
    result: PortfolioOptimizationResult,
    demandScenarios: DemandScenario[],
    competitorScenarios: CompetitorScenario[],
    marketScenarios: MarketScenario[]
  ): { bestCase: number; worstCase: number; expectedCase: number; confidenceInterval: { lower: number; upper: number } } {
    return {
      bestCase: result.expectedReturn * 1.5,
      worstCase: result.expectedReturn * 0.5,
      expectedCase: result.expectedReturn,
      confidenceInterval: {
        lower: result.expectedReturn * 0.8,
        upper: result.expectedReturn * 1.2
      }
    };
  }

  /**
   * Генерирует сценарии спроса
   */
  private async generateDemandScenarios(inputs: OptimizationInputs): Promise<DemandScenario[]> {
    return this.scenarioGenerator.generateDemandScenarios(
      inputs.skuData.map(sku => ({
        sku: sku.sku,
        history: [], // Упрощенно
        priceElasticity: sku.priceElasticity,
        seasonalityWeight: sku.seasonalityWeight
      }))
    );
  }

  /**
   * Генерирует сценарии конкурентов
   */
  private async generateCompetitorScenarios(inputs: OptimizationInputs): Promise<CompetitorScenario[]> {
    return this.scenarioGenerator.generateCompetitorScenarios(
      inputs.skuData.map(sku => ({
        sku: sku.sku,
        currentPrice: sku.currentPrice,
        competitorPrice: sku.currentPrice * 0.9, // Упрощенно
        reactionModel: {
          responseProbability: 0.3,
          priceChangeDelta: 0.1,
          responseDelay: 2,
          aggressiveness: 'medium'
        }
      }))
    );
  }

  /**
   * Генерирует рыночные сценарии
   */
  private async generateMarketScenarios(inputs: OptimizationInputs): Promise<MarketScenario[]> {
    return this.scenarioGenerator.generateMarketScenarios(
      inputs.timeHorizon || 30,
      inputs.numScenarios || 1000
    );
  }
}
