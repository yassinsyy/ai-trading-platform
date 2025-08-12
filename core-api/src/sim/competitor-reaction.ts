import { Injectable, Logger } from '@nestjs/common';
import { CompetitorReactionModel, Snapshot } from '../ai/types/pricing.types';

export interface CompetitorReaction {
  competitorId: string;
  priceChange: number;
  delay: number; // в минутах
  probability: number;
  aggressiveness: 'low' | 'medium' | 'high';
}

export interface ReactionSimulation {
  timestamp: string;
  competitorId: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePct: number;
  delay: number;
  applied: boolean;
}

@Injectable()
export class CompetitorReactionService {
  private readonly logger = new Logger(CompetitorReactionService.name);

  /**
   * Симулирует реакцию конкурентов на изменение цены
   * §6: Competitor Reaction Model
   */
  async simulateCompetitorReactions(
    ourPriceChange: number,
    ourPriceChangePct: number,
    competitors: Array<{ id: string; currentPrice: number; model: CompetitorReactionModel }>,
    timestamp: string
  ): Promise<ReactionSimulation[]> {
    this.logger.log(`Simulating competitor reactions to price change: ${ourPriceChangePct.toFixed(2)}%`);

    const reactions: ReactionSimulation[] = [];

    for (const competitor of competitors) {
      const reaction = await this.simulateSingleCompetitorReaction(
        ourPriceChange,
        ourPriceChangePct,
        competitor,
        timestamp
      );

      if (reaction) {
        reactions.push(reaction);
      }
    }

    // Сортируем по времени задержки
    reactions.sort((a, b) => a.delay - b.delay);

    this.logger.log(`Generated ${reactions.length} competitor reactions`);
    return reactions;
  }

  /**
   * Симулирует реакцию одного конкурента
   */
  private async simulateSingleCompetitorReaction(
    ourPriceChange: number,
    ourPriceChangePct: number,
    competitor: { id: string; currentPrice: number; model: CompetitorReactionModel },
    timestamp: string
  ): Promise<ReactionSimulation | null> {
    const { id, currentPrice, model } = competitor;

    // Проверяем вероятность реакции
    const reactionProbability = this.calculateReactionProbability(ourPriceChangePct, model);
    
    if (Math.random() > reactionProbability) {
      return null; // Конкурент не отреагировал
    }

    // Определяем агрессивность реакции
    const aggressiveness = this.determineAggressiveness(ourPriceChangePct, model);
    
    // Рассчитываем изменение цены
    const priceChange = this.calculatePriceChange(ourPriceChange, ourPriceChangePct, aggressiveness, model);
    
    // Рассчитываем задержку
    const delay = this.calculateReactionDelay(aggressiveness, model);
    
    // Применяем изменение цены
    const newPrice = Math.max(0, currentPrice + priceChange);
    const priceChangePct = (priceChange / currentPrice) * 100;

    // Проверяем, применилась ли реакция (может быть отклонена системой)
    const applied = this.shouldApplyReaction(newPrice, priceChangePct, model);

    return {
      timestamp,
      competitorId: id,
      oldPrice: currentPrice,
      newPrice,
      priceChange,
      priceChangePct,
      delay,
      applied
    };
  }

  /**
   * Рассчитывает вероятность реакции конкурента
   */
  private calculateReactionProbability(
    ourPriceChangePct: number,
    model: CompetitorReactionModel
  ): number {
    const baseProbability = model.baseReactionProbability || 0.3;
    const sensitivity = model.priceSensitivity || 1.0;
    
    // Чем больше изменение цены, тем выше вероятность реакции
    const magnitudeFactor = Math.min(1.0, Math.abs(ourPriceChangePct) / 10.0);
    
    // Конкурентная интенсивность влияет на вероятность
    const competitiveIntensity = model.competitiveIntensity || 0.5;
    
    let probability = baseProbability * (1 + magnitudeFactor * sensitivity * competitiveIntensity);
    
    // Ограничиваем вероятность
    return Math.min(0.95, Math.max(0.05, probability));
  }

