import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('fees')
export class Fees {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  marketplace: string; // kaspi, wb, ozon, amazon

  @Column({ type: 'varchar', length: 100 })
  category: string; // категория товара

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  feePct: number; // комиссия в процентах

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  storageFeePerUnitDay: number; // плата за хранение за единицу в день

  @Column({ type: 'jsonb' })
  deliveryFeeRules: {
    weightRanges: Array<{
      min: number;
      max: number;
      fee: number;
    }>;
    distanceRanges?: Array<{
      min: number;
      max: number;
      fee: number;
    }>;
    expressDeliveryMultiplier?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  additionalFees: {
    listingFee?: number; // плата за размещение
    promotionFee?: number; // плата за продвижение
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validTo: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
