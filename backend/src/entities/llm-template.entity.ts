import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('llm_templates')
export class LLMTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  category: string; // категория товара

  @Column({ type: 'varchar', length: 50, nullable: true })
  marketplace: string; // для какого маркетплейса

  @Column({ type: 'text' })
  promptText: string; // текст промпта для LLM

  @Column({ type: 'jsonb' })
  rules: {
    maxTitleLength?: number; // максимальная длина заголовка
    maxBulletsCount?: number; // максимальное количество буллетов
    maxBulletLength?: number; // максимальная длина буллета
    maxDescriptionLength?: number; // максимальная длина описания
    forbiddenWords?: string[]; // запрещенные слова
    requiredFields?: string[]; // обязательные поля
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  examples: {
    goodTitle?: string; // пример хорошего заголовка
    goodBullets?: string[]; // примеры хороших буллетов
    goodDescription?: string; // пример хорошего описания
  };

  @Column({ type: 'jsonb', nullable: true })
  marketplaceSpecific: {
    kaspi?: {
      [key: string]: any;
    };
    wb?: {
      [key: string]: any;
    };
    ozon?: {
      [key: string]: any;
    };
    amazon?: {
      [key: string]: any;
    };
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 1 })
  version: number; // версия шаблона

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
