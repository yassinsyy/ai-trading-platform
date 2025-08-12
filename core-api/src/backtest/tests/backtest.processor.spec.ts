import { Test, TestingModule } from '@nestjs/testing';
import { BacktestProcessor } from '../backtest.processor';
import { AugmentedBacktestService } from '../augmented-backtest.service';

describe('BacktestProcessor', () => {
  let processor: BacktestProcessor;
  let backtestService: AugmentedBacktestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BacktestProcessor,
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

    processor = module.get<BacktestProcessor>(BacktestProcessor);
    backtestService = module.get<AugmentedBacktestService>(AugmentedBacktestService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('scheduleWeeklyBacktest', () => {
    it('should schedule weekly backtest', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      await processor['scheduleWeeklyBacktest']();

      expect(logSpy).toHaveBeenCalledWith('Scheduling weekly backtest...');
      expect(logSpy).toHaveBeenCalledWith('Weekly backtest scheduled successfully');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle errors during weekly backtest scheduling', async () => {
      // Mock the addBacktestJob method to throw an error
      jest.spyOn(processor as any, 'addBacktestJob').mockRejectedValueOnce(new Error('Test error'));
      
      const logSpy = jest.spyOn(processor['logger'], 'log');
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      await processor['scheduleWeeklyBacktest']();

      expect(logSpy).toHaveBeenCalledWith('Scheduling weekly backtest...');
      expect(errorSpy).toHaveBeenCalledWith('Failed to schedule weekly backtest', expect.any(String));
    });
  });

  describe('scheduleDailyBacktest', () => {
    it('should schedule daily backtest', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      await processor['scheduleDailyBacktest']();

      expect(logSpy).toHaveBeenCalledWith('Scheduling daily backtest...');
      expect(logSpy).toHaveBeenCalledWith('Daily backtest scheduled successfully');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle errors during daily backtest scheduling', async () => {
      // Mock the addBacktestJob method to throw an error
      jest.spyOn(processor as any, 'addBacktestJob').mockRejectedValueOnce(new Error('Test error'));
      
      const logSpy = jest.spyOn(processor['logger'], 'log');
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      await processor['scheduleDailyBacktest']();

      expect(logSpy).toHaveBeenCalledWith('Scheduling daily backtest...');
      expect(errorSpy).toHaveBeenCalledWith('Failed to schedule daily backtest', expect.any(String));
    });
  });

  describe('processBacktestJob', () => {
    it('should process backtest job successfully', async () => {
      const mockJob = {
        data: {
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
          userId: 'test-user',
        },
        progress: jest.fn(),
      } as any;

      const logSpy = jest.spyOn(processor['logger'], 'log');

      await processor['processBacktestJob'](mockJob);

      expect(logSpy).toHaveBeenCalledWith('Processing backtest job: Test Backtest (Priority: MEDIUM)');
      expect(logSpy).toHaveBeenCalledWith('Backtest job Test Backtest completed successfully');
      expect(mockJob.progress).toHaveBeenCalledWith(100);
    });

    it('should handle errors during job processing', async () => {
      const mockJob = {
        data: {
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
          userId: 'test-user',
        },
        progress: jest.fn(),
      } as any;

      // Mock the getHistoricalData method to throw an error
      jest.spyOn(processor as any, 'getHistoricalData').mockRejectedValueOnce(new Error('Test error'));
      
      const logSpy = jest.spyOn(processor['logger'], 'log');
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      await expect(processor['processBacktestJob'](mockJob)).rejects.toThrow('Test error');

      expect(logSpy).toHaveBeenCalledWith('Processing backtest job: Test Backtest (Priority: MEDIUM)');
      expect(errorSpy).toHaveBeenCalledWith('Failed to process backtest job Test Backtest', expect.any(String));
    });
  });

  describe('getJobPriority', () => {
    it('should return correct priority values', () => {
      expect(processor['getJobPriority']('HIGH')).toBe(1);
      expect(processor['getJobPriority']('MEDIUM')).toBe(5);
      expect(processor['getJobPriority']('LOW')).toBe(10);
      expect(processor['getJobPriority']('MEDIUM')).toBe(5); // default case
    });
  });

  describe('addBacktestJob', () => {
    it('should add backtest job to queue', async () => {
      const jobData = {
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
        userId: 'test-user',
      };

      const logSpy = jest.spyOn(processor['logger'], 'log');

      await processor['addBacktestJob'](jobData);

      expect(logSpy).toHaveBeenCalledWith('Backtest job added to queue: Test Backtest');
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch historical data', async () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-01-31T23:59:59.999Z';
      
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const result = await processor['getHistoricalData'](startDate, endDate);

      expect(logSpy).toHaveBeenCalledWith(`Fetching historical data from ${startDate} to ${endDate}`);
      expect(result).toEqual([]);
    });
  });

  describe('getPricingPolicy', () => {
    it('should fetch pricing policy', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const result = await processor['getPricingPolicy']();

      expect(logSpy).toHaveBeenCalledWith('Fetching pricing policy');
      expect(result).toEqual({});
    });
  });

  describe('saveBacktestResults', () => {
    it('should save backtest results', async () => {
      const name = 'Test Backtest';
      const description = 'Test description';
      const result = { test: 'data' };
      const tags = ['test'];
      const userId = 'test-user';
      
      const logSpy = jest.spyOn(processor['logger'], 'log');

      await processor['saveBacktestResults'](name, description, result, tags, userId);

      expect(logSpy).toHaveBeenCalledWith(`Saving backtest results for: ${name}`);
    });
  });
});
