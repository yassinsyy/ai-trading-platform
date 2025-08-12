import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MarketplaceAccount } from './marketplace-account.entity';
import { Product } from './product.entity';
import { Supplier } from './supplier.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { User } from './user.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 3, default: 'RUB' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => MarketplaceAccount, account => account.merchant)
  marketplaceAccounts: MarketplaceAccount[];

  @OneToMany(() => Product, product => product.merchant)
  products: Product[];

  @OneToMany(() => Supplier, supplier => supplier.merchant)
  suppliers: Supplier[];

  @OneToMany(() => PurchaseOrder, po => po.merchant)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => User, user => user.merchant)
  users: User[];
}
