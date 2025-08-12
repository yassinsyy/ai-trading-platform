import { Injectable, Logger } from '@nestjs/common';
import { PortfolioConstraints, PortfolioOptimizationResult } from '../types/pricing.types';

export interface RiskMetrics {
  var95: number;
  cvar95: number;
  var99: number;
  cvar99: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  volatility: number;
  skewness: number;
  kurtosis: number;
}

export interface PortfolioRiskProfile {
  totalRisk: number;
  systematicRisk: number;
  idiosyncraticRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
  correlationMatrix: number[][];
  riskDecomposition: Record<string, number>;
}

@Injectable()
export class RiskManagementService {
  private readonly logger = new Logger(RiskManagementService.name);

  /**
   * Вычисляет метрики риска для портфеля согласно §5.4
   */
  async calculatePortfolioRisk(
    returns: number[][], // [scenario][asset]
    weights: number[], // веса активов
    riskFreeRate: number = 0.02 // безрисковая ставка (2%)
  ): Promise<RiskMetrics> {
    try {
      // Вычисляем доходности портфеля для каждого сценария
      const portfolioReturns = returns.map(scenarioReturns => 
        scenarioReturns.reduce((sum, ret, i) => sum + ret * weights[i], 0)
      );

      // Сортируем доходности для вычисления квантилей
      portfolioReturns.sort((a, b) => a - b);
      
      // Вычисляем VaR и CVaR
      const var95 = this.calculateVaR(portfolioReturns, 0.05);
      const cvar95 = this.calculateCVaR(portfolioReturns, 0.05);
      const var99 = this.calculateVaR(portfolioReturns, 0.01);
      const cvar99 = this.calculateCVaR(portfolioReturns, 0.01);
      
      // Вычисляем максимальную просадку
      const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);
      
      // Вычисляем коэффициент Шарпа
      const sharpeRatio = this.calculateSharpeRatio(portfolioReturns, riskFreeRate);
      
      // Вычисляем коэффициент Сортино
      const sortinoRatio = this.calculateSortinoRatio(portfolioReturns, riskFreeRate);
      
      // Вычисляем коэффициент Кальмара
      const calmarRatio = this.calculateCalmarRatio(portfolioReturns, maxDrawdown);
      
      // Вычисляем волатильность
      const volatility = this.calculateVolatility(portfolioReturns);
      
      // Вычисляем асимметрию и эксцесс
      const skewness = this.calculateSkewness(portfolioReturns);
      const kurtosis = this.calculateKurtosis(portfolioReturns);

      return {
        var95,
        cvar95,
        var99,
        cvar99,
        maxDrawdown,
        sharpeRatio,
        sortinoRatio,
        calmarRatio,
        volatility,
        skewness,
        kurtosis
      };

    } catch (error) {
      this.logger.error('Ошибка вычисления рисков портфеля:', error);
      throw error;
    }
  }

  /**
   * Вычисляет профиль риска портфеля
   */
  async calculatePortfolioRiskProfile(
    returns: number[][],
    weights: number[],
    assetNames: string[]
  ): Promise<PortfolioRiskProfile> {
    try {
      // Общий риск портфеля
      const totalRisk = this.calculatePortfolioVolatility(returns, weights);
      
      // Систематический риск (рыночный)
      const systematicRisk = this.calculateSystematicRisk(returns, weights);
      
      // Идиосинкратический риск (специфичный для активов)
      const idiosyncraticRisk = this.calculateIdiosyncraticRisk(returns, weights);
      
      // Риск концентрации
      const concentrationRisk = this.calculateConcentrationRisk(weights);
      
      // Риск ликвидности (упрощенная оценка)
      const liquidityRisk = this.calculateLiquidityRisk(weights);
      
      // Матрица корреляций
      const correlationMatrix = this.calculateCorrelationMatrix(returns);
      
      // Декомпозиция риска по активам
      const riskDecomposition = this.calculateRiskDecomposition(returns, weights, assetNames);

      return {
        totalRisk,
        systematicRisk,
        idiosyncraticRisk,
        concentrationRisk,
        liquidityRisk,
        correlationMatrix,
        riskDecomposition
      };

    } catch (error) {
      this.logger.error('Ошибка вычисления профиля риска портфеля:', error);
      throw error;
    }
  }

  /**
   * Проверяет соответствие портфеля ограничениям риска
   */
  async validateRiskConstraints(
    riskMetrics: RiskMetrics,
    constraints: PortfolioConstraints
  ): Promise<{
    satisfied: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Проверяем VaR
    if (riskMetrics.var95 > constraints.maxVaR) {
      violations.push(`VaR(95%) превышает лимит: ${riskMetrics.var95.toFixed(2)} > ${constraints.maxVaR.toFixed(2)}`);
      recommendations.push('Рассмотрите диверсификацию портфеля или снижение позиций в высокорисковых активах');
    }

    // Проверяем CVaR
    if (riskMetrics.cvar95 > constraints.maxCVaR) {
      violations.push(`CVaR(95%) превышает лимит: ${riskMetrics.cvar95.toFixed(2)} > ${constraints.maxCVaR.toFixed(2)}`);
      recommendations.push('Увеличьте хеджирование или снизьте общий риск портфеля');
    }

    // Проверяем максимальную просадку
    if (riskMetrics.maxDrawdown > constraints.maxDrawdown) {
      violations.push(`Максимальная просадка превышает лимит: ${(riskMetrics.maxDrawdown * 100).toFixed(1)}% > ${(constraints.maxDrawdown * 100).toFixed(1)}%`);
      recommendations.push('Рассмотрите стратегии управления рисками или снижение волатильности');
    }

    // Проверяем коэффициент Шарпа
    if (riskMetrics.sharpeRatio < constraints.minExpectedReturn) {
      violations.push(`Коэффициент Шарпа ниже минимального: ${riskMetrics.sharpeRatio.toFixed(2)} < ${constraints.minExpectedReturn.toFixed(2)}`);
      recommendations.push('Оптимизируйте соотношение риск-доходность или пересмотрите стратегию');
    }

    const satisfied = violations.length === 0;

    if (satisfied) {
      recommendations.push('Портфель соответствует всем ограничениям риска');
    }

    return {
      satisfied,
      violations,
      recommendations
    };
  }

  /**
   * Вычисляет Value at Risk (VaR)
   */
  private calculateVaR(returns: number[], confidenceLevel: number): number {
    const index = Math.floor(returns.length * confidenceLevel);
    return returns[index] || 0;
  }

  /**
   * Вычисляет Conditional Value at Risk (CVaR)
   */
  private calculateCVaR(returns: number[], confidenceLevel: number): number {
    const varIndex = Math.floor(returns.length * confidenceLevel);
    const tailReturns = returns.slice(0, varIndex);
    
    if (tailReturns.length === 0) {
      return 0;
    }
    
    return tailReturns.reduce((sum, val) => sum + val, 0) / tailReturns.length;
  }

  /**
   * Вычисляет максимальную просадку
   */
  private calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = -Infinity;
    
    for (const value of returns) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  /**
   * Вычисляет коэффициент Шарпа
   */
  private calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const excessReturn = meanReturn - riskFreeRate;
    const volatility = this.calculateVolatility(returns);
    
    return volatility > 0 ? excessReturn / volatility : 0;
  }

  /**
   * Вычисляет коэффициент Сортино
   */
  private calculateSortinoRatio(returns: number[], riskFreeRate: number): number {
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const excessReturn = meanReturn - riskFreeRate;
    
    // Вычисляем downside deviation
    const downsideReturns = returns.filter(ret => ret < meanReturn);
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / downsideReturns.length
    );
    
    return downsideDeviation > 0 ? excessReturn / downsideDeviation : 0;
  }

  /**
   * Вычисляет коэффициент Кальмара
   */
  private calculateCalmarRatio(returns: number[], maxDrawdown: number): number {
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    return maxDrawdown > 0 ? meanReturn / maxDrawdown : 0;
  }

  /**
   * Вычисляет волатильность
   */
  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  /**
   * Вычисляет асимметрию
   */
  private calculateSkewness(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    const skewness = returns.reduce((sum, ret) => sum + Math.pow((ret - mean) / stdDev, 3), 0) / returns.length;
    return skewness;
  }

  /**
   * Вычисляет эксцесс
   */
  private calculateKurtosis(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    const kurtosis = returns.reduce((sum, ret) => sum + Math.pow((ret - mean) / stdDev, 4), 0) / returns.length;
    return kurtosis - 3; // Нормализованный эксцесс
  }

  /**
   * Вычисляет волатильность портфеля
   */
  private calculatePortfolioVolatility(returns: number[][], weights: number[]): number {
    const numAssets = weights.length;
    const numScenarios = returns.length;
    
    // Вычисляем ковариационную матрицу
    const covarianceMatrix: number[][] = [];
    for (let i = 0; i < numAssets; i++) {
      covarianceMatrix[i] = [];
      for (let j = 0; j < numAssets; j++) {
        covarianceMatrix[i][j] = this.calculateCovariance(
          returns.map(scenario => scenario[i]),
          returns.map(scenario => scenario[j])
        );
      }
    }
    
    // Вычисляем волатильность портфеля
    let portfolioVariance = 0;
    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        portfolioVariance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }
    
    return Math.sqrt(portfolioVariance);
  }

  /**
   * Вычисляет ковариацию между двумя рядами доходностей
   */
  private calculateCovariance(returns1: number[], returns2: number[]): number {
    const mean1 = returns1.reduce((sum, ret) => sum + ret, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, ret) => sum + ret, 0) / returns2.length;
    
    let covariance = 0;
    for (let i = 0; i < returns1.length; i++) {
      covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
    }
    
    return covariance / returns1.length;
  }

  /**
   * Вычисляет систематический риск
   */
  private calculateSystematicRisk(returns: number[][], weights: number[]): number {
    // Упрощенная оценка систематического риска как 70% от общего риска
    const totalRisk = this.calculatePortfolioVolatility(returns, weights);
    return totalRisk * 0.7;
  }

  /**
   * Вычисляет идиосинкратический риск
   */
  private calculateIdiosyncraticRisk(returns: number[][], weights: number[]): number {
    const totalRisk = this.calculatePortfolioVolatility(returns, weights);
    const systematicRisk = this.calculateSystematicRisk(returns, weights);
    return Math.sqrt(Math.max(0, totalRisk * totalRisk - systematicRisk * systematicRisk));
  }

  /**
   * Вычисляет риск концентрации
   */
  private calculateConcentrationRisk(weights: number[]): number {
    // Индекс Херфиндаля-Хиршмана
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
    return hhi;
  }

  /**
   * Вычисляет риск ликвидности
   */
  private calculateLiquidityRisk(weights: number[]): number {
    // Упрощенная оценка на основе весов (большие веса = больший риск ликвидности)
    return weights.reduce((sum, weight) => sum + weight * weight, 0);
  }

  /**
   * Вычисляет матрицу корреляций
   */
  private calculateCorrelationMatrix(returns: number[][]): number[][] {
    const numAssets = returns[0].length;
    const correlationMatrix: number[][] = [];
    
    for (let i = 0; i < numAssets; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < numAssets; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          const returnsI = returns.map(scenario => scenario[i]);
          const returnsJ = returns.map(scenario => scenario[j]);
          correlationMatrix[i][j] = this.calculateCorrelation(returnsI, returnsJ);
        }
      }
    }
    
    return correlationMatrix;
  }

  /**
   * Вычисляет корреляцию между двумя рядами доходностей
   */
  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    const covariance = this.calculateCovariance(returns1, returns2);
    const stdDev1 = Math.sqrt(this.calculateCovariance(returns1, returns1));
    const stdDev2 = Math.sqrt(this.calculateCovariance(returns2, returns2));
    
    if (stdDev1 === 0 || stdDev2 === 0) {
      return 0;
    }
    
    return covariance / (stdDev1 * stdDev2);
  }

  /**
   * Вычисляет декомпозицию риска по активам
   */
  private calculateRiskDecomposition(
    returns: number[][],
    weights: number[],
    assetNames: string[]
  ): Record<string, number> {
    const numAssets = weights.length;
    const riskDecomposition: Record<string, number> = {};
    
    // Вычисляем вклад каждого актива в общий риск
    for (let i = 0; i < numAssets; i++) {
      let contribution = 0;
      
      for (let j = 0; j < numAssets; j++) {
        const covariance = this.calculateCovariance(
          returns.map(scenario => scenario[i]),
          returns.map(scenario => scenario[j])
        );
        contribution += weights[j] * covariance;
      }
      
      riskDecomposition[assetNames[i]] = (weights[i] * contribution) / this.calculatePortfolioVolatility(returns, weights);
    }
    
    return riskDecomposition;
  }
}
