import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// AI Services
import { CapitalAllocationService } from './capital-allocation/capital-allocation.service';
import { RollingSimService } from './rolling-sim/rolling-sim.service';

// Demand Models
import { LogLinearDemandModel } from './demand/loglinear.model';
import { PiecewiseDemandModel } from './demand/piecewise.model';
import { TimeSyncUtils } from './demand/time-sync.utils';

// Entities
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
      CompetitorSnapshot,
      StockSnapshot,
      Offer,
      PricePolicy,
      AuditLog,
    ]),
    BullModule.registerQueue({
      name: 'ai-backtest',
    }),
    BullModule.registerQueue({
      name: 'ai-retrain',
    }),
    CommonModule,
  ],
  providers: [
    CapitalAllocationService,
    RollingSimService,
    LogLinearDemandModel,
    PiecewiseDemandModel,
    TimeSyncUtils,
  ],
  exports: [
    CapitalAllocationService,
    RollingSimService,
    LogLinearDemandModel,
    PiecewiseDemandModel,
    TimeSyncUtils,
  ],
})
export class AiModule {}
