import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

// Services
import { RollingSimService } from './rolling-sim.service';
import { CompetitorReactionService } from './competitor-reaction';

// Controllers
import { SimController } from './sim.controller';

// Entities
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { BacktestResult } from '../entities/backtest-result.entity';

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
      BacktestResult,
    ]),
    BullModule.registerQueue({
      name: 'simulation',
    }),
    BullModule.registerQueue({
      name: 'ai-retrain',
    }),
    CommonModule,
  ],
  controllers: [SimController],
  providers: [
    RollingSimService,
    CompetitorReactionService,
  ],
  exports: [
    RollingSimService,
    CompetitorReactionService,
  ],
})
export class SimModule {}
