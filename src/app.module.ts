import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';

import { AuthModule } from './auth/auth.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { ProductsModule } from './products/products.module';
import { OffersModule } from './offers/offers.module';
import { PricingModule } from './pricing/pricing.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { ContentModule } from './content/content.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 минута
        limit: 100, // 100 запросов в минуту
      },
    ]),

    // Очереди задач
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Health checks
    TerminusModule,

    // Бизнес-модули
    AuthModule,
    MarketplacesModule,
    ProductsModule,
    OffersModule,
    PricingModule,
    OpportunitiesModule,
    ContentModule,
    PurchaseOrdersModule,
    CommonModule,
  ],
})
export class AppModule {}
