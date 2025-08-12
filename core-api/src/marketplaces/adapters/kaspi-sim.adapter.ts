import { Injectable, Logger } from '@nestjs/common';
import { 
  MarketplaceAdapter, 
  Mp, 
  CompetitionPrice, 
  StockItem, 
  PriceUpdate, 
  PriceUpdateResult 
} from '../adapter.types';
import axios from 'axios';

@Injectable()
export class KaspiSimAdapter implements MarketplaceAdapter {
  private readonly logger = new Logger(KaspiSimAdapter.name);
  private readonly simBaseUrl = process.env.SIM_BASE_URL || 'http://localhost:3001';

  async fetchStocks(offerIds: string[]): Promise<StockItem[]> {
    this.logger.debug(`Fetching stocks for ${offerIds.length} offers via sim mode`);
    
    try {
      const response = await axios.get(`${this.simBaseUrl}/sim/kaspi/stocks`, {
        params: { ids: offerIds.join(',') },
        timeout: 5000,
      });
      
      return response.data.map((item: any) => ({
        offerExternalId: item.offerExternalId,
        onHand: item.onHand,
        city: item.city,
        observedAt: new Date(item.observedAt),
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch stocks from sim: ${error.message}`);
      throw error;
    }
  }

  async fetchCompetition(offerIds: string[]): Promise<CompetitionPrice[]> {
    this.logger.debug(`Fetching competition for ${offerIds.length} offers via sim mode`);
    
    try {
      const response = await axios.get(`${this.simBaseUrl}/sim/kaspi/competition`, {
        params: { ids: offerIds.join(',') },
        timeout: 5000,
      });
      
      return response.data.map((item: any) => ({
        offerExternalId: item.offerExternalId,
        minPrice: item.minPrice,
        avgPrice: item.avgPrice,
        maxPrice: item.maxPrice,
        observedAt: new Date(item.observedAt),
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch competition from sim: ${error.message}`);
      throw error;
    }
  }

  async updatePrices(batch: PriceUpdate[]): Promise<PriceUpdateResult[]> {
    this.logger.debug(`Updating ${batch.length} prices via sim mode`);
    
    try {
      const response = await axios.post(`${this.simBaseUrl}/sim/kaspi/prices/update`, {
        updates: batch,
      }, {
        timeout: 10000,
      });
      
      return response.data.results.map((result: any) => ({
        offerExternalId: result.offerExternalId,
        status: result.status,
        code: result.code,
        message: result.message,
        timestamp: new Date(result.timestamp),
      }));
    } catch (error) {
      this.logger.error(`Failed to update prices via sim: ${error.message}`);
      
      // Симулируем ошибки сети
      if (error.response?.status === 429) {
        return batch.map(update => ({
          offerExternalId: update.offerExternalId,
          status: 'RETRY',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded, retry later',
          timestamp: new Date(),
        }));
      }
      
      if (error.response?.status >= 500) {
        return batch.map(update => ({
          offerExternalId: update.offerExternalId,
          status: 'RETRY',
          code: 'SERVER_ERROR',
          message: 'Server error, retry later',
          timestamp: new Date(),
        }));
      }
      
      throw error;
    }
  }

  getRateLimits(): { rpm: number; burst: number; batchSize: number } {
    return {
      rpm: 60, // 60 запросов в минуту
      burst: 10,
      batchSize: parseInt(process.env.KASPI_BATCH_SIZE || '50'),
    };
  }

  getMode(): 'feed' | 'api' | 'sim' {
    return 'sim';
  }

  getMarketplace(): Mp {
    return 'KASPI';
  }
}
