import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
} from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Invoices
  @Get('invoices')
  @RequirePermissions('finance.view', 'BILLING_VIEW', 'VIEW_INVOICES')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  findAllInvoices(@TenantId() tenantId: string, @Query() query: any) {
    return this.financeService.findAllInvoices(tenantId, query);
  }

  @Get('invoices/:id')
  @RequirePermissions('finance.view', 'BILLING_VIEW', 'VIEW_INVOICES')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOneInvoice(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.financeService.findOneInvoice(id, tenantId);
  }

  // Payments
  @Post('payments')
  @RequirePermissions('payment.create', 'PAYMENT_CREATE', 'BILLING_PAYMENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  createPayment(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.financeService.createPayment(createDto, tenantId);
  }

  @Get('payments')
  @RequirePermissions('payment.view', 'PAYMENT_VIEW', 'VIEW_PAYMENTS')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  findAllPayments(@TenantId() tenantId: string, @Query() query: any) {
    return this.financeService.findAllPayments(tenantId, query);
  }

  @Get('payments/:id')
  @RequirePermissions('payment.view', 'PAYMENT_VIEW', 'VIEW_PAYMENTS')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOnePayment(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.financeService.findOnePayment(id, tenantId);
  }

  // Reports
  @Get('reports/revenue')
  @RequirePermissions('finance.view', 'FINANCE_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report retrieved successfully' })
  getRevenueReport(@TenantId() tenantId: string, @Query() query: any) {
    return this.financeService.getRevenueReport(tenantId, query);
  }

  @Get('reports/outstanding')
  @RequirePermissions('finance.view', 'FINANCE_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get outstanding payments report' })
  @ApiResponse({ status: 200, description: 'Outstanding report retrieved successfully' })
  getOutstandingReport(@TenantId() tenantId: string) {
    return this.financeService.getOutstandingReport(tenantId);
  }

  @Get('stats')
  @RequirePermissions('finance.view', 'FINANCE_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get financial statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@TenantId() tenantId: string, @Query() query: any) {
    return this.financeService.getStats(tenantId, query);
  }
}
