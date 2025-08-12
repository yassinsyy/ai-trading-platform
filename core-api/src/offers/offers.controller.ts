import { Controller, Get, Query, Post, Param, Body } from '@nestjs/common';

type OfferRowDto = {
  id: string;
  sku: string;
  title: string;
  marketplace: string;
  currentPrice: number | null;
  recommendedPrice: number | null;
  stock: number | null;
  compMin: number | null;
  compAvg: number | null;
  status: string | null;
};

type ApplyPricingDto = {
  newPrice: number;
  reason?: string;
  priority?: number;
};

@Controller('offers')
export class OffersController {
  /**
   * Возвращает список офферов с mock данными для демо
   * Фильтры: marketplace (KASPI/WB/OZON), q (поиск по SKU/Title), limit/offset.
   */
  @Get()
  async list(
    @Query('marketplace') marketplace?: string,
    @Query('q') q?: string,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0',
  ): Promise<OfferRowDto[]> {
    // Mock данные для демо
    const mockOffers: OfferRowDto[] = [
      {
        id: 'demo-1',
        sku: 'KETTLE-001',
        title: 'Электрический чайник Philips HD9316',
        marketplace: 'KASPI',
        currentPrice: 15000,
        recommendedPrice: 16500,
        stock: 45,
        compMin: 14000,
        compAvg: 16000,
        status: 'ACTIVE'
      },
      {
        id: 'demo-2',
        sku: 'BLENDER-002',
        title: 'Блендер Bosch MSM66110',
        marketplace: 'WILDBERRIES',
        currentPrice: 8500,
        recommendedPrice: 9200,
        stock: 23,
        compMin: 8000,
        compAvg: 9000,
        status: 'ACTIVE'
      },
      {
        id: 'demo-3',
        sku: 'COFFEE-003',
        title: 'Кофемашина DeLonghi ECAM 370.95.T',
        marketplace: 'OZON',
        currentPrice: 125000,
        recommendedPrice: 135000,
        stock: 8,
        compMin: 120000,
        compAvg: 130000,
        status: 'ACTIVE'
      }
    ];

    // Фильтрация по marketplace
    let filteredOffers = mockOffers;
    if (marketplace) {
      filteredOffers = mockOffers.filter(offer => 
        offer.marketplace.toLowerCase() === marketplace.toLowerCase()
      );
    }

    // Поиск по SKU/Title
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredOffers = filteredOffers.filter(offer =>
        offer.sku.toLowerCase().includes(searchTerm) ||
        offer.title.toLowerCase().includes(searchTerm)
      );
    }

    // Пагинация
    const limitNum = Math.min(parseInt(limit, 10) || 100, 500);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);
    
    return filteredOffers.slice(offsetNum, offsetNum + limitNum);
  }

  @Post('pricing/:offerId/apply')
  async applyPricing(
    @Param('offerId') offerId: string,
    @Body() applyPricingDto: ApplyPricingDto,
  ) {
    // Mock response для демо
    const oldPrice = 1500; // Фиксированная цена для демо
    const newPrice = applyPricingDto.newPrice;
    
    return {
      success: true,
      offerId,
      oldPrice,
      newPrice,
      priceChange: newPrice - oldPrice,
      priceChangePercent: ((newPrice - oldPrice) / oldPrice) * 100,
      reason: applyPricingDto.reason || 'Manual adjustment',
      priority: applyPricingDto.priority || 3,
      timestamp: new Date(),
      guardrailsApplied: ['min_price', 'max_price'],
      feedGenerated: true,
      feedUrl: 's3://price-feeds/kaspi/merchant-1/feed-2025-08-10.xml'
    };
  }
}
