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

@Entity('costs')
@Index(['productId'], { unique: true })
export class Costs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cogs: number; // себестоимость (Cost of Goods Sold)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  packaging: number; // упаковка

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  inboundLogistics: number; // входящая логистика

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  customs: number; // таможенные сборы

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  qualityControl: number; // контроль качества

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  storage: number; // складские расходы

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  handling: number; // обработка

  @Column({ type: 'jsonb', nullable: true })
  breakdown: {
    materials?: number;
    labor?: number;
    overhead?: number;
    [key: string]: number;
  };

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'timestamp' })
  lastUpdate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    supplier?: string;
    batchSize?: number;
    notes?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Computed properties
  get totalCost(): number {
    return this.cogs + this.packaging + this.inboundLogistics + 
           this.customs + this.qualityControl + this.storage + this.handling;
  }

  get costPerUnit(): number {
    return this.totalCost;
  }
}
