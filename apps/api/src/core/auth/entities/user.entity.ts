import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../rbac/enums/roles.enum';
import { Permission } from '../../rbac/enums/permissions.enum';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('users')
@Index(['email', 'tenantId'], { unique: true })
export class User extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 100, name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  // Custom permissions that override role-based permissions
  @Column({
    type: 'simple-array',
    nullable: true,
    name: 'custom_permissions',
  })
  customPermissions?: Permission[];

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_phone_verified' })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_2fa_enabled' })
  is2FAEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'two_fa_secret' })
  twoFASecret?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_login_ip' })
  lastLoginIp?: string;

  @Column({ type: 'int', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_until' })
  lockedUntil?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'reset_password_token' })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'reset_password_expires' })
  resetPasswordExpires?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email_verification_token' })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verification_expires' })
  emailVerificationExpires?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Tenant, { eager: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Virtual field for full name
  get fullName(): string {
    return this.middleName
      ? `${this.firstName} ${this.middleName} ${this.lastName}`
      : `${this.firstName} ${this.lastName}`;
  }

  // Check if account is locked
  get isLocked(): boolean {
    return this.lockedUntil ? new Date() < this.lockedUntil : false;
  }
}
