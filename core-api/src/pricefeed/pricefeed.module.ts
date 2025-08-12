import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceFeedService } from './pricefeed.service';
import { PriceFeedPublisher } from './pricefeed.publisher';
import { PriceFeedController } from './pricefeed.controller';
// import { PriceFeedPublishProcessor } from '../jobs/pricefeed-publish.processor';
import { MarketplacesModule } from '../marketplaces/marketplaces.module';
import { Offer } from '../entities/offer.entity';
import { Product } from '../entities/product.entity';
import { MarketplaceAccount } from '../entities/marketplace-account.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';

@Module({
    imports: [
    TypeOrmModule.forFeature([
      Offer,
      Product,
      MarketplaceAccount,
      PricePolicy,
      StockSnapshot
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() => MarketplacesModule)
  ],
      providers: [PriceFeedService, PriceFeedPublisher],
    controllers: [PriceFeedController],
    exports: [PriceFeedService, PriceFeedPublisher]
})
export class PriceFeedModule {}
