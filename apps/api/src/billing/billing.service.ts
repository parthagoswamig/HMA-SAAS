import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  InvoiceFilterDto,
  PaymentFilterDto,
} from './dto/billing.dto';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private prisma: CustomPrismaService) {}

  // ==================== Helper Methods ====================

  /**
   * Get invoice include options
   */
  private getInvoiceIncludes() {
    return {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          medicalRecordNumber: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          email: true,
        },
      },
      items: true,
      payments: {
        orderBy: {
          paymentDate: 'desc' as const,
        },
      },
    };
  }

  /**
   * Get payment include options
   */
  private getPaymentIncludes() {
    return {
      invoice: {
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
            },
          },
        },
      },
    };
  }

  /**
   * Build where clause for invoice queries
   */
  private buildInvoiceWhereClause(tenantId: string, filters: any) {
    const { patientId, status, startDate, endDate, search } = filters;
    const where: any = { tenantId };

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  /**
   * Build where clause for payment queries
   */
  private buildPaymentWhereClause(tenantId: string, filters: any) {
    const { invoiceId, paymentMethod, status, startDate, endDate } = filters;
    const where: any = { tenantId };

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    return where;
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(page: any, limit: any): { page: number; limit: number } {
    const validatedPage = Math.max(1, parseInt(page?.toString() || '1', 10));
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit?.toString() || '10', 10)));
    
    return { page: validatedPage, limit: validatedLimit };
  }

  /**
   * Generate unique invoice number
   * Format: INV-YYYYMM-XXXXXX
   */
  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}`;

    // Get the latest invoice for this month
    const latestInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let sequence = 1;
    if (latestInvoice) {
      const lastNumber = latestInvoice.invoiceNumber.split('-')[2];
      sequence = parseInt(lastNumber, 10) + 1;
    }

    return `${prefix}-${String(sequence).padStart(6, '0')}`;
  }

  /**
   * Generate unique payment number
   * Format: PAY-YYYYMM-XXXXXX
   */
  private async generatePaymentNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `PAY-${year}${month}`;

    // Get the latest payment for this month
    const latestPayment = await this.prisma.payment.findFirst({
      where: {
        tenantId,
        paymentNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let sequence = 1;
    if (latestPayment) {
      const lastNumber = latestPayment.paymentNumber.split('-')[2];
      sequence = parseInt(lastNumber, 10) + 1;
    }

    return `${prefix}-${String(sequence).padStart(6, '0')}`;
  }

  /**
   * Calculate invoice totals
   */
  private calculateInvoiceTotals(
    items: Array<{
      quantity: number;
      unitPrice: number;
      discount?: number;
      taxRate?: number;
    }>,
    globalDiscount: number = 0,
  ) {
    let subTotal = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemAfterDiscount = itemSubtotal - itemDiscount;
      const itemTax = (itemAfterDiscount * (item.taxRate || 0)) / 100;

      subTotal += itemSubtotal;
      totalTax += itemTax;
    });

    const totalAmount = subTotal - globalDiscount + totalTax;

    return {
      subTotal,
      taxAmount: totalTax,
      discountAmount: globalDiscount,
      totalAmount,
    };
  }

  /**
   * Create a new invoice
   */
  async createInvoice(dto: CreateInvoiceDto, tenantId: string) {
    try {
      // Verify patient exists
      const patient = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(tenantId);

      // Calculate totals
      const totals = this.calculateInvoiceTotals(
        dto.items,
        dto.discountAmount || 0,
      );

      // Create invoice with items in a transaction
      const invoice = await this.prisma.$transaction(async (prisma) => {
        // Create invoice
        const newInvoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            patientId: dto.patientId,
            date: dto.date ? new Date(dto.date) : new Date(),
            dueDate: new Date(dto.dueDate),
            status: InvoiceStatus.PENDING,
            subTotal: totals.subTotal,
            taxAmount: totals.taxAmount,
            discountAmount: totals.discountAmount,
            totalAmount: totals.totalAmount,
            notes: dto.notes,
            tenantId,
            createdBy: dto.createdBy,
          },
        });

        // Create invoice items
        const itemsData = dto.items.map((item) => {
          const itemTotal =
            item.quantity * item.unitPrice -
            (item.discount || 0) +
            ((item.quantity * item.unitPrice - (item.discount || 0)) *
              (item.taxRate || 0)) /
              100;

          return {
            invoiceId: newInvoice.id,
            itemType: item.itemType,
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            taxRate: item.taxRate || 0,
            totalAmount: itemTotal,
            tenantId,
          };
        });

        await prisma.invoiceItem.createMany({
          data: itemsData,
        });

        // Return invoice with items
        return prisma.invoice.findUnique({
          where: { id: newInvoice.id },
          include: {
            patient: true,
            items: true,
            payments: true,
          },
        });
      });

      this.logger.log(
        `Invoice created: ${invoiceNumber} for tenant ${tenantId}`,
      );
      return invoice;
    } catch (error) {
      this.logger.error(
        `Failed to create invoice: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all invoices with filters
   */
  async getInvoices(filters: InvoiceFilterDto, tenantId: string) {
    try {
      this.logger.log(`Finding invoices for tenant: ${tenantId} with filters:`, filters);
      
      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildInvoiceWhereClause(tenantId, filters);

      const [invoices, total] = await Promise.all([
        this.prisma.invoice.findMany({
          where,
          skip,
          take: limit,
          include: this.getInvoiceIncludes(),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.invoice.count({ where }),
      ]);

      this.logger.log(`Found ${invoices.length} invoices out of ${total} total`);
      return {
        data: invoices,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error finding invoices:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch invoices');
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding invoice with ID: ${id} for tenant: ${tenantId}`);
      
      const invoice = await this.prisma.invoice.findFirst({
        where: { id, tenantId },
        include: this.getInvoiceIncludes(),
      });

      if (!invoice) {
        this.logger.warn(`Invoice not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Invoice not found');
      }

      this.logger.log(`Successfully found invoice: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding invoice:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch invoice');
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, dto: UpdateInvoiceDto, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        discountAmount: dto.discountAmount,
        notes: dto.notes,
        updatedBy: dto.updatedBy,
      },
      include: {
        patient: true,
        items: true,
        payments: true,
      },
    });

    this.logger.log(`Invoice updated: ${invoice.invoiceNumber}`);
    return updatedInvoice;
  }

  /**
   * Delete invoice (soft delete by marking as cancelled)
   */
  async deleteInvoice(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    if (invoice.payments.length > 0) {
      throw new BadRequestException(
        'Cannot delete invoice with existing payments',
      );
    }

    const deletedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
      },
    });

    this.logger.log(`Invoice cancelled: ${invoice.invoiceNumber}`);
    return deletedInvoice;
  }

  /**
   * Create a payment for an invoice
   */
  async createPayment(dto: CreatePaymentDto, tenantId: string) {
    try {
      // Verify invoice exists
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: dto.invoiceId, tenantId },
        include: { payments: true },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException(
          'Cannot add payment to a cancelled invoice',
        );
      }

      // Calculate total paid amount
      const totalPaid = invoice.payments.reduce((sum, payment) => {
        if (payment.status === PaymentStatus.COMPLETED) {
          return sum + payment.amount;
        }
        return sum;
      }, 0);

      const remainingAmount = invoice.totalAmount - totalPaid;

      if (dto.amount > remainingAmount) {
        throw new BadRequestException(
          `Payment amount (${dto.amount}) exceeds remaining balance (${remainingAmount})`,
        );
      }

      // Generate payment number
      const paymentNumber = await this.generatePaymentNumber(tenantId);

      // Create payment and update invoice status
      const payment = await this.prisma.$transaction(async (prisma) => {
        const newPayment = await prisma.payment.create({
          data: {
            paymentNumber,
            invoiceId: dto.invoiceId,
            amount: dto.amount,
            paymentDate: dto.paymentDate
              ? new Date(dto.paymentDate)
              : new Date(),
            paymentMethod: dto.paymentMethod,
            referenceNumber: dto.referenceNumber,
            notes: dto.notes,
            status: PaymentStatus.COMPLETED,
            tenantId,
            createdBy: dto.createdBy,
          },
        });

        // Update invoice status
        const newTotalPaid = totalPaid + dto.amount;
        let newStatus = invoice.status;

        if (newTotalPaid >= invoice.totalAmount) {
          newStatus = InvoiceStatus.PAID;
        } else if (newTotalPaid > 0) {
          newStatus = InvoiceStatus.PARTIALLY_PAID;
        }

        await prisma.invoice.update({
          where: { id: dto.invoiceId },
          data: { status: newStatus },
        });

        return newPayment;
      });

      this.logger.log(
        `Payment created: ${paymentNumber} for invoice ${invoice.invoiceNumber}`,
      );
      return payment;
    } catch (error) {
      this.logger.error(
        `Failed to create payment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all payments with filters
   */
  async getPayments(filters: PaymentFilterDto, tenantId: string) {
    try {
      this.logger.log(`Finding payments for tenant: ${tenantId} with filters:`, filters);
      
      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildPaymentWhereClause(tenantId, filters);

      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          skip,
          take: limit,
          include: this.getPaymentIncludes(),
          orderBy: {
            paymentDate: 'desc',
          },
        }),
        this.prisma.payment.count({ where }),
      ]);

      this.logger.log(`Found ${payments.length} payments out of ${total} total`);
      return {
        data: payments,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error finding payments:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch payments');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding payment with ID: ${id} for tenant: ${tenantId}`);
      
      const payment = await this.prisma.payment.findFirst({
        where: { id, tenantId },
        include: this.getPaymentIncludes(),
      });

      if (!payment) {
        this.logger.warn(`Payment not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Payment not found');
      }

      this.logger.log(`Successfully found payment: ${payment.paymentNumber}`);
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding payment:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch payment');
    }
  }

  /**
   * Update payment
   */
  async updatePayment(id: string, dto: UpdatePaymentDto, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        invoice: {
          include: {
            patient: true,
          },
        },
      },
    });

    this.logger.log(`Payment updated: ${payment.paymentNumber}`);
    return updatedPayment;
  }

  /**
   * Get billing statistics
   */
  async getBillingStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      partiallyPaidInvoices,
      todayRevenue,
      monthlyRevenue,
      todayInvoices,
      monthlyInvoices,
    ] = await Promise.all([
      this.prisma.invoice.count({ where: { tenantId } }),
      this.prisma.invoice.count({
        where: { tenantId, status: InvoiceStatus.PENDING },
      }),
      this.prisma.invoice.count({
        where: { tenantId, status: InvoiceStatus.PAID },
      }),
      this.prisma.invoice.count({
        where: { tenantId, status: InvoiceStatus.PARTIALLY_PAID },
      }),
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: InvoiceStatus.PAID,
          date: { gte: today },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: InvoiceStatus.PAID,
          date: { gte: thisMonth },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.count({
        where: { tenantId, date: { gte: today } },
      }),
      this.prisma.invoice.count({
        where: { tenantId, date: { gte: thisMonth } },
      }),
    ]);

    // Get revenue by payment method
    const paymentsByMethod = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        tenantId,
        status: PaymentStatus.COMPLETED,
        paymentDate: { gte: thisMonth },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      partiallyPaidInvoices,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      todayInvoices,
      monthlyInvoices,
      paymentsByMethod: paymentsByMethod.map((p) => ({
        method: p.paymentMethod,
        amount: p._sum.amount || 0,
      })),
    };
  }

  /**
   * Get revenue report by date range
   */
  async getRevenueReport(startDate: string, endDate: string, tenantId: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: InvoiceStatus.PAID,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        patient: true,
        items: true,
        payments: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    const totalDiscount = invoices.reduce(
      (sum, inv) => sum + inv.discountAmount,
      0,
    );

    return {
      startDate: start,
      endDate: end,
      totalInvoices: invoices.length,
      totalRevenue,
      totalTax,
      totalDiscount,
      invoices,
    };
  }
}
