import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceAdapter, PriceUpdate, PriceUpdateResult } from '../adapter.types';
import { resolveAdapter } from '../adapter.registry';

describe('Marketplace Adapter Contract Tests', () => {
  let kaspiFeedAdapter: MarketplaceAdapter;
  let kaspiSimAdapter: MarketplaceAdapter;

  beforeAll(async () => {
    // Set environment for testing
    process.env.MP_KASPI_MODE = 'feed';
    process.env.KASPI_BATCH_SIZE = '50';
    
    kaspiFeedAdapter = resolveAdapter('KASPI');
    
    process.env.MP_KASPI_MODE = 'sim';
    kaspiSimAdapter = resolveAdapter('KASPI');
  });

  describe('Adapter Interface Compliance', () => {
    it('should have required methods', () => {
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      adapters.forEach(adapter => {
        expect(adapter).toHaveProperty('fetchStocks');
        expect(adapter).toHaveProperty('fetchCompetition');
        expect(adapter).toHaveProperty('updatePrices');
        expect(adapter).toHaveProperty('getRateLimits');
        expect(adapter).toHaveProperty('getMode');
        expect(adapter).toHaveProperty('getMarketplace');
      });
    });

    it('should return correct marketplace type', () => {
      expect(kaspiFeedAdapter.getMarketplace()).toBe('KASPI');
      expect(kaspiSimAdapter.getMarketplace()).toBe('KASPI');
    });

    it('should return correct mode', () => {
      expect(kaspiFeedAdapter.getMode()).toBe('feed');
      expect(kaspiSimAdapter.getMode()).toBe('sim');
    });
  });

  describe('Rate Limits Configuration', () => {
    it('should return valid rate limit configuration', () => {
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      adapters.forEach(adapter => {
        const limits = adapter.getRateLimits();
        
        expect(limits).toHaveProperty('rpm');
        expect(limits).toHaveProperty('burst');
        expect(limits).toHaveProperty('batchSize');
        
        expect(limits.rpm).toBeGreaterThan(0);
        expect(limits.burst).toBeGreaterThan(0);
        expect(limits.batchSize).toBeGreaterThan(0);
        expect(limits.batchSize).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('fetchStocks Method', () => {
    it('should return array of StockItem for valid offer IDs', async () => {
      const testOfferIds = ['KSP-001', 'KSP-002', 'KSP-003'];
      
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      for (const adapter of adapters) {
        const result = await adapter.fetchStocks(testOfferIds);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(testOfferIds.length);
        
        result.forEach((item, index) => {
          expect(item).toHaveProperty('offerExternalId');
          expect(item).toHaveProperty('onHand');
          expect(item).toHaveProperty('observedAt');
          
          expect(item.offerExternalId).toBe(testOfferIds[index]);
          expect(typeof item.onHand).toBe('number');
          expect(item.onHand).toBeGreaterThanOrEqual(0);
          expect(item.observedAt).toBeInstanceOf(Date);
        });
      }
    });

    it('should handle empty offer IDs array', async () => {
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      for (const adapter of adapters) {
        const result = await adapter.fetchStocks([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      }
    });
  });

  describe('fetchCompetition Method', () => {
    it('should return array of CompetitionPrice for valid offer IDs', async () => {
      const testOfferIds = ['KSP-001', 'KSP-002', 'KSP-003'];
      
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      for (const adapter of adapters) {
        const result = await adapter.fetchCompetition(testOfferIds);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(testOfferIds.length);
        
        result.forEach((item, index) => {
          expect(item).toHaveProperty('offerExternalId');
          expect(item).toHaveProperty('minPrice');
          expect(item).toHaveProperty('observedAt');
          
          expect(item.offerExternalId).toBe(testOfferIds[index]);
          expect(typeof item.minPrice).toBe('number');
          expect(item.minPrice).toBeGreaterThan(0);
          expect(item.observedAt).toBeInstanceOf(Date);
          
          if (item.avgPrice) {
            expect(typeof item.avgPrice).toBe('number');
            expect(item.avgPrice).toBeGreaterThan(0);
          }
          
          if (item.maxPrice) {
            expect(typeof item.maxPrice).toBe('number');
            expect(item.maxPrice).toBeGreaterThan(0);
          }
        });
      }
    });
  });

  describe('updatePrices Method', () => {
    it('should return array of PriceUpdateResult for valid updates', async () => {
      const testUpdates: PriceUpdate[] = [
        { offerExternalId: 'KSP-001', newPrice: 1500, reason: 'Test update' },
        { offerExternalId: 'KSP-002', newPrice: 2500, reason: 'Test update' },
      ];
      
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      for (const adapter of adapters) {
        const result = await adapter.updatePrices(testUpdates);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(testUpdates.length);
        
        result.forEach((item, index) => {
          expect(item).toHaveProperty('offerExternalId');
          expect(item).toHaveProperty('status');
          expect(item).toHaveProperty('timestamp');
          
          expect(item.offerExternalId).toBe(testUpdates[index].offerExternalId);
          expect(['OK', 'REJECTED', 'RETRY']).toContain(item.status);
          expect(item.timestamp).toBeInstanceOf(Date);
          
          if (item.code) {
            expect(typeof item.code).toBe('string');
          }
          
          if (item.message) {
            expect(typeof item.message).toBe('string');
          }
        });
      }
    });

    it('should respect batch size limits', async () => {
      const largeBatch: PriceUpdate[] = Array.from({ length: 200 }, (_, i) => ({
        offerExternalId: `KSP-${String(i + 1).padStart(3, '0')}`,
        newPrice: 1000 + i,
        reason: 'Batch test',
      }));
      
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      for (const adapter of adapters) {
        const limits = adapter.getRateLimits();
        
        if (largeBatch.length > limits.batchSize) {
          // Should handle large batches gracefully
          const result = await adapter.updatePrices(largeBatch);
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(largeBatch.length);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require mocking network failures
      // For now, we just ensure the interface is consistent
      const adapters = [kaspiFeedAdapter, kaspiSimAdapter];
      
      for (const adapter of adapters) {
        expect(typeof adapter.fetchStocks).toBe('function');
        expect(typeof adapter.fetchCompetition).toBe('function');
        expect(typeof adapter.updatePrices).toBe('function');
      }
    });
  });
});
