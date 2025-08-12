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
import { Product } from './product.entity';

@Entity('fees')
@Index(['marketplace', 'category'], { unique: true })
export class Fees {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string;

  @Column({ type: 'varchar', length: 50 })
  marketplace: string; // kaspi, wb, ozon, amazon

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number; // комиссия в процентах

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  paymentProcessingFee: number; // комиссия за обработку платежа

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fixedFee: number; // фиксированная комиссия

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  storageFeePerUnitDay: number; // складской сбор за единицу в день

  @Column({ type: 'jsonb' })
  deliveryFeeRules: {
    baseFee: number;
    weightBased?: {
      [weightRange: string]: number;
    };
    distanceBased?: {
      [distanceRange: string]: number;
    };
    freeShippingThreshold?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  additionalFees: {
    [feeName: string]: {
      amount: number;
      type: 'fixed' | 'percentage';
      description: string;
    };
  };

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validTo: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    lastUpdate?: Date;
    notes?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
