import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  InvoiceFilterDto,
  PaymentFilterDto,
} from './dto/billing.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ==================== INVOICE ENDPOINTS ====================

  /**
   * Create a new invoice
   */
  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new invoice',
    description: 'Creates a new invoice with items for a patient'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Invoice created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid data provided'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Patient not found'
  })
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto, 
    @TenantId() tenantId: string
  ) {
    const invoice = await this.billingService.createInvoice(
      createInvoiceDto,
      tenantId,
    );
    return {
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    };
  }

  /**
   * Get all invoices with filters
   */
  @Get('invoices')
  @ApiOperation({ 
    summary: 'Get all invoices',
    description: 'Retrieves paginated list of invoices with optional filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invoices retrieved successfully'
  })
  async getInvoices(
    @Query() filters: InvoiceFilterDto, 
    @TenantId() tenantId: string
  ) {
    const result = await this.billingService.getInvoices(
      filters,
      tenantId,
    );
    return {
      success: true,
      message: 'Invoices retrieved successfully',
      ...result,
    };
  }

  /**
   * Get billing statistics
   */
  @Get('invoices/stats')
  @ApiOperation({ 
    summary: 'Get billing statistics',
    description: 'Retrieves billing statistics including revenue, invoice counts, and payment methods'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Billing statistics retrieved successfully'
  })
  async getBillingStats(@TenantId() tenantId: string) {
    const stats = await this.billingService.getBillingStats(tenantId);
    return {
      success: true,
      message: 'Billing statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Get revenue report
   */
  @Get('invoices/reports/revenue')
  @ApiOperation({ 
    summary: 'Get revenue report',
    description: 'Generates revenue report for a specific date range'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Revenue report generated successfully'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: true, 
    description: 'Start date for the report (ISO string)',
    example: '2024-12-01T00:00:00.000Z'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: true, 
    description: 'End date for the report (ISO string)',
    example: '2024-12-31T23:59:59.999Z'
  })
  async getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @TenantId() tenantId: string,
  ) {
    const report = await this.billingService.getRevenueReport(
      startDate,
      endDate,
      tenantId,
    );
    return {
      success: true,
      message: 'Revenue report generated successfully',
      data: report,
    };
  }

  /**
   * Get invoice by ID
   */
  @Get('invoices/:id')
  @ApiOperation({ 
    summary: 'Get invoice by ID',
    description: 'Retrieves a specific invoice with all its details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invoice retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invoice not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Invoice ID',
    example: 'invoice-uuid-123'
  })
  async getInvoiceById(
    @Param('id') id: string, 
    @TenantId() tenantId: string
  ) {
    const invoice = await this.billingService.getInvoiceById(
      id,
      tenantId,
    );
    return {
      success: true,
      message: 'Invoice retrieved successfully',
      data: invoice,
    };
  }

  /**
   * Update invoice
   */
  @Patch('invoices/:id')
  @ApiOperation({ 
    summary: 'Update invoice',
    description: 'Updates an existing invoice'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invoice updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invoice not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Invoice ID',
    example: 'invoice-uuid-123'
  })
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @TenantId() tenantId: string,
  ) {
    const invoice = await this.billingService.updateInvoice(
      id,
      updateInvoiceDto,
      tenantId,
    );
    return {
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    };
  }

  /**
   * Cancel invoice
   */
  @Delete('invoices/:id')
  @ApiOperation({ 
    summary: 'Cancel invoice',
    description: 'Cancels an existing invoice (soft delete)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invoice cancelled successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot delete a paid invoice or invoice with payments'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invoice not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Invoice ID',
    example: 'invoice-uuid-123'
  })
  async deleteInvoice(
    @Param('id') id: string, 
    @TenantId() tenantId: string
  ) {
    const invoice = await this.billingService.deleteInvoice(
      id,
      tenantId,
    );
    return {
      success: true,
      message: 'Invoice cancelled successfully',
      data: invoice,
    };
  }

  // ==================== PAYMENT ENDPOINTS ====================

  /**
   * Create a payment
   */
  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Record a payment',
    description: 'Records a new payment against an invoice'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment recorded successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Payment amount exceeds remaining balance or invalid data'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Invoice not found'
  })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto, 
    @TenantId() tenantId: string
  ) {
    const payment = await this.billingService.createPayment(
      createPaymentDto,
      tenantId,
    );
    return {
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    };
  }

  /**
   * Get all payments with filters
   */
  @Get('payments')
  @ApiOperation({ 
    summary: 'Get all payments',
    description: 'Retrieves paginated list of payments with optional filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payments retrieved successfully'
  })
  async getPayments(
    @Query() filters: PaymentFilterDto, 
    @TenantId() tenantId: string
  ) {
    const result = await this.billingService.getPayments(
      filters,
      tenantId,
    );
    return {
      success: true,
      message: 'Payments retrieved successfully',
      ...result,
    };
  }

  /**
   * Get payment by ID
   */
  @Get('payments/:id')
  @ApiOperation({ 
    summary: 'Get payment by ID',
    description: 'Retrieves a specific payment with all its details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Payment not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Payment ID',
    example: 'payment-uuid-123'
  })
  async getPaymentById(
    @Param('id') id: string, 
    @TenantId() tenantId: string
  ) {
    const payment = await this.billingService.getPaymentById(
      id,
      tenantId,
    );
    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  }

  /**
   * Update payment
   */
  @Patch('payments/:id')
  @ApiOperation({ 
    summary: 'Update payment',
    description: 'Updates an existing payment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Payment not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Payment ID',
    example: 'payment-uuid-123'
  })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @TenantId() tenantId: string,
  ) {
    const payment = await this.billingService.updatePayment(
      id,
      updatePaymentDto,
      tenantId,
    );
    return {
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    };
  }
}
