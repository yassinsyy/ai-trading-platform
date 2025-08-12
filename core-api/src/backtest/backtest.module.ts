import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { AugmentedBacktestService } from './augmented-backtest.service';

// Controllers
import { BacktestController } from './backtest.controller';

// Processors
import { BacktestProcessor } from './backtest.processor';

// Repositories
import { BacktestRepository } from './backtest.repository';

// AI Services (dependencies)
import { LogLinearDemandModel } from '../ai/demand/loglinear.model';
import { PiecewiseDemandModel } from '../ai/demand/piecewise.model';
import { TimeSyncUtils } from '../ai/demand/time-sync.utils';
import { PortfolioOptimizerService } from '../ai/portfolio/optimizer';
import { ScenarioGeneratorService } from '../ai/portfolio/scenario-generator';
import { RiskManagementService } from '../ai/portfolio/risk';

// Sim Services
import { CompetitorReactionService } from '../sim/competitor-reaction';

// Entities
import { BacktestResult } from '../entities/backtest-result.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { AuditLog } from '../entities/audit-log.entity';

// Common
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BacktestResult,
      CompetitorSnapshot,
      StockSnapshot,
      Offer,
      PricePolicy,
      AuditLog,
    ]),
    BullModule.registerQueue({
      name: 'backtest',
    }),
    BullModule.registerQueue({
      name: 'ai-retrain',
    }),
    ScheduleModule.forRoot(),
    CommonModule,
  ],
  controllers: [BacktestController],
  providers: [
    AugmentedBacktestService,
    BacktestProcessor,
    BacktestRepository,
    LogLinearDemandModel,
    PiecewiseDemandModel,
    TimeSyncUtils,
    PortfolioOptimizerService,
    ScenarioGeneratorService,
    RiskManagementService,
    CompetitorReactionService,
  ],
  exports: [
    AugmentedBacktestService,
  ],
})
export class BacktestModule {}
