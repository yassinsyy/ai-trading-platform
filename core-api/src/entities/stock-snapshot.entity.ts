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

@Entity('stock_snapshots')
@Index(['offerId', 'ts'])
@Index(['ts'])
@Index(['productId', 'timestamp'])
export class StockSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'uuid', nullable: true })
  productId: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'boolean', default: false })
  isComplete: boolean;

  @Column({ type: 'timestamp' })
  ts: Date;

  @Column({ type: 'integer', default: 0 })
  onHand: number; // доступный остаток

  @Column({ type: 'integer', default: 0 })
  reserved: number; // зарезервированный остаток

  @Column({ type: 'varchar', length: 100, nullable: true })
  warehouse: string; // склад

  @Column({ type: 'integer', default: 0 })
  inTransit: number; // в пути

  @Column({ type: 'integer', default: 0 })
  damaged: number; // поврежденный товар

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    syncMethod?: string;
    confidence?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  city: Record<string, number>; // остатки по городам

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
  get availableStock(): number {
    return this.onHand - this.reserved;
  }

  get totalStock(): number {
    return this.onHand + this.inTransit;
  }

  // Alias for backward compatibility
  get stock(): number | { onHand: number; reserved: number; city?: Record<string, number> } {
    return {
      onHand: this.onHand,
      reserved: this.reserved,
      city: this.city
    };
  }
}
