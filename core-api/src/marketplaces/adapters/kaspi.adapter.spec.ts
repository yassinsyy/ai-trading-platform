import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KaspiAdapter } from './kaspi.adapter';
import { Offer } from '../../entities/offer.entity';
import { Product } from '../../entities/product.entity';
import { MarketplaceAccount } from '../../entities/marketplace-account.entity';
import { PricePolicy } from '../../entities/price-policy.entity';
import { StockSnapshot } from '../../entities/stock-snapshot.entity';
import { MarketplaceType, MarketplaceStatus, ListingStatus } from '../../entities';
import { PriceFeedService } from '../../pricefeed/pricefeed.service';
import { PriceFeedPublisher } from '../../pricefeed/pricefeed.publisher';

describe('KaspiAdapter', () => {
  let adapter: KaspiAdapter;
  let mockOfferRepository: any;
  let mockProductRepository: any;
  let mockMarketplaceAccountRepository: any;
  let mockPricePolicyRepository: any;
  let mockStockSnapshotRepository: any;
  let mockPriceFeedService: any;
  let mockPriceFeedPublisher: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KaspiAdapter,
        {
          provide: getRepositoryToken(Offer),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            })),
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketplaceAccount),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PricePolicy),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StockSnapshot),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: PriceFeedService,
          useValue: {
            buildXml: jest.fn().mockResolvedValue('<xml>test</xml>'),
            validateItems: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
            createMetadata: jest.fn(),
          },
        },
        {
          provide: PriceFeedPublisher,
          useValue: {
            publish: jest.fn().mockResolvedValue({ url: 'https://mock', revision: '1' }),
          },
        },
      ],
    }).compile();

    adapter = module.get<KaspiAdapter>(KaspiAdapter);
    mockOfferRepository = module.get(getRepositoryToken(Offer));
    mockProductRepository = module.get(getRepositoryToken(Product));
    mockMarketplaceAccountRepository = module.get(getRepositoryToken(MarketplaceAccount));
    mockPricePolicyRepository = module.get(getRepositoryToken(PricePolicy));
    mockStockSnapshotRepository = module.get(getRepositoryToken(StockSnapshot));
    mockPriceFeedService = module.get(PriceFeedService);
    mockPriceFeedPublisher = module.get(PriceFeedPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('refreshPriceFeed', () => {
    it('should refresh price feed successfully for valid merchant', async () => {
      const merchantId = 'merchant-123';
      
      // Mock marketplace accounts
      mockMarketplaceAccountRepository.find.mockResolvedValue([
        {
          id: 'account-1',
          merchantId,
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
        },
      ]);

      // Mock offers with createQueryBuilder
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'offer-1',
            externalId: 'SKU-001',
            currentPrice: 999.99,
            listingStatus: ListingStatus.PUBLISHED,
            product: {
              sku: 'PROD-001',
              brand: 'Test Brand',
              category: 'Electronics',
              attributes: {
                model: 'Test Model',
                weight: 1.5,
                dimensions: { length: 10, width: 5, height: 2 }
              },
              pricePolicies: [
                {
                  id: 'policy-1',
                  isActive: true,
                  floorPrice: 899.99
                }
              ]
            },
            stockSnapshots: [
              {
                id: 'stock-1',
                onHand: 50,
                createdAt: new Date()
              }
            ]
          },
        ]),
      };
      mockOfferRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock PriceFeedService
      mockPriceFeedService.validateItems.mockReturnValue({ isValid: true, errors: [] });
      mockPriceFeedService.buildXml.mockResolvedValue('<xml>test</xml>');

      // Mock PriceFeedPublisher
      mockPriceFeedPublisher.publish.mockResolvedValue({
        url: 'https://example.com/feed.xml',
        revision: 'abc123',
        key: 'feeds/kaspi/merchant-123/pricefeed-abc123.xml'
      });

      const result = await adapter.refreshPriceFeed(merchantId);

      expect(result).toEqual({
        url: 'https://example.com/feed.xml',
        rev: 'abc123',
      });

      expect(mockMarketplaceAccountRepository.find).toHaveBeenCalledWith({
        where: {
          merchantId,
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
        },
      });

      expect(mockOfferRepository.createQueryBuilder).toHaveBeenCalledWith('offer');
      expect(mockPriceFeedService.validateItems).toHaveBeenCalled();
      expect(mockPriceFeedService.buildXml).toHaveBeenCalledWith(merchantId, expect.any(Array));
      expect(mockPriceFeedPublisher.publish).toHaveBeenCalledWith('<xml>test</xml>', merchantId);
    });

    it('should throw error when no active Kaspi accounts found', async () => {
      const merchantId = 'merchant-123';
      
      mockMarketplaceAccountRepository.find.mockResolvedValue([]);

      await expect(adapter.refreshPriceFeed(merchantId)).rejects.toThrow(
        'No active Kaspi accounts found for merchant'
      );
    });

    it('should throw error when no active offers found', async () => {
      const merchantId = 'merchant-123';
      
      mockMarketplaceAccountRepository.find.mockResolvedValue([
        {
          id: 'account-1',
          merchantId,
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
        },
      ]);

      // Mock createQueryBuilder to return empty array
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockOfferRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(adapter.refreshPriceFeed(merchantId)).rejects.toThrow(
        'No active offers found for merchant'
      );
    });

    it('should throw error when feed validation fails', async () => {
      const merchantId = 'merchant-123';
      
      // Mock marketplace accounts
      mockMarketplaceAccountRepository.find.mockResolvedValue([
        {
          id: 'account-1',
          merchantId,
          type: MarketplaceType.KASPI,
          status: MarketplaceStatus.ACTIVE,
        },
      ]);

      // Mock offers with createQueryBuilder
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'offer-1',
            externalId: 'SKU-001',
            currentPrice: 0, // Invalid price
            listingStatus: ListingStatus.PUBLISHED,
            product: {
              sku: '', // Missing SKU
              brand: 'Test Brand',
              category: 'Electronics',
              attributes: {},
              pricePolicies: []
            },
            stockSnapshots: []
          },
        ]),
      };
      mockOfferRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock validation to fail
      mockPriceFeedService.validateItems.mockReturnValue({
        isValid: false,
        errors: ['Invalid price', 'Missing SKU']
      });

      await expect(adapter.refreshPriceFeed(merchantId)).rejects.toThrow(
        'Feed validation failed: Invalid price, Missing SKU'
      );
    });
  });

  describe('name', () => {
    it('should return kaspi', () => {
      expect(adapter.name()).toBe('kaspi');
    });
  });
});
