import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Offer } from './offer.entity';

@Entity('sales_daily')
@Index(['offerId', 'date'], { unique: true })
@Index(['date'])
export class SalesDaily {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'integer', default: 0 })
  units: number; // количество проданных единиц

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number; // выручка

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averagePrice: number; // средняя цена продажи

  @Column({ type: 'integer', default: 0 })
  returnsUnits: number; // возвраты (количество)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  returnsAmount: number; // возвраты (сумма)

  @Column({ type: 'integer', default: 0 })
  views: number; // просмотры

  @Column({ type: 'integer', default: 0 })
  clicks: number; // клики

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  conversionRate: number; // конверсия (clicks/views)

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    promotions?: string[];
    seasonality?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  // Computed properties
  get netSales(): number {
    return this.revenue - this.returnsAmount;
  }

  get netUnits(): number {
    return this.units - this.returnsUnits;
  }

  get effectiveConversionRate(): number {
    return this.views > 0 ? this.clicks / this.views : 0;
  }
}
