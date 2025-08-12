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
import { Product } from './product.entity';
import { MarketplaceAccount } from './marketplace-account.entity';
import { StockSnapshot } from './stock-snapshot.entity';
import { SalesDaily } from './sales-daily.entity';
import { CompetitorSnapshot } from './competitor-snapshot.entity';
import { ListingDraft } from './listing-draft.entity';
import { ABTest } from './ab-test.entity';
import { PricePolicy } from './price-policy.entity';

export enum ListingStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

@Entity('offers')
@Index(['marketplaceAccountId', 'externalId'], { unique: true })
@Index(['productId', 'marketplaceAccountId'], { unique: true })
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  marketplaceAccountId: string;

  @Column({ type: 'varchar', length: 255 })
  externalId: string; // ID в маркетплейсе

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.DRAFT,
  })
  listingStatus: ListingStatus;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number; // текущая цена (alias для currentPrice)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lastPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdateAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  marketplaceData: {
    rating?: number;
    reviewsCount?: number;
    buyboxOwner?: string;
    position?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    priceMin?: number;
    priceMax?: number;
    stockMin?: number;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: false })
  isAutoPricingEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => MarketplaceAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marketplaceAccountId' })
  marketplaceAccount: MarketplaceAccount;

  @OneToMany(() => StockSnapshot, snapshot => snapshot.offer)
  stockSnapshots: StockSnapshot[];

  @OneToMany(() => SalesDaily, sales => sales.offer)
  sales: SalesDaily[];

  @OneToMany(() => CompetitorSnapshot, competitor => competitor.offer)
  competitorSnapshots: CompetitorSnapshot[];

  @OneToMany(() => ListingDraft, draft => draft.offer)
  listingDrafts: ListingDraft[];

  @OneToMany(() => ABTest, abTest => abTest.offer)
  abTests: ABTest[];

  // Virtual relation to PricePolicy
  pricePolicy?: PricePolicy;
}
