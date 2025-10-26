import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions('reports.view', 'REPORTS_READ', 'VIEW_DASHBOARD')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getDashboard(@TenantId() tenantId: string) {
    return this.reportsService.getDashboard(tenantId);
  }

  @Get('patients')
  @RequirePermissions('reports.view', 'REPORTS_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get patient analytics report' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: 200, description: 'Patient report retrieved successfully' })
  getPatientReport(@TenantId() tenantId: string, @Query() query: any) {
    return this.reportsService.getPatientReport(tenantId, query);
  }

  @Get('appointments')
  @RequirePermissions('reports.view', 'REPORTS_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get appointments analytics report' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: 200, description: 'Appointment report retrieved successfully' })
  getAppointmentReport(@TenantId() tenantId: string, @Query() query: any) {
    return this.reportsService.getAppointmentReport(tenantId, query);
  }

  @Get('revenue')
  @RequirePermissions('reports.view', 'REPORTS_READ', 'VIEW_FINANCIAL_REPORTS')
  @ApiOperation({ summary: 'Get revenue analytics report' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by period (day, week, month)' })
  @ApiResponse({ status: 200, description: 'Revenue report retrieved successfully' })
  getRevenueReport(@TenantId() tenantId: string, @Query() query: any) {
    return this.reportsService.getRevenueReport(tenantId, query);
  }

  @Get('lab')
  @RequirePermissions('reports.view', 'REPORTS_READ', 'VIEW_LAB_REPORTS')
  @ApiOperation({ summary: 'Get laboratory analytics report' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: 200, description: 'Lab report retrieved successfully' })
  getLabReport(@TenantId() tenantId: string, @Query() query: any) {
    return this.reportsService.getLabReport(tenantId, query);
  }

  @Get('pharmacy')
  @RequirePermissions('reports.view', 'REPORTS_READ', 'VIEW_PHARMACY_REPORTS')
  @ApiOperation({ summary: 'Get pharmacy analytics report' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiResponse({ status: 200, description: 'Pharmacy report retrieved successfully' })
  getPharmacyReport(@TenantId() tenantId: string, @Query() query: any) {
    return this.reportsService.getPharmacyReport(tenantId, query);
  }
}
