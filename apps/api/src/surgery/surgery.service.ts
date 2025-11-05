import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurgeryService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: any, tenantId: string) {
    const surgery = await this.prisma.surgery.create({
      data: { ...createDto, tenantId },
      include: { patient: true, operationTheater: true },
    });
    return { success: true, message: 'Surgery scheduled', data: surgery };
  }

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 10, status } = query;
    const where: any = { tenantId, isActive: true };
    if (status) where.status = status;

    const [surgeries, total] = await Promise.all([
      this.prisma.surgery.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { patient: true, operationTheater: true },
        orderBy: { scheduledDate: 'asc' },
      }),
      this.prisma.surgery.count({ where }),
    ]);
    return {
      success: true,
      data: {
        items: surgeries,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const surgery = await this.prisma.surgery.findFirst({
      where: { id, tenantId, isActive: true },
      include: { patient: true, operationTheater: true },
    });
    if (!surgery) throw new NotFoundException('Surgery not found');
    return { success: true, data: surgery };
  }

  async update(id: string, updateDto: any, tenantId: string) {
    const surgery = await this.prisma.surgery.findFirst({
      where: { id, tenantId },
    });
    if (!surgery) throw new NotFoundException('Surgery not found');
    const updated = await this.prisma.surgery.update({
      where: { id },
      data: updateDto,
    });
    return { success: true, message: 'Surgery updated', data: updated };
  }

  async getUpcoming(tenantId: string) {
    const surgeries = await this.prisma.surgery.findMany({
      where: {
        tenantId,
        status: 'SCHEDULED',
        scheduledDate: { gte: new Date() },
      },
      include: { patient: true, operationTheater: true },
      orderBy: { scheduledDate: 'asc' },
      take: 10,
    });
    return { success: true, data: surgeries };
  }

  async getAvailableTheaters(tenantId: string) {
    const theaters = await this.prisma.operationTheater.findMany({
      where: { tenantId, isActive: true, status: 'AVAILABLE' },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: theaters };
  }

  async getStats(tenantId: string) {
    const [total, scheduled, inProgress, completed] = await Promise.all([
      this.prisma.surgery.count({ where: { tenantId, isActive: true } }),
      this.prisma.surgery.count({ where: { tenantId, status: 'SCHEDULED' } }),
      this.prisma.surgery.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      this.prisma.surgery.count({ where: { tenantId, status: 'COMPLETED' } }),
    ]);
    return { success: true, data: { total, scheduled, inProgress, completed } };
  }
}
