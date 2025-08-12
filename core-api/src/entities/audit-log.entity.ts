import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  PUBLISH = 'PUBLISH',
  SUSPEND = 'SUSPEND',
  SYNC = 'SYNC',
  PRICE_UPDATE = 'PRICE_UPDATE',
  STOCK_UPDATE = 'STOCK_UPDATE',
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_UPDATE = 'ORDER_UPDATE',
  INCIDENT_CREATE = 'INCIDENT_CREATE',
  INCIDENT_UPDATE = 'INCIDENT_UPDATE',
}

export enum AuditResource {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  MARKETPLACE_ACCOUNT = 'MARKETPLACE_ACCOUNT',
  PRODUCT = 'PRODUCT',
  OFFER = 'OFFER',
  PRICE_POLICY = 'PRICE_POLICY',
  STOCK = 'STOCK',
  SALES = 'SALES',
  SUPPLIER = 'SUPPLIER',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  LISTING_DRAFT = 'LISTING_DRAFT',
  AB_TEST = 'AB_TEST',
  INCIDENT = 'INCIDENT',
  SYSTEM = 'SYSTEM',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['resourceType', 'resourceId'])
@Index(['action'])
@Index(['timestamp'])
@Index(['merchantId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  merchantId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditResource })
  resourceType: AuditResource;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityType: string; // тип сущности для AI стратегий

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityId: string; // ID сущности для AI стратегий

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceName: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  context: {
    sessionId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    params?: Record<string, any>;
    headers?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed properties
  get hasChanges(): boolean {
    return !!this.oldValues || !!this.newValues;
  }

  get changeSummary(): string {
    if (!this.hasChanges) return 'No data changes';
    
    const changes: string[] = [];
    
    if (this.oldValues && this.newValues) {
      Object.keys(this.newValues).forEach(key => {
        if (this.oldValues[key] !== this.newValues[key]) {
          changes.push(`${key}: ${this.oldValues[key]} → ${this.newValues[key]}`);
        }
      });
    }
    
    return changes.length > 0 ? changes.join(', ') : 'No data changes';
  }

  get isDataChange(): boolean {
    return [AuditAction.CREATE, AuditAction.UPDATE, AuditAction.DELETE].includes(this.action);
  }

  get isSystemAction(): boolean {
    return [AuditAction.SYNC, AuditAction.PRICE_UPDATE, AuditAction.STOCK_UPDATE].includes(this.action);
  }
}
