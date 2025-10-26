import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma, TenantType } from '@prisma/client';
import { CreateTenantDto, UpdateTenantDto, TenantQueryDto } from './dto/tenant.dto';

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

  async findAll(query: TenantQueryDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              patients: true,
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
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
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            appointments: true,
            invoices: true,
          },
        },
      },
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
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      success: true,
      data: tenant,
    };
  }

  async update(id: string, updateDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: updateDto,
    });

    return {
      success: true,
      message: 'Tenant updated successfully',
      data: updated,
    };
  }

  async delete(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant has associated data
    if (tenant._count.users > 0 || tenant._count.patients > 0) {
      throw new BadRequestException(
        'Cannot delete tenant with associated users or patients. Please deactivate instead.',
      );
    }

    // Soft delete by setting deletedAt
    const deleted = await this.prisma.tenant.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Tenant deleted successfully',
      data: deleted,
    };
  }

  async getStats(tenantId: string) {
    const [users, patients, appointments, revenue] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.appointment.count({ where: { tenantId } }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      success: true,
      data: {
        users,
        patients,
        appointments,
        revenue: revenue._sum.amount || 0,
      },
    };
  }
}
