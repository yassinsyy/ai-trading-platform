import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitorSnapshot } from '../../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../../entities/stock-snapshot.entity';
import { Offer } from '../../entities/offer.entity';
import { PricePolicy } from '../../entities/price-policy.entity';
import { TimeSyncPipe } from '../../common/pipes/time-sync.pipe';

export interface SkuForecast {
  skuId: string;
  expectedMargin: number; // Expected margin percentage
  expectedVolume: number; // Expected sales volume
  salesVelocity: number; // Sales velocity (units per day)
  currentPrice: number;
  cogs: number;
  riskScore: number; // 0-1 risk score
  liquidityScore: number; // 0-1 liquidity score
}

export interface CapitalAllocationConstraints {
  maxVaR: number; // Maximum Value at Risk (percentage)
  minLiquidity: number; // Minimum cash reserve (percentage)
  maxConcentration: number; // Maximum allocation to single SKU (percentage)
  maxLeverage: number; // Maximum leverage ratio
  riskFreeRate: number; // Risk-free interest rate
}

export interface CapitalAllocationResult {
  skuId: string;
  recommendedAllocation: number; // Amount to allocate
  recommendedPrice: number; // Recommended price adjustment
  expectedReturn: number; // Expected return percentage
  riskContribution: number; // Risk contribution to portfolio
  liquidityImpact: number; // Impact on liquidity
  confidence: number; // Confidence in recommendation
}

export interface PortfolioOptimizationResult {
  totalAllocated: number;
  expectedPortfolioReturn: number;
  portfolioVaR: number;
  portfolioLiquidity: number;
  efficientFrontier: Array<{
    risk: number;
    return: number;
    allocation: number[];
  }>;
  recommendations: CapitalAllocationResult[];
  metadata: {
    optimizationMethod: string;
    iterations: number;
    convergence: boolean;
    timestamp: Date;
  };
}

@Injectable()
export class CapitalAllocationService {
  private readonly logger = new Logger(CapitalAllocationService.name);

  constructor(
    @InjectRepository(CompetitorSnapshot)
    private readonly competitorSnapshotRepository: Repository<CompetitorSnapshot>,
    @InjectRepository(StockSnapshot)
    private readonly stockSnapshotRepository: Repository<StockSnapshot>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    private readonly timeSyncPipe: TimeSyncPipe,
  ) {}

  /**
   * Main capital allocation optimization function
   */
  async optimizeCapitalAllocation(
    skuForecasts: SkuForecast[],
    totalCapital: number,
    constraints: CapitalAllocationConstraints,
  ): Promise<PortfolioOptimizationResult> {
    this.logger.log(`Starting capital allocation optimization for ${skuForecasts.length} SKUs`);

    // 1. Validate inputs
    this.validateInputs(skuForecasts, totalCapital, constraints);

    // 2. Calculate efficient frontier
    const efficientFrontier = this.calculateEfficientFrontier(skuForecasts, totalCapital, constraints);

    // 3. Find optimal allocation
    const optimalAllocation = this.findOptimalAllocation(efficientFrontier, constraints);

    // 4. Generate recommendations
    const recommendations = this.generateRecommendations(skuForecasts, optimalAllocation, totalCapital);

    // 5. Calculate portfolio metrics
    const portfolioMetrics = this.calculatePortfolioMetrics(recommendations, totalCapital);

    const result: PortfolioOptimizationResult = {
      totalAllocated: portfolioMetrics.totalAllocated,
      expectedPortfolioReturn: portfolioMetrics.expectedReturn,
              portfolioVaR: portfolioMetrics.portfolioVar,
      portfolioLiquidity: portfolioMetrics.liquidity,
      efficientFrontier,
      recommendations,
      metadata: {
        optimizationMethod: 'efficient-frontier-optimization',
        iterations: efficientFrontier.length,
        convergence: true,
        timestamp: new Date(),
      },
    };

    this.logger.log(`Capital allocation optimization completed. Expected return: ${result.expectedPortfolioReturn}%`);
    return result;
  }

  /**
   * Get SKU forecasts from historical data and current market conditions
   */
  async getSkuForecasts(skuIds: string[]): Promise<SkuForecast[]> {
    const forecasts: SkuForecast[] = [];

    for (const skuId of skuIds) {
      // Get latest competitor and stock data
      const competitorData = await this.getLatestCompetitorData(skuId);
      const stockData = await this.getLatestStockData(skuId);
      const offer = await this.getOfferData(skuId);

      if (competitorData && stockData && offer) {
        const forecast = this.calculateSkuForecast(skuId, competitorData, stockData, offer);
        forecasts.push(forecast);
      }
    }

    return forecasts;
  }

