import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Offer } from './offer.entity';

export enum TestStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TestType {
  PRICING = 'pricing',
  TITLE = 'title',
  DESCRIPTION = 'description',
  IMAGES = 'images',
  BULLETS = 'bullets',
}

@Entity('ab_tests')
@Index(['offerId', 'type'], { unique: true })
@Index(['status'])
export class ABTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({
    type: 'enum',
    enum: TestType,
  })
  type: TestType;

  @Column({
    type: 'enum',
    enum: TestStatus,
    default: TestStatus.DRAFT,
  })
  status: TestStatus;

  @Column({ type: 'varchar', length: 255 })
  name: string; // название теста

  @Column({ type: 'text', nullable: true })
  description: string; // описание теста

  @Column({ type: 'jsonb' })
  variants: {
    a: any; // контрольный вариант
    b: any; // тестовый вариант
    [key: string]: any;
  };

  @Column({ type: 'integer', default: 50 })
  trafficSplit: number; // процент трафика для варианта B (0-100)

  @Column({ type: 'date', nullable: true })
  startDate: Date; // дата начала теста

  @Column({ type: 'date', nullable: true })
  endDate: Date; // планируемая дата окончания

  @Column({ type: 'integer', default: 0 })
  minSampleSize: number; // минимальный размер выборки

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 95.0 })
  confidenceLevel: number; // уровень доверия (%)

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    viewsA?: number;
    viewsB?: number;
    clicksA?: number;
    clicksB?: number;
    conversionsA?: number;
    conversionsB?: number;
    revenueA?: number;
    revenueB?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  results: {
    winner?: 'A' | 'B' | 'none';
    confidence?: number;
    lift?: number;
    pValue?: number;
    conclusion?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    autoStop?: boolean;
    autoStopThreshold?: number;
    notificationEmails?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    createdBy?: string;
    tags?: string[];
    notes?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offerId' })
  offer: Offer;
}
