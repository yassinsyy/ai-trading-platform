import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';

@Entity('supplier_skus')
export class SupplierSKU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 100 })
  supplierSku: string; // SKU у поставщика

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // цена поставщика

  @Column({ type: 'integer' })
  moq: number; // минимальный объем заказа

  @Column({ type: 'integer' })
  leadDays: number; // время выполнения заказа в днях

  @Column({ type: 'boolean', default: false })
  hasCert: boolean; // есть ли сертификат

  @Column({ type: 'varchar', length: 100, nullable: true })
  certificateNumber: string; // номер сертификата

  @Column({ type: 'date', nullable: true })
  certificateExpiry: Date; // срок действия сертификата

  @Column({ type: 'jsonb', nullable: true })
  packaging: {
    unitsPerPack?: number; // единиц в упаковке
    packWeight?: number; // вес упаковки
    packDimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  quality: {
    grade?: string; // сорт товара
    defects?: string[]; // возможные дефекты
    warranty?: string; // гарантия
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
  @ManyToOne(() => Supplier, supplier => supplier.supplierSkus)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ManyToOne(() => Product, product => product.supplierSkus)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
