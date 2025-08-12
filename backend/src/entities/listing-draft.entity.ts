import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Offer } from './offer.entity';

export type DraftStatus = 'draft' | 'validated' | 'approved' | 'published' | 'rejected';

@Entity('listing_drafts')
export class ListingDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  offerId: string;

  @Column({ type: 'integer' })
  version: number; // версия черновика

  @Column({ type: 'varchar', length: 500 })
  title: string; // заголовок

  @Column({ type: 'jsonb' })
  bullets: string[]; // буллеты характеристик

  @Column({ type: 'text' })
  description: string; // описание

  @Column({ type: 'jsonb' })
  images: {
    main?: string; // главное изображение
    additional?: string[]; // дополнительные изображения
    [key: string]: any;
  };

  @Column({ type: 'enum', enum: ['draft', 'validated', 'approved', 'published', 'rejected'], default: 'draft' })
  status: DraftStatus;

  @Column({ type: 'jsonb', nullable: true })
  validationResults: {
    errors?: string[]; // ошибки валидации
    warnings?: string[]; // предупреждения
    score?: number; // оценка качества (0-100)
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  marketplaceData: {
    externalId?: string; // ID на маркетплейсе
    publishedAt?: Date; // когда опубликовали
    [key: string]: any;
  };

  @Column({ type: 'uuid', nullable: true })
  createdBy: string; // кто создал

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string; // кто одобрил

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date; // когда одобрили

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Offer, offer => offer.listingDrafts)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;
}
