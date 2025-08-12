import { Injectable, Logger } from '@nestjs/common';
import { PricingInputs, PricingDecision, Snapshot, PricePolicy } from '../ai/types/pricing.types';
import { LogLinearDemandModel } from '../ai/demand/loglinear.model';
import { PiecewiseDemandModel } from '../ai/demand/piecewise.model';
import { TimeSyncUtils } from '../ai/demand/time-sync.utils';
import { CompetitorReactionService, ReactionSimulation } from '../sim/competitor-reaction';
import { ScenarioGeneratorService } from '../ai/portfolio/scenario-generator';
import { RiskManagementService } from '../ai/portfolio/risk';
import { BacktestRepository } from './backtest.repository';
import { BacktestResult, BacktestStatus } from '../entities/backtest-result.entity';
import { CreateBacktestDto } from './dto';

export interface BacktestConfig {
  startDate: string;
  endDate: string;
  timeWindow: number; // в минутах
  includeCompetitorReactions: boolean;
  includeScenarios: boolean;
  scenarioCount: number;
  confidenceLevel: number; // для VaR/CVaR
  riskFreeRate: number;
}

export interface BacktestResultData {
  summary: {
    totalPnL: number;
    totalRevenue: number;
    totalCost: number;
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
    sortinoRatio: number;
    calmarRatio: number;
    volatility: number;
    skewness: number;
    kurtosis: number;
  };
  dailyMetrics: Array<{
    date: string;
    pnl: number;
    revenue: number;
    cost: number;
    margin: number;
    unitsSold: number;
    stockLevel: number;
    price: number;
  }>;
  competitorAnalysis: {
    reactionCount: number;
    averageReactionTime: number;
    pricePressure: number;
    marketShareImpact: number;
  };
  scenarioAnalysis: {
    bestCase: number;
    worstCase: number;
    expectedCase: number;
    confidenceInterval: { lower: number; upper: number };
    scenarioDistribution: Array<{ profit: number; probability: number }>;
  };
  recommendations: Array<{
    type: 'PRICING' | 'INVENTORY' | 'COMPETITIVE' | 'RISK';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    expectedImpact: number;
    implementation: string;
  }>;
}

export interface CounterfactualTrajectory {
  timestamp: string;
  originalPrice: number;
  alternativePrice: number;
  originalPnL: number;
  alternativePnL: number;
  improvement: number;
  reason: string;
}

@Injectable()
export class AugmentedBacktestService {
  private readonly logger = new Logger(AugmentedBacktestService.name);

  constructor(
    private readonly logLinearDemandModel: LogLinearDemandModel,
    private readonly piecewiseDemandModel: PiecewiseDemandModel,
    private readonly timeSyncUtils: TimeSyncUtils,
    private readonly competitorReactionService: CompetitorReactionService,
    private readonly scenarioGenerator: ScenarioGeneratorService,
    private readonly riskService: RiskManagementService,
    private readonly backtestRepository: BacktestRepository
  ) {}

  /**
   * Основной метод бэктестинга
   * §9: Augmented Backtesting
   */
  async runBacktest(
    historicalData: Snapshot[],
    pricingPolicy: PricePolicy,
    config: BacktestConfig
  ): Promise<BacktestResultData> {
    this.logger.log(`Starting augmented backtest from ${config.startDate} to ${config.endDate}`);

    // 1. Синхронизация времени и валидация данных
    const validatedData = await this.validateAndSyncData(historicalData, config);
    
    // 2. Генерация контрафактических траекторий
    const counterfactuals = await this.generateCounterfactualTrajectories(
      validatedData,
      pricingPolicy,
      config
    );
    
    // 3. Симуляция реакций конкурентов
    let competitorReactions: ReactionSimulation[] = [];
    if (config.includeCompetitorReactions) {
      competitorReactions = await this.simulateCompetitorReactions(validatedData, config);
    }
    
    // 4. Генерация сценариев для анализа рисков
    let scenarios: any[] = [];
    if (config.includeScenarios) {
      scenarios = await this.generateRiskScenarios(validatedData, config);
    }
    
    // 5. Расчет метрик и KPI
    const metrics = await this.calculateBacktestMetrics(
      validatedData,
      counterfactuals,
      competitorReactions,
      scenarios,
      config
    );
    
    // 6. Анализ рисков
    const riskMetrics = await this.calculateRiskMetrics(metrics.dailyMetrics, config);
    
    // 7. Генерация рекомендаций
    const recommendations = await this.generateRecommendations(
      metrics,
      riskMetrics,
      counterfactuals,
      competitorReactions
    );
    
    // 8. Формирование результата
    const result: BacktestResultData = {
      summary: metrics.summary,
      riskMetrics,
      dailyMetrics: metrics.dailyMetrics,
      competitorAnalysis: metrics.competitorAnalysis,
      scenarioAnalysis: metrics.scenarioAnalysis,
      recommendations
    };

    this.logger.log(`Backtest completed. Total PnL: ${result.summary.totalPnL.toFixed(2)}`);
    return result;
  }

