import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CompetitorSnapshot } from '../../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../../entities/stock-snapshot.entity';
import { Offer } from '../../entities/offer.entity';
import { PricePolicy } from '../../entities/price-policy.entity';
import { TimeSyncPipe } from '../../common/pipes/time-sync.pipe';

export interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  pricingRules: {
    minMarginPct: number;
    maxDeltaPctDay: number;
    strategy: string;
    competitorWeight: number;
    stockWeight: number;
    demandWeight: number;
  };
  capitalAllocation?: {
    maxVaR: number;
    minLiquidity: number;
    maxConcentration: number;
  };
}

export interface BacktestInputs {
  strategy: BacktestStrategy;
  startDate: Date;
  endDate: Date;
  skuIds: string[];
  initialCapital: number;
  augmentationConfig: {
    fillMissingData: boolean;
    competitorReactionModel: 'linear' | 'aggressive' | 'conservative';
    demandInterpolation: 'linear' | 'seasonal' | 'ml';
  };
}

export interface BacktestMetrics {
  totalPnL: number;
  totalRevenue: number;
  totalCosts: number;
  maxDrawdown: number;
  sharpeRatio: number;
  var95: number;
  liquidityRatio: number;
  winRate: number;
  avgTradeSize: number;
  totalTrades: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  startDate: Date;
  endDate: Date;
  metrics: BacktestMetrics;
  trades: Array<{
    timestamp: Date;
    skuId: string;
    action: 'buy' | 'sell' | 'price_change';
    price: number;
    quantity: number;
    pnl: number;
  }>;
  capitalAllocation: Array<{
    timestamp: Date;
    skuId: string;
    allocatedAmount: number;
    riskScore: number;
  }>;
  augmentedDataPoints: number;
  confidence: number;
  createdAt: Date;
}

@Injectable()
export class AugmentedBacktestService {
  private readonly logger = new Logger(AugmentedBacktestService.name);

  constructor(
    @InjectRepository(CompetitorSnapshot)
    private readonly competitorSnapshotRepository: Repository<CompetitorSnapshot>,
    @InjectRepository(StockSnapshot)
    private readonly stockSnapshotRepository: Repository<StockSnapshot>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    @InjectQueue('ai-backtest')
    private readonly backtestQueue: Queue,
    private readonly timeSyncPipe: TimeSyncPipe,
  ) {}

