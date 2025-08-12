import { Test, TestingModule } from '@nestjs/testing';
import { SimController } from './sim.controller';
import { RollingSimService } from './rolling-sim.service';
import { CompetitorReactionService } from './competitor-reaction';

describe('SimController', () => {
  let controller: SimController;
  let rollingSimService: RollingSimService;
  let competitorReactionService: CompetitorReactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimController],
      providers: [
        {
          provide: RollingSimService,
          useValue: {
            runRollingSimulation: jest.fn(),
            getActiveSimulations: jest.fn(),
            getSimulationState: jest.fn(),
            cleanupCompletedSimulations: jest.fn(),
          },
        },
        {
          provide: CompetitorReactionService,
          useValue: {
            analyzeCompetitorReactionPatterns: jest.fn(),
            simulateCompetitorReactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SimController>(SimController);
    rollingSimService = module.get<RollingSimService>(RollingSimService);
    competitorReactionService = module.get<CompetitorReactionService>(CompetitorReactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAndRunScenario', () => {
    it('should create and run a simulation scenario', async () => {
      const scenario = {
        name: 'Test Scenario',
        description: 'Test Description',
        parameters: { test: true },
        priority: 'MEDIUM' as const,
        horizon: 24,
        stepSize: 1,
      };

      const mockResult = {
        scenarioId: 'test_id',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        steps: [],
        summary: { totalRevenue: 1000, totalCost: 800, totalProfit: 200, averageMargin: 0.2, stockOutRate: 0.1, daysOfCover: 5, turnoverSpeed: 2.0 },
        riskMetrics: { var95: 0.1, cvar95: 0.15, maxDrawdown: 0.05, sharpeRatio: 1.2 },
        competitorAnalysis: { reactionCount: 5, averageReactionTime: 2, pricePressure: 0.1 },
        recommendations: [],
      };

      jest.spyOn(rollingSimService, 'runRollingSimulation').mockResolvedValue(mockResult);

      const result = await controller.createAndRunScenario(scenario);

      expect(result.success).toBe(true);
      expect(result.scenarioId).toBeDefined();
      expect(result.result).toEqual(mockResult);
      expect(rollingSimService.runRollingSimulation).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Scenario' }),
        [],
        24,
        1
      );
    });
  });

  describe('getScenarios', () => {
    it('should return active simulations and current state', async () => {
      const mockActiveSimulations = new Map([
        ['sim1', {
          scenarioId: 'scenario1',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-01T23:59:59Z',
          steps: [],
          summary: { totalRevenue: 1000, totalCost: 800, totalProfit: 200, averageMargin: 0.2, stockOutRate: 0.1, daysOfCover: 5, turnoverSpeed: 2.0 },
          riskMetrics: { var95: 0.1, cvar95: 0.15, maxDrawdown: 0.05, sharpeRatio: 1.2 },
          competitorAnalysis: { reactionCount: 5, averageReactionTime: 2, pricePressure: 0.1 },
          recommendations: [],
        }],
      ]);

      const mockState = {
        currentScenario: null,
        currentStep: 0,
        totalSteps: 0,
        startTime: null,
        lastUpdateTime: null,
        status: 'IDLE' as const,
        progress: 0,
        error: null,
      };

      jest.spyOn(rollingSimService, 'getActiveSimulations').mockReturnValue(mockActiveSimulations);
      jest.spyOn(rollingSimService, 'getSimulationState').mockReturnValue(mockState);

      const result = await controller.getScenarios();

      expect(result.activeSimulations).toHaveLength(1);
      expect(result.currentState).toEqual(mockState);
    });
  });

  describe('getSimulationState', () => {
    it('should return current simulation state', async () => {
      const mockState = {
        currentScenario: null,
        currentStep: 0,
        totalSteps: 0,
        startTime: null,
        lastUpdateTime: null,
        status: 'IDLE' as const,
        progress: 0,
        error: null,
      };

      jest.spyOn(rollingSimService, 'getSimulationState').mockReturnValue(mockState);

      const result = await controller.getSimulationState();

      expect(result).toEqual(mockState);
    });
  });
});