  /**
   * Валидация и синхронизация данных
   */
  private async validateAndSyncData(
    data: Snapshot[],
    config: BacktestConfig
  ): Promise<Array<Snapshot & { incomplete: boolean }>> {
    this.logger.log('Validating and synchronizing historical data');
    
    // Используем встроенный метод TimeSyncUtils для нормализации и валидации
    const validatedData = this.timeSyncUtils.normalizeAndValidateSnapshots(data);
    
    // Фильтрация по датам
    const filteredData = validatedData.filter(snapshot => {
      const snapshotDate = new Date(snapshot.ts);
      const startDate = new Date(config.startDate);
      const endDate = new Date(config.endDate);
      return snapshotDate >= startDate && snapshotDate <= endDate;
    });
    
    this.logger.log(`Validated ${filteredData.length} snapshots from ${data.length} original`);
    return filteredData;
  }

  /**
   * Генерация контрафактических траекторий
   */
  private async generateCounterfactualTrajectories(
    data: Array<Snapshot & { incomplete: boolean }>,
    policy: PricePolicy,
    config: BacktestConfig
  ): Promise<CounterfactualTrajectory[]> {
    this.logger.log('Generating counterfactual pricing trajectories');
    
    const counterfactuals: CounterfactualTrajectory[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const snapshot = data[i];
      
      // Пропускаем неполные наблюдения
      if (snapshot.incomplete) continue;
      
      // Генерируем альтернативные цены
      const alternativePrices = this.generateAlternativePrices(snapshot, policy);
      
      for (const altPrice of alternativePrices) {
        const originalPnL = this.calculatePnL(snapshot, snapshot.ourPrice);
        const alternativePnL = this.calculatePnL(snapshot, altPrice);
        const improvement = alternativePnL - originalPnL;
        
        if (Math.abs(improvement) > 0.01) { // Значимое улучшение
          counterfactuals.push({
            timestamp: snapshot.ts,
            originalPrice: snapshot.ourPrice,
            alternativePrice: altPrice,
            originalPnL: originalPnL,
            alternativePnL: alternativePnL,
            improvement,
            reason: this.identifyImprovementReason(altPrice, snapshot.ourPrice, policy)
          });
        }
      }
    }
    
    this.logger.log(`Generated ${counterfactuals.length} counterfactual trajectories`);
    return counterfactuals;
  }

  /**
   * Генерация альтернативных цен
   */
  private generateAlternativePrices(
    snapshot: Snapshot,
    policy: PricePolicy
  ): number[] {
    const prices: number[] = [];
    const currentPrice = snapshot.ourPrice;
    
    // Цены выше и ниже текущей
    const variations = [-0.2, -0.1, -0.05, 0.05, 0.1, 0.2]; // ±20%, ±10%, ±5%
    
    for (const variation of variations) {
      const newPrice = currentPrice * (1 + variation);
      
      // Проверяем ограничения политики
      if (policy.floorPrice && newPrice < policy.floorPrice) continue;
      if (policy.ceilingPrice && newPrice > policy.ceilingPrice) continue;
      
      prices.push(Math.round(newPrice * 100) / 100);
    }
    
    return prices;
  }

  /**
   * Расчет PnL для одной сделки
   */
  private calculatePnL(snapshot: Snapshot, price: number): number {
    const cost = snapshot.cost || 0;
    const fee = snapshot.fee || 0;
    const margin = price - cost - fee;
    const units = typeof snapshot.stock === 'number' ? snapshot.stock : snapshot.stock?.onHand || 0;
    
    return margin * units;
  }

