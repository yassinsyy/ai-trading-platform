import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PriceApplyService, PriceApplyRequest } from './price-apply.service';

@ApiTags('Price Management')
@Controller('offers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PriceApplyController {
  constructor(private readonly priceApplyService: PriceApplyService) {}

  @Post(':id/price/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply price change to offer' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Unique key to prevent duplicate price applications',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Price applied successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid price or offer not found' })
  @ApiResponse({ status: 409, description: 'Conflict - guardrail violation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async applyPrice(
    @Param('id') offerId: string,
    @Body() body: { newPrice: number; reason: 'manual' | 'rebalance' | 'clearance' },
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    // Validate idempotency key
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    // Validate request body
    if (!body.newPrice || body.newPrice <= 0) {
      throw new BadRequestException('newPrice must be a positive number');
    }

    if (!body.reason || !['manual', 'rebalance', 'clearance'].includes(body.reason)) {
      throw new BadRequestException('reason must be one of: manual, rebalance, clearance');
    }

    const request: PriceApplyRequest = {
      newPrice: body.newPrice,
      reason: body.reason,
      idempotencyKey,
    };

    try {
      return await this.priceApplyService.applyPrice(offerId, request);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw guardrail violations as 409
      }
      throw error;
    }
  }
}
