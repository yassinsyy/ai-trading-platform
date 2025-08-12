import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/services/base.service';
import { Product } from '../entities/product.entity';
import { Offer, ListingStatus } from '../entities/offer.entity';
import { PricePolicy, PricingMode } from '../entities/price-policy.entity';
import { Costs } from '../entities/costs.entity';
import { SupplierSKU } from '../entities/supplier-sku.entity';
import { CreateProductDto, UpdateProductDto, ProductFiltersDto } from './dto';

@Injectable()
export class ProductsService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(PricePolicy)
    private readonly pricePolicyRepository: Repository<PricePolicy>,
    @InjectRepository(Costs)
    private readonly costsRepository: Repository<Costs>,
    @InjectRepository(SupplierSKU)
    private readonly supplierSkuRepository: Repository<SupplierSKU>,
  ) {
    super(productRepository);
  }

  async createProduct(merchantId: string, data: CreateProductDto): Promise<Product> {
    // Check if SKU already exists for this merchant
    const existingProduct = await this.productRepository.findOne({
      where: { merchantId, sku: data.sku }
    });

    if (existingProduct) {
      throw new BadRequestException(`Product with SKU ${data.sku} already exists`);
    }

    const product = await this.create({
      ...data,
      merchantId,
      isActive: true,
    });

    // Create default price policy
    await this.pricePolicyRepository.save({
      productId: product.id,
      mode: PricingMode.MANUAL,
      minMarginPct: 15,
      maxPriceDeltaPctDay: 5,
      isActive: true,
    });

    // Create default costs record
    await this.costsRepository.save({
      productId: product.id,
      cogs: 0,
      packaging: 0,
      inboundLogistics: 0,
      customs: 0,
      qualityControl: 0,
      storage: 0,
      handling: 0,
      currency: 'USD',
      lastUpdate: new Date(),
    });

    return product;
  }

  async updateProduct(id: string, merchantId: string, data: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    
    if (!product || product.merchantId !== merchantId) {
      throw new NotFoundException('Product not found');
    }

    // Check SKU uniqueness if it's being changed
    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { merchantId, sku: data.sku }
      });

      if (existingProduct) {
        throw new BadRequestException(`Product with SKU ${data.sku} already exists`);
      }
    }

    return await this.update(id, data);
  }

  async getProductsByMerchant(
    merchantId: string,
    filters: ProductFiltersDto,
    pagination: any
  ) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.offers', 'offers')
      .leftJoinAndSelect('product.pricePolicy', 'pricePolicy')
      .leftJoinAndSelect('product.costs', 'costs')
      .where('product.merchantId = :merchantId', { merchantId });

    // Apply filters
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters.brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand: filters.brand });
    }

    if (filters.sku) {
      queryBuilder.andWhere('product.sku ILIKE :sku', { sku: `%${filters.sku}%` });
    }

    if (filters.title) {
      queryBuilder.andWhere('product.title ILIKE :title', { title: `%${filters.title}%` });
    }

    // Apply sorting
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'ASC';
      queryBuilder.orderBy(`product.${filters.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    // Apply pagination
    if (pagination) {
      queryBuilder.skip(pagination.skip).take(pagination.take);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    if (pagination) {
      return new (await import('../common/dto/pagination.dto')).PaginatedResponseDto(
        data,
        total,
        pagination
      );
    }

    return { data, total };
  }

  async getProductWithDetails(id: string, merchantId: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.offers', 'offers')
      .leftJoinAndSelect('product.pricePolicy', 'pricePolicy')
      .leftJoinAndSelect('product.costs', 'costs')
      .leftJoinAndSelect('product.supplierSkus', 'supplierSkus')
      .leftJoinAndSelect('supplierSkus.supplier', 'supplier')
      .where('product.id = :id', { id })
      .andWhere('product.merchantId = :merchantId', { merchantId })
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProductAnalytics(id: string, merchantId: string) {
    const product = await this.getProductWithDetails(id, merchantId);

    // Get recent sales data
    const salesData = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.salesDaily', 'sales')
      .where('offer.productId = :productId', { productId: id })
      .andWhere('sales.date >= :startDate', { 
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      })
      .orderBy('sales.date', 'DESC')
      .getMany();

    // Get stock data
    const stockData = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.stockSnapshots', 'stock')
      .where('offer.productId = :productId', { productId: id })
      .orderBy('stock.ts', 'DESC')
      .limit(10)
      .getMany();

    // Calculate metrics
    const totalRevenue = salesData.reduce((sum, offer) => {
      return sum + (offer.sales || []).reduce((s, sale) => s + sale.revenue, 0);
    }, 0);

    const totalUnits = salesData.reduce((sum, offer) => {
      return sum + (offer.sales || []).reduce((s, sale) => s + sale.units, 0);
    }, 0);

    const avgPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;

    const currentStock = stockData.reduce((sum, offer) => {
      const latestStock = offer.stockSnapshots[0];
      return sum + (latestStock?.onHand || 0);
    }, 0);

    return {
      product,
      analytics: {
        totalRevenue,
        totalUnits,
        avgPrice,
        currentStock,
        salesData,
        stockData,
      }
    };
  }

  async deactivateProduct(id: string, merchantId: string): Promise<Product> {
    const product = await this.findById(id);
    
    if (!product || product.merchantId !== merchantId) {
      throw new NotFoundException('Product not found');
    }

    // Deactivate all offers
    await this.offerRepository.update(
      { productId: id },
      { listingStatus: ListingStatus.SUSPENDED }
    );

    // Deactivate price policy
    await this.pricePolicyRepository.update(
      { productId: id },
      { isActive: false }
    );

    return await this.update(id, { isActive: false });
  }

  async getProductCompliance(id: string, merchantId: string) {
    const product = await this.findById(id);
    
    if (!product || product.merchantId !== merchantId) {
      throw new NotFoundException('Product not found');
    }

    const compliance = product.compliance;
    const issues: string[] = [];

    // Check required certifications
    if (compliance?.requiresCertification && !product.metadata?.certifications) {
      issues.push('Missing required certifications');
    }

    // Check for forbidden words in title
    if (compliance?.restrictedWords) {
      const title = product.title.toLowerCase();
      const restrictedWords = compliance.restrictedWords.map(word => word.toLowerCase());
      
      restrictedWords.forEach(word => {
        if (title.includes(word)) {
          issues.push(`Title contains restricted word: ${word}`);
        }
      });
    }

    // Check for required elements
    if (compliance?.requiredDocs && !product.metadata?.documents) {
      issues.push('Missing required documents');
    }

    return {
      product,
      compliance,
      issues,
      isCompliant: issues.length === 0,
    };
  }
}
