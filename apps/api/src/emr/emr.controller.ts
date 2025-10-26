import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmrService } from './emr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  EmrFilterDto,
} from './dto';

@ApiTags('Electronic Medical Records (EMR)')
@ApiBearerAuth()
@Controller('emr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmrController {
  constructor(private readonly emrService: EmrService) {}

  @Post('records')
  @RequirePermissions('medical.record.create', 'MEDICAL_RECORD_CREATE', 'CREATE_MEDICAL_RECORDS')
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Medical record created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  create(@Body() createDto: CreateMedicalRecordDto, @TenantId() tenantId: string) {
    return this.emrService.create(createDto, tenantId);
  }

  @Get('records')
  @RequirePermissions('medical.record.view', 'MEDICAL_RECORD_READ', 'VIEW_MEDICAL_RECORDS')
  @ApiOperation({ summary: 'Get all medical records with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical records retrieved successfully',
  })
  findAll(@TenantId() tenantId: string, @Query() query: EmrFilterDto) {
    return this.emrService.findAll(tenantId, query);
  }

  @Get('records/patient/:patientId')
  @RequirePermissions('medical.record.view', 'MEDICAL_RECORD_READ', 'VIEW_MEDICAL_RECORDS')
  @ApiOperation({ summary: 'Get all medical records for a specific patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient medical records retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  findByPatient(@Param('patientId') patientId: string, @TenantId() tenantId: string) {
    return this.emrService.findByPatient(patientId, tenantId);
  }

  @Get('records/:id')
  @RequirePermissions('medical.record.view', 'MEDICAL_RECORD_READ', 'VIEW_MEDICAL_RECORDS')
  @ApiOperation({ summary: 'Get a specific medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical record retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical record not found',
  })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.emrService.findOne(id, tenantId);
  }

  @Patch('records/:id')
  @RequirePermissions('medical.record.update', 'MEDICAL_RECORD_UPDATE', 'UPDATE_MEDICAL_RECORDS')
  @ApiOperation({ summary: 'Update a medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical record updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical record not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @TenantId() tenantId: string,
  ) {
    return this.emrService.update(id, updateDto, tenantId);
  }

  @Delete('records/:id')
  @RequirePermissions('medical.record.delete', 'MEDICAL_RECORD_DELETE', 'DELETE_MEDICAL_RECORDS')
  @ApiOperation({ summary: 'Soft delete a medical record' })
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical record deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical record not found',
  })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.emrService.remove(id, tenantId);
  }

  @Get('stats')
  @RequirePermissions('medical.record.view', 'MEDICAL_RECORD_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get EMR statistics and analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'EMR statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: string) {
    return this.emrService.getStats(tenantId);
  }
}
