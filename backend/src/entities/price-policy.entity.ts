import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

export type PricingMode = 'auto' | 'manual' | 'clearance';

@Entity('price_policies')
export class PricePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  minMarginPct: number; // минимальная маржа в процентах

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  maxPriceDeltaPctDay: number; // максимальное изменение цены в день в процентах

  @Column({ type: 'enum', enum: ['auto', 'manual', 'clearance'], default: 'auto' })
  mode: PricingMode;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  floorPrice: number; // минимальная цена (рассчитывается автоматически)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ceilingPrice: number; // максимальная цена

  @Column({ type: 'jsonb', nullable: true })
  rules: {
    competitorPriceWeight: number; // вес цены конкурента (0-1)
    demandSensitivity: number; // чувствительность к спросу
    stockCoverInfluence: number; // влияние покрытия запасами
    quietHoursEnabled: boolean;
    clearanceModeEnabled: boolean;
    clearanceMaxDiscount: number; // максимальная скидка в режиме ликвидации
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, product => product.pricePolicies)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
