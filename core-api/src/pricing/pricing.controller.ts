import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PricingService } from './pricing.service';
import { ApplyPricingDto } from '../offers/dto/apply-pricing.dto';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post(':offerId/apply')
  @ApiOperation({
    summary: 'Apply pricing to offer',
    description: 'Applies new pricing to a specific offer with real-time updates'
  })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pricing applied successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        offerId: { type: 'string' },
        oldPrice: { type: 'number' },
        newPrice: { type: 'number' },
        priceChange: { type: 'number' },
        priceChangePercent: { type: 'number' },
        reason: { type: 'string' },
        priority: { type: 'number' },
        guardrailsApplied: { type: 'array', items: { type: 'string' } },
        kpis: {
          type: 'object',
          properties: {
            margin: { type: 'number' },
            marginPercent: { type: 'number' },
            roi: { type: 'number' },
          }
        },
        appliedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Offer not found'
  })
  async applyPricing(
    @Param('offerId') offerId: string,
    @Body() applyPricingDto: ApplyPricingDto,
  ) {
    return this.pricingService.computeAndApply(offerId, applyPricingDto);
  }
}
