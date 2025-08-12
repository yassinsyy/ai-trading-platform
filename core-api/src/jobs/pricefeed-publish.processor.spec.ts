import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceFeedPublishProcessor } from './pricefeed-publish.processor';
import { KaspiAdapter } from '../marketplaces/adapters/kaspi.adapter';
import { MarketplaceAccount } from '../entities/marketplace-account.entity';
import { MarketplaceType, MarketplaceStatus } from '../entities';

describe('PriceFeedPublishProcessor', () => {
  let processor: PriceFeedPublishProcessor;
  let mockKaspiAdapter: any;
  let mockMarketplaceAccountRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceFeedPublishProcessor,
        {
          provide: KaspiAdapter,
          useValue: {
            refreshPriceFeed: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketplaceAccount),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<PriceFeedPublishProcessor>(PriceFeedPublishProcessor);
    mockKaspiAdapter = module.get(KaspiAdapter);
    mockMarketplaceAccountRepository = module.get(getRepositoryToken(MarketplaceAccount));
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleScheduledPublish', () => {
    it('should publish price feeds for all active Kaspi accounts', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          merchantId: 'merchant-1',
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
          merchant: { id: 'merchant-1', name: 'Test Merchant 1' }
        },
        {
          id: 'account-2',
          merchantId: 'merchant-2',
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
          merchant: { id: 'merchant-2', name: 'Test Merchant 2' }
        }
      ];

      mockMarketplaceAccountRepository.find.mockResolvedValue(mockAccounts);
      mockKaspiAdapter.refreshPriceFeed.mockResolvedValue({ url: 'test', rev: '1' });

      await processor.handleScheduledPublish();

      expect(mockMarketplaceAccountRepository.find).toHaveBeenCalledWith({
        where: {
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE
        },
        relations: ['merchant']
      });

      expect(mockKaspiAdapter.refreshPriceFeed).toHaveBeenCalledWith('merchant-1');
      expect(mockKaspiAdapter.refreshPriceFeed).toHaveBeenCalledWith('merchant-2');
    });

    it('should handle empty accounts gracefully', async () => {
      mockMarketplaceAccountRepository.find.mockResolvedValue([]);

      await processor.handleScheduledPublish();

      expect(mockMarketplaceAccountRepository.find).toHaveBeenCalled();
      expect(mockKaspiAdapter.refreshPriceFeed).not.toHaveBeenCalled();
    });

    it('should continue processing if one merchant fails', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          merchantId: 'merchant-1',
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
          merchant: { id: 'merchant-1', name: 'Test Merchant 1' }
        },
        {
          id: 'account-2',
          merchantId: 'merchant-2',
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
          merchant: { id: 'merchant-2', name: 'Test Merchant 2' }
        }
      ];

      mockMarketplaceAccountRepository.find.mockResolvedValue(mockAccounts);
      mockKaspiAdapter.refreshPriceFeed
        .mockRejectedValueOnce(new Error('First merchant failed'))
        .mockResolvedValueOnce({ url: 'test', rev: '1' });

      await processor.handleScheduledPublish();

      expect(mockKaspiAdapter.refreshPriceFeed).toHaveBeenCalledTimes(2);
    });
  });
});
