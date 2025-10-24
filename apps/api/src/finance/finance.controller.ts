import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Invoices
  @Get('invoices')
  findAllInvoices(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.findAllInvoices(tenantId, query);
  }

  @Get('invoices/:id')
  findOneInvoice(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.findOneInvoice(id, tenantId);
  }

  // Payments
  @Post('payments')
  createPayment(@Body() createDto: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.createPayment(createDto, tenantId);
  }

  @Get('payments')
  findAllPayments(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.findAllPayments(tenantId, query);
  }

  @Get('payments/:id')
  findOnePayment(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.findOnePayment(id, tenantId);
  }

  // Reports
  @Get('reports/revenue')
  getRevenueReport(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.getRevenueReport(tenantId, query);
  }

  @Get('reports/outstanding')
  getOutstandingReport(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.getOutstandingReport(tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.financeService.getStats(tenantId, query);
  }
}
