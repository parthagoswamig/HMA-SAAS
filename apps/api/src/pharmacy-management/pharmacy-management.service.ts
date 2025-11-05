import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PharmacyManagementService {
  constructor(private prisma: PrismaService) {}

  async createMedication(createDto: any, tenantId: string) {
    const medication = await this.prisma.medication.create({
      data: { ...createDto, tenantId },
    });
    return { success: true, message: 'Medication created', data: medication };
  }

  async findAllMedications(tenantId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const [medications, total] = await Promise.all([
      this.prisma.medication.findMany({
        where: { tenantId, isActive: true },
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      this.prisma.medication.count({ where: { tenantId, isActive: true } }),
    ]);
    return {
      success: true,
      data: {
        items: medications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findAllOrders(tenantId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const [orders, total] = await Promise.all([
      this.prisma.pharmacyOrder.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { patient: true, items: { include: { medication: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pharmacyOrder.count({ where: { tenantId } }),
    ]);
    return {
      success: true,
      data: {
        items: orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async dispenseOrder(id: string, tenantId: string) {
    const order = await this.prisma.pharmacyOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');
    const updated = await this.prisma.pharmacyOrder.update({
      where: { id },
      data: { status: 'DISPENSED', dispensedDate: new Date() },
    });
    return { success: true, message: 'Order dispensed', data: updated };
  }

  async getStats(tenantId: string) {
    const [totalMedications, totalOrders, pendingOrders] = await Promise.all([
      this.prisma.medication.count({ where: { tenantId, isActive: true } }),
      this.prisma.pharmacyOrder.count({ where: { tenantId } }),
      this.prisma.pharmacyOrder.count({
        where: { tenantId, status: 'PENDING' },
      }),
    ]);
    return {
      success: true,
      data: { totalMedications, totalOrders, pendingOrders },
    };
  }
}
