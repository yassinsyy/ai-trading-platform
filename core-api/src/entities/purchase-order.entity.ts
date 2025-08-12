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
import { Merchant } from './merchant.entity';
import { Supplier } from './supplier.entity';
import { POLine } from './po-line.entity';

export enum POStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum POCurrency {
  USD = 'USD',
  EUR = 'EUR',
  RUB = 'RUB',
  KZT = 'KZT',
}

@Entity('purchase_orders')
@Index(['merchantId', 'poNumber'], { unique: true })
@Index(['supplierId'])
@Index(['status'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'varchar', length: 50 })
  poNumber: string; // номер заказа

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: POCurrency,
    default: POCurrency.USD,
  })
  currency: POCurrency;

  @Column({ type: 'date', nullable: true })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  shipping: {
    method?: string;
    cost?: number;
    trackingNumber?: string;
    carrier?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  payment: {
    terms?: string;
    method?: string;
    dueDate?: Date;
    paidAmount?: number;
    paidAt?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  approval: {
    approvedBy?: string;
    approvedAt?: Date;
    notes?: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    tags?: string[];
    priority?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(() => POLine, line => line.purchaseOrder, { cascade: true })
  lines: POLine[];

  // Computed properties
  get isApproved(): boolean {
    return this.status !== POStatus.DRAFT && this.status !== POStatus.PENDING_APPROVAL;
  }

  get isShipped(): boolean {
    return [
      POStatus.SHIPPED,
      POStatus.PARTIALLY_SHIPPED,
      POStatus.PARTIALLY_RECEIVED,
      POStatus.RECEIVED,
      POStatus.CLOSED,
    ].includes(this.status);
  }

  get isCompleted(): boolean {
    return this.status === POStatus.CLOSED;
  }
}
