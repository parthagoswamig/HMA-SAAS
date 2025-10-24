import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  EXPORT = 'export',
  PRINT = 'print',
  SHARE = 'share',
  APPROVE = 'approve',
  REJECT = 'reject',
  SIGN = 'sign',
}

export enum AuditEntityType {
  USER = 'user',
  PATIENT = 'patient',
  APPOINTMENT = 'appointment',
  MEDICAL_RECORD = 'medical_record',
  PRESCRIPTION = 'prescription',
  LAB_ORDER = 'lab_order',
  LAB_RESULT = 'lab_result',
  BILLING = 'billing',
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  INVENTORY = 'inventory',
  MEDICATION = 'medication',
  TENANT = 'tenant',
  SETTING = 'setting',
}

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['entityType', 'entityId'])
export class AuditLog extends TenantBaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255, name: 'user_email' })
  userEmail: string;

  @Column({ type: 'varchar', length: 100, name: 'user_role' })
  userRole: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Index()
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntityType,
    name: 'entity_type',
  })
  @Index()
  entityType: AuditEntityType;

  @Column({ type: 'varchar', length: 255, name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // HTTP Request Info
  @Column({ type: 'varchar', length: 10, nullable: true })
  method?: string;

  @Column({ type: 'text', nullable: true })
  endpoint?: string;

  @Column({ type: 'int', nullable: true, name: 'status_code' })
  statusCode?: number;

  // Client Info
  @Column({ type: 'varchar', length: 100, name: 'ip_address', nullable: true })
  @Index()
  ipAddress?: string;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string;

  // Data Changes (for UPDATE actions)
  @Column({ type: 'jsonb', nullable: true, name: 'old_values' })
  oldValues?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'new_values' })
  newValues?: Record<string, any>;

  // Additional Context
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    reason?: string;
    approvedBy?: string;
    notes?: string;
    [key: string]: any;
  };

  // Security flags
  @Column({ type: 'boolean', default: false, name: 'is_sensitive' })
  isSensitive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_suspicious' })
  isSuspicious: boolean;

  @Column({ type: 'boolean', default: false, name: 'requires_review' })
  requiresReview: boolean;

  // Performance tracking
  @Column({ type: 'int', nullable: true, name: 'duration_ms' })
  durationMs?: number;
}
