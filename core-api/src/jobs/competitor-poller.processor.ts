import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { MarketplaceAccount, MarketplaceType } from '../entities/marketplace-account.entity';

@Injectable()
export class CompetitorPollerProcessor {
  private readonly logger = new Logger(CompetitorPollerProcessor.name);

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(CompetitorSnapshot)
    private readonly competitorSnapshotRepository: Repository<CompetitorSnapshot>,
    @InjectRepository(MarketplaceAccount)
    private readonly marketplaceAccountRepository: Repository<MarketplaceAccount>,
  ) {}

  /**
   * Poll competitor prices every 15 minutes
   * Uses exponential backoff with jitter for rate limiting
   */
  @Cron('0 */15 * * * *') // Every 15 minutes
  async pollCompetitorPrices() {
    this.logger.log('Starting competitor price polling job');

    try {
      const activeOffers = await this.getActiveOffers();
      
      // Process offers in batches to respect rate limits
      const batchSize = 50;
      for (let i = 0; i < activeOffers.length; i += batchSize) {
        const batch = activeOffers.slice(i, i + batchSize);
        
        await this.processBatch(batch);
        
        // Rate limiting: wait between batches
        if (i + batchSize < activeOffers.length) {
          await this.delay(1000 + Math.random() * 2000); // 1-3 seconds with jitter
        }
      }

      // Prune old snapshots (>30 days)
      await this.pruneOldSnapshots();
      
      this.logger.log(`Competitor polling completed for ${activeOffers.length} offers`);
    } catch (error) {
      this.logger.error(`Competitor polling job failed: ${error.message}`);
    }
  }

  private async getActiveOffers(): Promise<Offer[]> {
    return await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.marketplaceAccount', 'marketplace')
      .where('offer.listingStatus = :status', { status: 'PUBLISHED' })
      .andWhere('offer.isAutoPricingEnabled = :enabled', { enabled: true })
      .andWhere('marketplace.isActive = :active', { active: true })
      .getMany();
  }

  private async processBatch(offers: Offer[]): Promise<void> {
    const promises = offers.map(offer => this.pollOfferCompetition(offer));
    
    // Process with concurrency limit
    const concurrencyLimit = 10;
    for (let i = 0; i < promises.length; i += concurrencyLimit) {
      const batch = promises.slice(i, i + concurrencyLimit);
      await Promise.allSettled(batch);
      
      // Small delay between concurrent batches
      if (i + concurrencyLimit < promises.length) {
        await this.delay(100);
      }
    }
  }

  private async pollOfferCompetition(offer: Offer): Promise<void> {
    try {
      const marketplaceAccount = offer.marketplaceAccount;
      
      // Get competitor data from marketplace adapter
      const competitorData = await this.getOfferCompetition(offer, marketplaceAccount);
      
      if (competitorData) {
        // Create competitor snapshot
        await this.createCompetitorSnapshot(offer.id, competitorData);
        
        this.logger.debug(`Updated competitor data for offer ${offer.id}: ${competitorData.competitorsCount} competitors`);
      }
    } catch (error) {
      this.logger.error(`Failed to poll competition for offer ${offer.id}: ${error.message}`);
      
      // Implement exponential backoff for failed offers
      await this.scheduleRetry(offer.id, error);
    }
  }

  private async getOfferCompetition(offer: Offer, marketplaceAccount: MarketplaceAccount): Promise<any> {
    // This is a placeholder for the actual marketplace adapter integration
    // In production, this would call the appropriate adapter based on marketplace type
    
    switch (marketplaceAccount.type) {
      case MarketplaceType.KASPI:
        return await this.callKaspiAdapter(offer, marketplaceAccount);
      case MarketplaceType.WILDBERRIES:
        return await this.callWildberriesAdapter(offer, marketplaceAccount);
      default:
        this.logger.warn(`Unknown marketplace type: ${marketplaceAccount.type}`);
        return null;
    }
  }

  private async callKaspiAdapter(offer: Offer, marketplaceAccount: MarketplaceAccount): Promise<any> {
    // TODO: Implement Kaspi API adapter
    // This would make HTTP calls to Kaspi's API to get competitor pricing
    this.logger.debug(`Calling Kaspi adapter for offer ${offer.id}`);
    
    // Mock response for now
    return {
      minCompetitorPrice: Math.random() * 1000 + 500,
      avgCompetitorPrice: Math.random() * 1000 + 500,
      maxCompetitorPrice: Math.random() * 1000 + 500,
      competitorsCount: Math.floor(Math.random() * 20) + 1,
      buyboxOwner: Math.random() > 0.5 ? 'competitor' : null,
      ourPosition: Math.floor(Math.random() * 10) + 1,
    };
  }

  private async callWildberriesAdapter(offer: Offer, marketplaceAccount: MarketplaceAccount): Promise<any> {
    // TODO: Implement Wildberries API adapter
    // This would make HTTP calls to Wildberries' API to get competitor pricing
    this.logger.debug(`Calling Wildberries adapter for offer ${offer.id}`);
    
    // Mock response for now
    return {
      minCompetitorPrice: Math.random() * 1000 + 500,
      avgCompetitorPrice: Math.random() * 1000 + 500,
      maxCompetitorPrice: Math.random() * 1000 + 500,
      competitorsCount: Math.floor(Math.random() * 20) + 1,
      buyboxOwner: Math.random() > 0.5 ? 'competitor' : null,
      ourPosition: Math.floor(Math.random() * 10) + 1,
    };
  }

  private async createCompetitorSnapshot(offerId: string, competitorData: any): Promise<void> {
    const snapshot = this.competitorSnapshotRepository.create({
      offerId,
      ts: new Date(),
      minCompetitorPrice: competitorData.minCompetitorPrice,
      avgCompetitorPrice: competitorData.avgCompetitorPrice,
      maxCompetitorPrice: competitorData.maxCompetitorPrice,
      competitorsCount: competitorData.competitorsCount,
      buyboxOwner: competitorData.buyboxOwner,
      ourPosition: competitorData.ourPosition,
      metadata: {
        source: 'competitor_poller',
        timestamp: new Date().toISOString(),
      },
    });

    await this.competitorSnapshotRepository.save(snapshot);
  }

  private async scheduleRetry(offerId: string, error: any): Promise<void> {
    // TODO: Implement retry mechanism with exponential backoff
    // This could use a separate retry queue or database table
    this.logger.debug(`Scheduling retry for offer ${offerId} due to: ${error.message}`);
  }

  private async pruneOldSnapshots(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.competitorSnapshotRepository
      .createQueryBuilder()
      .delete()
      .where('ts < :date', { date: thirtyDaysAgo })
      .execute();

    if (result.affected > 0) {
      this.logger.log(`Pruned ${result.affected} old competitor snapshots`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manual trigger for testing/debugging
   */
  async manualPoll(offerId?: string): Promise<void> {
    if (offerId) {
      const offer = await this.offerRepository.findOne({
        where: { id: offerId },
        relations: ['marketplaceAccount'],
      });
      
      if (offer) {
        await this.pollOfferCompetition(offer);
      }
    } else {
      await this.pollCompetitorPrices();
    }
  }
}
