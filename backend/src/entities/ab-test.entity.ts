import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Offer } from './offer.entity';
import { ListingDraft } from './listing-draft.entity';

export type ABTestStatus = 'running' | 'completed' | 'stopped';

@Entity('ab_tests')
export class ABTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'uuid' })
  variantAId: string; // ID варианта A

  @Column({ type: 'uuid' })
  variantBId: string; // ID варианта B

  @Column({ type: 'varchar', length: 100 })
  name: string; // название теста

  @Column({ type: 'text', nullable: true })
  description: string; // описание теста

  @Column({ type: 'enum', enum: ['running', 'completed', 'stopped'], default: 'running' })
  status: ABTestStatus;

  @Column({ type: 'timestamp' })
  startTs: Date; // когда начали тест

  @Column({ type: 'timestamp', nullable: true })
  endTs: Date; // когда закончили тест

  @Column({ type: 'uuid', nullable: true })
  winnerVariantId: string; // ID победившего варианта

  @Column({ type: 'integer', default: 0 })
  variantAViews: number; // показы варианта A

  @Column({ type: 'integer', default: 0 })
  variantBViews: number; // показы варианта B

  @Column({ type: 'integer', default: 0 })
  variantAClicks: number; // клики по варианту A

  @Column({ type: 'integer', default: 0 })
  variantBClicks: number; // клики по варианту B

  @Column({ type: 'integer', default: 0 })
  variantAConversions: number; // конверсии варианта A

  @Column({ type: 'integer', default: 0 })
  variantBConversions: number; // конверсии варианта B

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  variantACTR: number; // CTR варианта A

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  variantBCTR: number; // CTR варианта B

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  variantACR: number; // CR варианта A

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  variantBCR: number; // CR варианта B

  @Column({ type: 'jsonb', nullable: true })
  testConfig: {
    trafficSplit?: number; // процент трафика для варианта B (0-100)
    minSampleSize?: number; // минимальный размер выборки
    confidenceLevel?: number; // уровень доверия (0.95, 0.99)
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  results: {
    pValue?: number; // p-value статистического теста
    isSignificant?: boolean; // статистически значимый результат
    confidenceInterval?: [number, number]; // доверительный интервал
    effectSize?: number; // размер эффекта
    [key: string]: any;
  };

  @Column({ type: 'uuid', nullable: true })
  createdBy: string; // кто создал тест

  @Column({ type: 'uuid', nullable: true })
  stoppedBy: string; // кто остановил тест

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Offer, offer => offer.abTests)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  @ManyToOne(() => ListingDraft, draft => draft.id)
  @JoinColumn({ name: 'variantAId' })
  variantA: ListingDraft;

  @ManyToOne(() => ListingDraft, draft => draft.id)
  @JoinColumn({ name: 'variantBId' })
  variantB: ListingDraft;

  @ManyToOne(() => ListingDraft, draft => draft.id)
  @JoinColumn({ name: 'winnerVariantId' })
  winnerVariant: ListingDraft;
}
