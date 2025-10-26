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
  ApiParam,
} from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Insurance')
@ApiBearerAuth()
@Controller('insurance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @Post('claims')
  @RequirePermissions('insurance.create', 'INSURANCE_CREATE', 'CREATE_CLAIMS')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new insurance claim' })
  @ApiResponse({ status: 201, description: 'Insurance claim created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.service.create(createDto, tenantId);
  }

  @Get('claims')
  @RequirePermissions('insurance.view', 'INSURANCE_READ', 'VIEW_CLAIMS')
  @ApiOperation({ summary: 'Get all insurance claims' })
  @ApiResponse({ status: 200, description: 'Insurance claims retrieved successfully' })
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query);
  }

  @Get('stats')
  @RequirePermissions('insurance.view', 'INSURANCE_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get insurance statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }

  @Get('claims/:id')
  @RequirePermissions('insurance.view', 'INSURANCE_READ', 'VIEW_CLAIMS')
  @ApiOperation({ summary: 'Get insurance claim by ID' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Insurance claim retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch('claims/:id')
  @RequirePermissions('insurance.update', 'INSURANCE_UPDATE', 'UPDATE_CLAIMS')
  @ApiOperation({ summary: 'Update insurance claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Insurance claim updated successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  update(@Param('id') id: string, @Body() updateDto: any, @TenantId() tenantId: string) {
    return this.service.update(id, updateDto, tenantId);
  }

  @Patch('claims/:id/status')
  @RequirePermissions('insurance.update', 'INSURANCE_UPDATE', 'PROCESS_CLAIMS')
  @ApiOperation({ summary: 'Update insurance claim status' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim status updated successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string },
    @TenantId() tenantId: string,
  ) {
    return this.service.updateStatus(id, statusDto.status, tenantId);
  }
}
