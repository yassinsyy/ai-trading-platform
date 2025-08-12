import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

// import { AuthModule } from './auth/auth.module';
// import { MarketplacesModule } from './marketplaces/marketplaces.module';
// import { ProductsModule } from './products/products.module';
// import { OpportunitiesModule } from './opportunities/opportunities.module';
// import { PricingModule } from './pricing/pricing.module';
// import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
// import { ContentModule } from './content/content.module';
// import { ReportsModule } from './reports/reports.module';
// import { HealthModule } from './health/health.module';

import { getDatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // База данных
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // Redis и очереди
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const redisConfig = new RedisConfig(configService);
        return redisConfig.createBullOptions();
      },
      inject: [ConfigService],
    }),

    // Планировщик задач
    ScheduleModule.forRoot(),

    // Мониторинг здоровья
    TerminusModule,

    // События
    EventEmitterModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 минута
        limit: 100, // 100 запросов в минуту
      },
    ]),

    // Модули приложения
    // AuthModule,
    // MarketplacesModule,
    // ProductsModule,
    // OpportunitiesModule,
    // PricingModule,
    // PurchaseOrdersModule,
    // ContentModule,
    // ReportsModule,
    // HealthModule,
  ],
})
export class AppModule {}
