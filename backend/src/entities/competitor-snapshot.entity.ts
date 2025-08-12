import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Offer } from './offer.entity';

@Entity('competitor_snapshots')
export class CompetitorSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'integer' })
  competitorsCount: number; // количество конкурентов

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minCompetitorPrice: number; // минимальная цена конкурента

  @Column({ type: 'varchar', length: 100, nullable: true })
  buyboxOwner: string; // владелец корзины покупок

  @Column({ type: 'jsonb', nullable: true })
  competitorPrices: Array<{
    price: number;
    seller: string;
    rating?: number;
    reviewsCount?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  marketPosition: {
    ourPosition?: number; // наша позиция в списке
    totalOffers?: number; // общее количество предложений
    priceRank?: number; // ранг по цене
  };

  @Column({ type: 'jsonb', nullable: true })
  additionalData: {
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Offer, offer => offer.competitorSnapshots)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;
}
