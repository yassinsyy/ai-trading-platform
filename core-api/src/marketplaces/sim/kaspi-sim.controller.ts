import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { 
  CompetitionPrice, 
  StockItem, 
  PriceUpdate, 
  PriceUpdateResult 
} from '../adapter.types';

@Controller('sim/kaspi')
export class KaspiSimController {
  private readonly logger = new Logger(KaspiSimController.name);
  
  // Фикстуры для симуляции
  private readonly mockStocks: Record<string, StockItem> = {
    'KSP-001': { offerExternalId: 'KSP-001', onHand: 15, city: 'Almaty', observedAt: new Date() },
    'KSP-002': { offerExternalId: 'KSP-002', onHand: 8, city: 'Astana', observedAt: new Date() },
    'KSP-003': { offerExternalId: 'KSP-003', onHand: 23, city: 'Almaty', observedAt: new Date() },
  };
  
  private readonly mockCompetition: Record<string, CompetitionPrice> = {
    'KSP-001': { 
      offerExternalId: 'KSP-001', 
      minPrice: 1200, 
      avgPrice: 1350, 
      maxPrice: 1500, 
      observedAt: new Date() 
    },
    'KSP-002': { 
      offerExternalId: 'KSP-002', 
      minPrice: 2500, 
      avgPrice: 2750, 
      maxPrice: 3000, 
      observedAt: new Date() 
    },
    'KSP-003': { 
      offerExternalId: 'KSP-003', 
      minPrice: 3200, 
      avgPrice: 3500, 
      maxPrice: 3800, 
      observedAt: new Date() 
    },
  };

  @Get('stocks')
  async getStocks(@Query('ids') ids: string): Promise<StockItem[]> {
    this.logger.debug(`Simulating stocks request for: ${ids}`);
    
    const offerIds = ids.split(',').filter(id => id.trim());
    const results: StockItem[] = [];
    
    for (const offerId of offerIds) {
      if (this.mockStocks[offerId]) {
        results.push(this.mockStocks[offerId]);
      } else {
        // Генерируем случайные данные для неизвестных офферов
        results.push({
          offerExternalId: offerId,
          onHand: Math.floor(Math.random() * 50) + 1,
          city: ['Almaty', 'Astana', 'Shymkent'][Math.floor(Math.random() * 3)],
          observedAt: new Date(),
        });
      }
    }
    
    // Симулируем задержку сети
    await this.delay(100 + Math.random() * 200);
    
    return results;
  }

  @Get('competition')
  async getCompetition(@Query('ids') ids: string): Promise<CompetitionPrice[]> {
    this.logger.debug(`Simulating competition request for: ${ids}`);
    
    const offerIds = ids.split(',').filter(id => id.trim());
    const results: CompetitionPrice[] = [];
    
    for (const offerId of offerIds) {
      if (this.mockCompetition[offerId]) {
        results.push(this.mockCompetition[offerId]);
      } else {
        // Генерируем случайные данные для неизвестных офферов
        const basePrice = Math.floor(Math.random() * 5000) + 500;
        results.push({
          offerExternalId: offerId,
          minPrice: basePrice * 0.8,
          avgPrice: basePrice,
          maxPrice: basePrice * 1.2,
          observedAt: new Date(),
        });
      }
    }
    
    // Симулируем задержку сети
    await this.delay(150 + Math.random() * 300);
    
    return results;
  }

  @Post('prices/update')
  async updatePrices(@Body() body: { updates: PriceUpdate[] }): Promise<{ results: PriceUpdateResult[] }> {
    this.logger.debug(`Simulating price update for ${body.updates.length} offers`);
    
    const results: PriceUpdateResult[] = [];
    
    for (const update of body.updates) {
      // Симулируем различные сценарии
      const scenario = Math.random();
      
      if (scenario < 0.85) {
        // 85% успешных обновлений
        results.push({
          offerExternalId: update.offerExternalId,
          status: 'OK',
          code: 'PRICE_UPDATED',
          message: `Price updated to ${update.newPrice}`,
          timestamp: new Date(),
        });
      } else if (scenario < 0.95) {
        // 10% ошибок валидации
        results.push({
          offerExternalId: update.offerExternalId,
          status: 'REJECTED',
          code: 'INVALID_PRICE',
          message: 'Price is outside allowed range',
          timestamp: new Date(),
        });
      } else {
        // 5% временных ошибок
        results.push({
          offerExternalId: update.offerExternalId,
          status: 'RETRY',
          code: 'TEMPORARY_ERROR',
          message: 'Temporary error, please retry',
          timestamp: new Date(),
        });
      }
    }
    
    // Симулируем задержку обработки
    await this.delay(200 + Math.random() * 500);
    
    // Иногда симулируем rate limit
    if (Math.random() < 0.05) {
      this.logger.warn('Simulating rate limit error');
      return {
        results: body.updates.map(update => ({
          offerExternalId: update.offerExternalId,
          status: 'RETRY',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded, retry later',
          timestamp: new Date(),
        }))
      };
    }
    
    return { results };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