  /**
   * Идентификация причины улучшения
   */
  private identifyImprovementReason(
    altPrice: number,
    originalPrice: number,
    policy: PricePolicy
  ): string {
    const priceDiff = altPrice - originalPrice;
    const priceDiffPct = (priceDiff / originalPrice) * 100;
    
    if (priceDiff > 0) {
      if (priceDiffPct > 10) return 'Significant price increase';
      if (priceDiffPct > 5) return 'Moderate price increase';
      return 'Small price increase';
    } else {
      if (priceDiffPct < -10) return 'Significant price decrease';
      if (priceDiffPct < -5) return 'Moderate price decrease';
      return 'Small price decrease';
    }
  }

  /**
   * Симуляция реакций конкурентов
   */
  private async simulateCompetitorReactions(
    data: Array<Snapshot & { incomplete: boolean }>,
    config: BacktestConfig
  ): Promise<ReactionSimulation[]> {
    this.logger.log('Simulating competitor reactions for backtesting');
    
    // Создаем модели конкурентов (упрощенно для бэктестинга)
    const competitors = [
      {
        id: 'competitor_1',
        initialPrice: data[0]?.price || 100,
        model: {
          responseProbability: 0.4,
          priceChangeDelta: 0.6,
          responseDelay: 45,
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
      },
      {
        id: 'competitor_2',
        initialPrice: data[0]?.price || 95,
        model: {
          responseProbability: 0.3,
          priceChangeDelta: 0.4,
          responseDelay: 60,
          aggressiveness: 'low' as const,
          baseReactionProbability: 0.3,
          priceSensitivity: 0.8,
          competitiveIntensity: 0.5,
          baseReactionRatio: 0.4,
          baseReactionDelay: 60,
          minPrice: 60,
          maxPriceChangePct: 25,
          systemRejectionProbability: 0.2
        }
      }
    ];
    
    // Генерируем историю наших изменений цен
    const ourPriceHistory = data
      .filter(s => !s.incomplete)
      .map(s => ({ timestamp: s.timestamp, price: s.price }));
    
    return await this.competitorReactionService.generateCompetitorReactionHistory(
      ourPriceHistory,
      competitors,
      config.startDate
    );
  }

  /**
   * Генерация сценариев рисков
   */
  private async generateRiskScenarios(
    data: Array<Snapshot & { incomplete: boolean }>,
    config: BacktestConfig
  ): Promise<any[]> {
    this.logger.log(`Generating ${config.scenarioCount} risk scenarios`);
    
    // Подготавливаем данные для генерации сценариев спроса
    const demandData = data.map(snapshot => ({
      sku: snapshot.id || 'unknown',
      history: [snapshot],
      priceElasticity: -0.5, // Значение по умолчанию
      seasonalityWeight: 0.3 // Значение по умолчанию
    }));
    
    // Генерируем сценарии спроса
    const demandScenarios = await this.scenarioGenerator.generateDemandScenarios(
      demandData,
      config.scenarioCount
    );
    
    // Подготавливаем данные для генерации сценариев конкурентов
    const competitorData = data.map(snapshot => ({
      sku: snapshot.id || 'unknown',
      currentPrice: snapshot.ourPrice || 0,
      competitorPrice: snapshot.competitor?.avg || snapshot.ourPrice || 0,
      reactionModel: {
        responseProbability: 0.3,
        priceChangeDelta: 0.05,
        responseDelay: 24
      } as any
    }));
    
    // Генерируем сценарии конкурентов
    const competitorScenarios = await this.scenarioGenerator.generateCompetitorScenarios(
      competitorData,
      config.scenarioCount
    );
    
    // Генерируем рыночные сценарии
    const marketScenarios = await this.scenarioGenerator.generateMarketScenarios(
      30, // timeHorizon в днях
      config.scenarioCount
    );
    
    return [...demandScenarios, ...competitorScenarios, ...marketScenarios];
  }

  /**
   * Расчет метрик бэктестинга
   */
  private async calculateBacktestMetrics(
    data: Array<Snapshot & { incomplete: boolean }>,
    counterfactuals: CounterfactualTrajectory[],
    competitorReactions: ReactionSimulation[],
    scenarios: any[],
    config: BacktestConfig
  ): Promise<{
    summary: any;
    dailyMetrics: any[];
    competitorAnalysis: any;
    scenarioAnalysis: any;
  }> {
    this.logger.log('Calculating backtest metrics and KPIs');
    
    // Группируем данные по дням
    const dailyData = this.groupDataByDay(data);
    
    // Рассчитываем дневные метрики
    const dailyMetrics = dailyData.map(dayData => ({
      date: dayData.date,
      pnl: dayData.snapshots.reduce((sum, s) => sum + this.calculatePnL(s, s.price), 0),
      revenue: dayData.snapshots.reduce((sum, s) => sum + (s.price * (typeof s.stock === 'number' ? s.stock : s.stock?.onHand || 0)), 0),
      cost: dayData.snapshots.reduce((sum, s) => sum + ((s.cost || 0) * this.getStockValue(s)), 0),
      margin: dayData.snapshots.reduce((sum, s) => sum + (this.getPriceValue(s) - (s.cost || 0) - (s.fee || 0)), 0),
      unitsSold: dayData.snapshots.reduce((sum, s) => sum + this.getStockValue(s), 0),
      stockLevel: this.getStockValue(dayData.snapshots[dayData.snapshots.length - 1] || {} as Snapshot),
      price: this.getPriceValue(dayData.snapshots[dayData.snapshots.length - 1] || {} as Snapshot)
    }));
    
    // Сводные метрики
    const summary = {
      totalPnL: dailyMetrics.reduce((sum, d) => sum + d.pnl, 0),
      totalRevenue: dailyMetrics.reduce((sum, d) => sum + d.revenue, 0),
      totalCost: dailyMetrics.reduce((sum, d) => sum + d.cost, 0),
      averageMargin: dailyMetrics.reduce((sum, d) => sum + d.margin, 0) / dailyMetrics.length,
      stockOutRate: this.calculateStockOutRate(data),
      daysOfCover: this.calculateDaysOfCover(data),
      turnoverSpeed: this.calculateTurnoverSpeed(data)
    };
    
    // Анализ конкурентов
    const competitorAnalysis = await this.analyzeCompetitorImpact(competitorReactions, data);
    
    // Анализ сценариев
    const scenarioAnalysis = this.analyzeScenarios(scenarios, dailyMetrics);
    
    return {
      summary,
      dailyMetrics,
      competitorAnalysis,
      scenarioAnalysis
    };
  }

  /**
   * Группировка данных по дням
   */
  private groupDataByDay(data: Array<Snapshot & { incomplete: boolean }>): Array<{
    date: string;
    snapshots: Array<Snapshot & { incomplete: boolean }>;
  }> {
    const dailyGroups = new Map<string, Array<Snapshot & { incomplete: boolean }>>();
    
    for (const snapshot of data) {
      if (snapshot.incomplete) continue;
      
      const date = new Date(snapshot.timestamp).toISOString().split('T')[0];
      
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      
      dailyGroups.get(date)!.push(snapshot);
    }
    
    return Array.from(dailyGroups.entries()).map(([date, snapshots]) => ({
      date,
      snapshots: snapshots.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }));
  }

  /**
   * Расчет метрик риска
   */
  private async calculateRiskMetrics(
    dailyMetrics: any[],
    config: BacktestConfig
  ): Promise<any> {
    if (dailyMetrics.length < 2) {
      return {
        var95: 0,
        cvar95: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        calmarRatio: 0,
        volatility: 0,
        skewness: 0,
        kurtosis: 0
      };
    }
    
    // Рассчитываем доходности
    const returns = dailyMetrics.slice(1).map((day, i) => {
      const prevPnL = dailyMetrics[i].pnl;
      const currPnL = day.pnl;
      return prevPnL !== 0 ? (currPnL - prevPnL) / Math.abs(prevPnL) : 0;
    });
    
    // Используем RiskManagementService для расчета метрик
    const riskMetrics = await this.riskService.calculatePortfolioRisk(
      [returns],
      [1], // единичный вес для одного актива
      config.confidenceLevel
    );
    
    return riskMetrics;
  }

  /**
   * Анализ влияния конкурентов
   */
  private async analyzeCompetitorImpact(
    reactions: ReactionSimulation[],
    data: Array<Snapshot & { incomplete: boolean }>
  ): Promise<any> {
    if (reactions.length === 0) {
      return {
        reactionCount: 0,
        averageReactionTime: 0,
        pricePressure: 0,
        marketShareImpact: 0
      };
    }
    
    const patterns = await this.competitorReactionService.analyzeCompetitorReactionPatterns(reactions);
    
    // Рассчитываем ценовое давление
    const pricePressure = reactions.reduce((sum, r) => sum + Math.abs(r.priceChangePct), 0) / reactions.length;
    
    // Оценка влияния на долю рынка (упрощенно)
    const marketShareImpact = this.estimateMarketShareImpact(reactions, data);
    
    return {
      reactionCount: reactions.length,
      averageReactionTime: patterns.averageReactionTime,
      pricePressure,
      marketShareImpact
    };
  }

  /**
   * Анализ сценариев
   */
  private analyzeScenarios(scenarios: any[], dailyMetrics: any[]): any {
    if (scenarios.length === 0) {
      return {
        bestCase: 0,
        worstCase: 0,
        expectedCase: 0,
        confidenceInterval: { lower: 0, upper: 0 },
        scenarioDistribution: []
      };
    }
    
    // Генерируем распределение прибыли по сценариям
    const profitScenarios = scenarios.map(() => {
      // Упрощенная симуляция прибыли на основе исторических данных
      const randomDay = dailyMetrics[Math.floor(Math.random() * dailyMetrics.length)];
      return randomDay.pnl * (0.8 + Math.random() * 0.4); // ±20% вариация
    });
    
    profitScenarios.sort((a, b) => a - b);
    
    const bestCase = profitScenarios[profitScenarios.length - 1];
    const worstCase = profitScenarios[0];
    const expectedCase = profitScenarios.reduce((sum, p) => sum + p, 0) / profitScenarios.length;
    
    // 95% доверительный интервал
    const lowerIndex = Math.floor(profitScenarios.length * 0.025);
    const upperIndex = Math.floor(profitScenarios.length * 0.975);
    const confidenceInterval = {
      lower: profitScenarios[lowerIndex],
      upper: profitScenarios[upperIndex]
    };
    
    // Распределение сценариев
    const scenarioDistribution = this.createScenarioDistribution(profitScenarios);
    
    return {
      bestCase,
      worstCase,
      expectedCase,
      confidenceInterval,
      scenarioDistribution
    };
  }

  /**
   * Создание распределения сценариев
   */
  private createScenarioDistribution(profits: number[]): Array<{ profit: number; probability: number }> {
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    const bucketCount = 10;
    const bucketSize = (maxProfit - minProfit) / bucketCount;
    
    const buckets = new Array(bucketCount).fill(0);
    
    for (const profit of profits) {
      const bucketIndex = Math.min(Math.floor((profit - minProfit) / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    }
    
    return buckets.map((count, index) => ({
      profit: minProfit + (index + 0.5) * bucketSize,
      probability: count / profits.length
    }));
  }

  /**
   * Генерация рекомендаций
   */
  private async generateRecommendations(
    metrics: any,
    riskMetrics: any,
    counterfactuals: CounterfactualTrajectory[],
    competitorReactions: ReactionSimulation[]
  ): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Анализ ценообразования
    if (counterfactuals.length > 0) {
      const avgImprovement = counterfactuals.reduce((sum, c) => sum + c.improvement, 0) / counterfactuals.length;
      
      if (avgImprovement > 100) {
        recommendations.push({
          type: 'PRICING',
          priority: 'HIGH',
          description: 'Significant pricing optimization opportunities detected',
          expectedImpact: avgImprovement,
          implementation: 'Review pricing strategy and implement dynamic pricing'
        });
      }
    }
    
    // Анализ рисков
    if (riskMetrics.maxDrawdown < -0.2) {
      recommendations.push({
        type: 'RISK',
        priority: 'HIGH',
        description: 'High maximum drawdown detected',
        expectedImpact: riskMetrics.maxDrawdown,
        implementation: 'Implement stop-loss mechanisms and risk controls'
      });
    }
    
    // Анализ конкурентов
    if (competitorReactions.length > 0) {
      const avgReactionTime = competitorReactions.reduce((sum, r) => sum + r.delay, 0) / competitorReactions.length;
      
      if (avgReactionTime < 30) {
        recommendations.push({
          type: 'COMPETITIVE',
          priority: 'MEDIUM',
          description: 'Competitors are reacting quickly to price changes',
          expectedImpact: -0.1,
          implementation: 'Implement stealth pricing strategies and timing optimization'
        });
      }
    }
    
    // Анализ запасов
    if (metrics.summary.stockOutRate > 0.1) {
      recommendations.push({
        type: 'INVENTORY',
        priority: 'MEDIUM',
        description: 'High stock-out rate detected',
        expectedImpact: -0.15,
        implementation: 'Improve demand forecasting and inventory management'
      });
    }
    
    return recommendations;
  }

  /**
   * Вспомогательные методы для расчета KPI
   */
  private calculateStockOutRate(data: Array<Snapshot & { incomplete: boolean }>): number {
    const totalSnapshots = data.filter(s => !s.incomplete).length;
    const stockOutSnapshots = data.filter(s => !s.incomplete && (s.stock || 0) === 0).length;
    
    return totalSnapshots > 0 ? stockOutSnapshots / totalSnapshots : 0;
  }

  private calculateDaysOfCover(data: Array<Snapshot & { incomplete: boolean }>): number {
    const validData = data.filter(s => !s.incomplete);
    if (validData.length === 0) return 0;
    
    const avgStock = validData.reduce((sum, s) => sum + (typeof s.stock === 'number' ? s.stock : s.stock?.onHand || 0), 0) / validData.length;
    const avgDemand = validData.reduce((sum, s) => sum + (typeof s.demand === 'number' ? s.demand : s.demand?.mu || 0), 0) / validData.length;
    
    return avgDemand > 0 ? avgStock / avgDemand : 0;
  }

  private calculateTurnoverSpeed(data: Array<Snapshot & { incomplete: boolean }>): number {
    const validData = data.filter(s => !s.incomplete);
    if (validData.length === 0) return 0;
    
    const totalRevenue = validData.reduce((sum, s) => sum + (s.price * (typeof s.stock === 'number' ? s.stock : s.stock?.onHand || 0)), 0);
    const avgInventory = validData.reduce((sum, s) => sum + (typeof s.stock === 'number' ? s.stock : s.stock?.onHand || 0), 0) / validData.length;
    
    return avgInventory > 0 ? totalRevenue / avgInventory : 0;
  }

  private estimateMarketShareImpact(reactions: ReactionSimulation[], data: Array<Snapshot & { incomplete: boolean }>): number {
    if (reactions.length === 0) return 0;

    // Анализируем влияние реакций конкурентов на долю рынка
    const totalReactions = reactions.length;
    const aggressiveReactions = reactions.filter(r => 
      (r.priceChangePct || 0) < -0.1 // Снижение цены более чем на 10%
    ).length;

    // Чем больше агрессивных реакций, тем больше влияние на долю рынка
    const aggressiveRatio = aggressiveReactions / totalReactions;
    return Math.min(1.0, aggressiveRatio * 2); // Нормализуем к [0, 1]
  }

  /**
   * Helper функция для безопасного извлечения значения stock
   */
  private getStockValue(snapshot: Snapshot): number {
    if (typeof snapshot.stock === 'number') {
      return snapshot.stock;
    }
    return snapshot.stock.onHand + snapshot.stock.reserved;
  }

  /**
   * Helper функция для безопасного извлечения значения demand
   */
  private getDemandValue(snapshot: Snapshot): number {
    if (typeof snapshot.demand === 'number') {
      return snapshot.demand;
    }
    return snapshot.demand?.mu || 0;
  }

  /**
   * Helper функция для безопасного извлечения значения price
   */
  private getPriceValue(snapshot: Snapshot): number {
    return snapshot.price || snapshot.ourPrice;
  }

  /**
   * Создает новый бэктест в базе данных
   */
  async createBacktest(createBacktestDto: any): Promise<BacktestResult> {
    try {
      const backtest = this.backtestRepository.create({
        ...createBacktestDto,
        status: BacktestStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.backtestRepository.create(backtest as any);
    } catch (error) {
      this.logger.error('Failed to create backtest', error);
      throw error;
    }
  }

  /**
   * Ставит бэктест в очередь на выполнение
   */
  async queueBacktest(backtestId: string): Promise<void> {
    try {
      // Обновляем статус на RUNNING
      await this.backtestRepository.updateStatus(backtestId, BacktestStatus.RUNNING, {
        startedAt: new Date(),
        updatedAt: new Date(),
      });

      // Здесь можно добавить логику для постановки в очередь Bull
      this.logger.log(`Backtest ${backtestId} queued for execution`);
    } catch (error) {
      this.logger.error('Failed to queue backtest', error);
      throw error;
    }
  }
}
