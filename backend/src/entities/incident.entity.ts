import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type IncidentType = 'integration_error' | 'pricing_violation' | 'stock_shortage' | 'quality_issue' | 'compliance_warning' | 'system_error';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['integration_error', 'pricing_violation', 'stock_shortage', 'quality_issue', 'compliance_warning', 'system_error'] })
  type: IncidentType;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'critical'] })
  severity: IncidentSeverity;

  @Column({ type: 'enum', enum: ['open', 'investigating', 'resolved', 'closed'], default: 'open' })
  status: IncidentStatus;

  @Column({ type: 'varchar', length: 200 })
  title: string; // краткое описание инцидента

  @Column({ type: 'text' })
  description: string; // детальное описание

  @Column({ type: 'jsonb' })
  context: {
    entityType?: string; // тип сущности (offer, product, supplier, etc.)
    entityId?: string; // ID сущности
    marketplace?: string; // маркетплейс (если применимо)
    errorCode?: string; // код ошибки
    stackTrace?: string; // стек трейс (для системных ошибок)
    [key: string]: any;
  };

  @Column({ type: 'uuid', nullable: true })
  handledBy: string; // кто обрабатывает инцидент

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date; // когда назначили

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date; // когда разрешили

  @Column({ type: 'text', nullable: true })
  resolution: string; // описание решения

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[]; // теги для группировки
    priority?: number; // приоритет (1-5)
    estimatedResolutionTime?: number; // оценка времени решения в часах
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
