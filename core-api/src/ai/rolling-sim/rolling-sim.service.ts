import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompetitorSnapshot } from '../../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../../entities/stock-snapshot.entity';
import { Offer } from '../../entities/offer.entity';
import { PricePolicy } from '../../entities/price-policy.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { TimeSyncPipe } from '../../common/pipes/time-sync.pipe';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  horizon: number; // Weeks to simulate
  marketConditions: {
    competitorAggressiveness: 'low' | 'medium' | 'high';
    demandVolatility: 'low' | 'medium' | 'high';
    supplyDisruption: 'none' | 'partial' | 'severe';
    seasonality: 'none' | 'moderate' | 'strong';
  };
  constraints: {
    maxPriceChange: number;
    minMargin: number;
    maxInventoryRisk: number;
  };
}

export interface SimulationStep {
  week: number;
  skuId: string;
  currentPrice: number;
  competitorPrice: number;
  stockLevel: number;
  demand: number;
  action: 'price_change' | 'inventory_adjustment' | 'hold';
  newPrice?: number;
  newStock?: number;
  expectedRevenue: number;
  expectedCost: number;
  expectedProfit: number;
}

export interface SimulationResult {
  id: string;
  scenarioId: string;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  maxDrawdown: number;
  sharpeRatio: number;
  steps: SimulationStep[];
  competitorReactions: Array<{
    week: number;
    skuId: string;
    reactionType: string;
    priceChange: number;
  }>;
  marketInsights: {
    priceVolatility: number;
    demandTrends: string[];
    competitiveIntensity: number;
    seasonalityImpact: number;
  };
  createdAt: Date;
}

export interface RetrainingTrigger {
  id: string;
  type: 'weekly' | 'performance_threshold' | 'market_change' | 'manual';
  description: string;
  performanceMetrics: {
    currentProfitMargin: number;
    targetProfitMargin: number;
    currentSharpeRatio: number;
    targetSharpeRatio: number;
  };
  marketChanges: {
    competitorCountChange: number;
    priceVolatilityChange: number;
    demandPatternChange: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class RollingSimService {
  private readonly logger = new Logger(RollingSimService.name);

  constructor(
    @InjectRepository(CompetitorSnapshot)
    private readonly competitorSnapshotRepository: Repository<CompetitorSnapshot>,
    @InjectRepository(StockSnapshot)
    private readonly stockSnapshotRepository: Repository<StockSnapshot>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectQueue('ai-retrain')
    private readonly retrainQueue: Queue,
    private readonly timeSyncPipe: TimeSyncPipe,
  ) {}

  /**
   * Weekly retraining trigger (CRON job)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async triggerWeeklyRetraining() {
    this.logger.log('Triggering weekly retraining');
    
    try {
      const trigger: RetrainingTrigger = {
        id: this.generateTriggerId(),
        type: 'weekly',
        description: 'Weekly scheduled retraining',
        performanceMetrics: {
          currentProfitMargin: 0, // Will be calculated
          targetProfitMargin: 0.15, // 15% target
          currentSharpeRatio: 0, // Will be calculated
          targetSharpeRatio: 1.0, // Target Sharpe ratio
        },
        marketChanges: {
          competitorCountChange: 0, // Will be calculated
          priceVolatilityChange: 0, // Will be calculated
          demandPatternChange: 'stable', // Will be analyzed
        },
        status: 'pending',
        createdAt: new Date(),
      };

      // Calculate current performance metrics
      const currentMetrics = await this.calculateCurrentPerformance();
      trigger.performanceMetrics = { ...trigger.performanceMetrics, ...currentMetrics };

      // Analyze market changes
      const marketChanges = await this.analyzeMarketChanges();
      trigger.marketChanges = { ...trigger.marketChanges, ...marketChanges };

      // Queue retraining job
      await this.queueRetraining(trigger);

      // Log the trigger
      await this.logRetrainingTrigger(trigger);

    } catch (error) {
      this.logger.error(`Weekly retraining failed: ${error.message}`);
    }
  }

  /**
   * Run rolling simulation for a specific scenario
   */
  async runRollingSimulation(scenario: SimulationScenario): Promise<SimulationResult> {
    this.logger.log(`Starting rolling simulation for scenario: ${scenario.name}`);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + scenario.horizon * 7 * 24 * 60 * 60 * 1000);

    // 1. Initialize simulation state
    const simulationState = await this.initializeSimulationState(scenario);
    
    // 2. Run simulation steps
    const steps: SimulationStep[] = [];
    const competitorReactions: any[] = [];
    
    for (let week = 1; week <= scenario.horizon; week++) {
      const weekSteps = await this.simulateWeek(week, simulationState, scenario);
      steps.push(...weekSteps);
      
      // Simulate competitor reactions
      const reactions = this.simulateCompetitorReactions(week, weekSteps, scenario);
      competitorReactions.push(...reactions);
      
      // Update simulation state for next week
      this.updateSimulationState(simulationState, weekSteps, reactions);
    }

    // 3. Calculate final metrics
    const metrics = this.calculateSimulationMetrics(steps);
    const marketInsights = this.analyzeMarketInsights(steps, competitorReactions, scenario);

    const result: SimulationResult = {
      id: this.generateSimulationId(),
      scenarioId: scenario.id,
      startDate,
      endDate,
      ...metrics,
      steps,
      competitorReactions,
      marketInsights,
      createdAt: new Date(),
    };

    this.logger.log(`Rolling simulation completed. Total profit: ${result.totalProfit}`);
    return result;
  }

  /**
   * Queue retraining job
   */
  async queueRetraining(trigger: RetrainingTrigger): Promise<{ jobId: string; status: string }> {
    const job = await this.retrainQueue.add('retrain-strategy', trigger, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      priority: trigger.type === 'performance_threshold' ? 1 : 2,
    });

    return {
      jobId: job.id.toString(),
      status: 'queued',
    };
  }

