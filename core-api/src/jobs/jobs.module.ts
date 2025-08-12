import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CompetitorPollerProcessor } from './competitor-poller.processor';
import { PricingRebalanceProcessor } from './pricing-rebalance.processor';
import { PricingModule } from '../pricing/pricing.module';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';
import { Costs } from '../entities/costs.entity';
import { Fees } from '../entities/fees.entity';
import { MarketplaceAccount } from '../entities/marketplace-account.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Offer,
      PricePolicy,
      CompetitorSnapshot,
      StockSnapshot,
      Costs,
      Fees,
      MarketplaceAccount,
    ]),
    PricingModule,
  ],
  providers: [
    CompetitorPollerProcessor,
    PricingRebalanceProcessor,
  ],
  exports: [
    CompetitorPollerProcessor,
    PricingRebalanceProcessor,
  ],
})
export class JobsModule {}
