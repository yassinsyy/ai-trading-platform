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

export enum DraftStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

@Entity('listing_drafts')
@Index(['offerId', 'version'], { unique: true })
@Index(['status'])
export class ListingDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'integer', default: 1 })
  version: number; // версия черновика

  @Column({
    type: 'enum',
    enum: DraftStatus,
    default: DraftStatus.DRAFT,
  })
  status: DraftStatus;

  @Column({ type: 'varchar', length: 500 })
  title: string; // заголовок

  @Column({ type: 'text' })
  description: string; // описание

  @Column({ type: 'jsonb' })
  bullets: string[]; // характеристики

  @Column({ type: 'jsonb', nullable: true })
  images: {
    main?: string;
    additional?: string[];
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  attributes: {
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  seo: {
    keywords?: string[];
    metaDescription?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  validation: {
    errors?: string[];
    warnings?: string[];
    score?: number;
    lastValidated?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  llmGeneration: {
    templateId?: string;
    prompt?: string;
    response?: string;
    model?: string;
    temperature?: number;
    tokensUsed?: number;
    cost?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  review: {
    reviewedBy?: string;
    reviewedAt?: Date;
    notes?: string;
    score?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
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
