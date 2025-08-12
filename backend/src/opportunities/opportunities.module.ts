import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesProcessor } from './opportunities.processor';

import { Product } from '../entities/product.entity';
import { Offer } from '../entities/offer.entity';
import { SalesDaily } from '../entities/sales-daily.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { Costs } from '../entities/costs.entity';
import { SupplierSKU } from '../entities/supplier-sku.entity';
import { Fees } from '../entities/fees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Offer,
      SalesDaily,
      CompetitorSnapshot,
      Costs,
      SupplierSKU,
      Fees,
    ]),
    BullModule.registerQueue({
      name: 'opportunities',
    }),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, OpportunitiesProcessor],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