  /**
   * Get retraining status
   */
  async getRetrainingStatus(jobId: string): Promise<any> {
    const job = await this.retrainQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    return {
      jobId,
      status: await job.getState(),
      progress: job.progress(),
      result: job.returnvalue,
      error: job.failedReason,
      trigger: job.data,
    };
  }

  /**
   * Get retraining history
   */
  async getRetrainingHistory(limit: number = 20): Promise<RetrainingTrigger[]> {
    const completedJobs = await this.retrainQueue.getJobs(['completed', 'failed'], 0, limit);
    
    const results = [];
    for (const job of completedJobs) {
      results.push({
        ...job.data,
        status: await job.getState(),
        completedAt: job.finishedOn,
      });
    }
    return results;
  }

  /**
   * Initialize simulation state
   */
  private async initializeSimulationState(scenario: SimulationScenario) {
    // Get current market state
    const activeOffers = await this.offerRepository.find({
      where: { listingStatus: 'published' as any },
      relations: ['pricePolicy'],
    });

    const state: any = {
      offers: {},
      competitors: {},
      market: {
        week: 0,
        totalDemand: 0,
        averagePrice: 0,
        competitorCount: 0,
      },
    };

    for (const offer of activeOffers) {
      const competitorData = await this.getLatestCompetitorData(offer.id);
      const stockData = await this.getLatestStockData(offer.id);

      state.offers[offer.id] = {
        currentPrice: offer.price || 0,
        stockLevel: stockData?.availableStock || 0,
        pricePolicy: offer.pricePolicy,
        baseDemand: this.calculateBaseDemand(offer, competitorData, stockData),
      };

      if (competitorData) {
        state.competitors[offer.id] = {
          currentPrice: competitorData.minCompetitorPrice || offer.price || 0,
          count: competitorData.competitorsCount || 0,
          aggressiveness: scenario.marketConditions.competitorAggressiveness,
        };
      }
    }

    return state;
  }

