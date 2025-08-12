import { Injectable, Logger } from '@nestjs/common';
import { Snapshot, CompetitorReactionModel } from '../types/pricing.types';

export interface DemandScenario {
  sku: string;
  baseDemand: number;
  scenarios: number[];
  confidence: {
    lower: number;
    upper: number;
    mean: number;
    stdDev: number;
  };
}

export interface CompetitorScenario {
  sku: string;
  basePrice: number;
  reactionScenarios: Array<{
    probability: number;
    priceChange: number;
    delay: number;
  }>;
}

export interface MarketScenario {
  timestamp: string;
  seasonality: number;
  volatility: number;
  competitiveIntensity: number;
  demandShock: number;
  costShock: number;
}

@Injectable()
export class ScenarioGeneratorService {
  private readonly logger = new Logger(ScenarioGeneratorService.name);

  /**
   * Генерирует сценарии спроса для портфеля согласно §5.1
   */
  async generateDemandScenarios(
    skuData: Array<{
      sku: string;
      history: Snapshot[];
      priceElasticity: number;
      seasonalityWeight: number;
    }>,
    numScenarios: number = 1000
  ): Promise<DemandScenario[]> {
    const demandScenarios: DemandScenario[] = [];

    for (const { sku, history, priceElasticity, seasonalityWeight } of skuData) {
      try {
        // Вычисляем базовый спрос на основе исторических данных
        const baseDemand = this.calculateBaseDemand(history);
        
        // Генерируем сценарии спроса
        const scenarios = this.generateDemandVariations(
          baseDemand,
          priceElasticity,
          seasonalityWeight,
          numScenarios
        );

        // Вычисляем статистики
        const confidence = this.calculateDemandConfidence(scenarios);

        demandScenarios.push({
          sku,
          baseDemand,
          scenarios,
          confidence
        });

        this.logger.log(`Сгенерировано ${scenarios.length} сценариев спроса для ${sku}`);

      } catch (error) {
        this.logger.error(`Ошибка генерации сценариев спроса для ${sku}:`, error);
        
        // Fallback: простой сценарий
        demandScenarios.push({
          sku,
          baseDemand: 0,
          scenarios: new Array(numScenarios).fill(0),
          confidence: { lower: 0, upper: 0, mean: 0, stdDev: 0 }
        });
      }
    }

    return demandScenarios;
  }

  /**
   * Генерирует сценарии реакций конкурентов согласно §5.2
   */
  async generateCompetitorScenarios(
    skuData: Array<{
      sku: string;
      currentPrice: number;
      competitorPrice: number;
      reactionModel: CompetitorReactionModel;
    }>,
    numScenarios: number = 1000
  ): Promise<CompetitorScenario[]> {
    const competitorScenarios: CompetitorScenario[] = [];

    for (const { sku, currentPrice, competitorPrice, reactionModel } of skuData) {
      try {
        const reactionScenarios = this.generateCompetitorReactions(
          currentPrice,
          competitorPrice,
          reactionModel,
          numScenarios
        );

        competitorScenarios.push({
          sku,
          basePrice: competitorPrice,
          reactionScenarios
        });

        this.logger.log(`Сгенерировано ${reactionScenarios.length} сценариев реакций конкурентов для ${sku}`);

      } catch (error) {
        this.logger.error(`Ошибка генерации сценариев конкурентов для ${sku}:`, error);
        
        // Fallback: без изменений
        competitorScenarios.push({
          sku,
          basePrice: competitorPrice,
          reactionScenarios: [{
            probability: 1,
            priceChange: 0,
            delay: 0
          }]
        });
      }
    }

    return competitorScenarios;
  }

  /**
   * Генерирует рыночные сценарии согласно §5.3
   */
  async generateMarketScenarios(
    timeHorizon: number, // в днях
    numScenarios: number = 1000
  ): Promise<MarketScenario[]> {
    const marketScenarios: MarketScenario[] = [];
    const baseDate = new Date();

    for (let day = 0; day < timeHorizon; day++) {
      const timestamp = new Date(baseDate.getTime() + day * 24 * 60 * 60 * 1000).toISOString();
      
      // Базовые рыночные условия
      const seasonality = this.calculateSeasonality(timestamp);
      const volatility = this.calculateVolatility(day);
      const competitiveIntensity = this.calculateCompetitiveIntensity(day);
      
      // Генерируем шоки для каждого сценария
      for (let scenario = 0; scenario < numScenarios; scenario++) {
        const demandShock = this.generateDemandShock(seasonality, volatility);
        const costShock = this.generateCostShock(volatility);

        marketScenarios.push({
          timestamp,
          seasonality,
          volatility,
          competitiveIntensity,
          demandShock,
          costShock
        });
      }
    }

    this.logger.log(`Сгенерировано ${marketScenarios.length} рыночных сценариев для горизонта ${timeHorizon} дней`);
    return marketScenarios;
  }

