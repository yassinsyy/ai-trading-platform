import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { Supplier } from './supplier.entity';
import { POLine } from './po-line.entity';

export type POStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'confirmed' | 'shipped' | 'arrived' | 'cancelled';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'varchar', length: 50 })
  poNumber: string; // номер заказа

  @Column({ type: 'enum', enum: ['draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'shipped', 'arrived', 'cancelled'], default: 'draft' })
  status: POStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number; // общая сумма заказа

  @Column({ type: 'varchar', length: 3, default: 'RUB' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date; // ожидаемая дата поставки

  @Column({ type: 'jsonb', nullable: true })
  shipping: {
    method?: string; // способ доставки
    address?: string; // адрес доставки
    contactPerson?: string; // контактное лицо
    phone?: string; // телефон
  };

  @Column({ type: 'jsonb', nullable: true })
  payment: {
    terms?: string; // условия оплаты
    method?: string; // способ оплаты
    dueDate?: Date; // срок оплаты
  };

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string; // кто одобрил

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date; // когда одобрили

  @Column({ type: 'uuid', nullable: true })
  sentBy: string; // кто отправил

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date; // когда отправили

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.purchaseOrders)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => Supplier, supplier => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(() => POLine, poLine => poLine.purchaseOrder)
  poLines: POLine[];
}
