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

export enum PricingMode {
  AUTO = 'auto',
  MANUAL = 'manual',
  SEMI_AUTO = 'semi_auto',
}

@Entity('price_policies')
@Index(['productId'], { unique: true })
export class PricePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({
    type: 'enum',
    enum: PricingMode,
    default: PricingMode.AUTO,
  })
  mode: PricingMode;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.0 })
  minMarginPct: number; // минимальный процент маржи

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  maxPriceDeltaPctDay: number; // максимальное изменение цены в день

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  floorPrice: number; // минимальная цена (если задана)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ceilingPrice: number; // максимальная цена (если задана)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cogs: number; // себестоимость товара

  @Column({ type: 'jsonb', nullable: true })
  rules: {
    competitorOffset?: number; // отступ от конкурента (-0.01 = на 1% дешевле)
    stockBasedPricing?: boolean; // учитывать остатки при ценообразовании
    quietHours?: {
      start: string; // "22:00"
      end: string; // "08:00"
      enabled: boolean;
    };
    seasonalAdjustments?: {
      [month: string]: number; // множители по месяцам
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  overrides: {
    lastOverrideAt?: Date;
    overrideReason?: string;
    overrideBy?: string;
    overridePrice?: number;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
