import { Module } from '@nestjs/common';
import { JobsDevController } from './jobs-dev.controller';
import { DevGuard } from '../common/guards/dev.guard';
import { PricingRebalanceService } from './pricing-rebalance.service';

@Module({
  controllers: [JobsDevController],
  providers: [DevGuard, PricingRebalanceService],
})
export class JobsDevModule {}