  /**
   * Вычисляет базовый спрос на основе исторических данных
   */
  private calculateBaseDemand(history: Snapshot[]): number {
    if (history.length === 0) {
      return 0;
    }

    // Агрегируем данные по дням
    const dailyDemand = new Map<string, number>();
    
    for (let i = 1; i < history.length; i++) {
      const current = history[i];
      const previous = history[i - 1];
      const date = current.ts.split('T')[0];
      
      // Оцениваем спрос на основе изменения остатков
      const previousStock = typeof previous.stock === 'number' ? previous.stock : previous.stock.onHand;
      const currentStock = typeof current.stock === 'number' ? current.stock : current.stock.onHand;
      const demand = Math.max(0, previousStock - currentStock);
      dailyDemand.set(date, (dailyDemand.get(date) || 0) + demand);
    }

    // Вычисляем средний дневной спрос
    const totalDemand = Array.from(dailyDemand.values()).reduce((sum, val) => sum + val, 0);
    const numDays = dailyDemand.size || 1;
    
    return totalDemand / numDays;
  }

  /**
   * Генерирует вариации спроса на основе эластичности и сезонности
   */
  private generateDemandVariations(
    baseDemand: number,
    priceElasticity: number,
    seasonalityWeight: number,
    numScenarios: number
  ): number[] {
    const scenarios: number[] = [];
    
    for (let i = 0; i < numScenarios; i++) {
      // Базовый спрос
      let demand = baseDemand;
      
      // Сезонность
      const seasonalityFactor = 1 + (Math.random() - 0.5) * seasonalityWeight;
      demand *= seasonalityFactor;
      
      // Случайные колебания
      const randomFactor = this.randomNormal(1, 0.2); // ±20% отклонение
      demand *= randomFactor;
      
      // Ограничиваем спрос неотрицательными значениями
      demand = Math.max(0, demand);
      
      scenarios.push(demand);
    }
    
    return scenarios;
  }

  /**
   * Вычисляет доверительные интервалы для спроса
   */
  private calculateDemandConfidence(scenarios: number[]): {
    lower: number;
    upper: number;
    mean: number;
    stdDev: number;
  } {
    const mean = scenarios.reduce((sum, val) => sum + val, 0) / scenarios.length;
    const variance = scenarios.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scenarios.length;
    const stdDev = Math.sqrt(variance);
    
    // 95% доверительный интервал
    const lower = mean - 1.96 * stdDev;
    const upper = mean + 1.96 * stdDev;
    
    return {
      lower: Math.max(0, lower),
      upper,
      mean,
      stdDev
    };
  }

  /**
   * Генерирует сценарии реакций конкурентов
   */
  private generateCompetitorReactions(
    currentPrice: number,
    competitorPrice: number,
    reactionModel: CompetitorReactionModel,
    numScenarios: number
  ): Array<{
    probability: number;
    priceChange: number;
    delay: number;
  }> {
    const reactions: Array<{
      probability: number;
      priceChange: number;
      delay: number;
    }> = [];

    for (let i = 0; i < numScenarios; i++) {
      // Определяем, будет ли реакция
      const willReact = Math.random() < reactionModel.responseProbability;
      
      if (willReact) {
        // Генерируем изменение цены
        const baseChange = reactionModel.priceChangeDelta;
        const aggressiveness = this.getAggressivenessMultiplier(reactionModel.aggressiveness);
        const priceChange = baseChange * aggressiveness * (Math.random() - 0.5) * 2;
        
        // Генерируем задержку
        const delay = reactionModel.responseDelay * (0.5 + Math.random());
        
        reactions.push({
          probability: reactionModel.responseProbability,
          priceChange,
          delay
        });
      } else {
        // Без изменений
        reactions.push({
          probability: 1 - reactionModel.responseProbability,
          priceChange: 0,
          delay: 0
        });
      }
    }
    
    return reactions;
  }

  /**
   * Вычисляет сезонность на основе даты
   */
  private calculateSeasonality(timestamp: string): number {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Простая модель сезонности
    const seasonalPeak = Math.sin((dayOfYear / 365) * 2 * Math.PI);
    const monthlyAdjustment = Math.sin((month / 12) * 2 * Math.PI);
    
    return 1 + 0.3 * seasonalPeak + 0.1 * monthlyAdjustment;
  }

  /**
   * Вычисляет волатильность на основе горизонта планирования
   */
  private calculateVolatility(day: number): number {
    // Волатильность растет с горизонтом планирования
    return 0.1 + (day / 30) * 0.2; // От 10% до 30%
  }

  /**
   * Вычисляет интенсивность конкуренции
   */
  private calculateCompetitiveIntensity(day: number): number {
    // Конкуренция может меняться со временем
    return 0.5 + 0.3 * Math.sin(day * 0.1);
  }

  /**
   * Генерирует шок спроса
   */
  private generateDemandShock(seasonality: number, volatility: number): number {
    const baseShock = this.randomNormal(1, volatility);
    return baseShock * seasonality;
  }

  /**
   * Генерирует шок затрат
   */
  private generateCostShock(volatility: number): number {
    return this.randomNormal(1, volatility * 0.5); // Затраты менее волатильны
  }

  /**
   * Получает множитель агрессивности
   */
  private getAggressivenessMultiplier(aggressiveness: 'low' | 'medium' | 'high'): number {
    switch (aggressiveness) {
      case 'low': return 0.5;
      case 'medium': return 1.0;
      case 'high': return 2.0;
      default: return 1.0;
    }
  }

  /**
   * Генерирует случайное число с нормальным распределением
   */
  private randomNormal(mean: number, stdDev: number): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}
