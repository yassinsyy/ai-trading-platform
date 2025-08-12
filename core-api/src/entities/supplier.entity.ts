import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { SupplierSKU } from './supplier-sku.entity';
import { PurchaseOrder } from './purchase-order.entity';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

export enum SupplierRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
  UNKNOWN = 'unknown',
}

@Entity('suppliers')
@Index(['merchantId', 'name'], { unique: true })
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  code: string; // внутренний код поставщика

  @Column({ type: 'jsonb' })
  contacts: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    contactPerson?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb' })
  terms: {
    paymentTerms?: string; // "30 days net"
    deliveryTime?: number; // дни
    minimumOrder?: number;
    currency?: string;
    incoterms?: string;
    [key: string]: any;
  };

  @Column({
    type: 'enum',
    enum: SupplierRating,
    default: SupplierRating.UNKNOWN,
  })
  rating: SupplierRating;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  reliabilityScore: number; // 0-1

  @Column({ type: 'integer', default: 0 })
  totalOrders: number;

  @Column({ type: 'integer', default: 0 })
  successfulOrders: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  onTimeDeliveryPct: number; // процент своевременных поставок

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus;

  @Column({ type: 'jsonb', nullable: true })
  certifications: {
    iso9001?: boolean;
    iso14001?: boolean;
    fsc?: boolean;
    [key: string]: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    notes?: string;
    tags?: string[];
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => SupplierSKU, supplierSku => supplierSku.supplier)
  supplierSkus: SupplierSKU[];

  @OneToMany(() => PurchaseOrder, po => po.supplier)
  purchaseOrders: PurchaseOrder[];

  // Computed properties
  get successRate(): number {
    return this.totalOrders > 0 ? this.successfulOrders / this.totalOrders : 0;
  }

  get isReliable(): boolean {
    return this.reliabilityScore >= 0.8 && this.onTimeDeliveryPct >= 90;
  }
}
