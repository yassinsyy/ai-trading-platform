import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

export type UserRole = 'owner' | 'manager' | 'operator' | 'readonly';
export type UserStatus = 'active' | 'inactive' | 'suspended';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string; // ID мерчанта

  @Column({ type: 'varchar', length: 100 })
  email: string; // email пользователя

  @Column({ type: 'varchar', length: 100 })
  username: string; // логин пользователя

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string; // хеш пароля

  @Column({ type: 'varchar', length: 100 })
  firstName: string; // имя

  @Column({ type: 'varchar', length: 100 })
  lastName: string; // фамилия

  @Column({ type: 'enum', enum: ['owner', 'manager', 'operator', 'readonly'], default: 'operator' })
  role: UserRole;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    canManageUsers?: boolean;
    canManagePricing?: boolean;
    canApprovePO?: boolean;
    canViewFinancials?: boolean;
    canManageContent?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date; // последний вход

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastLoginIp: string; // IP последнего входа

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean; // подтвержден ли email

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date; // когда подтвердили email

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    timezone?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      telegram?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  notes: string; // примечания

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.users)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;
}
