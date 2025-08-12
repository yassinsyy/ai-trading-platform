import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type AuditScope = 'product' | 'offer' | 'pricing' | 'purchase_order' | 'supplier' | 'marketplace' | 'user' | 'system';
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'publish' | 'price_change' | 'status_change';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  actorId: string; // ID пользователя или системы, который выполнил действие

  @Column({ type: 'varchar', length: 50 })
  actorType: string; // тип актора (user, system, integration)

  @Column({ type: 'enum', enum: ['product', 'offer', 'pricing', 'purchase_order', 'supplier', 'marketplace', 'user', 'system'] })
  scope: AuditScope;

  @Column({ type: 'enum', enum: ['create', 'update', 'delete', 'approve', 'reject', 'publish', 'price_change', 'status_change'] })
  action: AuditAction;

  @Column({ type: 'uuid', nullable: true })
  entityId: string; // ID сущности, к которой относится действие

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType: string; // тип сущности

  @Column({ type: 'jsonb' })
  payload: {
    before?: any; // состояние до изменения
    after?: any; // состояние после изменения
    changes?: string[]; // список измененных полей
    reason?: string; // причина изменения
    metadata?: any; // дополнительная информация
    [key: string]: any;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string; // IP адрес

  @Column({ type: 'varchar', length: 200, nullable: true })
  userAgent: string; // User Agent

  @Column({ type: 'jsonb', nullable: true })
  context: {
    sessionId?: string; // ID сессии
    requestId?: string; // ID запроса
    marketplace?: string; // маркетплейс (если применимо)
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;
}
