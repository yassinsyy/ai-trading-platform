import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from './product.entity';

@Entity('po_lines')
export class POLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  poId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'integer' })
  qty: number; // количество

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number; // стоимость за единицу

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  lineTotal: number; // общая стоимость строки (вычисляемое поле)

  @Column({ type: 'date', nullable: true })
  etaDate: Date; // ожидаемая дата поставки

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierSku: string; // SKU у поставщика

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    color?: string;
    size?: string;
    variant?: string;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @Column({ type: 'boolean', default: false })
  isReceived: boolean; // получен ли товар

  @Column({ type: 'integer', default: 0 })
  receivedQty: number; // полученное количество

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date; // когда получили

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => PurchaseOrder, po => po.poLines)
  @JoinColumn({ name: 'poId' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product, product => product.id)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
