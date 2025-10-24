import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { TenantType } from '@prisma/client';

export interface CreateTenantDto {
  name: string;
  slug: string;
  type: TenantType;
  address?: string;
  phone?: string;
  email?: string;
}

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: CustomPrismaService) {}

  async create(createDto: CreateTenantDto) {
    // Check if slug exists
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    // Convert type to uppercase to match Prisma enum
    const tenantType = typeof createDto.type === 'string' 
      ? (createDto.type.toUpperCase() as TenantType)
      : createDto.type;

    const tenant = await this.prisma.tenant.create({
      data: {
        name: createDto.name,
        slug: createDto.slug,
        type: tenantType,
        address: createDto.address,
        phone: createDto.phone,
        email: createDto.email,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'Tenant created successfully',
      data: tenant,
    };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      success: true,
      data: {
        items: tenants,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      success: true,
      data: tenant,
    };
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      success: true,
      data: tenant,
    };
  }
}
