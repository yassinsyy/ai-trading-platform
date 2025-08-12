import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { Offer } from './offer.entity';
import { PricePolicy } from './price-policy.entity';
import { Costs } from './costs.entity';
import { SupplierSKU } from './supplier-sku.entity';

@Entity('products')
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

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'jsonb', nullable: true })
  attributes: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    color?: string;
    material?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    requiresCertification: boolean;
    restrictedWords: string[];
    brandGateRisk: 'low' | 'medium' | 'high';
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.products)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Offer, offer => offer.product)
  offers: Offer[];

  @OneToMany(() => PricePolicy, policy => policy.product)
  pricePolicies: PricePolicy[];

  @OneToMany(() => Costs, costs => costs.product)
  costs: Costs[];

  @OneToMany(() => SupplierSKU, supplierSku => supplierSku.product)
  supplierSkus: SupplierSKU[];
}
