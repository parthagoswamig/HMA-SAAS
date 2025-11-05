import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.reportsService.getDashboard(tenantId);
  }

  @Get('patients')
  getPatientReport(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.reportsService.getPatientReport(tenantId, query);
  }

  @Get('appointments')
  getAppointmentReport(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.reportsService.getAppointmentReport(tenantId, query);
  }

  @Get('revenue')
  getRevenueReport(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.reportsService.getRevenueReport(tenantId, query);
  }

  @Get('lab')
  getLabReport(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.reportsService.getLabReport(tenantId, query);
  }

  @Get('pharmacy')
  getPharmacyReport(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.reportsService.getPharmacyReport(tenantId, query);
  }
}
