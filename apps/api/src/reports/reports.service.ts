import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const [
      totalPatients,
      todayAppointments,
      pendingInvoices,
      todayRevenue,
      labOrdersPending,
      pharmacyOrdersPending,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { tenantId, isActive: true } }),
      this.prisma.appointment.count({
        where: {
          tenantId,
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.invoice.count({
        where: { tenantId, status: { in: ['PENDING', 'PARTIALLY_PAID'] } },
      }),
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          status: 'COMPLETED',
          paymentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.labOrder.count({
        where: { tenantId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }),
      this.prisma.pharmacyOrder.count({
        where: { tenantId, status: 'PENDING' },
      }),
    ]);

    return {
      success: true,
      data: {
        patients: totalPatients,
        todayAppointments,
        pendingInvoices,
        todayRevenue: todayRevenue._sum.amount || 0,
        labOrdersPending,
        pharmacyOrdersPending,
      },
    };
  }

  async getPatientReport(tenantId: string, query: any) {
    const { startDate, endDate, groupBy = 'day' } = query;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, byGender, byAge] = await Promise.all([
      this.prisma.patient.count({ where }),
      this.prisma.patient.groupBy({
        by: ['gender'],
        where,
        _count: true,
      }),
      this.prisma.patient.findMany({
        where,
        select: { dateOfBirth: true },
      }),
    ]);

    // Calculate age distribution
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0,
    };
    byAge.forEach((p) => {
      if (p.dateOfBirth) {
        const age = Math.floor(
          (Date.now() - p.dateOfBirth.getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        );
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      }
    });

    return {
      success: true,
      data: {
        total,
        byGender,
        byAge: ageGroups,
      },
    };
  }

  async getAppointmentReport(tenantId: string, query: any) {
    const { startDate, endDate } = query;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [total, byStatus, byDoctor] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.appointment.groupBy({
        by: ['doctorId'],
        where,
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byStatus,
        byDoctor: byDoctor.length,
      },
    };
  }

  async getRevenueReport(tenantId: string, query: any) {
    const { startDate, endDate, groupBy = 'day' } = query;

    const where: any = { tenantId, status: 'COMPLETED' };
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        amount: true,
        paymentDate: true,
        paymentMethod: true,
      },
      orderBy: { paymentDate: 'asc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod = payments.reduce((acc: any, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        totalRevenue,
        byMethod,
        count: payments.length,
      },
    };
  }

  async getLabReport(tenantId: string, query: any) {
    const { startDate, endDate } = query;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [total, byStatus, topTests] = await Promise.all([
      this.prisma.labOrder.count({ where }),
      this.prisma.labOrder.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.labOrderTest.groupBy({
        by: ['testId'],
        where: { tenantId },
        _count: true,
        orderBy: { _count: { testId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byStatus,
        topTests: topTests.length,
      },
    };
  }

  async getPharmacyReport(tenantId: string, query: any) {
    const { startDate, endDate } = query;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [total, byStatus, topMedications] = await Promise.all([
      this.prisma.pharmacyOrder.count({ where }),
      this.prisma.pharmacyOrder.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.pharmacyOrderItem.groupBy({
        by: ['medicationId'],
        where: { tenantId },
        _count: true,
        orderBy: { _count: { medicationId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byStatus,
        topMedications: topMedications.length,
      },
    };
  }
}
