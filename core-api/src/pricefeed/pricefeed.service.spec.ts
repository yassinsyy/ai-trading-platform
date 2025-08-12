import { Test, TestingModule } from '@nestjs/testing';
import { PriceFeedService } from './pricefeed.service';
import { PriceFeedItem } from './kaspi-city.types';

describe('PriceFeedService', () => {
  let service: PriceFeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceFeedService],
    }).compile();

    service = module.get<PriceFeedService>(PriceFeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildXml', () => {
    it('should generate valid XML for basic items', async () => {
      const items: PriceFeedItem[] = [
        {
          sku: 'TEST-SKU-001',
          model: 'Test Product 1',
          brand: 'Test Brand',
          quantity: 10,
          price: 999.99,
          category: 'Electronics'
        },
        {
          sku: 'TEST-SKU-002',
          model: 'Test Product 2',
          brand: 'Test Brand',
          quantity: 5,
          price: 1499.99,
          category: 'Electronics'
        }
      ];

      const xml = await service.buildXml('merchant-123', items);

      expect(xml).toContain('<pricefeed');
      expect(xml).toContain('generatedAt=');
      expect(xml).toContain('<merchant id="merchant-123"');
      expect(xml).toContain('<sku>TEST-SKU-001</sku>');
      expect(xml).toContain('<sku>TEST-SKU-002</sku>');
      expect(xml).toContain('<price>999.99</price>');
      expect(xml).toContain('<price>1499.99</price>');
      expect(xml).toContain('<quantity>10</quantity>');
      expect(xml).toContain('<quantity>5</quantity>');
    });

    it('should generate deterministic XML structure for same input', async () => {
      const items: PriceFeedItem[] = [
        { sku: 'ABC', quantity: 10, price: 999.9 },
        { sku: 'DEF', quantity: 0, price: 0 }
      ];

      const xml1 = await service.buildXml('m1', items);
      const xml2 = await service.buildXml('m1', items);

      // Проверяем структуру, а не точное совпадение (timestamp меняется)
      expect(xml1).toContain('<sku>ABC</sku>');
      expect(xml1).toContain('<sku>DEF</sku>');
      expect(xml1).toContain('<price>999.9</price>');
      expect(xml1).toContain('<price>0</price>');
      expect(xml1).toContain('<quantity>10</quantity>');
      expect(xml1).toContain('<quantity>0</quantity>');
      
      // Проверяем что структура одинаковая
      const structure1 = xml1.replace(/generatedAt="[^"]*"/g, 'generatedAt="TIMESTAMP"');
      const structure2 = xml2.replace(/generatedAt="[^"]*"/g, 'generatedAt="TIMESTAMP"');
      expect(structure1).toEqual(structure2);
    });

    it('should include city prices when provided', async () => {
      const items: PriceFeedItem[] = [
        {
          sku: 'CITY-SKU-001',
          quantity: 10,
          price: 1000,
          cityPrices: [
            { cityId: 'city1', cityName: 'City 1', price: 950 },
            { cityId: 'city2', cityName: 'City 2', price: 1050 }
          ]
        }
      ];

      const xml = await service.buildXml('merchant-123', items);

      expect(xml).toContain('<prices>');
      expect(xml).toContain('<price cityId="city1">950</price>');
      expect(xml).toContain('<price cityId="city2">1050</price>');
    });

    it('should handle items with dimensions and weight', async () => {
      const items: PriceFeedItem[] = [
        {
          sku: 'DIM-SKU-001',
          quantity: 1,
          price: 500,
          weight: 2.5,
          dimensions: {
            length: 10,
            width: 5,
            height: 3
          }
        }
      ];

      const xml = await service.buildXml('merchant-123', items);

      expect(xml).toContain('<weight>2.5</weight>');
      expect(xml).toContain('<length>10</length>');
      expect(xml).toContain('<width>5</width>');
      expect(xml).toContain('<height>3</height>');
    });

    it('should skip undefined values', async () => {
      const items: PriceFeedItem[] = [
        {
          sku: 'MINIMAL-SKU',
          quantity: 1,
          price: 100
          // model, brand, category are undefined
        }
      ];

      const xml = await service.buildXml('merchant-123', items);

      expect(xml).toContain('<sku>MINIMAL-SKU</sku>');
      expect(xml).toContain('<quantity>1</quantity>');
      expect(xml).toContain('<price>100</price>');
      expect(xml).not.toContain('<model>');
      expect(xml).not.toContain('<brand>');
      expect(xml).not.toContain('<category>');
    });
  });

  describe('validateItems', () => {
    it('should validate valid items', () => {
      const items: PriceFeedItem[] = [
        { sku: 'VALID-1', quantity: 10, price: 100 },
        { sku: 'VALID-2', quantity: 0, price: 0 }
      ];

      const result = service.validateItems(items);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty items array', () => {
      const result = service.validateItems([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Items array is empty');
    });

    it('should reject items with missing SKU', () => {
      const items: PriceFeedItem[] = [
        { sku: '', quantity: 10, price: 100 },
        { sku: 'VALID', quantity: 5, price: 50 }
      ];

      const result = service.validateItems(items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item 0: SKU is required');
    });

    it('should reject items with negative quantity', () => {
      const items: PriceFeedItem[] = [
        { sku: 'TEST', quantity: -1, price: 100 }
      ];

      const result = service.validateItems(items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item 0: Quantity must be a non-negative number');
    });

    it('should reject items with negative price', () => {
      const items: PriceFeedItem[] = [
        { sku: 'TEST', quantity: 10, price: -50 }
      ];

      const result = service.validateItems(items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item 0: Price must be a non-negative number');
    });

    it('should validate city prices', () => {
      const items: PriceFeedItem[] = [
        {
          sku: 'TEST',
          quantity: 10,
          price: 100,
          cityPrices: [
            { cityId: '', cityName: 'City', price: 90 }, // Invalid: empty cityId
            { cityId: 'city2', cityName: 'City 2', price: -10 } // Invalid: negative price
          ]
        }
      ];

      const result = service.validateItems(items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item 0, city price 0: City ID is required');
      expect(result.errors).toContain('Item 0, city price 1: City price must be a non-negative number');
    });
  });

  describe('createMetadata', () => {
    it('should create correct metadata', () => {
      const items: PriceFeedItem[] = [
        { sku: 'SKU1', quantity: 10, price: 100 },
        { sku: 'SKU2', quantity: 5, price: 200 },
        {
          sku: 'SKU3',
          quantity: 2,
          price: 150,
          cityPrices: [
            { cityId: 'city1', cityName: 'City 1', price: 140 },
            { cityId: 'city2', cityName: 'City 2', price: 160 }
          ]
        }
      ];

      const metadata = service.createMetadata('merchant-123', items, 'rev-abc');

      expect(metadata.merchantId).toBe('merchant-123');
      expect(metadata.revision).toBe('rev-abc');
      expect(metadata.itemCount).toBe(3);
      expect(metadata.totalValue).toBe(10 * 100 + 5 * 200 + 2 * 150);
      expect(metadata.cities).toEqual(['city1', 'city2']);
      expect(metadata.generatedAt).toBeInstanceOf(Date);
    });

    it('should handle items without city prices', () => {
      const items: PriceFeedItem[] = [
        { sku: 'SKU1', quantity: 1, price: 100 }
      ];

      const metadata = service.createMetadata('merchant-123', items, 'rev-xyz');

      expect(metadata.cities).toEqual([]);
      expect(metadata.totalValue).toBe(100);
    });
  });
});
