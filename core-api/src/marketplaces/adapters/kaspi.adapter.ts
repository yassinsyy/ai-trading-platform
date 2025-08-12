import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceAdapter, CatalogItem, OfferStock, OfferCompetition, PriceUpdate } from './marketplace.adapter';
import { Offer } from '../../entities/offer.entity';
import { Product } from '../../entities/product.entity';
import { MarketplaceAccount } from '../../entities/marketplace-account.entity';
import { PricePolicy } from '../../entities/price-policy.entity';
import { StockSnapshot } from '../../entities/stock-snapshot.entity';
import { MarketplaceType, MarketplaceStatus, ListingStatus } from '../../entities';
import { PriceFeedService } from '../../pricefeed/pricefeed.service';
import { PriceFeedPublisher } from '../../pricefeed/pricefeed.publisher';

@Injectable()
export class KaspiAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(KaspiAdapter.name);

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MarketplaceAccount)
    private readonly marketplaceAccountRepository: Repository<MarketplaceAccount>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    @InjectRepository(StockSnapshot)
    private readonly stockSnapshotRepository: Repository<StockSnapshot>,
    private readonly priceFeedService: PriceFeedService,
    private readonly priceFeedPublisher: PriceFeedPublisher,
  ) {}

  name() {
    return 'kaspi' as const;
  }

  /**
   * Получение каталога товаров через Shop API
   * TODO: Заменить на реальные эндпоинты из Kaspi Guide
   */
  async getCatalog(opts?: { page?: number; pageSize?: number }): Promise<CatalogItem[]> {
    try {
      // TODO: Реализовать получение каталога
      this.logger.log('Getting catalog from Kaspi...');
      return [];
    } catch (error) {
      this.logger.error('Failed to get catalog from Kaspi:', error);
      return [];
    }
  }

  /**
   * Получение остатков товаров
   */
  async getStocks(): Promise<OfferStock[]> {
    try {
      // TODO: Реализовать получение остатков
      this.logger.log('Getting stocks from Kaspi...');
      return [];
    } catch (error) {
      this.logger.error('Failed to get stocks from Kaspi:', error);
      return [];
    }
  }

  /**
   * Получение информации о конкуренции для товара
   */
  async getOfferCompetition(externalId: string): Promise<OfferCompetition> {
    try {
      // TODO: Реализовать получение конкурентной информации
      this.logger.log(`Getting competition info for ${externalId}...`);
      return {
        externalId,
        competitors: [],
        averagePrice: 0,
        priceRange: { min: 0, max: 0 }
      };
    } catch (error) {
      this.logger.error('Failed to get competition info:', error);
      return {
        externalId,
        competitors: [],
        averagePrice: 0,
        priceRange: { min: 0, max: 0 }
      };
    }
  }

  /**
   * Обновление цен товаров
   */
  async updatePrices(updates: PriceUpdate[]): Promise<void> {
    try {
      // TODO: Реализовать обновление цен
      this.logger.log(`Updating prices for ${updates.length} items...`);
    } catch (error) {
      this.logger.error('Failed to update prices:', error);
      throw error;
    }
  }

  /**
   * Обновление прайс-фида для мерчанта
   */
  async refreshPriceFeed(merchantId: string): Promise<{ url: string; rev: string }> {
    try {
      this.logger.log(`Refreshing price feed for merchant ${merchantId}...`);
      
      // Проверяем что у мерчанта есть активные аккаунты Kaspi
      const kaspiAccounts = await this.marketplaceAccountRepository.find({
        where: {
          merchantId,
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE
        }
      });

      if (kaspiAccounts.length === 0) {
        throw new Error('No active Kaspi accounts found for merchant');
      }

      // Получаем активные офферы мерчанта с актуальными ценами и остатками
      const offers = await this.offerRepository
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.product', 'product')
        .leftJoinAndSelect('offer.marketplaceAccount', 'marketplaceAccount')
        .leftJoinAndSelect('product.pricePolicies', 'pricePolicies')
        .leftJoinAndSelect('offer.stockSnapshots', 'stockSnapshots')
        .where('marketplaceAccount.merchantId = :merchantId', { merchantId })
        .andWhere('marketplaceAccount.type = :type', { type: MarketplaceType.KASPI })
        .andWhere('marketplaceAccount.status = :status', { status: MarketplaceStatus.ACTIVE })
        .andWhere('offer.listingStatus = :listingStatus', { listingStatus: ListingStatus.PUBLISHED })
        .orderBy('stockSnapshots.createdAt', 'DESC')
        .getMany();

      if (offers.length === 0) {
        throw new Error('No active offers found for merchant');
      }

      // Преобразуем офферы в формат для XML фида
      const feedItems = offers.map(offer => {
        // Получаем последний снимок остатков
        const latestStock = offer.stockSnapshots?.[0];
        
        // Получаем актуальную цену (либо из оффера, либо из политики цен)
        let currentPrice = offer.currentPrice;
        if (offer.product.pricePolicies && offer.product.pricePolicies.length > 0) {
          const activePolicy = offer.product.pricePolicies.find(p => p.isActive);
          if (activePolicy) {
            currentPrice = activePolicy.floorPrice || currentPrice;
          }
        }

        return {
          sku: offer.externalId || offer.product.sku,
          model: offer.product.attributes?.model,
          brand: offer.product.brand,
          quantity: latestStock?.onHand || 0,
          price: currentPrice || 0,
          category: offer.product.category,
          dimensions: offer.product.attributes?.dimensions,
          weight: offer.product.attributes?.weight,
          cityPrices: [] // TODO: Получить из PricePolicy по городам
        };
      });

      // Валидируем данные фида
      const validation = this.priceFeedService.validateItems(feedItems);
      if (!validation.isValid) {
        throw new Error(`Feed validation failed: ${validation.errors.join(', ')}`);
      }

      // Генерируем XML фид
      const xml = await this.priceFeedService.buildXml(merchantId, feedItems);
      
      // Публикуем в S3/MinIO
      const publishResult = await this.priceFeedPublisher.publish(xml, merchantId);
      
      this.logger.log(`Price feed refreshed successfully for merchant ${merchantId}: ${publishResult.url}`);
      
      return {
        url: publishResult.url,
        rev: publishResult.revision
      };
    } catch (error) {
      this.logger.error(`Failed to refresh price feed for merchant ${merchantId}:`, error);
      throw error;
    }
  }



  /**
   * Публикация листинга товара
   */
  async publishListing(externalId: string, payload: any): Promise<void> {
    try {
      // TODO: Реализовать публикацию листинга
      this.logger.log(`Publishing listing for ${externalId}...`);
    } catch (error) {
      this.logger.error('Failed to publish listing:', error);
      throw error;
    }
  }

  /**
   * Получение заказов
   */
  async getOrders(filters?: {
    page?: number;
    pageSize?: number;
    orderCode?: string;
    status?: string;
  }): Promise<any[]> {
    try {
      // TODO: Реализовать получение заказов
      this.logger.log('Getting orders from Kaspi...');
      return [];
    } catch (error) {
      this.logger.error('Failed to get orders:', error);
      return [];
    }
  }

  /**
   * Обновление статуса заказа
   */
  async updateOrderStatus(orderCode: string, status: string): Promise<void> {
    try {
      // TODO: Реализовать обновление статуса заказа
      this.logger.log(`Updating order ${orderCode} status to ${status}...`);
    } catch (error) {
      this.logger.error('Failed to update order status:', error);
      throw error;
    }
  }

  /**
   * Проверка здоровья API
   */
  async healthCheck(): Promise<boolean> {
    try {
      // TODO: Реализовать проверку здоровья API
      this.logger.log('Checking Kaspi API health...');
      return true;
    } catch (error) {
      this.logger.error('Kaspi API health check failed:', error);
      return false;
    }
  }
}
