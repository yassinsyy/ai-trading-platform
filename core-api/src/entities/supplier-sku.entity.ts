import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';

@Entity('supplier_skus')
@Index(['supplierId', 'supplierSku'], { unique: true })
@Index(['productId', 'supplierId'], { unique: true })
export class SupplierSKU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 100 })
  supplierSku: string; // SKU у поставщика

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // цена поставщика

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'integer', default: 1 })
  moq: number; // минимальный размер заказа

  @Column({ type: 'integer', default: 1 })
  leadDays: number; // время поставки в днях

  @Column({ type: 'boolean', default: false })
  hasCert: boolean; // есть ли сертификат

  @Column({ type: 'integer', default: 0 })
  availableStock: number; // доступный остаток у поставщика

  @Column({ type: 'jsonb', nullable: true })
  packaging: {
    unitsPerPack?: number;
    packWeight?: number;
    packDimensions?: { length: number; width: number; height: number };
  };

  @Column({ type: 'jsonb', nullable: true })
  quality: {
    grade?: string;
    defects?: number;
    returnPolicy?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  logistics: {
    shippingMethod?: string;
    shippingCost?: number;
    customsHandling?: boolean;
    insurance?: boolean;
  };

  @Column({ type: 'date', nullable: true })
  priceValidUntil: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    notes?: string;
    lastUpdate?: Date;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Computed properties
  get isInStock(): boolean {
    return this.availableStock >= this.moq;
  }

  get totalCost(): number {
    return this.price;
  }
}
