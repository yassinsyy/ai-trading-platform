import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { PricePolicy } from '../entities/price-policy.entity';
import { Costs } from '../entities/costs.entity';
import { Fees } from '../entities/fees.entity';
import { AuditLog, AuditAction, AuditResource } from '../entities/audit-log.entity';
import { MarketplaceType } from '../entities/marketplace-account.entity';
import { PricingService } from './pricing.service';
import { PricingInputs } from '../ai/types/pricing.types';
import { PricingGateway, PricingUpdate } from '../ws/pricing.gateway';
import { AdapterService } from '../marketplaces/adapter.service';
import { PriceUpdate, PriceUpdateResult } from '../marketplaces/adapter.types';

export interface PriceApplyRequest {
  newPrice: number;
  reason: 'manual' | 'rebalance' | 'clearance';
  idempotencyKey: string;
}

export interface PriceApplyResponse {
  applied: boolean;
  finalPrice: number;
  reasonCode: string;
  guardrail: {
    floorPrice: number;
    maxDeltaPctDay: number;
    violated: boolean;
  };
  auditId: string;
}

@Injectable()
export class PriceApplyService {
  private readonly logger = new Logger(PriceApplyService.name);
  private readonly appliedPrices = new Map<string, PriceApplyResponse>(); // In-memory cache for idempotency

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    @InjectRepository(Costs)
    private readonly costsRepository: Repository<Costs>,
    @InjectRepository(Fees)
    private readonly feesRepository: Repository<Fees>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly pricingService: PricingService,
    private readonly pricingGateway: PricingGateway,
    private readonly adapterService: AdapterService,
  ) {}

  /**
   * Apply price change with full validation and idempotency
   */
  async applyPrice(offerId: string, request: PriceApplyRequest): Promise<PriceApplyResponse> {
    // Check idempotency first
    const cacheKey = `${offerId}:${request.idempotencyKey}`;
    if (this.appliedPrices.has(cacheKey)) {
      this.logger.log(`Returning cached result for idempotency key: ${request.idempotencyKey}`);
      return this.appliedPrices.get(cacheKey)!;
    }

    // Get offer and validate
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['product', 'marketplaceAccount'],
    });

    if (!offer) {
      throw new BadRequestException('Offer not found');
    }

    // Get price policy
    const pricePolicy = await this.pricePolicyRepository.findOne({
      where: { productId: offer.productId }
    });

    if (!pricePolicy || !pricePolicy.isActive) {
      throw new BadRequestException('No active price policy found');
    }

    // Get costs and fees for guardrail calculation
    const costs = await this.costsRepository.findOne({
      where: { productId: offer.productId }
    });

    const fees = await this.feesRepository.findOne({
      where: { marketplace: offer.marketplaceAccount.type }
    });

    // Validate guardrails server-side (trust boundary)
    const guardrailValidation = await this.validateGuardrails(
      offer,
      pricePolicy,
      request.newPrice,
      costs,
      fees
    );

    if (guardrailValidation.violated) {
      throw new ConflictException(`Guardrail violation: ${guardrailValidation.reason}`);
    }

    // Apply price through marketplace adapter
    const appliedPrice = await this.applyPriceToMarketplace(offer, request.newPrice);

    // Update offer in database
    const oldPrice = offer.currentPrice;
    await this.offerRepository.update(offerId, {
      currentPrice: appliedPrice,
      lastPrice: oldPrice,
      lastPriceUpdateAt: new Date(),
    });

    // Create audit log
    const auditLog = await this.createAuditLog(offer, oldPrice, appliedPrice, request.reason);

    // Broadcast price update via WebSocket
    const pricingUpdate: PricingUpdate = {
      offerId: offer.id,
      oldPrice: oldPrice,
      newPrice: appliedPrice,
      reasonCode: 'PRICE_APPLIED',
      timestamp: new Date(),
      marketplaceId: offer.marketplaceAccountId,
      productId: offer.productId,
    };

    try {
      this.pricingGateway.broadcastPricingUpdate(pricingUpdate);
    } catch (error) {
      this.logger.error('Failed to broadcast pricing update via WebSocket', error);
      // Don't fail the price application if WebSocket broadcast fails
    }

    // Create response
    const response: PriceApplyResponse = {
      applied: true,
      finalPrice: appliedPrice,
      reasonCode: 'PRICE_APPLIED',
      guardrail: {
        floorPrice: guardrailValidation.floorPrice,
        maxDeltaPctDay: pricePolicy.maxPriceDeltaPctDay,
        violated: false,
      },
      auditId: auditLog.id,
    };

    // Cache for idempotency
    this.appliedPrices.set(cacheKey, response);

    // Clean up old cache entries (keep last 1000)
    if (this.appliedPrices.size > 1000) {
      const keys = Array.from(this.appliedPrices.keys());
      keys.slice(0, keys.length - 1000).forEach(key => this.appliedPrices.delete(key));
    }

    this.logger.log(`Price applied successfully for offer ${offerId}: ${oldPrice} → ${appliedPrice}`);

    // Update price feed if in feed mode
    if (offer.marketplaceAccount.type === MarketplaceType.KASPI) {
      try {
        const adapter = this.adapterService.resolveAdapter('KASPI');
        if (adapter.getMode() === 'feed') {
          const feedResult = await adapter.publishPriceFeed!('kaspi-feed');
          this.logger.log(`Price feed published for merchant ${offer.marketplaceAccount.merchantId}: ${feedResult.url}`);
          
          // Add feed info to audit log
          auditLog.metadata = {
            ...(auditLog.metadata || {}),
            feedUrl: feedResult.url,
            feedPublishedAt: feedResult.publishedAt
          };
          await this.auditLogRepository.save(auditLog);
        }
      } catch (error) {
        this.logger.error(`Failed to publish price feed for merchant ${offer.marketplaceAccount.merchantId}:`, error);
        // Don't fail the price application if price feed publish fails
        auditLog.metadata = {
          ...(auditLog.metadata || {}),
          feedPublishError: error.message
        };
        await this.auditLogRepository.save(auditLog);
      }
    }

    return response;
  }

  private async validateGuardrails(
    offer: Offer,
    pricePolicy: PricePolicy,
    newPrice: number,
    costs: Costs | null,
    fees: Fees | null
  ): Promise<{ violated: boolean; reason?: string; floorPrice: number }> {
    const currentPrice = offer.currentPrice;
    
    // Calculate floor price
    const cogs = costs?.cogs || 0;
    const feeAmount = fees?.commissionRate ? (cogs * fees.commissionRate / 100) : 0;
    const logistics = costs?.inboundLogistics || 0;
    const floorPrice = (cogs + feeAmount + logistics) * (1 + pricePolicy.minMarginPct / 100);

    // Check floor price
    if (newPrice < floorPrice) {
      return {
        violated: true,
        reason: `Price ${newPrice} below floor ${floorPrice}`,
        floorPrice,
      };
    }

    // Check max delta per day
    const maxDelta = currentPrice * (pricePolicy.maxPriceDeltaPctDay / 100);
    const priceChange = Math.abs(newPrice - currentPrice);
    
    if (priceChange > maxDelta) {
      return {
        violated: true,
        reason: `Price change ${priceChange} exceeds max daily delta ${maxDelta}`,
        floorPrice,
      };
    }

    // Check quiet hours if configured
    if (pricePolicy.rules?.quietHours?.enabled) {
      const now = new Date();
      if (this.isInQuietHours(now, pricePolicy.rules.quietHours)) {
        return {
          violated: true,
          reason: 'Price changes blocked during quiet hours',
          floorPrice,
        };
      }
    }

    return { violated: false, floorPrice };
  }

  private async applyPriceToMarketplace(offer: Offer, newPrice: number): Promise<number> {
    try {
      // Resolve adapter based on marketplace type
      const marketplaceType = offer.marketplaceAccount.type;
      let mp: 'KASPI' | 'WB' | 'OZON';
      
      switch (marketplaceType) {
        case MarketplaceType.KASPI:
          mp = 'KASPI';
          break;
        case MarketplaceType.WILDBERRIES:
          mp = 'WB';
          break;
        default:
          this.logger.warn(`No adapter for marketplace type: ${marketplaceType}`);
          return newPrice; // Return the requested price without applying to marketplace
      }
      
              const adapter = this.adapterService.resolveAdapter(mp);
      
      // Create price update batch
      const priceUpdate: PriceUpdate = {
        offerExternalId: offer.externalId,
        newPrice: newPrice,
        reason: 'AI pricing update',
        priority: 3,
      };
      
      // Apply price update
      const results = await adapter.updatePrices([priceUpdate]);
      const result = results[0];
      
      if (result.status === 'OK') {
        this.logger.log(`Price updated successfully for ${offer.externalId}: ${newPrice}`);
        return newPrice;
      } else if (result.status === 'REJECTED') {
        this.logger.warn(`Price update rejected for ${offer.externalId}: ${result.message}`);
        return offer.currentPrice; // Keep current price
      } else if (result.status === 'RETRY') {
        this.logger.warn(`Price update needs retry for ${offer.externalId}: ${result.message}`);
        throw new Error(`Price update failed, retry needed: ${result.message}`);
      } else {
        throw new Error(`Unknown price update status: ${result.status}`);
      }
    } catch (error) {
      this.logger.error(`Failed to apply price to marketplace: ${error.message}`);
      throw error;
    }
  }



  private async createAuditLog(
    offer: Offer,
    oldPrice: number,
    newPrice: number,
    reason: string
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action: AuditAction.UPDATE,
      resourceType: AuditResource.OFFER,
      resourceId: offer.id,
      resourceName: `Offer ${offer.externalId}`,
      oldValues: { currentPrice: oldPrice },
      newValues: { currentPrice: newPrice },
      description: `Price changed from ${oldPrice} to ${newPrice} (${reason})`,
      userId: 'system', // TODO: Get from request context
      merchantId: offer.marketplaceAccount.merchantId,
      context: {
        endpoint: '/offers/:id/price/apply',
        method: 'POST',
      },
      metadata: {
        offerId: offer.id,
        marketplaceType: offer.marketplaceAccount.type,
        priceChange: newPrice - oldPrice,
        priceChangePct: ((newPrice - oldPrice) / oldPrice) * 100,
      },
      timestamp: new Date(),
    });

    return await this.auditLogRepository.save(auditLog);
  }

  private isInQuietHours(now: Date, quietHours: { start: string; end: string; enabled: boolean }): boolean {
    if (!quietHours.enabled) return false;
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    if (quietHours.start && quietHours.end) {
      const [startHour, startMinute] = quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = quietHours.end.split(':').map(Number);

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime;
      } else {
        // Crosses midnight
        return currentTime >= startTime || currentTime <= endTime;
      }
    }

    return false;
  }

  /**
   * Get pricing recommendations for an offer
   */
  async getPricingRecommendations(offerId: string): Promise<any> {
    return await this.pricingService.getPricingRecommendations(offerId);
  }
}
