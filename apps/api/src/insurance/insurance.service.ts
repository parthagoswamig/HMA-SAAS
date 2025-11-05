import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: any, tenantId: string) {
    const claim = await this.prisma.insuranceClaim.create({
      data: { ...createDto, tenantId },
      include: { patient: true },
    });
    return { success: true, message: 'Claim created', data: claim };
  }

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 10, status } = query;
    const where: any = { tenantId, isActive: true };
    if (status) where.status = status;

    const [claims, total] = await Promise.all([
      this.prisma.insuranceClaim.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { patient: true },
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.insuranceClaim.count({ where }),
    ]);
    return {
      success: true,
      data: {
        items: claims,
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
    const claim = await this.prisma.insuranceClaim.findFirst({
      where: { id, tenantId, isActive: true },
      include: { patient: true },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return { success: true, data: claim };
  }

  async update(id: string, updateDto: any, tenantId: string) {
    const claim = await this.prisma.insuranceClaim.findFirst({
      where: { id, tenantId },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    const updated = await this.prisma.insuranceClaim.update({
      where: { id },
      data: updateDto,
    });
    return { success: true, message: 'Claim updated', data: updated };
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    const claim = await this.prisma.insuranceClaim.findFirst({
      where: { id, tenantId },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    const updateData: any = { status: status as any };
    if (status === 'APPROVED') updateData.approvedAt = new Date();
    if (status === 'PAID') updateData.paidAt = new Date();

    const updated = await this.prisma.insuranceClaim.update({
      where: { id },
      data: updateData,
    });
    return { success: true, message: 'Claim status updated', data: updated };
  }

  async getStats(tenantId: string) {
    const [total, submitted, approved, paid, totalAmount] = await Promise.all([
      this.prisma.insuranceClaim.count({ where: { tenantId, isActive: true } }),
      this.prisma.insuranceClaim.count({
        where: { tenantId, status: 'SUBMITTED' },
      }),
      this.prisma.insuranceClaim.count({
        where: { tenantId, status: 'APPROVED' },
      }),
      this.prisma.insuranceClaim.count({ where: { tenantId, status: 'PAID' } }),
      this.prisma.insuranceClaim.aggregate({
        where: { tenantId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);
    return {
      success: true,
      data: {
        total,
        submitted,
        approved,
        paid,
        totalAmount: totalAmount._sum.amount || 0,
      },
    };
  }
}
