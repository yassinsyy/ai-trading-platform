import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { Costs } from '../entities/costs.entity';
import { SupplierSKU } from '../entities/supplier-sku.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Offer,
      PricePolicy,
      Costs,
      SupplierSKU,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
