import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { Product } from '../entities/product.entity';
import { ApplyPricingDto } from './dto/apply-pricing.dto';
import { PricingService } from '../pricing/pricing.service';

export interface OffersFilters {
  marketplace?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly pricingService: PricingService,
  ) {}

  async getOffers(filters: OffersFilters) {
    const { marketplace, status, page = 1, limit = 20 } = filters;
    
    // Simple query without complex joins for now
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer');

    if (marketplace) {
      queryBuilder.andWhere('offer.marketplace = :marketplace', { marketplace });
    }

    if (status) {
      queryBuilder.andWhere('offer.listingStatus = :status', { status });
    }

    const [offers, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      offers: offers.map(offer => ({
        id: offer.id,
        productId: offer.productId,
        marketplaceAccountId: offer.marketplaceAccountId,
        externalId: offer.externalId,
        listingStatus: offer.listingStatus,
        url: offer.url,
        currentPrice: offer.currentPrice,
        price: offer.price,
        lastPrice: offer.lastPrice,
        lastPriceUpdateAt: offer.lastPriceUpdateAt,
        isAutoPricingEnabled: offer.isAutoPricingEnabled,
        lastSyncAt: offer.lastSyncAt,
        lastUpdated: offer.lastUpdated,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPublicOffers(filters: OffersFilters) {
    const { marketplace, status, page = 1, limit = 20 } = filters;
    
    // Query with latest snapshots
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.product', 'product')
      .leftJoinAndSelect('offer.marketplaceAccount', 'marketplaceAccount');

    if (marketplace) {
      queryBuilder.andWhere('marketplaceAccount.marketplace = :marketplace', { marketplace });
    }

    if (status) {
      queryBuilder.andWhere('offer.listingStatus = :status', { status });
    }

    // Add latest stock and competitor snapshots
    queryBuilder
      .addSelect(subQuery => {
        return subQuery
          .select('MAX(stock.timestamp)')
          .from('stock_snapshot', 'stock')
          .where('stock.offerId = offer.id');
      }, 'latestStockTimestamp')
      .addSelect(subQuery => {
        return subQuery
          .select('MAX(comp.timestamp)')
          .from('competitor_snapshot', 'comp')
          .where('comp.offerId = offer.id');
      }, 'latestCompetitorTimestamp');

    const [offers, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      offers: offers.map(offer => ({
        id: offer.id,
        productId: offer.productId,
        marketplaceAccountId: offer.marketplaceAccountId,
        externalId: offer.externalId,
        listingStatus: offer.listingStatus,
        currentPrice: offer.currentPrice,
        isAutoPricingEnabled: offer.isAutoPricingEnabled,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        product: offer.product ? {
          title: offer.product.title,
          sku: offer.product.sku,
          category: offer.product.category,
        } : null,
        marketplace: offer.marketplaceAccount ? {
          name: offer.marketplaceAccount.name,
          type: offer.marketplaceAccount.type,
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async applyPricing(offerId: string, applyPricingDto: ApplyPricingDto) {
    const { newPrice, reason, priority } = applyPricingDto;

    // Find offer with product details
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['product', 'product.costs', 'product.fees'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }

    // Validate price constraints
    const product = offer.product;
    if (newPrice < product.minPrice || newPrice > product.maxPrice) {
      throw new BadRequestException(
        `Price ${newPrice} is outside allowed range [${product.minPrice}, ${product.maxPrice}]`
      );
    }

    // Calculate new margin
    const costs = product.costs?.[0];
    const fees = product.fees?.[0];
    
    let newMargin = 0;
    let newMarginPercent = 0;
    
    if (costs && fees) {
      const totalCost = costs.totalCost;
      const commission = newPrice * fees.commissionRate;
      const processingFee = newPrice * fees.paymentProcessingFee;
      const totalFees = commission + processingFee;
      
      newMargin = newPrice - totalCost - totalFees;
      newMarginPercent = (newMargin / newPrice) * 100;
    }

    // Update offer price
    const oldPrice = offer.currentPrice;
    offer.currentPrice = newPrice;
    offer.lastUpdated = new Date();
    
    await this.offerRepository.save(offer);

    // Log price change
    console.log(`Price updated for offer ${offerId}: ${oldPrice} → ${newPrice} (${reason || 'No reason provided'})`);

    return {
      success: true,
      offerId,
      oldPrice,
      newPrice,
      priceChange: newPrice - oldPrice,
      priceChangePercent: ((newPrice - oldPrice) / oldPrice) * 100,
      newMargin,
      newMarginPercent,
      reason,
      priority,
      timestamp: new Date(),
    };
  }
}
