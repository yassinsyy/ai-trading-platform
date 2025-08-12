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
import { Offer } from './offer.entity';

export enum MarketplaceType {
  KASPI = 'kaspi',
  WILDBERRIES = 'wb',
  OZON = 'ozon',
  AMAZON = 'amazon',
}

export enum MarketplaceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ERROR = 'error',
}

@Entity('marketplace_accounts')
@Index(['merchantId', 'type'], { unique: true })
export class MarketplaceAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({
    type: 'enum',
    enum: MarketplaceType,
  })
  type: MarketplaceType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb' })
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    sellerId?: string;
    shopId?: string;
    [key: string]: any;
  };

  @Column({
    type: 'enum',
    enum: MarketplaceStatus,
    default: MarketplaceStatus.INACTIVE,
  })
  status: MarketplaceStatus;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    syncInterval: number; // minutes
    priceUpdateEnabled: boolean;
    stockUpdateEnabled: boolean;
    orderSyncEnabled: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  health: {
    lastError?: string;
    errorCount: number;
    lastSuccessAt?: Date;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Offer, offer => offer.marketplaceAccount)
  offers: Offer[];
}
