import { Injectable, Logger } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: CustomPrismaService) {}

  async getStats(tenantId: string, user: any) {
    try {
      // Get counts based on user role
      const isPatient = user.role === 'PATIENT';
      
      if (isPatient) {
        // Patient-specific stats
        const [appointments, bills, records, prescriptions] = await Promise.all([
          this.prisma.appointment.count({
            where: {
              tenantId,
              patient: { email: user.email },
            },
          }),
          this.prisma.invoice.count({
            where: {
              tenantId,
              patient: { email: user.email },
              status: 'PENDING',
            },
          }),
          this.prisma.medicalRecord.count({
            where: {
              tenantId,
              patient: { email: user.email },
            },
          }),
          this.prisma.prescription.count({
            where: {
              tenantId,
              patient: { email: user.email },
            },
          }),
        ]);

        return {
          success: true,
          data: {
            myAppointments: appointments,
            pendingBills: bills,
            medicalRecords: records,
            prescriptions: prescriptions,
          },
        };
      } else {
        // Staff/Admin stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
          totalPatients,
          todaysAppointments,
          pendingBills,
          activeDoctors,
          totalAppointments,
          totalRevenue,
          activeStaff,
          availableBeds,
        ] = await Promise.all([
          this.prisma.patient.count({
            where: { tenantId, isActive: true },
          }),
          this.prisma.appointment.count({
            where: {
              tenantId,
              startTime: {
                gte: today,
                lt: tomorrow,
              },
            },
          }),
          this.prisma.invoice.count({
            where: {
              tenantId,
              status: 'PENDING',
            },
          }),
          this.prisma.user.count({
            where: {
              tenantId,
              role: 'DOCTOR',
              isActive: true,
            },
          }),
          this.prisma.appointment.count({
            where: { tenantId },
          }),
          this.prisma.payment.aggregate({
            where: {
              tenantId,
              status: 'COMPLETED',
            },
            _sum: {
              amount: true,
            },
          }),
          this.prisma.staff.count({
            where: {
              tenantId,
              isActive: true,
            },
          }),
          this.prisma.bed.count({
            where: {
              tenantId,
              status: 'AVAILABLE',
            },
          }),
        ]);

        return {
          success: true,
          data: {
            totalPatients,
            todaysAppointments,
            pendingBills,
            activeDoctors,
            totalAppointments,
            totalRevenue: totalRevenue._sum.amount || 0,
            activeStaff,
            availableBeds,
          },
        };
      }
    } catch (error) {
      this.logger.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        data: {
          totalPatients: 0,
          todaysAppointments: 0,
          pendingBills: 0,
          activeDoctors: 0,
        },
      };
    }
  }

  async getRecentActivities(tenantId: string, user: any) {
    try {
      const activities = await this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      return {
        success: true,
        data: activities.map((activity) => ({
          id: activity.id,
          action: activity.action,
          entityType: activity.entityType,
          entityId: activity.entityId,
          user: `${activity.user.firstName} ${activity.user.lastName}`,
          userRole: activity.user.role,
          timestamp: activity.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error('Error fetching recent activities:', error);
      return {
        success: false,
        error: 'Failed to fetch recent activities',
        data: [],
      };
    }
  }

  async getTodaysAppointments(tenantId: string, user: any) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const whereClause: any = {
        tenantId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      };

      // Filter by doctor if user is a doctor
      if (user.role === 'DOCTOR') {
        whereClause.doctorId = user.userId;
      }
      // Filter by patient if user is a patient
      else if (user.role === 'PATIENT') {
        whereClause.patient = { email: user.email };
      }

      const appointments = await this.prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
      });

      return {
        success: true,
        data: appointments.map((apt) => ({
          id: apt.id,
          patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
          patientPhone: apt.patient.phone,
          doctorName: `${apt.doctor.firstName} ${apt.doctor.lastName}`,
          department: apt.department?.name,
          startTime: apt.startTime,
          endTime: apt.endTime,
          status: apt.status,
          reason: apt.reason,
        })),
      };
    } catch (error) {
      this.logger.error('Error fetching today\'s appointments:', error);
      return {
        success: false,
        error: 'Failed to fetch today\'s appointments',
        data: [],
      };
    }
  }

  async getRevenueOverview(tenantId: string, user: any) {
    try {
      // Only allow admin and accountant roles to view revenue
      if (!['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'ADMIN', 'ACCOUNTANT'].includes(user.role)) {
        return {
          success: false,
          error: 'Unauthorized to view revenue data',
          data: null,
        };
      }

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const [todayRevenue, monthRevenue, yearRevenue, pendingPayments] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            tenantId,
            status: 'COMPLETED',
            paymentDate: {
              gte: new Date(today.setHours(0, 0, 0, 0)),
            },
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            tenantId,
            status: 'COMPLETED',
            paymentDate: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            tenantId,
            status: 'COMPLETED',
            paymentDate: { gte: startOfYear },
          },
          _sum: { amount: true },
        }),
        this.prisma.invoice.aggregate({
          where: {
            tenantId,
            status: 'PENDING',
          },
          _sum: { totalAmount: true },
        }),
      ]);

      // Get monthly revenue trend for chart
      const monthlyRevenue = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "paymentDate") as month,
          SUM(amount) as revenue
        FROM "Payment"
        WHERE "tenantId" = ${tenantId}
          AND status = 'COMPLETED'
          AND "paymentDate" >= ${startOfYear}
        GROUP BY DATE_TRUNC('month', "paymentDate")
        ORDER BY month
      `;

      return {
        success: true,
        data: {
          todayRevenue: todayRevenue._sum.amount || 0,
          monthRevenue: monthRevenue._sum.amount || 0,
          yearRevenue: yearRevenue._sum.amount || 0,
          pendingPayments: pendingPayments._sum.totalAmount || 0,
          monthlyTrend: monthlyRevenue,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching revenue overview:', error);
      return {
        success: false,
        error: 'Failed to fetch revenue overview',
        data: null,
      };
    }
  }
}
