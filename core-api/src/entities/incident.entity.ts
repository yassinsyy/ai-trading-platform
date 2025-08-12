import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IncidentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IncidentType {
  PRICING_ERROR = 'pricing_error',
  SYNC_FAILURE = 'sync_failure',
  API_ERROR = 'api_error',
  SYSTEM_ERROR = 'system_error',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  OTHER = 'other',
}

@Entity('incidents')
@Index(['status', 'severity'])
@Index(['createdAt'])
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
    default: IncidentSeverity.MEDIUM,
  })
  severity: IncidentSeverity;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.OPEN,
  })
  status: IncidentStatus;

  @Column({ type: 'varchar', length: 255 })
  title: string; // краткое описание

  @Column({ type: 'text' })
  description: string; // детальное описание

  @Column({ type: 'jsonb', nullable: true })
  affectedSystems: string[]; // затронутые системы

  @Column({ type: 'jsonb', nullable: true })
  affectedEntities: {
    type: string; // offer, product, marketplace, etc.
    id: string;
    name?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  context: {
    errorCode?: string;
    stackTrace?: string;
    requestData?: any;
    responseData?: any;
    [key: string]: any;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignedTo: string; // назначенный сотрудник

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date; // время подтверждения

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date; // время решения

  @Column({ type: 'text', nullable: true })
  resolution: string; // описание решения

  @Column({ type: 'jsonb', nullable: true })
  timeline: {
    timestamp: Date;
    action: string;
    actor: string;
    details?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    tags?: string[];
    priority?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