  /**
   * Simulate a single week
   */
  private async simulateWeek(
    week: number,
    state: any,
    scenario: SimulationScenario,
  ): Promise<SimulationStep[]> {
    const steps: SimulationStep[] = [];

    for (const [skuId, offerData] of Object.entries(state.offers)) {
      const typedOfferData = offerData as any;
      
      // Calculate demand for this week
      const demand = this.calculateWeeklyDemand(typedOfferData, week, scenario);
      
      // Calculate optimal action
      const action = this.calculateOptimalAction(typedOfferData, state.competitors[skuId], demand, scenario);
      
      // Execute action
      const newPrice = action.type === 'price_change' ? action.newPrice : typedOfferData.currentPrice;
      const newStock = action.type === 'inventory_adjustment' ? action.newStock : (typeof typedOfferData.stock === 'number' ? typedOfferData.stock : typedOfferData.stock?.onHand || 0);
      
      // Calculate expected outcomes
      const expectedRevenue = demand * newPrice;
      const expectedCost = demand * (typedOfferData.pricePolicy?.cogs || 0);
      const expectedProfit = expectedRevenue - expectedCost;
      
      // Update state
      typedOfferData.currentPrice = newPrice;
      if (typeof typedOfferData.stock === 'number') {
        typedOfferData.stock = newStock;
      } else if (typedOfferData.stock) {
        typedOfferData.stock.onHand = newStock;
      }
      
      const step: SimulationStep = {
        week,
        skuId,
        currentPrice: typedOfferData.currentPrice,
        competitorPrice: state.competitors[skuId]?.currentPrice || 0,
        stockLevel: typeof typedOfferData.stock === 'number' ? typedOfferData.stock : typedOfferData.stock?.onHand || 0,
        demand,
        action: action.type,
        newPrice: action.type === 'price_change' ? action.newPrice : undefined,
        newStock: action.type === 'inventory_adjustment' ? action.newStock : undefined,
        expectedRevenue,
        expectedCost,
        expectedProfit,
      };
      
      steps.push(step);
    }

    return steps;
  }

  /**
   * Simulate competitor reactions
   */
  private simulateCompetitorReactions(
    week: number,
    steps: SimulationStep[],
    scenario: SimulationScenario,
  ): Array<{ week: number; skuId: string; reactionType: string; priceChange: number }> {
    const reactions: any[] = [];

    for (const step of steps) {
      if (step.action === 'price_change' && step.newPrice) {
        const priceChange = (step.newPrice - step.currentPrice) / step.currentPrice;
        
        // Simulate competitor reaction based on scenario
        let reactionType = 'none';
        let reactionPriceChange = 0;
        
        switch (scenario.marketConditions.competitorAggressiveness) {
          case 'high':
            if (priceChange < -0.05) {
              reactionType = 'aggressive_undercut';
              reactionPriceChange = priceChange * 1.2; // More aggressive
            }
            break;
          case 'medium':
            if (priceChange < -0.1) {
              reactionType = 'moderate_response';
              reactionPriceChange = priceChange * 0.8; // Moderate response
            }
            break;
          case 'low':
            if (priceChange < -0.15) {
              reactionType = 'delayed_response';
              reactionPriceChange = priceChange * 0.5; // Delayed response
            }
            break;
        }
        
        if (reactionType !== 'none') {
          reactions.push({
            week,
            skuId: step.skuId,
            reactionType,
            priceChange: reactionPriceChange,
          });
        }
      }
    }

    return reactions;
  }

  /**
   * Update simulation state based on actions and reactions
   */
  private updateSimulationState(state: any, steps: SimulationStep[], reactions: any[]) {
    // Update offer prices and stock levels
    for (const step of steps) {
      if (state.offers[step.skuId]) {
        state.offers[step.skuId].currentPrice = step.newPrice || step.currentPrice;
        state.offers[step.skuId].stockLevel = step.newStock || step.stockLevel;
      }
    }
    
    // Update competitor prices based on reactions
    for (const reaction of reactions) {
      if (state.competitors[reaction.skuId]) {
        const currentPrice = state.competitors[reaction.skuId].currentPrice;
        state.competitors[reaction.skuId].currentPrice = currentPrice * (1 + reaction.priceChange);
      }
    }
    
    // Update market metrics
    state.market.week++;
    state.market.totalDemand = steps.reduce((sum, step) => sum + step.demand, 0);
    state.market.averagePrice = steps.reduce((sum, step) => sum + step.currentPrice, 0) / steps.length;
  }

  /**
   * Calculate simulation metrics
   */
  private calculateSimulationMetrics(steps: SimulationStep[]) {
    const totalRevenue = steps.reduce((sum, step) => sum + step.expectedRevenue, 0);
    const totalCost = steps.reduce((sum, step) => sum + step.expectedCost, 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
    
    // Calculate drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningProfit = 0;
    
    for (const step of steps) {
      runningProfit += step.expectedProfit;
      if (runningProfit > peak) {
        peak = runningProfit;
      }
      const drawdown = peak - runningProfit;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    // Calculate Sharpe ratio (simplified)
    const avgReturn = totalProfit / steps.length;
    const returns = steps.map(step => step.expectedProfit - avgReturn);
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);
    const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;
    
    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      maxDrawdown,
      sharpeRatio,
    };
  }

