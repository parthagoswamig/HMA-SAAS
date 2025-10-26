import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getStats(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getStats(tenantId, user);
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  async getRecentActivities(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getRecentActivities(tenantId, user);
  }

  @Get('appointments-today')
  @ApiOperation({ summary: 'Get today\'s appointments' })
  @ApiResponse({ status: 200, description: 'Today\'s appointments retrieved successfully' })
  async getTodaysAppointments(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getTodaysAppointments(tenantId, user);
  }

  @Get('revenue-overview')
  @ApiOperation({ summary: 'Get revenue overview' })
  @ApiResponse({ status: 200, description: 'Revenue overview retrieved successfully' })
  async getRevenueOverview(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.getRevenueOverview(tenantId, user);
  }
}
