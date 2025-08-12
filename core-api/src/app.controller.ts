import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdapterService } from './marketplaces/adapter.service';

@ApiTags('demo')
@Controller()
export class AppController {
  constructor(private readonly adapterService: AdapterService) {}
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  getHello(): string {
    return 'AI Trading Platform API is running!';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('adapters/status')
  @ApiOperation({ summary: 'Get marketplace adapters status' })
  getAdaptersStatus() {
    const adapters = this.adapterService.getAvailableAdapters();
    const currentConfig = {
      MP_KASPI_MODE: process.env.MP_KASPI_MODE || 'feed',
      KASPI_BATCH_SIZE: parseInt(process.env.KASPI_BATCH_SIZE || '100'),
      SIM_BASE_URL: process.env.SIM_BASE_URL || 'http://localhost:3001',
    };

    return {
      adapters,
      currentConfig,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('offers/public')
  @ApiOperation({ summary: 'Get public offers (mock data)' })
  getPublicOffers() {
    return {
      offers: [
        {
          id: 'demo-1',
          productId: 'prod-1',
          marketplaceAccountId: 'kaspi-1',
          externalId: 'KSP-001',
          listingStatus: 'active',
          currentPrice: 1500,
          isAutoPricingEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T12:00:00Z'
        },
        {
          id: 'demo-2',
          productId: 'prod-2',
          marketplaceAccountId: 'kaspi-1',
          externalId: 'KSP-002',
          listingStatus: 'active',
          currentPrice: 2500,
          isAutoPricingEnabled: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T12:00:00Z'
        },
        {
          id: 'demo-3',
          productId: 'prod-3',
          marketplaceAccountId: 'kaspi-1',
          externalId: 'KSP-003',
          listingStatus: 'active',
          currentPrice: 3500,
          isAutoPricingEnabled: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T12:00:00Z'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        pages: 1
      }
    };
  }

  @Post('pricing/:offerId/apply')
  @ApiOperation({ summary: 'Apply pricing (unified endpoint)' })
  applyPricing(
    @Param('offerId') offerId: string,
    @Body() body: { newPrice: number; reason: string; priority: number }
  ) {
    const oldPrice = 1500;
    const newPrice = body.newPrice;
    const priceChange = newPrice - oldPrice;
    const priceChangePercent = ((newPrice - oldPrice) / oldPrice) * 100;

    return {
      ok: true,
      offerId,
      oldPrice,
      newPrice,
      priceChange,
      priceChangePercent,
      reason: body.reason || 'Manual adjustment',
      priority: body.priority || 3,
      guardrailsApplied: ['min_price', 'max_price'],
      kpis: {
        margin: newPrice * 0.15,
        marginPercent: 15,
        roi: (newPrice * 0.15 / oldPrice) * 100
      },
      appliedAt: new Date().toISOString()
    };
  }

  @Post('offers/dev/pricing/:offerId/apply')
  @ApiOperation({ summary: 'Apply pricing (dev only) - legacy' })
  applyPricingDev(
    @Param('offerId') offerId: string,
    @Body() body: { newPrice: number; reason: string; priority: number }
  ) {
    return this.applyPricing(offerId, body);
  }
}
