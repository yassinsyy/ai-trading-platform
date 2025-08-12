import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { StockSnapshot } from '../entities/stock-snapshot.entity';
import { Costs } from '../entities/costs.entity';
import { Fees } from '../entities/fees.entity';
import { MarketplaceType } from '../entities/marketplace-account.entity';
import { PricingService } from '../pricing/pricing.service';
import { PricingInputs } from '../ai/types/pricing.types';
import { PriceApplyService } from '../pricing/price-apply.service';

@Injectable()
export class PricingRebalanceProcessor {
  private readonly logger = new Logger(PricingRebalanceProcessor.name);
  private readonly BATCH_SIZE = 1000; // Process 1k offers per batch
  private readonly MIN_PRICE_DELTA_PCT = 0.5; // 0.5% minimum change threshold

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    @InjectRepository(CompetitorSnapshot)
    private readonly competitorSnapshotRepository: Repository<CompetitorSnapshot>,
    @InjectRepository(StockSnapshot)
    private readonly stockSnapshotRepository: Repository<StockSnapshot>,
    @InjectRepository(Costs)
    private readonly costsRepository: Repository<Costs>,
    @InjectRepository(Fees)
    private readonly feesRepository: Repository<Fees>,
    private readonly pricingService: PricingService,
    private readonly priceApplyService: PriceApplyService,
  ) {}

  /**
   * Rebalance pricing every 2 hours
   * Respects rate limits per marketplace
   */
  @Cron('0 */2 * * *') // Every 2 hours
  async runPricingRebalance() {
    this.logger.log('Starting pricing rebalance job');

    try {
      let totalProcessed = 0;
      let totalApplied = 0;
      let offset = 0;

      // Process offers in batches
      while (true) {
        const offers = await this.getEligibleOffersBatch(offset, this.BATCH_SIZE);
        
        if (offers.length === 0) {
          break; // No more offers to process
        }

        const batchResults = await this.processBatch(offers);
        totalProcessed += offers.length;
        totalApplied += batchResults.applied;

        this.logger.log(`Batch processed: ${offers.length} offers, ${batchResults.applied} prices applied`);

        // Rate limiting: wait between batches
        if (offers.length === this.BATCH_SIZE) {
          await this.delay(2000 + Math.random() * 3000); // 2-5 seconds with jitter
        }

        offset += this.BATCH_SIZE;
      }

      this.logger.log(`Pricing rebalance completed: ${totalProcessed} offers processed, ${totalApplied} prices applied`);
    } catch (error) {
      this.logger.error(`Pricing rebalance job failed: ${error.message}`);
    }
  }

  private async getEligibleOffersBatch(offset: number, limit: number): Promise<Offer[]> {
    return await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.marketplaceAccount', 'marketplace')
      .where('offer.listingStatus = :status', { status: 'PUBLISHED' })
      .andWhere('offer.isAutoPricingEnabled = :enabled', { enabled: true })
      .andWhere('marketplace.isActive = :active', { active: true })
      .orderBy('offer.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  private async processBatch(offers: Offer[]): Promise<{ applied: number }> {
    let applied = 0;

    // Group offers by marketplace for rate limiting
    const offersByMarketplace = this.groupOffersByMarketplace(offers);

    for (const [marketplaceType, marketplaceOffers] of offersByMarketplace) {
      // Process marketplace offers with rate limiting
      const marketplaceResults = await this.processMarketplaceOffers(marketplaceType, marketplaceOffers);
      applied += marketplaceResults.applied;

      // Rate limiting per marketplace
      if (marketplaceOffers.length > 0) {
        await this.delay(this.getRateLimitDelay(marketplaceType));
      }
    }

    return { applied };
  }

  private groupOffersByMarketplace(offers: Offer[]): Map<string, Offer[]> {
    const grouped = new Map<string, Offer[]>();
    
    for (const offer of offers) {
      const marketplaceType = offer.marketplaceAccount.type;
      if (!grouped.has(marketplaceType)) {
        grouped.set(marketplaceType, []);
      }
      grouped.get(marketplaceType)!.push(offer);
    }

    return grouped;
  }

  private async processMarketplaceOffers(marketplaceType: string, offers: Offer[]): Promise<{ applied: number }> {
    let applied = 0;

    // Process offers sequentially to respect rate limits
    for (const offer of offers) {
      try {
        const shouldApply = await this.shouldApplyPriceChange(offer);
        
        if (shouldApply) {
          await this.applyPriceChange(offer);
          applied++;
        }
      } catch (error) {
        this.logger.error(`Failed to process offer ${offer.id}: ${error.message}`);
      }
    }

    return { applied };
  }

  private async shouldApplyPriceChange(offer: Offer): Promise<boolean> {
    try {
      // Get price policy
      const pricePolicy = await this.pricePolicyRepository.findOne({
        where: { productId: offer.productId }
      });

      if (!pricePolicy || !pricePolicy.isActive) {
        return false;
      }

      // Get latest data
      const competitorData = await this.getLatestCompetitorData(offer.id);
      const stockData = await this.getCurrentStock(offer.id);
      const costs = await this.getProductCosts(offer.productId);
      const fees = await this.getMarketplaceFees(offer.marketplaceAccountId);

      // Calculate new price using pricing engine
      const inputs: PricingInputs = {
        offerId: offer.id,
        sku: offer.product.sku || 'unknown',
        cost: {
          buy: costs?.cogs || 0,
          logistics: costs?.inboundLogistics || 0,
          other: 0
        },
        fee: {
          pct: fees?.commissionRate || 0.15,
          perOrderFixed: 0
        },
        policy: {
          mode: 'FOLLOW_MIN_COMPETITOR',
          floorPrice: costs?.cogs || 0,
          minMarginPct: (pricePolicy.minMarginPct || 15) / 100,
          maxPriceDeltaPctDay: (pricePolicy.maxPriceDeltaPctDay || 5) / 100
        },
        latest: {
          ts: new Date().toISOString(),
          ourPrice: offer.currentPrice,
          competitor: competitorData ? {
            min: competitorData.minCompetitorPrice || 0,
            avg: competitorData.minCompetitorPrice || 0,
            max: competitorData.minCompetitorPrice || 0
          } : null,
          stock: stockData ? stockData.onHand : 0,
          cost: costs?.cogs || 0,
          fee: fees?.commissionRate || 0.15
        } as any,
        history: [],
        market: 'KASPI' as any // Default market type
      };

      const decision = await this.pricingService.computePricing(inputs);

      // Check if price change meets minimum threshold
      if (decision.recommendedPrice !== offer.currentPrice) {
        const priceChangePct = Math.abs(decision.recommendedPrice - offer.currentPrice) / offer.currentPrice * 100;
        return priceChangePct >= this.MIN_PRICE_DELTA_PCT;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error checking price change for offer ${offer.id}: ${error.message}`);
      return false;
    }
  }

  private async applyPriceChange(offer: Offer): Promise<void> {
    try {
      // Generate idempotency key
      const idempotencyKey = `rebalance:${offer.id}:${Date.now()}`;

      // Get recommended price
      const recommendations = await this.pricingService.getPricingRecommendations(offer.id);
      const newPrice = recommendations.recommendedPrice;

      // Apply price change
      await this.priceApplyService.applyPrice(offer.id, {
        newPrice,
        reason: 'rebalance',
        idempotencyKey,
      });

      this.logger.debug(`Applied rebalance price for offer ${offer.id}: ${offer.currentPrice} → ${newPrice}`);
    } catch (error) {
      this.logger.error(`Failed to apply price change for offer ${offer.id}: ${error.message}`);
    }
  }

  private async getLatestCompetitorData(offerId: string): Promise<CompetitorSnapshot | null> {
    return await this.competitorSnapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.offerId = :offerId', { offerId })
      .orderBy('snapshot.ts', 'DESC')
      .getOne();
  }

  private async getCurrentStock(offerId: string): Promise<StockSnapshot | null> {
    return await this.stockSnapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.offerId = :offerId', { offerId })
      .orderBy('snapshot.ts', 'DESC')
      .getOne();
  }

  private async getProductCosts(productId: string): Promise<Costs | null> {
    return await this.costsRepository.findOne({
      where: { productId }
    });
  }

  private async getMarketplaceFees(marketplaceAccountId: string): Promise<Fees | null> {
    // This would need to be implemented based on marketplace account type
    // For now, return default fees
    return {
      commissionRate: 15,
      storageFeePerUnitDay: 0.01,
    } as Fees;
  }

  private getRateLimitDelay(marketplaceType: string): number {
    // Different rate limits for different marketplaces
    switch (marketplaceType) {
      case 'KASPI':
        return 1000; // 1 second
      case 'WILDBERRIES':
        return 2000; // 2 seconds
      default:
        return 1500; // 1.5 seconds default
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manual trigger for testing/debugging
   */
  async manualRebalance(offerId?: string): Promise<void> {
    if (offerId) {
      const offer = await this.offerRepository.findOne({
        where: { id: offerId },
        relations: ['marketplaceAccount'],
      });
      
      if (offer) {
        const shouldApply = await this.shouldApplyPriceChange(offer);
        if (shouldApply) {
          await this.applyPriceChange(offer);
        }
      }
    } else {
      await this.runPricingRebalance();
    }
  }
}
