import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async findAllInvoices(tenantId: string, query: any) {
    const {
      page = 1,
      limit = 10,
      status,
      patientId,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          patient: true,
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: invoices,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneInvoice(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return { success: true, data: invoice };
  }

  async createPayment(createDto: any, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: createDto.invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber,
        ...createDto,
        tenantId,
      },
      include: {
        invoice: true,
      },
    });

    // Update invoice status
    const totalPaid = await this.prisma.payment.aggregate({
      where: { invoiceId: createDto.invoiceId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const paidAmount = totalPaid._sum.amount || 0;
    let newStatus = invoice.status;

    if (paidAmount >= invoice.totalAmount) {
      newStatus = 'PAID';
    } else if (paidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    await this.prisma.invoice.update({
      where: { id: createDto.invoiceId },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    };
  }

  async findAllPayments(tenantId: string, query: any) {
    const {
      page = 1,
      limit = 10,
      status,
      invoiceId,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (invoiceId) where.invoiceId = invoiceId;
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          invoice: {
            include: {
              patient: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: payments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOnePayment(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        invoice: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return { success: true, data: payment };
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

    // Group by date/month/year
    const grouped = payments.reduce((acc: any, payment) => {
      const date = new Date(payment.paymentDate);
      let key: string;

      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'year') {
        key = `${date.getFullYear()}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, methods: {} };
      }

      acc[key].total += payment.amount;
      acc[key].count += 1;
      acc[key].methods[payment.paymentMethod] =
        (acc[key].methods[payment.paymentMethod] || 0) + payment.amount;

      return acc;
    }, {});

    return {
      success: true,
      data: grouped,
    };
  }

  async getOutstandingReport(tenantId: string) {
    const outstandingInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
      },
      include: {
        patient: true,
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const report = outstandingInvoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const outstanding = invoice.totalAmount - paidAmount;

      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        patient: {
          id: invoice.patient.id,
          name: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
        },
        totalAmount: invoice.totalAmount,
        paidAmount,
        outstanding,
        dueDate: invoice.dueDate,
        overdue: new Date() > new Date(invoice.dueDate),
      };
    });

    const totalOutstanding = report.reduce((sum, r) => sum + r.outstanding, 0);

    return {
      success: true,
      data: {
        invoices: report,
        summary: {
          totalInvoices: report.length,
          totalOutstanding,
        },
      },
    };
  }

  async getStats(tenantId: string, query: any) {
    const { startDate, endDate } = query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
    }

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenue,
      outstandingAmount,
    ] = await Promise.all([
      this.prisma.invoice.count({
        where: {
          tenantId,
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
      }),
      this.prisma.invoice.count({
        where: {
          tenantId,
          status: 'PAID',
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
      }),
      this.prisma.invoice.count({
        where: {
          tenantId,
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          tenantId,
          status: 'COMPLETED',
          ...(Object.keys(dateFilter).length > 0
            ? { paymentDate: dateFilter }
            : {}),
        },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      success: true,
      data: {
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          pending: pendingInvoices,
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          outstanding: outstandingAmount._sum.totalAmount || 0,
        },
      },
    };
  }
}