  /**
   * Analyze market insights from simulation
   */
  private analyzeMarketInsights(
    steps: SimulationStep[],
    reactions: any[],
    scenario: SimulationScenario,
  ) {
    // Calculate price volatility
    const prices = steps.map(step => step.currentPrice);
    const priceVolatility = this.calculatePriceVolatility(prices);
    
    // Analyze demand trends
    const demandTrends = this.analyzeDemandTrends(steps);
    
    // Calculate competitive intensity
    const competitiveIntensity = this.calculateCompetitiveIntensity(reactions, steps);
    
    // Calculate seasonality impact
    const seasonalityImpact = this.calculateSeasonalityImpact(steps, scenario);
    
    return {
      priceVolatility,
      demandTrends,
      competitiveIntensity,
      seasonalityImpact,
    };
  }

  /**
   * Calculate current performance metrics
   */
  private async calculateCurrentPerformance() {
    // Get recent performance data
    const recentOffers = await this.offerRepository.find({
      where: { listingStatus: 'published' as any },
      relations: ['pricePolicy'],
    });
    
    let totalRevenue = 0;
    let totalCost = 0;
    
    for (const offer of recentOffers) {
            // Simplified calculation - in production would use actual sales data   
      const estimatedRevenue = (offer.currentPrice || 0) * 10; // Assume 10 units sold
      const estimatedCost = (offer.pricePolicy?.cogs || 0) * 10;
      
      totalRevenue += estimatedRevenue;
      totalCost += estimatedCost;
    }
    
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
    
    // Simplified Sharpe ratio calculation
    const sharpeRatio = profitMargin > 0 ? profitMargin / 0.1 : 0; // Assume 10% volatility
    
    return {
      currentProfitMargin: profitMargin,
      currentSharpeRatio: sharpeRatio,
    };
  }

