import { RollingSimService } from '../rolling-sim.service';
import { CompetitorReactionService } from '../competitor-reaction';

/**
 * Пример использования модуля симуляции
 */
export class SimulationExample {
  constructor(
    private readonly rollingSimService: RollingSimService,
    private readonly competitorReactionService: CompetitorReactionService,
  ) {}

  /**
   * Пример запуска симуляции расширения рынка
   */
  async runMarketExpansionSimulation() {
    console.log('🚀 Starting Market Expansion Simulation...');

    const scenario = {
      id: `market_expansion_${Date.now()}`,
      name: 'Market Expansion Strategy',
      description: 'Testing pricing strategy for entering new market segments',
      parameters: {
        portfolioOptimization: true,
        riskTolerance: 'MEDIUM',
        targetMargin: 0.25,
        competitorAggressiveness: 'MEDIUM',
        demandVolatility: 'HIGH',
        supplyDisruption: 'NONE',
        seasonality: 'MODERATE',
      },
      priority: 'HIGH' as const,
      createdAt: new Date().toISOString(),
      status: 'PENDING' as const,
    };

    try {
      // Запускаем симуляцию на 48 часов с шагом в 2 часа
      const result = await this.rollingSimService.runRollingSimulation(
        scenario,
        [], // initialData будет получен из базы данных
        48, // horizon: 48 часов
        2   // stepSize: 2 часа
      );

      console.log('✅ Simulation completed successfully!');
      console.log(`📊 Total Revenue: $${result.summary.totalRevenue.toFixed(2)}`);
      console.log(`💰 Total Profit: $${result.summary.totalProfit.toFixed(2)}`);
      console.log(`📈 Profit Margin: ${(result.summary.averageMargin * 100).toFixed(1)}%`);
      console.log(`⚠️  Max Drawdown: ${(result.riskMetrics.maxDrawdown * 100).toFixed(1)}%`);
      console.log(`📊 Sharpe Ratio: ${result.riskMetrics.sharpeRatio.toFixed(2)}`);

      // Анализируем рекомендации
      if (result.recommendations.length > 0) {
        console.log('\n🎯 Recommendations:');
        result.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.type}: ${rec.description} (${rec.priority} priority)`);
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Simulation failed:', error.message);
      throw error;
    }
  }

  /**
   * Пример анализа конкурентных реакций
   */
  async analyzeCompetitorBehavior() {
    console.log('🔍 Analyzing competitor behavior...');

    try {
      const patterns = await this.competitorReactionService.analyzeCompetitorReactionPatterns(
        [] // Пустой массив реакций для примера
      );

      console.log('✅ Competitor analysis completed!');
      console.log(`📊 Found ${patterns.topReactors.length} top reactors`);

      patterns.topReactors.forEach((reactor, index) => {
        console.log(`\nReactor ${index + 1}:`);
        console.log(`  - Competitor: ${reactor.competitorId}`);
        console.log(`  - Reaction Count: ${reactor.reactionCount}`);
        console.log(`  - Average Delay: ${reactor.averageDelay.toFixed(1)} hours`);
      });

      return patterns;

    } catch (error) {
      console.error('❌ Competitor analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Пример симуляции реакции конкурентов на изменение цены
   */
  async simulatePriceChangeReaction() {
    console.log('🎭 Simulating competitor reactions to price change...');

    try {
      const reactions = await this.competitorReactionService.simulateCompetitorReactions(
        15, // 15% increase in price
        0.15, // 15% increase in price
        [{ id: 'COMP001', currentPrice: 1000, model: { responseProbability: 0.3, priceChangeDelta: 0.1, responseDelay: 2, aggressiveness: 'medium', baseReactionProbability: 0.3, priceSensitivity: 1.0, competitiveIntensity: 0.5, baseReactionRatio: 0.5, baseReactionDelay: 2, minPrice: 100, maxPriceChangePct: 0.2, systemRejectionProbability: 0.1 } }],
        new Date().toISOString()
      );

      console.log('✅ Reaction simulation completed!');
      console.log(`📊 Simulated ${reactions.length} competitor reactions`);

      reactions.forEach((reaction, index) => {
        console.log(`\nReaction ${index + 1}:`);
        console.log(`  - Competitor: ${reaction.competitorId || 'Unknown'}`);
        console.log(`  - Delay: ${reaction.delay || 0} hours`);
        console.log(`  - Price Change: ${(reaction.priceChangePct || 0) * 100}%`);
      });

      return reactions;

    } catch (error) {
      console.error('❌ Reaction simulation failed:', error.message);
      throw error;
    }
  }

  /**
   * Пример мониторинга состояния симуляции
   */
  async monitorSimulationProgress() {
    console.log('📊 Monitoring simulation progress...');

    const state = this.rollingSimService.getSimulationState();
    const activeSimulations = this.rollingSimService.getActiveSimulations();

    console.log('Current Simulation State:');
    console.log(`  - Status: ${state.status}`);
    console.log(`  - Progress: ${state.progress}%`);
    console.log(`  - Current Step: ${state.currentStep}/${state.totalSteps}`);
    
    if (state.currentScenario) {
      console.log(`  - Scenario: ${state.currentScenario.name}`);
    }

    console.log(`\nActive Simulations: ${activeSimulations.size}`);
    activeSimulations.forEach((sim, id) => {
      console.log(`  - ${id}: ${sim.scenarioId} (${sim.endTime ? 'Completed' : 'Running'})`);
    });

    return { state, activeSimulations };
  }

  /**
   * Пример очистки завершенных симуляций
   */
  async cleanupSimulations() {
    console.log('🧹 Cleaning up completed simulations...');

    try {
      this.rollingSimService.cleanupCompletedSimulations();
      console.log('✅ Cleanup completed successfully!');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      throw error;
    }
  }
}

/**
 * Функция для демонстрации всех возможностей модуля симуляции
 */
export async function demonstrateSimulationModule(
  rollingSimService: RollingSimService,
  competitorReactionService: CompetitorReactionService
) {
  const example = new SimulationExample(rollingSimService, competitorReactionService);

  try {
    // 1. Анализируем поведение конкурентов
    await example.analyzeCompetitorBehavior();

    // 2. Симулируем реакцию на изменение цены
    await example.simulatePriceChangeReaction();

    // 3. Запускаем полную симуляцию
    await example.runMarketExpansionSimulation();

    // 4. Мониторим прогресс
    await example.monitorSimulationProgress();

    // 5. Очищаем завершенные симуляции
    await example.cleanupSimulations();

    console.log('\n🎉 All simulation examples completed successfully!');

  } catch (error) {
    console.error('\n💥 Some examples failed:', error.message);
  }
}
