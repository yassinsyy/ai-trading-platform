import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { SupplierSKU } from './supplier-sku.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  code: string; // внутренний код поставщика

  @Column({ type: 'jsonb' })
  contacts: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    contactPerson?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb' })
  terms: {
    paymentTerms?: string; // условия оплаты
    deliveryTerms?: string; // условия доставки
    minOrderValue?: number; // минимальная сумма заказа
    leadTime?: number; // время выполнения заказа в днях
    [key: string]: any;
  };

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number; // рейтинг поставщика (0-5)

  @Column({ type: 'integer', default: 0 })
  ordersCount: number; // количество заказов

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalOrderValue: number; // общая сумма заказов

  @Column({ type: 'jsonb', nullable: true })
  performance: {
    onTimeDelivery?: number; // процент своевременных поставок
    qualityScore?: number; // оценка качества
    communicationScore?: number; // оценка коммуникации
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.suppliers)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => SupplierSKU, supplierSku => supplierSku.supplier)
  supplierSkus: SupplierSKU[];

  @OneToMany(() => PurchaseOrder, po => po.supplier)
  purchaseOrders: PurchaseOrder[];
}
