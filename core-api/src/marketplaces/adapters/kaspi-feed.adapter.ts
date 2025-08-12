import { Injectable, Logger } from '@nestjs/common';
import { 
  MarketplaceAdapter, 
  Mp, 
  CompetitionPrice, 
  StockItem, 
  PriceUpdate, 
  PriceUpdateResult, 
  PriceFeedResult 
} from '../adapter.types';
import { PriceFeedPublisher } from '../../pricefeed/pricefeed.publisher';

@Injectable()
export class KaspiFeedAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(KaspiFeedAdapter.name);

  constructor(private readonly priceFeedPublisher: PriceFeedPublisher) {}

  async fetchStocks(offerIds: string[]): Promise<StockItem[]> {
    this.logger.debug(`Fetching stocks for ${offerIds.length} offers via feed mode`);
    
    // В feed режиме мы не можем получить актуальные остатки
    // Возвращаем пустой массив или данные из последнего снапшота
    return offerIds.map(offerId => ({
      offerExternalId: offerId,
      onHand: 0, // Неизвестно в feed режиме
      observedAt: new Date(),
    }));
  }

  async fetchCompetition(offerIds: string[]): Promise<CompetitionPrice[]> {
    this.logger.debug(`Fetching competition for ${offerIds.length} offers via feed mode`);
    
    // В feed режиме мы не можем получить конкурентные цены
    // Возвращаем пустой массив или данные из последнего снапшота
    return offerIds.map(offerId => ({
      offerExternalId: offerId,
      minPrice: 0, // Неизвестно в feed режиме
      observedAt: new Date(),
    }));
  }

  async updatePrices(batch: PriceUpdate[]): Promise<PriceUpdateResult[]> {
    this.logger.debug(`Updating ${batch.length} prices via feed mode`);
    
    try {
      // В feed режиме публикуем XML фид
      const feedUrl = await this.publishPriceFeed('kaspi-feed');
      
      return batch.map(update => ({
        offerExternalId: update.offerExternalId,
        status: 'OK',
        code: 'FEED_PUBLISHED',
        message: `Price feed published: ${feedUrl.url}`,
        timestamp: new Date(),
      }));
    } catch (error) {
      this.logger.error(`Failed to publish price feed: ${error.message}`);
      
      return batch.map(update => ({
        offerExternalId: update.offerExternalId,
        status: 'RETRY',
        code: 'FEED_PUBLISH_FAILED',
        message: error.message,
        timestamp: new Date(),
      }));
    }
  }

  async publishPriceFeed(feedUrl: string): Promise<PriceFeedResult> {
    this.logger.debug('Publishing Kaspi price feed');
    
    try {
      // Generate a simple XML feed for demo purposes
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<pricefeed generatedAt="${new Date().toISOString()}" merchantId="demo-merchant">
  <item>
    <offerId>demo-offer</offerId>
    <price>1500</price>
    <reason>AI pricing update</reason>
  </item>
</pricefeed>`;
      
      const result = await this.priceFeedPublisher.publish(xml, 'demo-merchant');
      
      return {
        accepted: true,
        url: result.url,
        publishedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish price feed: ${error.message}`);
      throw error;
    }
  }

  getRateLimits(): { rpm: number; burst: number; batchSize: number } {
    return {
      rpm: 10, // 10 фидов в минуту
      burst: 5,
      batchSize: parseInt(process.env.KASPI_BATCH_SIZE || '100'),
    };
  }

  getMode(): 'feed' | 'api' | 'sim' {
    return 'feed';
  }

  getMarketplace(): Mp {
    return 'KASPI';
  }
}
