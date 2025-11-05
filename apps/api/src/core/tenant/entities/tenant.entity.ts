import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

export enum TenantType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  DIAGNOSTIC_CENTER = 'diagnostic_center',
  PHARMACY = 'pharmacy',
  LABORATORY = 'laboratory',
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  PENDING = 'pending',
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  slug: string;

  @Column({
    type: 'enum',
    enum: TenantType,
    default: TenantType.CLINIC,
  })
  type: TenantType;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PENDING,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
    name: 'subscription_plan',
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_start_date' })
  subscriptionStartDate?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_end_date' })
  subscriptionEndDate?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'trial_ends_at' })
  trialEndsAt?: Date;

  // Contact Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  // Address
  @Column({ type: 'text', nullable: true, name: 'address_line1' })
  addressLine1?: string;

  @Column({ type: 'text', nullable: true, name: 'address_line2' })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'postal_code' })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  // Licensing & Registration
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'license_number' })
  licenseNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'registration_number' })
  registrationNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tax_id' })
  taxId?: string;

  // Configuration
  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    currency?: string;
    language?: string;
    features?: {
      appointments?: boolean;
      laboratory?: boolean;
      pharmacy?: boolean;
      billing?: boolean;
      inventory?: boolean;
      reporting?: boolean;
    };
    limits?: {
      maxUsers?: number;
      maxPatients?: number;
      maxAppointments?: number;
      storageGB?: number;
    };
  };

  // Branding
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo_url' })
  logoUrl?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'primary_color' })
  primaryColor?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'secondary_color' })
  secondaryColor?: string;

  // Billing
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'billing_email' })
  billingEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'stripe_subscription_id' })
  stripeSubscriptionId?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  // Virtual fields
  get isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  get isTrialActive(): boolean {
    return (
      this.status === TenantStatus.TRIAL &&
      this.trialEndsAt &&
      new Date() < this.trialEndsAt
    );
  }

  get isSubscriptionActive(): boolean {
    return (
      this.subscriptionEndDate &&
      new Date() < this.subscriptionEndDate
    );
  }
}
