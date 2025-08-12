import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../src/entities/product.entity';
import { Offer } from '../src/entities/offer.entity';
import { Costs } from '../src/entities/costs.entity';
import { Fees } from '../src/entities/fees.entity';
import { CompetitorSnapshot } from '../src/entities/competitor-snapshot.entity';
import { StockSnapshot } from '../src/entities/stock-snapshot.entity';
import { PriceHistory } from '../src/entities/price-history.entity';
import { Merchant } from '../src/entities/merchant.entity';
import { MarketplaceAccount, MarketplaceType, MarketplaceStatus } from '../src/entities/marketplace-account.entity';
import { PricePolicy, PricingMode } from '../src/entities/price-policy.entity';
import { SalesDaily } from '../src/entities/sales-daily.entity';
import { ListingDraft } from '../src/entities/listing-draft.entity';
import { ABTest } from '../src/entities/ab-test.entity';

async function seedDemoData() {
  // Защита от случайного запуска в продакшене
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run demo seeder in production');
  }

  console.log('🌱 Starting demo data seeding...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    console.log('✅ NestJS application context created successfully');
    
    // Get repositories
    const merchantRepo = app.get<Repository<Merchant>>(getRepositoryToken(Merchant));
    const accountRepo = app.get<Repository<MarketplaceAccount>>(getRepositoryToken(MarketplaceAccount));
    const productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
    const offerRepo = app.get<Repository<Offer>>(getRepositoryToken(Offer));
    const costsRepo = app.get<Repository<Costs>>(getRepositoryToken(Costs));
    const feesRepo = app.get<Repository<Fees>>(getRepositoryToken(Fees));
    const competitorRepo = app.get<Repository<CompetitorSnapshot>>(getRepositoryToken(CompetitorSnapshot));
    const stockRepo = app.get<Repository<StockSnapshot>>(getRepositoryToken(StockSnapshot));
    const priceRepo = app.get<Repository<PriceHistory>>(getRepositoryToken(PriceHistory));
    const policyRepo = app.get<Repository<PricePolicy>>(getRepositoryToken(PricePolicy));
    const salesRepo = app.get<Repository<SalesDaily>>(getRepositoryToken(SalesDaily));
    const listingRepo = app.get<Repository<ListingDraft>>(getRepositoryToken(ListingDraft));
    const abTestRepo = app.get<Repository<ABTest>>(getRepositoryToken(ABTest));

    console.log('✅ All repositories retrieved successfully');

    // Clear existing data (с отключением проверки внешних ключей)
    const queryRunner = merchantRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Отключаем проверку внешних ключей
      await queryRunner.query('SET session_replication_role = replica;');
      
      // Очищаем все таблицы
      await queryRunner.query('TRUNCATE TABLE price_history CASCADE;');
      await queryRunner.query('TRUNCATE TABLE stock_snapshots CASCADE;');
      await queryRunner.query('TRUNCATE TABLE competitor_snapshots CASCADE;');
      await queryRunner.query('TRUNCATE TABLE sales_daily CASCADE;');
      await queryRunner.query('TRUNCATE TABLE listing_drafts CASCADE;');
      await queryRunner.query('TRUNCATE TABLE ab_tests CASCADE;');
      await queryRunner.query('TRUNCATE TABLE price_policies CASCADE;');
      await queryRunner.query('TRUNCATE TABLE fees CASCADE;');
      await queryRunner.query('TRUNCATE TABLE costs CASCADE;');
      await queryRunner.query('TRUNCATE TABLE offers CASCADE;');
      await queryRunner.query('TRUNCATE TABLE products CASCADE;');
      await queryRunner.query('TRUNCATE TABLE marketplace_accounts CASCADE;');
      await queryRunner.query('TRUNCATE TABLE merchants CASCADE;');
      
      // Включаем обратно проверку внешних ключей
      await queryRunner.query('SET session_replication_role = DEFAULT;');
      
      await queryRunner.commitTransaction();
      console.log('🧹 Cleared existing data');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Создаём Merchant и MarketplaceAccount
    const merchant = await merchantRepo.save({
      name: 'Demo Merchant',
      timezone: 'Asia/Almaty',
      currency: 'KZT',
      description: 'Demo merchant for testing',
      settings: {
        minMarginPct: 15.0,
        maxPriceDeltaPctDay: 5.0,
        reorderThreshold: 10,
        liquidationThreshold: 5,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      },
      isActive: true
    });

    const account = await accountRepo.save({
      merchantId: merchant.id,
      type: MarketplaceType.KASPI,
      name: 'Kaspi Demo Account',
      credentials: {
        apiKey: 'demo-key',
        sellerId: 'demo-seller'
      },
      status: MarketplaceStatus.ACTIVE,
      settings: {
        syncInterval: 15,
        priceUpdateEnabled: true,
        stockUpdateEnabled: true,
        orderSyncEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      },
      isActive: true
    });

    console.log('🏢 Created merchant and marketplace account');

    // Create 3 SKUs with different elasticity
    const products = await productRepo.save([
      {
        sku: 'SKU-HIGH-ELASTIC',
        title: 'High Elasticity Product',
        category: 'Electronics',
        brand: 'DemoBrand',
        basePrice: 1000,
        minPrice: 800,
        maxPrice: 1500,
        elasticity: -2.5, // High elasticity
        isActive: true,
        merchantId: merchant.id, // Используем реальный ID
        attributes: {},
      },
      {
        sku: 'SKU-LOW-ELASTIC',
        title: 'Low Elasticity Product',
        category: 'Luxury',
        brand: 'DemoBrand',
        basePrice: 5000,
        minPrice: 4500,
        maxPrice: 6000,
        elasticity: -0.8, // Low elasticity
        isActive: true,
        merchantId: merchant.id, // Используем реальный ID
        attributes: {},
      },
      {
        sku: 'SKU-MIXED-ELASTIC',
        title: 'Mixed Elasticity Product',
        category: 'Fashion',
        brand: 'DemoBrand',
        basePrice: 2000,
        minPrice: 1500,
        maxPrice: 3000,
        elasticity: -1.5, // Medium elasticity
        isActive: true,
        merchantId: merchant.id, // Используем реальный ID
        attributes: {},
      }
    ]);

    console.log('📦 Created 3 products');

    // Create offers for Kaspi
    const offers = await offerRepo.save([
      {
        productId: products[0].id,
        marketplaceAccountId: account.id, // Используем реальный ID
        externalId: 'kaspi-001',
        currentPrice: 1000,
        listingStatus: 'published' as any,
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        productId: products[1].id,
        marketplaceAccountId: account.id, // Используем реальный ID
        externalId: 'kaspi-002',
        currentPrice: 5000,
        listingStatus: 'published' as any,
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        productId: products[2].id,
        marketplaceAccountId: account.id, // Используем реальный ID
        externalId: 'kaspi-003',
        currentPrice: 2000,
        listingStatus: 'published' as any,
        isActive: true,
        lastUpdated: new Date(),
      }
    ]);

    console.log('🛒 Created 3 offers');

    // Create costs (используем правильные поля)
    const costs = await costsRepo.save([
      {
        productId: products[0].id,
        cogs: 600, // себестоимость
        packaging: 20, // упаковка
        inboundLogistics: 50, // входящая логистика
        customs: 0,
        qualityControl: 0,
        storage: 0,
        handling: 0,
        currency: 'KZT',
        lastUpdate: new Date(),
        breakdown: {
          materials: 550,
          labor: 50
        },
        metadata: {
          source: 'demo',
          supplier: 'Demo Supplier'
        }
      },
      {
        productId: products[1].id,
        cogs: 3000,
        packaging: 100,
        inboundLogistics: 200,
        customs: 0,
        qualityControl: 0,
        storage: 0,
        handling: 0,
        currency: 'KZT',
        lastUpdate: new Date(),
        breakdown: {
          materials: 2800,
          labor: 200
        },
        metadata: {
          source: 'demo',
          supplier: 'Demo Supplier'
        }
      },
      {
        productId: products[2].id,
        cogs: 1200,
        packaging: 40,
        inboundLogistics: 80,
        customs: 0,
        qualityControl: 0,
        storage: 0,
        handling: 0,
        currency: 'KZT',
        lastUpdate: new Date(),
        breakdown: {
          materials: 1100,
          labor: 100
        },
        metadata: {
          source: 'demo',
          supplier: 'Demo Supplier'
        }
      }
    ]);

    console.log('💰 Created costs');

    // Create fees (используем правильные поля)
    const fees = await feesRepo.save([
      {
        productId: products[0].id,
        marketplace: 'kaspi',
        category: 'Electronics',
        commissionRate: 5.0, // 5%
        paymentProcessingFee: 2.0, // 2%
        fixedFee: 0,
        storageFeePerUnitDay: 2, // 2 KZT за единицу в день
        deliveryFeeRules: { baseFee: 0 },
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true
      },
      {
        productId: products[1].id,
        marketplace: 'kaspi',
        category: 'Luxury',
        commissionRate: 5.0, // 5%
        paymentProcessingFee: 2.0, // 2%
        fixedFee: 0,
        storageFeePerUnitDay: 5, // 5 KZT за единицу в день
        deliveryFeeRules: { baseFee: 0 },
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true
      },
      {
        productId: products[2].id,
        marketplace: 'kaspi',
        category: 'Fashion',
        commissionRate: 5.0, // 5%
        paymentProcessingFee: 2.0, // 2%
        fixedFee: 0,
        storageFeePerUnitDay: 3, // 3 KZT за единицу в день
        deliveryFeeRules: { baseFee: 0 },
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true
      }
    ]);

    console.log('💳 Created fees');

    // Create PricePolicy для каждого продукта
    const policies = await policyRepo.save([
      {
        productId: products[0].id,
        mode: PricingMode.AUTO,
        minMarginPct: 15.0,
        maxPriceDeltaPctDay: 5.0,
        floorPrice: 800,
        ceilingPrice: 1500,
        cogs: 670, // totalCost из costs
        rules: {
          competitorOffset: -0.01, // на 1% дешевле конкурента
          stockBasedPricing: true,
          quietHours: {
            start: '22:00',
            end: '08:00',
            enabled: true
          }
        },
        isActive: true
      },
      {
        productId: products[1].id,
        mode: PricingMode.AUTO,
        minMarginPct: 20.0,
        maxPriceDeltaPctDay: 3.0,
        floorPrice: 4500,
        ceilingPrice: 6000,
        cogs: 3300,
        rules: {
          competitorOffset: 0.02, // на 2% дороже конкурента (люкс)
          stockBasedPricing: true,
          quietHours: {
            start: '22:00',
            end: '08:00',
            enabled: true
          }
        },
        isActive: true
      },
      {
        productId: products[2].id,
        mode: PricingMode.AUTO,
        minMarginPct: 18.0,
        maxPriceDeltaPctDay: 4.0,
        floorPrice: 1500,
        ceilingPrice: 3000,
        cogs: 1320,
        rules: {
          competitorOffset: 0.0, // по цене конкурента
          stockBasedPricing: true,
          quietHours: {
            start: '22:00',
            end: '08:00',
            enabled: true
          }
        },
        isActive: true
      }
    ]);

    console.log('⚙️ Created price policies');

    // Create competitor snapshots (используем правильные поля)
    const now = new Date();
    const competitorSnapshots = [];
    
    for (let day = 0; day < 2; day++) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timestamp = new Date(now);
          timestamp.setDate(timestamp.getDate() - day);
          timestamp.setHours(hour, minute, 0, 0);
          
          // High elasticity - more price variation
          competitorSnapshots.push({
            offerId: offers[0].id,
            productId: products[0].id,
            timestamp,
            ts: timestamp,
            isComplete: true, // используем правильное поле
            competitorsCount: 3,
            minCompetitorPrice: 950,
            maxCompetitorPrice: 1050,
            avgCompetitorPrice: 1000,
            ourPosition: 2,
            competitorDetails: {
              'comp1': { price: 950, rating: 4.5, reviewsCount: 120 },
              'comp2': { price: 1000, rating: 4.3, reviewsCount: 89 },
              'comp3': { price: 1050, rating: 4.7, reviewsCount: 156 }
            }
          });
          
          // Low elasticity - less price variation
          competitorSnapshots.push({
            offerId: offers[1].id,
            productId: products[1].id,
            timestamp,
            ts: timestamp,
            isComplete: true,
            competitorsCount: 2,
            minCompetitorPrice: 4800,
            maxCompetitorPrice: 5000,
            avgCompetitorPrice: 4900,
            ourPosition: 1,
            competitorDetails: {
              'comp1': { price: 4800, rating: 4.8, reviewsCount: 45 },
              'comp2': { price: 5000, rating: 4.6, reviewsCount: 67 }
            }
          });
          
          // Mixed elasticity
          competitorSnapshots.push({
            offerId: offers[2].id,
            productId: products[2].id,
            timestamp,
            ts: timestamp,
            isComplete: true,
            competitorsCount: 4,
            minCompetitorPrice: 1800,
            maxCompetitorPrice: 2200,
            avgCompetitorPrice: 2000,
            ourPosition: 3,
            competitorDetails: {
              'comp1': { price: 1800, rating: 4.2, reviewsCount: 78 },
              'comp2': { price: 1900, rating: 4.4, reviewsCount: 92 },
              'comp3': { price: 2100, rating: 4.1, reviewsCount: 65 },
              'comp4': { price: 2200, rating: 4.6, reviewsCount: 103 }
            }
          });
        }
      }
    }

    await competitorRepo.save(competitorSnapshots);
    console.log('📊 Created competitor snapshots');

    // Create stock snapshots (используем правильные поля)
    const stockSnapshots = [];
    for (let day = 0; day < 2; day++) {
      for (let hour = 0; hour < 24; hour += 2) { // Every 2 hours
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        stockSnapshots.push(
          {
            offerId: offers[0].id,
            productId: products[0].id,
            timestamp,
            ts: timestamp,
            isComplete: true, // используем правильное поле
            quantity: 50 - Math.floor(Math.random() * 10), // 40-50
            onHand: 50 - Math.floor(Math.random() * 10),
            reserved: 0,
            inTransit: 0,
            damaged: 0,
            city: { 'Almaty': 30, 'Astana': 20 }, // cityBreakdown
          },
          {
            offerId: offers[1].id,
            productId: products[1].id,
            timestamp,
            ts: timestamp,
            isComplete: true,
            quantity: 20 - Math.floor(Math.random() * 5), // 15-20
            onHand: 20 - Math.floor(Math.random() * 5),
            reserved: 0,
            inTransit: 0,
            damaged: 0,
            city: { 'Almaty': 15, 'Astana': 5 },
          },
          {
            offerId: offers[2].id,
            productId: products[2].id,
            timestamp,
            ts: timestamp,
            isComplete: true,
            quantity: 35 - Math.floor(Math.random() * 8), // 27-35
            onHand: 35 - Math.floor(Math.random() * 8),
            reserved: 0,
            inTransit: 0,
            damaged: 0,
            city: { 'Almaty': 25, 'Astana': 10 },
          }
        );
      }
    }

    await stockRepo.save(stockSnapshots);
    console.log('📦 Created stock snapshots');

    // Create price history (на уровне offer, используем правильные поля)
    const priceHistory = [];
    for (let day = 0; day < 2; day++) {
      for (let hour = 0; hour < 24; hour += 1) { // Every hour
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        priceHistory.push(
          {
            productId: products[0].id,
            price: 1000 + (Math.random() - 0.5) * 100, // 950-1050
            timestamp,
            marketplace: 'kaspi',
            metadata: {
              source: 'demo',
              reason: 'competitor_analysis'
            }
          },
          {
            productId: products[1].id,
            price: 5000 + (Math.random() - 0.5) * 200, // 4900-5100
            timestamp,
            marketplace: 'kaspi',
            metadata: {
              source: 'demo',
              reason: 'competitor_analysis'
            }
          },
          {
            productId: products[2].id,
            price: 2000 + (Math.random() - 0.5) * 300, // 1850-2150
            timestamp,
            marketplace: 'kaspi',
            metadata: {
              source: 'demo',
              reason: 'competitor_analysis'
            }
          }
        );
      }
    }

    await priceRepo.save(priceHistory);
    console.log('📈 Created price history');

    console.log('✅ Demo data seeding completed successfully!');
    console.log(`📊 Created: ${products.length} products, ${offers.length} offers, ${costs.length} costs, ${fees.length} fees`);
    console.log(`⚙️ Created: ${policies.length} price policies`);
    console.log(`📈 Created: ${competitorSnapshots.length} competitor snapshots, ${stockSnapshots.length} stock snapshots, ${priceHistory.length} price records`);

    await app.close();

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to seed demo data:', error);
      process.exit(1);
    });
}

export { seedDemoData };
