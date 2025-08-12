import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { MarketplaceAccount } from './marketplace-account.entity';
import { StockSnapshot } from './stock-snapshot.entity';
import { SalesDaily } from './sales-daily.entity';
import { CompetitorSnapshot } from './competitor-snapshot.entity';
import { ListingDraft } from './listing-draft.entity';
import { ABTest } from './ab-test.entity';

export type ListingStatus = 'active' | 'inactive' | 'suspended' | 'draft' | 'pending_review';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  marketplaceAccountId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalId: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended', 'draft', 'pending_review'], default: 'draft' })
  listingStatus: ListingStatus;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lastPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdateAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  marketplaceData: {
    rating?: number;
    reviewsCount?: number;
    buyboxOwnership?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, product => product.offers)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => MarketplaceAccount, account => account.offers)
  @JoinColumn({ name: 'marketplaceAccountId' })
  marketplaceAccount: MarketplaceAccount;

  @OneToMany(() => StockSnapshot, snapshot => snapshot.offer)
  stockSnapshots: StockSnapshot[];

  @OneToMany(() => SalesDaily, sales => sales.offer)
  salesDaily: SalesDaily[];

  @OneToMany(() => CompetitorSnapshot, competitor => competitor.offer)
  competitorSnapshots: CompetitorSnapshot[];

  @OneToMany(() => ListingDraft, draft => draft.offer)
  listingDrafts: ListingDraft[];

  @OneToMany(() => ABTest, test => test.offer)
  abTests: ABTest[];
}
