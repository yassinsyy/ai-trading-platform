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
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from './product.entity';

@Entity('po_lines')
@Index(['poId', 'productId'])
export class POLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  poId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'integer' })
  qty: number; // заказываемое количество

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number; // цена за единицу

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number; // общая стоимость строки

  @Column({ type: 'date', nullable: true })
  etaDate: Date; // ожидаемая дата поставки

  @Column({ type: 'integer', default: 0 })
  receivedQty: number; // полученное количество

  @Column({ type: 'date', nullable: true })
  receivedAt: Date; // дата получения

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierSku: string; // SKU у поставщика

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    color?: string;
    size?: string;
    model?: string;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    tags?: string[];
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => PurchaseOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Computed properties
  get isFullyReceived(): boolean {
    return this.receivedQty >= this.qty;
  }

  get remainingQty(): number {
    return this.qty - this.receivedQty;
  }

  get receivedPercentage(): number {
    return this.qty > 0 ? (this.receivedQty / this.qty) * 100 : 0;
  }
}
