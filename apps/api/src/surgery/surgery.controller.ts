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
import { SurgeryService } from './surgery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Surgery')
@ApiBearerAuth()
@Controller('surgery')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SurgeryController {
  constructor(private readonly service: SurgeryService) {}

  @Post()
  @RequirePermissions('surgery.create', 'SURGERY_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule a new surgery' })
  @ApiResponse({ status: 201, description: 'Surgery scheduled successfully' })
  create(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.service.create(createDto, tenantId);
  }

  @Get()
  @RequirePermissions('surgery.view', 'SURGERY_READ', 'VIEW_SURGERY')
  @ApiOperation({ summary: 'Get all surgeries' })
  @ApiResponse({ status: 200, description: 'Surgeries retrieved successfully' })
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query);
  }

  @Get('schedule/upcoming')
  @RequirePermissions('surgery.view', 'SURGERY_READ', 'VIEW_SURGERY_SCHEDULE')
  @ApiOperation({ summary: 'Get upcoming surgeries' })
  @ApiResponse({ status: 200, description: 'Upcoming surgeries retrieved successfully' })
  getUpcoming(@TenantId() tenantId: string) {
    return this.service.getUpcoming(tenantId);
  }

  @Get('theaters/available')
  @RequirePermissions('surgery.view', 'SURGERY_READ', 'VIEW_SURGERY_THEATERS')
  @ApiOperation({ summary: 'Get available operation theaters' })
  @ApiResponse({ status: 200, description: 'Available theaters retrieved successfully' })
  getAvailableTheaters(@TenantId() tenantId: string) {
    return this.service.getAvailableTheaters(tenantId);
  }

  @Get('stats')
  @RequirePermissions('surgery.view', 'SURGERY_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get surgery statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }

  @Get(':id')
  @RequirePermissions('surgery.view', 'SURGERY_READ', 'VIEW_SURGERY')
  @ApiOperation({ summary: 'Get surgery by ID' })
  @ApiResponse({ status: 200, description: 'Surgery retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Surgery not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('surgery.update', 'SURGERY_UPDATE')
  @ApiOperation({ summary: 'Update surgery details' })
  @ApiResponse({ status: 200, description: 'Surgery updated successfully' })
  @ApiResponse({ status: 404, description: 'Surgery not found' })
  update(@Param('id') id: string, @Body() updateDto: any, @TenantId() tenantId: string) {
    return this.service.update(id, updateDto, tenantId);
  }
}
