import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Tenant,
  TenantType,
  TenantStatus,
  SubscriptionPlan,
} from '../entities/tenant.entity';

export interface CreateTenantDto {
  name: string;
  slug?: string;
  type: TenantType;
  email?: string;
  phone?: string;
  subscriptionPlan?: SubscriptionPlan;
  trialDays?: number;
  settings?: any;
}

export interface UpdateTenantDto {
  name?: string;
  status?: TenantStatus;
  type?: TenantType;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  licenseNumber?: string;
  registrationNumber?: string;
  taxId?: string;
  settings?: any;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  billingEmail?: string;
}

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new tenant
   */
  async create(createDto: CreateTenantDto): Promise<Tenant> {
    // Generate slug from name if not provided
    const slug = createDto.slug || this.generateSlug(createDto.name);

    // Check if slug already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    // Set trial period if free plan
    const trialEndsAt =
      createDto.subscriptionPlan === SubscriptionPlan.FREE
        ? new Date(Date.now() + (createDto.trialDays || 14) * 24 * 60 * 60 * 1000)
        : null;

    const tenant = this.tenantRepository.create({
      ...createDto,
      slug,
      status: TenantStatus.TRIAL,
      trialEndsAt,
      settings: this.getDefaultSettings(createDto.type),
    });

    return this.tenantRepository.save(tenant);
  }

  /**
   * Find tenant by ID
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { slug } });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Find all tenants (with pagination)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: TenantStatus,
  ): Promise<{ data: Tenant[]; total: number }> {
    const [data, total] = await this.tenantRepository.findAndCount({
      where: status ? { status } : {},
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Update tenant
   */
  async update(id: string, updateDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    Object.assign(tenant, updateDto);

    return this.tenantRepository.save(tenant);
  }

  /**
   * Activate tenant
   */
  async activate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.ACTIVE;
    return this.tenantRepository.save(tenant);
  }

  /**
   * Suspend tenant
   */
  async suspend(id: string, reason?: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.SUSPENDED;
    tenant.metadata = {
      ...tenant.metadata,
      suspensionReason: reason,
      suspendedAt: new Date(),
    };
    return this.tenantRepository.save(tenant);
  }

  /**
   * Deactivate tenant
   */
  async deactivate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.INACTIVE;
    return this.tenantRepository.save(tenant);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    id: string,
    plan: SubscriptionPlan,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.subscriptionPlan = plan;
    tenant.subscriptionStartDate = startDate || new Date();
    tenant.subscriptionEndDate = endDate;
    tenant.status = TenantStatus.ACTIVE;

    // Update limits based on plan
    tenant.settings = {
      ...tenant.settings,
      limits: this.getPlanLimits(plan),
    };

    return this.tenantRepository.save(tenant);
  }

  /**
   * Check if tenant has reached limits
   */
  async checkLimits(
    tenantId: string,
    resource: string,
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const tenant = await this.findOne(tenantId);
    const limits = tenant.settings?.limits || {};
    const limit = limits[`max${resource}`] || Infinity;

    // TODO: Query actual resource count from database
    const current = 0;

    return {
      allowed: current < limit,
      current,
      limit,
    };
  }

  /**
   * Soft delete tenant
   */
  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.softRemove(tenant);
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get default settings based on tenant type
   */
  private getDefaultSettings(type: TenantType): any {
    const baseSettings = {
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'USD',
      language: 'en',
    };

    const features = {
      appointments: true,
      laboratory: type !== TenantType.PHARMACY,
      pharmacy: true,
      billing: true,
      inventory: true,
      reporting: true,
    };

    return {
      ...baseSettings,
      features,
      limits: this.getPlanLimits(SubscriptionPlan.FREE),
    };
  }

  /**
   * Get limits based on subscription plan
   */
  private getPlanLimits(plan: SubscriptionPlan): any {
    const limits = {
      [SubscriptionPlan.FREE]: {
        maxUsers: 5,
        maxPatients: 100,
        maxAppointments: 50,
        storageGB: 1,
      },
      [SubscriptionPlan.BASIC]: {
        maxUsers: 20,
        maxPatients: 1000,
        maxAppointments: 500,
        storageGB: 10,
      },
      [SubscriptionPlan.PROFESSIONAL]: {
        maxUsers: 100,
        maxPatients: 10000,
        maxAppointments: 5000,
        storageGB: 100,
      },
      [SubscriptionPlan.ENTERPRISE]: {
        maxUsers: Infinity,
        maxPatients: Infinity,
        maxAppointments: Infinity,
        storageGB: 1000,
      },
    };

    return limits[plan];
  }
}
