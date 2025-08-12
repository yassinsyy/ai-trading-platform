import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { MarketplaceAccount } from './marketplace-account.entity';
import { Product } from './product.entity';
import { Supplier } from './supplier.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('merchants')
@Index(['name'], { unique: true })
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    minMarginPct: number;
    maxPriceDeltaPctDay: number;
    reorderThreshold: number;
    liquidationThreshold: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.merchant)
  users: User[];

  @OneToMany(() => MarketplaceAccount, account => account.merchant)
  marketplaceAccounts: MarketplaceAccount[];

  @OneToMany(() => Product, product => product.merchant)
  products: Product[];

  @OneToMany(() => Supplier, supplier => supplier.merchant)
  suppliers: Supplier[];

  @OneToMany(() => PurchaseOrder, po => po.merchant)
  purchaseOrders: PurchaseOrder[];
}
