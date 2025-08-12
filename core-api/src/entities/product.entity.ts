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
import { Offer } from './offer.entity';
import { PricePolicy } from './price-policy.entity';
import { Costs } from './costs.entity';
import { Fees } from './fees.entity';
import { SupplierSKU } from './supplier-sku.entity';

@Entity('products')
@Index(['merchantId', 'sku'], { unique: true })
@Index(['barcode'], { unique: true, sparse: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  elasticity: number;

  @Column({ type: 'jsonb' })
  attributes: {
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    color?: string;
    material?: string;
    size?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    requiresCertification: boolean;
    restrictedWords: string[];
    forbiddenClaims: string[];
    requiredDocs: string[];
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    tags?: string[];
    notes?: string;
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

  @OneToMany(() => Offer, offer => offer.product)
  offers: Offer[];

  @OneToMany(() => PricePolicy, policy => policy.product)
  pricePolicies: PricePolicy[];

  @OneToMany(() => Costs, costs => costs.product)
  costs: Costs[];

  @OneToMany(() => Fees, fees => fees.product)
  fees: Fees[];

  @OneToMany(() => SupplierSKU, supplierSku => supplierSku.product)
  supplierSkus: SupplierSKU[];
}
