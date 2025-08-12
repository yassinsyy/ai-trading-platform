import { Test, TestingModule } from '@nestjs/testing';
import { BacktestController } from '../backtest.controller';
import { AugmentedBacktestService } from '../augmented-backtest.service';

describe('BacktestController', () => {
  let controller: BacktestController;
  let backtestService: AugmentedBacktestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacktestController],
      providers: [
        {
          provide: AugmentedBacktestService,
          useValue: {
            logger: {
              log: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<BacktestController>(BacktestController);
    backtestService = module.get<AugmentedBacktestService>(AugmentedBacktestService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAndRunBacktest', () => {
    it('should create and run a new backtest', async () => {
      const createBacktestDto = {
        name: 'Test Backtest',
        description: 'Test description',
        config: {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.999Z',
          timeWindow: 15,
          includeCompetitorReactions: true,
          includeScenarios: true,
          scenarioCount: 1000,
          confidenceLevel: 0.95,
          riskFreeRate: 0.02,
        },
        tags: ['test'],
        priority: 'MEDIUM' as const,
      };

      const result = await controller.createAndRunBacktest(createBacktestDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Backtest');
      expect(result.status).toBe('PENDING');
      expect(result.startedAt).toBeDefined();
    });
  });

  describe('getBacktests', () => {
    it('should return list of backtests', async () => {
      const filters = {
        page: 1,
        limit: 20,
      };

      const result = await controller.getBacktests(filters);

      expect(result).toBeDefined();
      expect(result.results).toBeInstanceOf(Array);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('getBacktestById', () => {
    it('should return backtest by ID', async () => {
      const backtestId = 'test-backtest-id';

      const result = await controller.getBacktestById(backtestId);

      expect(result).toBeDefined();
      expect(result.id).toBe(backtestId);
      expect(result.name).toBe('Q4-2024-Pricing-Strategy');
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('updateBacktestStatus', () => {
    it('should update backtest status', async () => {
      const backtestId = 'test-backtest-id';
      const statusUpdate = { status: 'PAUSED' as const };

      const result = await controller.updateBacktestStatus(backtestId, statusUpdate);

      expect(result).toBeDefined();
      expect(result.id).toBe(backtestId);
      expect(result.status).toBe('PAUSED');
    });
  });

  describe('deleteBacktest', () => {
    it('should delete backtest', async () => {
      const backtestId = 'test-backtest-id';
      const spy = jest.spyOn(console, 'log');

      await controller.deleteBacktest(backtestId);

      expect(spy).toHaveBeenCalledWith(`Deleting backtest with ID: ${backtestId}`);
    });
  });

  describe('exportBacktestResults', () => {
    it('should export backtest results', async () => {
      const backtestId = 'test-backtest-id';
      const exportRequest = { format: 'CSV' as const };

      const result = await controller.exportBacktestResults(backtestId, exportRequest);

      expect(result).toBeDefined();
      expect(result.downloadUrl).toContain(backtestId);
      expect(result.downloadUrl).toContain('.csv');
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('getBacktestMetricsSummary', () => {
    it('should return backtest metrics summary', async () => {
      const result = await controller.getBacktestMetricsSummary();

      expect(result).toBeDefined();
      expect(result.totalBacktests).toBe(25);
      expect(result.completedBacktests).toBe(22);
      expect(result.failedBacktests).toBe(3);
      expect(result.successRate).toBe(0.88);
      expect(result.totalPnL).toBe(1250000);
      expect(result.averageSharpeRatio).toBe(1.6);
    });
  });
});