  /**
   * Queue a backtest job for asynchronous execution
   */
  async queueBacktest(inputs: BacktestInputs): Promise<{ jobId: string; status: string }> {
    const job = await this.backtestQueue.add('run-backtest', inputs, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return {
      jobId: job.id.toString(),
      status: 'queued',
    };
  }

  /**
   * Run backtest synchronously (for small datasets or immediate results)
   */
  async runBacktest(inputs: BacktestInputs): Promise<BacktestResult> {
    this.logger.log(`Starting backtest for strategy: ${inputs.strategy.name}`);

    // 1. Collect historical data
    const historicalData = await this.collectHistoricalData(inputs);
    
    // 2. Augment missing data points
    const augmentedData = await this.augmentMissingData(historicalData, inputs.augmentationConfig);
    
    // 3. Run simulation
    const simulationResult = await this.runSimulation(augmentedData, inputs);
    
    // 4. Calculate metrics
    const metrics = this.calculateMetrics(simulationResult);
    
    // 5. Generate result
    const result: BacktestResult = {
      id: this.generateBacktestId(),
      strategyId: inputs.strategy.id,
      startDate: inputs.startDate,
      endDate: inputs.endDate,
      metrics,
      trades: simulationResult.trades,
      capitalAllocation: simulationResult.capitalAllocation,
      augmentedDataPoints: simulationResult.augmentedDataPoints,
      confidence: this.calculateConfidence(augmentedData, inputs),
      createdAt: new Date(),
    };

    this.logger.log(`Backtest completed. PnL: ${metrics.totalPnL}, Confidence: ${result.confidence}`);
    return result;
  }

  /**
   * Collect historical data for backtesting
   */
  private async collectHistoricalData(inputs: BacktestInputs) {
    const { startDate, endDate, skuIds } = inputs;
    
    // Collect competitor snapshots
    const competitorSnapshots = await this.competitorSnapshotRepository
      .createQueryBuilder('cs')
      .where('cs.offerId IN (:...skuIds)', { skuIds })
      .andWhere('cs.ts BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('cs.ts', 'ASC')
      .getMany();

    // Collect stock snapshots
    const stockSnapshots = await this.stockSnapshotRepository
      .createQueryBuilder('ss')
      .where('ss.offerId IN (:...skuIds)', { skuIds })
      .andWhere('ss.ts BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('ss.ts', 'ASC')
      .getMany();

    // Apply time synchronization
    this.timeSyncPipe.markIncompleteIfNeeded([...competitorSnapshots, ...stockSnapshots]);
    
    return {
      competitorSnapshots: this.timeSyncPipe.filterCompleteSnapshots(competitorSnapshots),
      stockSnapshots: this.timeSyncPipe.filterCompleteSnapshots(stockSnapshots),
    };
  }

  /**
   * Augment missing data points using various models
   */
  private async augmentMissingData(historicalData: any, config: any) {
    const { competitorSnapshots, stockSnapshots } = historicalData;
    let augmentedPoints = 0;

    // Create time series with consistent intervals
    const timeSeries = this.createTimeSeries(competitorSnapshots, stockSnapshots);
    
    // Fill missing competitor data
    const augmentedCompetitors = this.augmentCompetitorData(timeSeries, config.competitorReactionModel);
    
    // Fill missing demand/stock data
    const augmentedStock = this.augmentStockData(timeSeries, config.demandInterpolation);
    
    augmentedPoints = augmentedCompetitors.augmented + augmentedStock.augmented;

    return {
      timeSeries,
      competitorData: augmentedCompetitors.data,
      stockData: augmentedStock.data,
      augmentedPoints,
    };
  }

  /**
   * Create consistent time series from snapshots
   */
  private createTimeSeries(competitorSnapshots: any[], stockSnapshots: any[]) {
    const allTimestamps = new Set<number>();
    
    competitorSnapshots.forEach(cs => allTimestamps.add(cs.ts.getTime()));
    stockSnapshots.forEach(ss => allTimestamps.add(ss.ts.getTime()));
    
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    
    // Create hourly intervals
    const hourlySeries = [];
    for (let i = 0; i < sortedTimestamps.length - 1; i++) {
      const current = new Date(sortedTimestamps[i]);
      const next = new Date(sortedTimestamps[i + 1]);
      
      // Add hourly points between snapshots
      while (current < next) {
        hourlySeries.push(new Date(current));
        current.setHours(current.getHours() + 1);
      }
    }
    
    return hourlySeries;
  }

  /**
   * Augment competitor data using reaction models
   */
  private augmentCompetitorData(timeSeries: Date[], model: string) {
    let augmented = 0;
    const data: any[] = [];

    timeSeries.forEach(timestamp => {
      // Simple augmentation logic - in production this would use ML models
      if (model === 'aggressive') {
        // Simulate aggressive competitor reactions
        data.push({
          timestamp,
          reactionType: 'aggressive',
          priceChange: Math.random() * 0.1 - 0.05, // ±5% random change
        });
        augmented++;
      } else if (model === 'conservative') {
        // Simulate conservative competitor reactions
        data.push({
          timestamp,
          reactionType: 'conservative',
          priceChange: Math.random() * 0.02 - 0.01, // ±1% random change
        });
        augmented++;
      } else {
        // Linear interpolation
        data.push({
          timestamp,
          reactionType: 'linear',
          priceChange: 0,
        });
      }
    });

    return { data, augmented };
  }

  /**
   * Augment stock/demand data using interpolation methods
   */
  private augmentStockData(timeSeries: Date[], method: string) {
    let augmented = 0;
    const data: any[] = [];

    timeSeries.forEach(timestamp => {
      if (method === 'seasonal') {
        // Simulate seasonal demand patterns
        const hour = timestamp.getHours();
        const demandMultiplier = 1 + 0.3 * Math.sin((hour - 6) * Math.PI / 12);
        
        data.push({
          timestamp,
          demandMultiplier,
          stockLevel: Math.floor(Math.random() * 100) + 50,
        });
        augmented++;
      } else if (method === 'ml') {
        // Placeholder for ML-based demand prediction
        data.push({
          timestamp,
          demandMultiplier: 1.0,
          stockLevel: 75,
        });
      } else {
        // Linear interpolation
        data.push({
          timestamp,
          demandMultiplier: 1.0,
          stockLevel: 75,
        });
      }
    });

    return { data, augmented };
  }

  /**
   * Run the actual simulation
   */
  private async runSimulation(augmentedData: any, inputs: BacktestInputs) {
    const { strategy, initialCapital } = inputs;
    let currentCapital = initialCapital;
    const trades: any[] = [];
    const capitalAllocation: any[] = [];
    
    // Simulate each time step
    for (let i = 0; i < augmentedData.timeSeries.length; i++) {
      const timestamp = augmentedData.timeSeries[i];
      const competitorData = augmentedData.competitorData[i];
      const stockData = augmentedData.stockData[i];
      
      // Apply strategy rules
      const decision = this.applyStrategyRules(strategy, competitorData, stockData, currentCapital);
      
      if (decision.action !== 'hold') {
        trades.push({
          timestamp,
          skuId: 'simulated-sku',
          action: decision.action,
          price: decision.price,
          quantity: decision.quantity,
          pnl: decision.pnl,
        });
        
        currentCapital += decision.pnl;
      }
      
      // Track capital allocation
      capitalAllocation.push({
        timestamp,
        skuId: 'simulated-sku',
        allocatedAmount: currentCapital * 0.1, // 10% allocation example
        riskScore: this.calculateRiskScore(decision, currentCapital),
      });
    }
    
    return {
      trades,
      capitalAllocation,
      augmentedDataPoints: augmentedData.augmentedPoints,
    };
  }

  /**
   * Apply strategy rules to make decisions
   */
  private applyStrategyRules(strategy: BacktestStrategy, competitorData: any, stockData: any, currentCapital: number) {
    const { pricingRules } = strategy;
    
    // Simple decision logic - in production this would be more sophisticated
    const basePrice = 100; // Example base price
    const competitorPrice = basePrice * (1 + competitorData.priceChange);
    const demandMultiplier = stockData.demandMultiplier;
    
    let action = 'hold';
    let price = basePrice;
    let quantity = 0;
    let pnl = 0;
    
    // Example decision logic
    if (competitorPrice < basePrice * 0.9) {
      action = 'price_change';
      price = competitorPrice * 0.95; // Undercut competitor
      pnl = -basePrice * 0.05; // Small loss for competitive positioning
    } else if (demandMultiplier > 1.2) {
      action = 'buy';
      quantity = Math.floor(currentCapital * 0.1 / basePrice);
      pnl = -quantity * basePrice;
    }
    
    return { action, price, quantity, pnl };
  }

  /**
   * Calculate risk score for capital allocation
   */
  private calculateRiskScore(decision: any, currentCapital: number): number {
    if (decision.action === 'hold') return 0;
    
    const riskMultiplier = decision.action === 'buy' ? 1.5 : 0.8;
    const capitalRisk = Math.abs(decision.pnl) / currentCapital;
    
    return Math.min(capitalRisk * riskMultiplier, 1.0);
  }

  /**
   * Calculate comprehensive backtest metrics
   */
  private calculateMetrics(simulationResult: any): BacktestMetrics {
    const { trades } = simulationResult;
    
    const totalPnL = trades.reduce((sum: number, trade: any) => sum + trade.pnl, 0);
    const totalRevenue = trades.filter((t: any) => t.action === 'sell').reduce((sum: number, t: any) => sum + t.price * t.quantity, 0);
    const totalCosts = trades.filter((t: any) => t.action === 'buy').reduce((sum: number, t: any) => sum + t.price * t.quantity, 0);
    
    // Calculate drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;
    
    trades.forEach((trade: any) => {
      runningPnL += trade.pnl;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // Calculate VaR (Value at Risk) - 95% confidence
    const pnlValues = trades.map((t: any) => t.pnl).sort((a: number, b: number) => a - b);
    const var95Index = Math.floor(pnlValues.length * 0.05);
    const var95 = pnlValues[var95Index] || 0;
    
    // Calculate Sharpe ratio (simplified)
    const avgReturn = totalPnL / trades.length;
    const returns = trades.map((t: any) => t.pnl - avgReturn);
    const volatility = Math.sqrt(returns.reduce((sum: number, r: number) => sum + r * r, 0) / returns.length);
    const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;
    
    return {
      totalPnL,
      totalRevenue,
      totalCosts,
      maxDrawdown,
      sharpeRatio,
      var95,
      liquidityRatio: 0.8, // Placeholder
      winRate: trades.filter((t: any) => t.pnl > 0).length / trades.length,
      avgTradeSize: trades.length > 0 ? totalPnL / trades.length : 0,
      totalTrades: trades.length,
    };
  }

  /**
   * Calculate confidence score for the backtest
   */
  private calculateConfidence(augmentedData: any, inputs: BacktestInputs): number {
    const { competitorSnapshots, stockSnapshots } = augmentedData;
    const totalDataPoints = competitorSnapshots.length + stockSnapshots.length;
    const augmentedPoints = augmentedData.augmentedPoints;
    
    // Higher confidence with more real data, lower with more augmented data
    const realDataRatio = totalDataPoints / (totalDataPoints + augmentedPoints);
    const timeSpanDays = (inputs.endDate.getTime() - inputs.startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Confidence decreases with longer time spans (more uncertainty)
    const timeConfidence = Math.max(0.5, 1 - (timeSpanDays / 30) * 0.3);
    
    return Math.min(realDataRatio * timeConfidence, 1.0);
  }

  /**
   * Generate unique backtest ID
   */
  private generateBacktestId(): string {
    return `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get backtest job status
   */
  async getBacktestStatus(jobId: string): Promise<any> {
    const job = await this.backtestQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }
    
    return {
      jobId,
      status: await job.getState(),
      progress: job.progress(),
      result: job.returnvalue,
      error: job.failedReason,
    };
  }

  /**
   * Get backtest history
   */
  async getBacktestHistory(limit: number = 10): Promise<any[]> {
    const completedJobs = await this.backtestQueue.getJobs(['completed'], 0, limit);
    return completedJobs.map(job => ({
      jobId: job.id,
      strategyId: job.data.strategy.id,
      status: 'completed',
      result: job.returnvalue,
      completedAt: job.finishedOn,
    }));
  }
}
