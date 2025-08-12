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
import { Product } from './product.entity';

@Entity('competitor_snapshots')
@Index(['offerId', 'ts'])
@Index(['ts'])
@Index(['productId', 'timestamp'])
export class CompetitorSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  competitorName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  isComplete: boolean;

  @Column({ type: 'timestamp' })
  ts: Date;

  @Column({ type: 'integer', default: 0 })
  competitorsCount: number; // количество конкурентов

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minCompetitorPrice: number; // минимальная цена конкурента

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxCompetitorPrice: number; // максимальная цена конкурента

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  avgCompetitorPrice: number; // средняя цена конкурента

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyboxOwner: string; // владелец корзины покупок

  @Column({ type: 'integer', default: 0 })
  ourPosition: number; // наша позиция в выдаче

  @Column({ type: 'jsonb', nullable: true })
  competitorDetails: {
    [competitorId: string]: {
      price: number;
      rating?: number;
      reviewsCount?: number;
      shipping?: string;
      stock?: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  marketInsights: {
    priceVolatility?: number;
    marketTrend?: 'up' | 'down' | 'stable';
    seasonality?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    syncMethod?: string;
    confidence?: number;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Computed properties
  get priceSpread(): number {
    if (this.minCompetitorPrice && this.maxCompetitorPrice) {
      return this.maxCompetitorPrice - this.minCompetitorPrice;
    }
    return 0;
  }

  get isCompetitive(): boolean {
    return this.competitorsCount > 0;
  }
}