  /**
   * Analyze market changes
   */
  private async analyzeMarketChanges() {
    // Get recent competitor data
    const recentCompetitors = await this.competitorSnapshotRepository
      .createQueryBuilder('cs')
      .where('cs.ts >= :date', { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
      .getMany();
    
    // Calculate competitor count change
    const avgCompetitorCount = recentCompetitors.reduce((sum, cs) => sum + cs.competitorsCount, 0) / recentCompetitors.length;
    const competitorCountChange = avgCompetitorCount > 5 ? 0.1 : -0.1; // Simplified
    
    // Calculate price volatility change
    const priceVolatilityChange = 0.05; // Simplified - would calculate actual change
    
    // Analyze demand pattern changes
    const demandPatternChange = 'stable'; // Simplified - would analyze actual patterns
    
    return {
      competitorCountChange,
      priceVolatilityChange,
      demandPatternChange,
    };
  }

  /**
   * Queue retraining job
   */
  private async queueRetrainingJob(trigger: RetrainingTrigger) {
    // This would integrate with the actual retraining pipeline
    this.logger.log(`Queuing retraining job for trigger: ${trigger.id}`);
  }

  /**
   * Log retraining trigger
   */
  private async logRetrainingTrigger(trigger: RetrainingTrigger) {
    const auditLog = this.auditLogRepository.create({
      resourceType: 'AI_STRATEGY' as any,
      entityType: 'AI_STRATEGY',
      resourceId: trigger.id,
      entityId: trigger.id,
      userId: 'system',
      timestamp: new Date(),
      description: `AI Strategy Update: ${trigger.type}`,
    });
    
    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Helper methods for calculations
   */
  private calculateBaseDemand(offer: Offer, competitorData: CompetitorSnapshot | null, stockData: StockSnapshot | null): number {
    // Base demand calculation based on market position and stock
    let baseDemand = 10; // Default demand
    
    if (competitorData) {
      if (competitorData.ourPosition <= 3) {
        baseDemand = 20; // High demand for top positions
      } else if (competitorData.ourPosition <= 6) {
        baseDemand = 15; // Medium demand for middle positions
      } else {
        baseDemand = 5; // Low demand for lower positions
      }
    }
    
    if (stockData && stockData.availableStock < baseDemand) {
      baseDemand = stockData.availableStock * 0.5; // Reduce demand if low stock
    }
    
    return baseDemand;
  }

  private calculateWeeklyDemand(offerData: any, week: number, scenario: SimulationScenario): number {
    let demand = offerData.baseDemand;
    
    // Apply seasonality
    if (scenario.marketConditions.seasonality === 'strong') {
      demand *= (1 + 0.3 * Math.sin((week - 1) * Math.PI / 4)); // Weekly seasonality
    } else if (scenario.marketConditions.seasonality === 'moderate') {
      demand *= (1 + 0.15 * Math.sin((week - 1) * Math.PI / 4));
    }
    
    // Apply demand volatility
    if (scenario.marketConditions.demandVolatility === 'high') {
      demand *= (0.8 + Math.random() * 0.4); // ±20% volatility
    } else if (scenario.marketConditions.demandVolatility === 'medium') {
      demand *= (0.9 + Math.random() * 0.2); // ±10% volatility
    }
    
    return Math.max(1, Math.floor(demand));
  }

  private calculateOptimalAction(offerData: any, competitorData: any, demand: number, scenario: SimulationScenario) {
    const currentPrice = offerData.currentPrice;
    const competitorPrice = competitorData?.currentPrice || currentPrice;
    const stockLevel = offerData.stockLevel;
    
    // Simple action logic - in production would use ML models
    if (currentPrice > competitorPrice * 1.1 && stockLevel > demand * 2) {
      return {
        type: 'price_change' as const,
        newPrice: competitorPrice * 1.05, // Undercut competitor slightly
      };
    } else if (stockLevel < demand && currentPrice < competitorPrice * 0.9) {
      return {
        type: 'price_change' as const,
        newPrice: currentPrice * 1.1, // Increase price if low stock
      };
    } else if (stockLevel < demand * 0.5) {
      return {
        type: 'inventory_adjustment' as const,
        newStock: demand * 2, // Restock
      };
    }
    
    return { type: 'hold' as const };
  }

  private calculatePriceVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private analyzeDemandTrends(steps: SimulationStep[]): string[] {
    const trends: string[] = [];
    
    // Group by SKU and analyze trends
    const skuGroups = steps.reduce((groups, step) => {
      if (!groups[step.skuId]) groups[step.skuId] = [];
      groups[step.skuId].push(step);
      return groups;
    }, {} as Record<string, SimulationStep[]>);
    
    for (const [skuId, skuSteps] of Object.entries(skuGroups)) {
      if (skuSteps.length >= 2) {
        const firstDemand = skuSteps[0].demand;
        const lastDemand = skuSteps[skuSteps.length - 1].demand;
        
        if (lastDemand > firstDemand * 1.2) {
          trends.push(`${skuId}: Increasing demand`);
        } else if (lastDemand < firstDemand * 0.8) {
          trends.push(`${skuId}: Decreasing demand`);
        } else {
          trends.push(`${skuId}: Stable demand`);
        }
      }
    }
    
    return trends;
  }

  private calculateCompetitiveIntensity(reactions: any[], steps: SimulationStep[]): number {
    if (reactions.length === 0) return 0;
    
    // Calculate based on reaction frequency and intensity
    const reactionIntensity = reactions.reduce((sum, reaction) => sum + Math.abs(reaction.priceChange), 0);
    const avgIntensity = reactionIntensity / reactions.length;
    
    return Math.min(1.0, avgIntensity * 10); // Scale to 0-1
  }

  private calculateSeasonalityImpact(steps: SimulationStep[], scenario: SimulationScenario): number {
    if (scenario.marketConditions.seasonality === 'none') return 0;
    
    // Calculate demand variation across weeks
    const weeklyDemand = steps.reduce((weekly, step) => {
      if (!weekly[step.week]) weekly[step.week] = 0;
      weekly[step.week] += step.demand;
      return weekly;
    }, {} as Record<number, number>);
    
    const demands = Object.values(weeklyDemand);
    if (demands.length < 2) return 0;
    
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private getLatestCompetitorData(skuId: string): Promise<CompetitorSnapshot | null> {
    return this.competitorSnapshotRepository
      .createQueryBuilder('cs')
      .where('cs.offerId = :skuId', { skuId })
      .orderBy('cs.ts', 'DESC')
      .getOne();
  }

  private getLatestStockData(skuId: string): Promise<StockSnapshot | null> {
    return this.stockSnapshotRepository
      .createQueryBuilder('ss')
      .where('ss.offerId = :skuId', { skuId })
      .orderBy('ss.ts', 'DESC')
      .getOne();
  }

  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
