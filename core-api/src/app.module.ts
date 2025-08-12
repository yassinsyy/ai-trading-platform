import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import only essential modules for demo
import { JobsDevModule } from './jobs/jobs-dev.module';
import { OffersModule } from './offers/offers.module';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '.env.local', 'env.local', '.env.docker'],
    }),

    // Database configuration
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [],
      synchronize: true,
      logging: false,
    }),

    // Only essential modules for demo (without DB for now)
    JobsDevModule,
    OffersModule,
    MarketplacesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