  /**
   * Calculate efficient frontier using portfolio optimization
   */
  private calculateEfficientFrontier(
    skuForecasts: SkuForecast[],
    totalCapital: number,
    constraints: CapitalAllocationConstraints,
  ): Array<{ risk: number; return: number; allocation: number[] }> {
    const frontier: Array<{ risk: number; return: number; allocation: number[] }> = [];
    
    // Generate risk-return combinations
    const riskLevels = this.generateRiskLevels(constraints.maxVaR);
    
    for (const targetRisk of riskLevels) {
      try {
        const allocation = this.optimizeForRiskTarget(
          skuForecasts,
          totalCapital,
          targetRisk,
          constraints,
        );
        
        if (allocation) {
          const expectedReturn = this.calculateExpectedReturn(skuForecasts, allocation);
          const actualRisk = this.calculatePortfolioRisk(skuForecasts, allocation);
          
          frontier.push({
            risk: actualRisk,
            return: expectedReturn,
            allocation: allocation,
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to optimize for risk target ${targetRisk}: ${error.message}`);
      }
    }

    // Sort by risk and filter dominated solutions
    return this.filterDominatedSolutions(frontier);
  }

  /**
   * Generate risk levels for efficient frontier calculation
   */
  private generateRiskLevels(maxVaR: number): number[] {
    const levels: number[] = [];
    const step = maxVaR / 20; // 20 risk levels
    
    for (let i = 0; i <= 20; i++) {
      levels.push(i * step);
    }
    
    return levels;
  }

  /**
   * Optimize allocation for a specific risk target
   */
  private optimizeForRiskTarget(
    skuForecasts: SkuForecast[],
    totalCapital: number,
    targetRisk: number,
    constraints: CapitalAllocationConstraints,
  ): number[] | null {
    // Simple optimization using gradient descent
    // In production, this would use more sophisticated optimization libraries
    
    const n = skuForecasts.length;
    let allocation = new Array(n).fill(1 / n); // Start with equal allocation
    let bestAllocation = [...allocation];
    let bestObjective = -Infinity;
    
    const maxIterations = 100;
    const learningRate = 0.01;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Calculate current portfolio metrics
      const currentRisk = this.calculatePortfolioRisk(skuForecasts, allocation);
      const currentReturn = this.calculateExpectedReturn(skuForecasts, allocation);
      
      // Check constraints
      if (this.violatesConstraints(allocation, totalCapital, constraints)) {
        allocation = this.repairAllocation(allocation, totalCapital, constraints);
        continue;
      }
      
      // Calculate objective function (Sharpe ratio)
      const objective = (currentReturn - constraints.riskFreeRate) / currentRisk;
      
      if (objective > bestObjective) {
        bestObjective = objective;
        bestAllocation = [...allocation];
      }
      
      // Gradient descent step
      const gradients = this.calculateGradients(skuForecasts, allocation, targetRisk);
      
      for (let i = 0; i < n; i++) {
        allocation[i] += learningRate * gradients[i];
      }
      
      // Normalize allocation
      allocation = this.normalizeAllocation(allocation);
    }
    
    return bestAllocation;
  }

  /**
   * Calculate portfolio risk (VaR approximation)
   */
  private calculatePortfolioRisk(skuForecasts: SkuForecast[], allocation: number[]): number {
    let portfolioRisk = 0;
    
    for (let i = 0; i < skuForecasts.length; i++) {
      for (let j = 0; j < skuForecasts.length; j++) {
        const correlation = this.calculateCorrelation(skuForecasts[i], skuForecasts[j]);
        const riskI = skuForecasts[i].riskScore;
        const riskJ = skuForecasts[j].riskScore;
        
        portfolioRisk += allocation[i] * allocation[j] * riskI * riskJ * correlation;
      }
    }
    
    return Math.sqrt(portfolioRisk);
  }

  /**
   * Calculate expected portfolio return
   */
  private calculateExpectedReturn(skuForecasts: SkuForecast[], allocation: number[]): number {
    let expectedReturn = 0;
    
    for (let i = 0; i < skuForecasts.length; i++) {
      expectedReturn += allocation[i] * skuForecasts[i].expectedMargin;
    }
    
    return expectedReturn;
  }

  /**
   * Calculate correlation between two SKUs
   */
  private calculateCorrelation(sku1: SkuForecast, sku2: SkuForecast): number {
    // Simple correlation based on risk scores
    // In production, this would use historical correlation data
    if (sku1.skuId === sku2.skuId) return 1;
    
    // Assume some correlation based on risk profiles
    const riskDiff = Math.abs(sku1.riskScore - sku2.riskScore);
    return Math.max(0, 1 - riskDiff * 2);
  }

  /**
   * Check if allocation violates constraints
   */
  private violatesConstraints(
    allocation: number[],
    totalCapital: number,
    constraints: CapitalAllocationConstraints,
  ): boolean {
    // Check concentration constraint
    const maxAllocation = Math.max(...allocation);
    if (maxAllocation > constraints.maxConcentration) return true;
    
    // Check liquidity constraint
    const allocatedCapital = allocation.reduce((sum, alloc) => sum + alloc, 0);
    if (allocatedCapital > (1 - constraints.minLiquidity)) return true;
    
    return false;
  }

  /**
   * Repair allocation to satisfy constraints
   */
  private repairAllocation(
    allocation: number[],
    totalCapital: number,
    constraints: CapitalAllocationConstraints,
  ): number[] {
    let repaired = [...allocation];
    
    // Cap maximum allocation
    for (let i = 0; i < repaired.length; i++) {
      if (repaired[i] > constraints.maxConcentration) {
        repaired[i] = constraints.maxConcentration;
      }
    }
    
    // Ensure liquidity constraint
    const allocatedCapital = repaired.reduce((sum, alloc) => sum + alloc, 0);
    if (allocatedCapital > (1 - constraints.minLiquidity)) {
      const scaleFactor = (1 - constraints.minLiquidity) / allocatedCapital;
      repaired = repaired.map(alloc => alloc * scaleFactor);
    }
    
    return this.normalizeAllocation(repaired);
  }

  /**
   * Normalize allocation to sum to 1
   */
  private normalizeAllocation(allocation: number[]): number[] {
    const sum = allocation.reduce((a, b) => a + b, 0);
    if (sum === 0) return allocation;
    return allocation.map(alloc => alloc / sum);
  }

  /**
   * Calculate gradients for optimization
   */
  private calculateGradients(
    skuForecasts: SkuForecast[],
    allocation: number[],
    targetRisk: number,
  ): number[] {
    const gradients = new Array(allocation.length).fill(0);
    
    // Simplified gradient calculation
    // In production, this would use automatic differentiation or finite differences
    
    for (let i = 0; i < allocation.length; i++) {
      const currentRisk = this.calculatePortfolioRisk(skuForecasts, allocation);
      const currentReturn = this.calculateExpectedReturn(skuForecasts, allocation);
      
      // Gradient of Sharpe ratio
      gradients[i] = skuForecasts[i].expectedMargin / currentRisk - 
                     (currentReturn * this.calculateRiskGradient(skuForecasts, allocation, i)) / (currentRisk * currentRisk);
    }
    
    return gradients;
  }

  /**
   * Calculate gradient of portfolio risk with respect to allocation
   */
  private calculateRiskGradient(
    skuForecasts: SkuForecast[],
    allocation: number[],
    index: number,
  ): number {
    // Simplified risk gradient calculation
    let gradient = 0;
    
    for (let j = 0; j < skuForecasts.length; j++) {
      const correlation = this.calculateCorrelation(skuForecasts[index], skuForecasts[j]);
      const riskI = skuForecasts[index].riskScore;
      const riskJ = skuForecasts[j].riskScore;
      
      gradient += allocation[j] * riskI * riskJ * correlation;
    }
    
    return gradient;
  }

  /**
   * Filter dominated solutions from efficient frontier
   */
  private filterDominatedSolutions(
    frontier: Array<{ risk: number; return: number; allocation: number[] }>,
  ): Array<{ risk: number; return: number; allocation: number[] }> {
    return frontier.filter((point, index) => {
      // Check if this point is dominated by any other point
      for (let i = 0; i < frontier.length; i++) {
        if (i === index) continue;
        
        const other = frontier[i];
        if (other.risk <= point.risk && other.return >= point.return) {
          return false; // Dominated
        }
      }
      return true; // Not dominated
    });
  }

  /**
   * Find optimal allocation from efficient frontier
   */
  private findOptimalAllocation(
    frontier: Array<{ risk: number; return: number; allocation: number[] }>,
    constraints: CapitalAllocationConstraints,
  ): number[] {
    if (frontier.length === 0) {
      throw new Error('No valid allocations found');
    }
    
    // Find allocation with highest Sharpe ratio that meets constraints
    let bestAllocation = frontier[0].allocation;
    let bestSharpe = -Infinity;
    
    for (const point of frontier) {
      if (point.risk <= constraints.maxVaR) {
        const sharpe = (point.return - constraints.riskFreeRate) / point.risk;
        if (sharpe > bestSharpe) {
          bestSharpe = sharpe;
          bestAllocation = point.allocation;
        }
      }
    }
    
    return bestAllocation;
  }

  /**
   * Generate recommendations from optimal allocation
   */
  private generateRecommendations(
    skuForecasts: SkuForecast[],
    allocation: number[],
    totalCapital: number,
  ): CapitalAllocationResult[] {
    const recommendations: CapitalAllocationResult[] = [];
    
    for (let i = 0; i < skuForecasts.length; i++) {
      const forecast = skuForecasts[i];
      const allocatedAmount = allocation[i] * totalCapital;
      
      // Calculate recommended price adjustment
      const priceAdjustment = this.calculatePriceAdjustment(forecast, allocatedAmount);
      
      const recommendation: CapitalAllocationResult = {
        skuId: forecast.skuId,
        recommendedAllocation: allocatedAmount,
        recommendedPrice: forecast.currentPrice * (1 + priceAdjustment),
        expectedReturn: forecast.expectedMargin,
        riskContribution: allocation[i] * forecast.riskScore,
        liquidityImpact: allocatedAmount / totalCapital,
        confidence: this.calculateConfidence(forecast),
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }

  /**
   * Calculate price adjustment based on allocation
   */
  private calculatePriceAdjustment(forecast: SkuForecast, allocatedAmount: number): number {
    // Simple price adjustment logic
    // In production, this would use more sophisticated pricing models
    
    const baseAdjustment = (forecast.expectedMargin - 0.1) * 0.5; // Base on margin
    const volumeAdjustment = (forecast.salesVelocity - 10) * 0.01; // Volume factor
    const allocationAdjustment = (allocatedAmount / 10000 - 1) * 0.02; // Allocation factor
    
    return Math.max(-0.2, Math.min(0.2, baseAdjustment + volumeAdjustment + allocationAdjustment));
  }

  /**
   * Calculate confidence in forecast
   */
  private calculateConfidence(forecast: SkuForecast): number {
    // Simple confidence calculation
    // In production, this would use statistical confidence intervals
    
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for lower risk
    confidence += (1 - forecast.riskScore) * 0.3;
    
    // Higher confidence for higher liquidity
    confidence += forecast.liquidityScore * 0.2;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Calculate portfolio metrics
   */
  private calculatePortfolioMetrics(
    recommendations: CapitalAllocationResult[],
    totalCapital: number,
  ): { totalAllocated: number; expectedReturn: number; portfolioVar: number; liquidity: number } {
    const totalAllocated = recommendations.reduce((sum, rec) => sum + rec.recommendedAllocation, 0);
    const expectedReturn = recommendations.reduce((sum, rec) => sum + rec.expectedReturn * rec.recommendedAllocation, 0) / totalAllocated;
    const portfolioVar = Math.sqrt(recommendations.reduce((sum, rec) => sum + rec.riskContribution * rec.riskContribution, 0));
    const liquidity = 1 - (totalAllocated / totalCapital);
    
    return { totalAllocated, expectedReturn, portfolioVar, liquidity };
  }

  /**
   * Validate input parameters
   */
  private validateInputs(
    skuForecasts: SkuForecast[],
    totalCapital: number,
    constraints: CapitalAllocationConstraints,
  ): void {
    if (skuForecasts.length === 0) {
      throw new Error('At least one SKU forecast is required');
    }
    
    if (totalCapital <= 0) {
      throw new Error('Total capital must be positive');
    }
    
    if (constraints.maxVaR <= 0 || constraints.maxVaR > 1) {
      throw new Error('Max VaR must be between 0 and 1');
    }
    
    if (constraints.minLiquidity < 0 || constraints.minLiquidity > 1) {
      throw new Error('Min liquidity must be between 0 and 1');
    }
  }

  /**
   * Get latest competitor data for SKU
   */
  private async getLatestCompetitorData(skuId: string): Promise<CompetitorSnapshot | null> {
    return this.competitorSnapshotRepository
      .createQueryBuilder('cs')
      .where('cs.offerId = :skuId', { skuId })
      .orderBy('cs.ts', 'DESC')
      .getOne();
  }

  /**
   * Get latest stock data for SKU
   */
  private async getLatestStockData(skuId: string): Promise<StockSnapshot | null> {
    return this.stockSnapshotRepository
      .createQueryBuilder('ss')
      .where('ss.offerId = :skuId', { skuId })
      .orderBy('ss.ts', 'DESC')
      .getOne();
  }

  /**
   * Get offer data for SKU
   */
  private async getOfferData(skuId: string): Promise<Offer | null> {
    return this.offerRepository.findOne({ where: { id: skuId } });
  }

  /**
   * Calculate SKU forecast from market data
   */
  private calculateSkuForecast(
    skuId: string,
    competitorData: CompetitorSnapshot,
    stockData: StockSnapshot,
    offer: Offer,
  ): SkuForecast {
    // Calculate expected margin based on competitor pricing
    const expectedMargin = this.calculateExpectedMargin(competitorData, offer);
    
    // Calculate expected volume based on stock and market position
    const expectedVolume = this.calculateExpectedVolume(stockData, competitorData);
    
    // Calculate sales velocity
    const salesVelocity = this.calculateSalesVelocity(stockData, competitorData);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(competitorData, stockData);
    
    // Calculate liquidity score
    const liquidityScore = this.calculateLiquidityScore(stockData, offer);
    
    return {
      skuId,
      expectedMargin,
      expectedVolume,
      salesVelocity,
      currentPrice: offer.price || 0,
      cogs: 0, // TODO: Get from Costs entity via product.costs
      riskScore,
      liquidityScore,
    };
  }

  /**
   * Calculate expected margin based on competitor pricing
   */
  private calculateExpectedMargin(competitorData: CompetitorSnapshot, offer: Offer): number {
    if (!competitorData.minCompetitorPrice || !offer.price) return 0.15; // Default 15%
    
    const priceDifference = (offer.price - competitorData.minCompetitorPrice) / offer.price;
    const baseMargin = 0.15;
    
    // Adjust margin based on competitive position
    if (priceDifference > 0.1) {
      return baseMargin * 0.8; // Lower margin if overpriced
    } else if (priceDifference < -0.05) {
      return baseMargin * 1.2; // Higher margin if underpriced
    }
    
    return baseMargin;
  }

  /**
   * Calculate expected volume based on stock and market position
   */
  private calculateExpectedVolume(stockData: StockSnapshot, competitorData: CompetitorSnapshot): number {
    const availableStock = stockData.availableStock;
    const marketPosition = competitorData.ourPosition || 10;
    
    // Base volume on available stock and market position
    let volume = availableStock * 0.1; // 10% of stock per period
    
    // Adjust based on market position
    if (marketPosition <= 3) {
      volume *= 1.5; // Higher volume for top positions
    } else if (marketPosition >= 8) {
      volume *= 0.7; // Lower volume for lower positions
    }
    
    return Math.max(1, volume);
  }

  /**
   * Calculate sales velocity
   */
  private calculateSalesVelocity(stockData: StockSnapshot, competitorData: CompetitorSnapshot): number {
    const availableStock = stockData.availableStock;
    const marketPosition = competitorData.ourPosition || 10;
    
    // Base velocity on market position
    let velocity = 5; // Base 5 units per day
    
    if (marketPosition <= 3) {
      velocity = 15; // High velocity for top positions
    } else if (marketPosition <= 6) {
      velocity = 8; // Medium velocity for middle positions
    } else {
      velocity = 2; // Low velocity for lower positions
    }
    
    // Adjust based on available stock
    if (availableStock < velocity * 7) {
      velocity *= 0.5; // Reduce velocity if low stock
    }
    
    return velocity;
  }

  /**
   * Calculate risk score for SKU
   */
  private calculateRiskScore(competitorData: CompetitorSnapshot, stockData: StockSnapshot): number {
    let riskScore = 0.5; // Base risk
    
    // Higher risk for more competitive markets
    if (competitorData.competitorsCount > 5) {
      riskScore += 0.2;
    }
    
    // Higher risk for low stock
    if (stockData.availableStock < 10) {
      riskScore += 0.3;
    }
    
    // Higher risk for price volatility
    if (competitorData.priceSpread && competitorData.priceSpread > 100) {
      riskScore += 0.2;
    }
    
    return Math.min(1.0, riskScore);
  }

  /**
   * Calculate liquidity score for SKU
   */
  private calculateLiquidityScore(stockData: StockSnapshot, offer: Offer): number {
    let liquidityScore = 0.5; // Base liquidity
    
    // Higher liquidity for higher stock levels
    if (stockData.availableStock > 50) {
      liquidityScore += 0.3;
    } else if (stockData.availableStock > 20) {
      liquidityScore += 0.1;
    }
    
    // Higher liquidity for higher prices (more valuable inventory)
    if (offer.price && offer.price > 1000) {
      liquidityScore += 0.2;
    }
    
    return Math.min(1.0, liquidityScore);
  }
}
