import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from '../entities/offer.entity';
import { Product } from '../entities/product.entity';
import { MarketplaceAccount } from '../entities/marketplace-account.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';
import { PriceFeedModule } from '../pricefeed/pricefeed.module';
import { KaspiSimController } from './sim/kaspi-sim.controller';
import { KaspiFeedAdapter } from './adapters/kaspi-feed.adapter';
import { KaspiSimAdapter } from './adapters/kaspi-sim.adapter';
import { AdapterService } from './adapter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Product,
      MarketplaceAccount,
      PricePolicy,
      StockSnapshot
    ]),
    forwardRef(() => PriceFeedModule)
  ],
  controllers: [KaspiSimController],
  providers: [
    AdapterService,
    KaspiFeedAdapter,
    KaspiSimAdapter,
  ],
  exports: [
    AdapterService,
    KaspiFeedAdapter,
    KaspiSimAdapter,
  ],
})
export class MarketplacesModule {}
