import { Controller, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PriceFeedService } from './pricefeed.service';
import { PriceFeedPublisher } from './pricefeed.publisher';
import { KaspiAdapter } from '../marketplaces/adapters/kaspi.adapter';

@ApiTags('Price Feed')
@Controller('pricefeed')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PriceFeedController {
  constructor(
    private readonly priceFeedService: PriceFeedService,
    private readonly priceFeedPublisher: PriceFeedPublisher,
    private readonly kaspiAdapter: KaspiAdapter,
  ) {}

  @Post('kaspi/:merchantId/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish Kaspi price feed',
    description: 'Manually publish price feed for a specific merchant to Kaspi marketplace'
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant ID',
    example: 'merchant-123'
  })
  @ApiResponse({
    status: 200,
    description: 'Price feed published successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Public URL to the published feed',
          example: 'https://cdn.example.com/feeds/kaspi/merchant-123/pricefeed-abc123.xml'
        },
        revision: {
          type: 'string',
          description: 'Feed revision hash',
          example: 'abc123def'
        },
        publishedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Publication timestamp'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed'
  })
  @ApiResponse({
    status: 404,
    description: 'Merchant not found or no active Kaspi account'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async publishKaspiFeed(
    @Param('merchantId') merchantId: string
  ): Promise<{ url: string; revision: string; publishedAt: string }> {
    try {
      const result = await this.kaspiAdapter.refreshPriceFeed(merchantId);
      
      return {
        url: result.url,
        revision: result.rev,
        publishedAt: new Date().toISOString()
      };
    } catch (error) {
      // Логируем ошибку для отладки
      console.error(`Failed to publish Kaspi feed for merchant ${merchantId}:`, error);
      
      // Перебрасываем ошибку с понятным сообщением
      if (error.message.includes('No active Kaspi accounts')) {
        throw new Error(`No active Kaspi accounts found for merchant ${merchantId}`);
      }
      if (error.message.includes('No active offers')) {
        throw new Error(`No active offers found for merchant ${merchantId}`);
      }
      if (error.message.includes('Feed validation failed')) {
        throw new Error(`Feed validation failed: ${error.message}`);
      }
      
      throw new Error(`Failed to publish price feed: ${error.message}`);
    }
  }
}
