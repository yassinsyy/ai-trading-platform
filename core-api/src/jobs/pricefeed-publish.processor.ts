import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KaspiAdapter } from '../marketplaces/adapters/kaspi.adapter';
import { MarketplaceAccount } from '../entities/marketplace-account.entity';
import { MarketplaceType, MarketplaceStatus } from '../entities';

@Injectable()
export class PriceFeedPublishProcessor {
  private readonly logger = new Logger(PriceFeedPublishProcessor.name);

  constructor(
    private readonly kaspiAdapter: KaspiAdapter,
    @InjectRepository(MarketplaceAccount)
    private readonly marketplaceAccountRepository: Repository<MarketplaceAccount>
  ) {}

  @Cron(process.env.PRICEFEED_PUBLISH_INTERVAL_CRON || '*/15 * * * *')
  async handleScheduledPublish() {
    try {
      this.logger.log('Starting scheduled price feed publish...');
      
      // Получаем всех активных мерчантов с Kaspi аккаунтами
      const kaspiAccounts = await this.marketplaceAccountRepository.find({
        where: {
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE
        },
        relations: ['merchant']
      });

      if (kaspiAccounts.length === 0) {
        this.logger.debug('No active Kaspi accounts found for scheduled publish');
        return;
      }

      // Публикуем фиды для каждого мерчанта
      for (const account of kaspiAccounts) {
        try {
          this.logger.debug(`Publishing price feed for merchant ${account.merchantId}...`);
          await this.kaspiAdapter.refreshPriceFeed(account.merchantId);
          this.logger.debug(`Price feed published successfully for merchant ${account.merchantId}`);
        } catch (error) {
          this.logger.error(`Failed to publish price feed for merchant ${account.merchantId}:`, error);
          // Продолжаем с другими мерчантами
        }
      }

      this.logger.log(`Scheduled price feed publish completed for ${kaspiAccounts.length} merchants`);
    } catch (error) {
      this.logger.error('Scheduled price feed publish failed:', error);
    }
  }
}
