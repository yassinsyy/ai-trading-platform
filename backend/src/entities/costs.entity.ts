import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('costs')
export class Costs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cogs: number; // себестоимость товара

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  packaging: number; // стоимость упаковки

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  inboundLogistics: number; // входящая логистика

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  customs: number; // таможенные пошлины

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  qualityControl: number; // контроль качества

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  storage: number; // стоимость хранения

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  other: number; // прочие расходы

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number; // общая себестоимость (вычисляемое поле)

  @Column({ type: 'timestamp' })
  lastUpdate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currency: string; // валюта

  @Column({ type: 'jsonb', nullable: true })
  costBreakdown: {
    [key: string]: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, product => product.costs)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
