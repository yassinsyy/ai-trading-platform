import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Offer } from './offer.entity';

@Entity('stock_snapshots')
export class StockSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'integer' })
  onHand: number; // доступный остаток

  @Column({ type: 'integer', default: 0 })
  reserved: number; // зарезервированный остаток

  @Column({ type: 'varchar', length: 100, nullable: true })
  warehouse: string; // склад

  @Column({ type: 'jsonb', nullable: true })
  additionalData: {
    inTransit?: number; // в пути
    damaged?: number; // поврежденный
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Offer, offer => offer.stockSnapshots)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;
}
