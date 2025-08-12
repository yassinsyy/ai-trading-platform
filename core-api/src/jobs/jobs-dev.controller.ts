import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DevGuard } from '../common/guards/dev.guard';
import { PricingRebalanceService } from './pricing-rebalance.service';

@ApiTags('jobs-dev')
@UseGuards(DevGuard)
@Controller('jobs-dev')
export class JobsDevController {
  constructor(private readonly svc: PricingRebalanceService) {}

  @ApiOperation({ summary: 'Run pricing rebalance now (dev only)' })
  @ApiQuery({ name: 'merchantId', required: false })
  @Post('pricing-rebalance/run')
  async run(@Query('merchantId') merchantId?: string) {
    if (merchantId) {
      const res = await this.svc.runOnceForMerchant(merchantId);
      return { ok: true, scope: 'merchant', merchantId, res };
    }
    const res = await this.svc.runOnceForAllMerchants();
    return { ok: true, scope: 'all', res };
  }
}
