import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Offer } from './offer.entity';

@Entity('sales_daily')
export class SalesDaily {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'integer' })
  units: number; // количество проданных единиц

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  revenue: number; // выручка

  @Column({ type: 'integer', default: 0 })
  returnsUnits: number; // количество возвратов

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  returnsAmount: number; // сумма возвратов

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averagePrice: number; // средняя цена продажи

  @Column({ type: 'jsonb', nullable: true })
  additionalData: {
    marketplaceFees?: number; // комиссии маркетплейса
    logisticsCosts?: number; // логистические расходы
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Offer, offer => offer.salesDaily)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;
}
