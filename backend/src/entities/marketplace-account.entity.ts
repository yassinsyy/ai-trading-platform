import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { Offer } from './offer.entity';

export type MarketplaceType = 'kaspi' | 'wb' | 'ozon' | 'amazon';
export type MarketplaceStatus = 'active' | 'inactive' | 'error' | 'suspended';

@Entity('marketplace_accounts')
export class MarketplaceAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'enum', enum: ['kaspi', 'wb', 'ozon', 'amazon'] })
  type: MarketplaceType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb' })
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    [key: string]: any;
  };

  @Column({ type: 'enum', enum: ['active', 'inactive', 'error', 'suspended'], default: 'inactive' })
  status: 'active' | 'inactive' | 'error' | 'suspended';

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    syncInterval: number; // minutes
    priceUpdateEnabled: boolean;
    stockUpdateEnabled: boolean;
    quietHours?: {
      start: string; // "22:00"
      end: string; // "08:00"
    };
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.marketplaceAccounts)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Offer, offer => offer.marketplaceAccount)
  offers: Offer[];
}
