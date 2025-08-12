import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingRebalanceService {
  async runOnceForAllMerchants() {
    // Mock implementation - замени на реальный сервис
    console.log('Running pricing rebalance for all merchants...');
    return { processed: 3, updated: 2, errors: 0 };
  }
  
  async runOnceForMerchant(merchantId: string) {
    // Mock implementation - замени на реальный сервис
    console.log(`Running pricing rebalance for merchant ${merchantId}...`);
    return { merchantId, processed: 1, updated: 1, errors: 0 };
  }
}
