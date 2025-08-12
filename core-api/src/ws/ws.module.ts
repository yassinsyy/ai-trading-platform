import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PricingGateway } from './pricing.gateway';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { WsThrottlerGuard } from '../common/guards/ws-throttler.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    PricingGateway,
    WsJwtGuard,
    WsThrottlerGuard,
  ],
  exports: [
    PricingGateway,
    WsJwtGuard,
    WsThrottlerGuard,
  ],
})
export class WsModule {}