  /**
   * Определяет агрессивность реакции
   */
  private determineAggressiveness(
    ourPriceChangePct: number,
    model: CompetitorReactionModel
  ): 'low' | 'medium' | 'high' {
    const magnitude = Math.abs(ourPriceChangePct);
    const aggressiveness = model.aggressiveness || 'medium';
    
    // Если наше изменение очень большое, конкурент может стать более агрессивным
    if (magnitude > 20) {
      return 'high';
    } else if (magnitude > 10) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Рассчитывает изменение цены конкурента
   */
  private calculatePriceChange(
    ourPriceChange: number,
    ourPriceChangePct: number,
    aggressiveness: 'low' | 'medium' | 'high',
    model: CompetitorReactionModel
  ): number {
    const aggressivenessMultiplier = this.getAggressivenessMultiplier(aggressiveness);
    const baseReactionRatio = model.baseReactionRatio || 0.5;
    
    // Базовое изменение цены пропорционально нашему изменению
    let priceChange = ourPriceChange * baseReactionRatio * aggressivenessMultiplier;
    
    // Добавляем случайный шум
    const noiseFactor = 0.1; // 10% случайности
    const noise = (Math.random() - 0.5) * 2 * noiseFactor * Math.abs(priceChange);
    priceChange += noise;
    
    // Округляем до копеек
    return Math.round(priceChange * 100) / 100;
  }

  /**
   * Рассчитывает задержку реакции
   */
  private calculateReactionDelay(
    aggressiveness: 'low' | 'medium' | 'high',
    model: CompetitorReactionModel
  ): number {
    const baseDelay = model.baseReactionDelay || 30; // 30 минут по умолчанию
    
    const aggressivenessMultiplier = this.getAggressivenessMultiplier(aggressiveness);
    
    // Более агрессивные конкуренты реагируют быстрее
    let delay = baseDelay / aggressivenessMultiplier;
    
    // Добавляем случайность
    const randomness = 0.3; // 30% случайности
    delay *= (1 + (Math.random() - 0.5) * randomness);
    
    // Минимальная задержка 5 минут
    return Math.max(5, Math.round(delay));
  }

  /**
   * Определяет, должна ли реакция примениться
   */
  private shouldApplyReaction(
    newPrice: number,
    priceChangePct: number,
    model: CompetitorReactionModel
  ): boolean {
    // Проверяем минимальную цену
    if (newPrice < (model.minPrice || 0)) {
      return false;
    }
    
    // Проверяем максимальное изменение цены
    const maxPriceChangePct = model.maxPriceChangePct || 50;
    if (Math.abs(priceChangePct) > maxPriceChangePct) {
      return false;
    }
    
    // Проверяем вероятность отклонения системой
    const systemRejectionProbability = model.systemRejectionProbability || 0.1;
    if (Math.random() < systemRejectionProbability) {
      return false;
    }
    
    return true;
  }

  /**
   * Получает множитель агрессивности
   */
  private getAggressivenessMultiplier(aggressiveness: 'low' | 'medium' | 'high'): number {
    switch (aggressiveness) {
      case 'low':
        return 0.5;
      case 'medium':
        return 1.0;
      case 'high':
        return 2.0;
      default:
        return 1.0;
    }
  }

  /**
   * Генерирует историю реакций конкурентов для бэктестинга
   */
  async generateCompetitorReactionHistory(
    ourPriceHistory: Array<{ timestamp: string; price: number }>,
    competitors: Array<{ id: string; initialPrice: number; model: CompetitorReactionModel }>,
    startTimestamp: string
  ): Promise<ReactionSimulation[]> {
    this.logger.log('Generating competitor reaction history for backtesting');

    const allReactions: ReactionSimulation[] = [];
    
    for (let i = 1; i < ourPriceHistory.length; i++) {
      const current = ourPriceHistory[i];
      const previous = ourPriceHistory[i - 1];
      
      const priceChange = current.price - previous.price;
      const priceChangePct = (priceChange / previous.price) * 100;
      
      // Получаем текущие цены конкурентов
      const currentCompetitorPrices = competitors.map(comp => ({
        id: comp.id,
        currentPrice: this.getCompetitorPriceAtTime(comp, allReactions, current.timestamp),
        model: comp.model
      }));
      
      // Симулируем реакции
      const reactions = await this.simulateCompetitorReactions(
        priceChange,
        priceChangePct,
        currentCompetitorPrices,
        current.timestamp
      );
      
      allReactions.push(...reactions);
    }
    
    this.logger.log(`Generated ${allReactions.length} competitor reactions for backtesting`);
    return allReactions;
  }

  /**
   * Получает цену конкурента в определенный момент времени
   */
  private getCompetitorPriceAtTime(
    competitor: { id: string; initialPrice: number; model: CompetitorReactionModel },
    reactions: ReactionSimulation[],
    timestamp: string
  ): number {
    // Начинаем с начальной цены
    let currentPrice = competitor.initialPrice;
    
    // Применяем все реакции до указанного времени
    const relevantReactions = reactions
      .filter(r => r.competitorId === competitor.id && r.timestamp <= timestamp && r.applied)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    for (const reaction of relevantReactions) {
      currentPrice = reaction.newPrice;
    }
    
    return currentPrice;
  }

  /**
   * Анализирует паттерны реакций конкурентов
   */
  async analyzeCompetitorReactionPatterns(
    reactions: ReactionSimulation[]
  ): Promise<{
    averageReactionTime: number;
    reactionProbability: number;
    averagePriceChange: number;
    aggressivenessDistribution: Record<string, number>;
    topReactors: Array<{ competitorId: string; reactionCount: number; averageDelay: number }>;
  }> {
    if (reactions.length === 0) {
      return {
        averageReactionTime: 0,
        reactionProbability: 0,
        averagePriceChange: 0,
        aggressivenessDistribution: {},
        topReactors: []
      };
    }

    // Группируем реакции по конкурентам
    const competitorReactions = new Map<string, ReactionSimulation[]>();
    for (const reaction of reactions) {
      if (!competitorReactions.has(reaction.competitorId)) {
        competitorReactions.set(reaction.competitorId, []);
      }
      competitorReactions.get(reaction.competitorId)!.push(reaction);
    }

    // Рассчитываем метрики
    const averageReactionTime = reactions.reduce((sum, r) => sum + r.delay, 0) / reactions.length;
    const reactionProbability = reactions.length / (reactions.length + competitorReactions.size);
    const averagePriceChange = reactions.reduce((sum, r) => sum + Math.abs(r.priceChangePct), 0) / reactions.length;

    // Анализируем топ-реакторов
    const topReactors = Array.from(competitorReactions.entries())
      .map(([competitorId, compReactions]) => ({
        competitorId,
        reactionCount: compReactions.length,
        averageDelay: compReactions.reduce((sum, r) => sum + r.delay, 0) / compReactions.length
      }))
      .sort((a, b) => b.reactionCount - a.reactionCount)
      .slice(0, 5);

    return {
      averageReactionTime,
      reactionProbability,
      averagePriceChange,
      aggressivenessDistribution: {},
      topReactors
    };
  }
}
