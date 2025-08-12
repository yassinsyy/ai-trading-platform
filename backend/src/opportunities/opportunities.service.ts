import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { Product } from '../entities/product.entity';
import { Offer } from '../entities/offer.entity';
import { SalesDaily } from '../entities/sales-daily.entity';
import { CompetitorSnapshot } from '../entities/competitor-snapshot.entity';
import { Costs } from '../entities/costs.entity';
import { SupplierSKU } from '../entities/supplier-sku.entity';
import { Fees } from '../entities/fees.entity';

export interface Opportunity {
  productId: string;
  product: Product;
  recommendedQty: number;
  expectedProfit: number;
  risk: number;
  rationale: string;
  score: number;
  supplierInfo: {
    supplierId: string;
    supplierName: string;
    price: number;
    moq: number;
    leadDays: number;
    hasCert: boolean;
  };
}

export interface OpportunityFilters {
  merchantId: string;
  minMargin?: number;
  maxCompetitors?: number;
  categories?: string[];
  suppliers?: string[];
  minScore?: number;
}

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(SalesDaily)
    private readonly salesDailyRepository: Repository<SalesDaily>,
    @InjectRepository(CompetitorSnapshot)
    private readonly competitorSnapshotRepository: Repository<CompetitorSnapshot>,
    @InjectRepository(Costs)
    private readonly costsRepository: Repository<Costs>,
    @InjectRepository(SupplierSKU)
    private readonly supplierSkuRepository: Repository<SupplierSKU>,
    @InjectRepository(Fees)
    private readonly feesRepository: Repository<Fees>,
    @InjectQueue('opportunities')
    private readonly opportunitiesQueue: Queue,
  ) {}

  async findOpportunities(filters: OpportunityFilters): Promise<Opportunity[]> {
    this.logger.log(`Finding opportunities for merchant: ${filters.merchantId}`);

    try {
      // 1. Предфильтр продуктов по базовым критериям
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.costs', 'costs')
        .leftJoinAndSelect('product.supplierSkus', 'supplierSkus')
        .leftJoinAndSelect('supplierSkus.supplier', 'supplier')
        .where('product.merchantId = :merchantId', { merchantId: filters.merchantId })
        .andWhere('product.isActive = true')
        .andWhere('supplierSkus.hasCert = :hasCert', { hasCert: true })
        .getMany();

      const opportunities: Opportunity[] = [];

      for (const product of products) {
        // 2. Анализ каждого продукта
        const opportunity = await this.analyzeProduct(product, filters);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }

      // 3. Сортировка по скору
      opportunities.sort((a, b) => b.score - a.score);

      // 4. Возврат топ-N возможностей
      return opportunities.slice(0, 50);

    } catch (error) {
      this.logger.error('Error finding opportunities', error);
      throw error;
    }
  }

  private async analyzeProduct(
    product: Product,
    filters: OpportunityFilters,
  ): Promise<Opportunity | null> {
    try {
      // Получаем последние данные о продажах
      const salesData = await this.getSalesData(product.id);
      if (!salesData || salesData.avgDailySales === 0) {
        return null;
      }

      // Получаем данные о конкурентах
      const competitorData = await this.getCompetitorData(product.id);
      if (competitorData.competitorsCount > (filters.maxCompetitors || 10)) {
        return null;
      }

      // Получаем данные о поставщиках
      const supplierData = await this.getSupplierData(product.id);
      if (!supplierData) {
        return null;
      }

      // Получаем данные о комиссиях
      const fees = await this.getFees(product.category, product.offers?.[0]?.marketplaceAccount?.type);

      // Рассчитываем экономику для разных объемов
      const volumes = [50, 100, 200, 500, 1000];
      let bestOpportunity: Opportunity | null = null;
      let bestScore = -Infinity;

      for (const volume of volumes) {
        if (volume < supplierData.moq) continue;

        const economics = this.calculateEconomics({
          volume,
          avgDailySales: salesData.avgDailySales,
          supplierPrice: supplierData.price,
          fees,
          costs: product.costs?.[0],
        });

        if (economics.margin < (filters.minMargin || 15)) continue;

        const risk = this.calculateRisk({
          salesVolatility: salesData.volatility,
          competitorCount: competitorData.competitorsCount,
          stockCoverDays: economics.stockCoverDays,
        });

        const score = this.calculateScore(economics.profit, risk);

        if (score > bestScore) {
          bestScore = score;
          bestOpportunity = {
            productId: product.id,
            product,
            recommendedQty: volume,
            expectedProfit: economics.profit,
            risk,
            rationale: this.generateRationale(economics, risk, competitorData),
            score,
            supplierInfo: {
              supplierId: supplierData.supplierId,
              supplierName: supplierData.supplierName,
              price: supplierData.price,
              moq: supplierData.moq,
              leadDays: supplierData.leadDays,
              hasCert: supplierData.hasCert,
            },
          };
        }
      }

      return bestOpportunity;

    } catch (error) {
      this.logger.error(`Error analyzing product ${product.id}`, error);
      return null;
    }
  }

  private async getSalesData(productId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await this.salesDailyRepository
      .createQueryBuilder('sales')
      .leftJoin('sales.offer', 'offer')
      .where('offer.productId = :productId', { productId })
      .andWhere('sales.date >= :date', { date: thirtyDaysAgo })
      .getMany();

    if (sales.length === 0) return null;

    const dailySales = sales.map(s => s.units);
    const avgDailySales = dailySales.reduce((a, b) => a + b, 0) / dailySales.length;
    
    // Простой расчет волатильности
    const variance = dailySales.reduce((acc, val) => acc + Math.pow(val - avgDailySales, 2), 0) / dailySales.length;
    const volatility = Math.sqrt(variance);

    return { avgDailySales, volatility };
  }

  private async getCompetitorData(productId: string) {
    const latestSnapshot = await this.competitorSnapshotRepository
      .createQueryBuilder('snapshot')
      .leftJoin('snapshot.offer', 'offer')
      .where('offer.productId = :productId', { productId })
      .orderBy('snapshot.ts', 'DESC')
      .getOne();

    return latestSnapshot || { competitorsCount: 0, minCompetitorPrice: null };
  }

  private async getSupplierData(productId: string) {
    const supplierSku = await this.supplierSkuRepository
      .createQueryBuilder('sku')
      .leftJoinAndSelect('sku.supplier', 'supplier')
      .where('sku.productId = :productId', { productId })
      .andWhere('sku.isActive = true')
      .orderBy('sku.price', 'ASC')
      .getOne();

    if (!supplierSku) return null;

    return {
      supplierId: supplierSku.supplier.id,
      supplierName: supplierSku.supplier.name,
      price: supplierSku.price,
      moq: supplierSku.moq,
      leadDays: supplierSku.leadDays,
      hasCert: supplierSku.hasCert,
    };
  }

  private async getFees(category: string, marketplace?: string) {
    const fees = await this.feesRepository.findOne({
      where: {
        category,
        marketplace: marketplace || 'kaspi',
        isActive: true,
      },
    });

    return fees || { feePct: 15, storageFeePerUnitDay: 0.1 };
  }

  private calculateEconomics(params: {
    volume: number;
    avgDailySales: number;
    supplierPrice: number;
    fees: any;
    costs: any;
  }) {
    const { volume, avgDailySales, supplierPrice, fees, costs } = params;
    
    const totalCost = volume * supplierPrice;
    const storageCost = volume * fees.storageFeePerUnitDay * 30; // 30 дней хранения
    const stockCoverDays = volume / avgDailySales;
    
    // Простая модель ценообразования
    const sellingPrice = supplierPrice * 1.3; // +30% к закупочной цене
    const revenue = volume * sellingPrice;
    const commission = revenue * (fees.feePct / 100);
    
    const profit = revenue - totalCost - storageCost - commission;
    const margin = (profit / revenue) * 100;

    return {
      profit,
      margin,
      stockCoverDays,
      roi: (profit / totalCost) * 100,
    };
  }

  private calculateRisk(params: {
    salesVolatility: number;
    competitorCount: number;
    stockCoverDays: number;
  }) {
    const { salesVolatility, competitorCount, stockCoverDays } = params;
    
    let risk = 0;
    
    // Риск волатильности продаж
    if (salesVolatility > 10) risk += 0.3;
    else if (salesVolatility > 5) risk += 0.2;
    else risk += 0.1;
    
    // Риск конкуренции
    if (competitorCount > 20) risk += 0.4;
    else if (competitorCount > 10) risk += 0.3;
    else if (competitorCount > 5) risk += 0.2;
    else risk += 0.1;
    
    // Риск избыточного запаса
    if (stockCoverDays > 90) risk += 0.3;
    else if (stockCoverDays > 60) risk += 0.2;
    else if (stockCoverDays > 30) risk += 0.1;
    
    return Math.min(risk, 1); // Нормализуем до 0-1
  }

  private calculateScore(profit: number, risk: number): number {
    // Простая формула скоринга: profit - λ * risk
    const lambda = 0.5; // Вес риска
    return profit - (lambda * risk * 1000); // Умножаем риск на 1000 для масштабирования
  }

  private generateRationale(economics: any, risk: number, competitorData: any): string {
    const reasons = [];
    
    if (economics.margin > 25) reasons.push('Высокая маржа');
    if (economics.stockCoverDays < 45) reasons.push('Оптимальный запас');
    if (competitorData.competitorsCount < 5) reasons.push('Низкая конкуренция');
    if (economics.roi > 50) reasons.push('Высокий ROI');
    
    return reasons.join(', ') || 'Сбалансированное соотношение риск/доходность';
  }

  async scheduleOpportunityAnalysis(merchantId: string): Promise<void> {
    await this.opportunitiesQueue.add('analyze', { merchantId }, {
      delay: 1000 * 60 * 60, // 1 час
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
