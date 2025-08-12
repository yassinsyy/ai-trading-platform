import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PriceApplyService } from './price-apply.service';
import { PriceApplyController } from './price-apply.controller';
import { PricingController } from './pricing.controller';
import { WsModule } from '../ws/ws.module';
import { AiModule } from '../ai/ai.module';
import { MarketplacesModule } from '../marketplaces/marketplaces.module';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { Costs } from '../entities/costs.entity';
import { Fees } from '../entities/fees.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      PricePolicy,
      Costs,
      Fees,
      AuditLog,
      CompetitorSnapshot,
      StockSnapshot,
    ]),
    WsModule,
    AiModule,
    MarketplacesModule,
  ],
  providers: [
    PricingService,
    PriceApplyService,
  ],
  controllers: [
    PriceApplyController,
    PricingController,
  ],
  exports: [
    PricingService,
    PriceApplyService,
  ],
})
export class PricingModule {}
