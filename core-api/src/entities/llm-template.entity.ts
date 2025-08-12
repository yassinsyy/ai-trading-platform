import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('llm_templates')
@Index(['category', 'marketplace'], { unique: true })
export class LLMTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  category: string; // категория товара

  @Column({ type: 'varchar', length: 50 })
  marketplace: string; // маркетплейс

  @Column({ type: 'text' })
  promptText: string; // основной промпт

  @Column({ type: 'jsonb' })
  rules: {
    maxTitleLength?: number;
    maxBulletsCount?: number;
    maxBulletLength?: number;
    maxDescriptionLength?: number;
    forbiddenWords?: string[];
    requiredElements?: string[];
    tone?: string; // formal, friendly, professional
    language?: string; // ru, en, kz
  };

  @Column({ type: 'jsonb', nullable: true })
  examples: {
    good?: string[];
    bad?: string[];
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  constraints: {
    minWords?: number;
    maxWords?: number;
    keywords?: string[];
    brandGuidelines?: string[];
  };

  @Column({ type: 'varchar', length: 50, default: 'gpt-4' })
  model: string; // модель LLM

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  temperature: number; // креативность (0-1)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  usageCount: number; // количество использований

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  successRate: number; // успешность генерации (0-1)

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    author?: string;
    version?: string;
    lastTested?: Date;
    notes?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
