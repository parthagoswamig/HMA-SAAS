import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
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
import { IpdService } from './ipd.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import {
  CreateWardDto,
  UpdateWardDto,
  CreateBedDto,
  UpdateBedStatusDto,
  WardFilterDto,
  BedFilterDto,
  CreateAdmissionDto,
  UpdateAdmissionDto,
  DischargePatientDto,
  AdmissionFilterDto,
} from './dto';

@ApiTags('IPD')
@ApiBearerAuth()
@Controller('ipd')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IpdController {
  constructor(private readonly service: IpdService) {}

  // ==================== Ward Management ====================

  /**
   * Create a new ward
   */
  @Post('wards')
  @RequirePermissions('ipd.create', 'IPD_CREATE', 'WARD_MANAGEMENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new ward',
    description: 'Creates a new inpatient ward with specified capacity and type'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ward created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid data provided'
  })
  createWard(
    @Body() createWardDto: CreateWardDto, 
    @TenantId() tenantId: string
  ) {
    return this.service.createWard(createWardDto, tenantId);
  }

  /**
   * Get all wards with filters
   */
  @Get('wards')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_WARDS')
  @ApiOperation({ 
    summary: 'Get all wards',
    description: 'Retrieves paginated list of wards with optional filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wards retrieved successfully'
  })
  findAllWards(
    @Query() filters: WardFilterDto,
    @TenantId() tenantId: string
  ) {
    return this.service.findAllWards(tenantId, filters);
  }

  /**
   * Get ward by ID
   */
  @Get('wards/:id')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_WARDS')
  @ApiOperation({ 
    summary: 'Get ward by ID',
    description: 'Retrieves a specific ward with all its details including beds'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ward retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ward not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Ward ID',
    example: 'ward-uuid-123'
  })
  findOneWard(
    @Param('id') id: string, 
    @TenantId() tenantId: string
  ) {
    return this.service.findOneWard(id, tenantId);
  }

  /**
   * Update ward
   */
  @Patch('wards/:id')
  @RequirePermissions('ipd.update', 'IPD_UPDATE', 'WARD_MANAGEMENT')
  @ApiOperation({ 
    summary: 'Update ward',
    description: 'Updates an existing ward'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ward updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ward not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Ward ID',
    example: 'ward-uuid-123'
  })
  updateWard(
    @Param('id') id: string, 
    @Body() updateWardDto: UpdateWardDto, 
    @TenantId() tenantId: string
  ) {
    return this.service.updateWard(id, updateWardDto, tenantId);
  }

  // ==================== Bed Management ====================

  /**
   * Create a new bed
   */
  @Post('beds')
  @RequirePermissions('ipd.create', 'IPD_CREATE', 'BED_MANAGEMENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new bed',
    description: 'Creates a new bed within a specified ward'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Bed created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid data provided'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ward not found'
  })
  createBed(
    @Body() createBedDto: CreateBedDto, 
    @TenantId() tenantId: string
  ) {
    return this.service.createBed(createBedDto, tenantId);
  }

  /**
   * Get all beds with filters
   */
  @Get('beds')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_BEDS')
  @ApiOperation({ 
    summary: 'Get all beds',
    description: 'Retrieves paginated list of beds with optional filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Beds retrieved successfully'
  })
  findAllBeds(
    @Query() filters: BedFilterDto,
    @TenantId() tenantId: string
  ) {
    return this.service.findAllBeds(tenantId, filters);
  }

  /**
   * Get available beds
   */
  @Get('beds/available')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_BEDS')
  @ApiOperation({ 
    summary: 'Get available beds',
    description: 'Retrieves all available beds for new admissions'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Available beds retrieved successfully'
  })
  findAvailableBeds(@TenantId() tenantId: string) {
    return this.service.findAvailableBeds(tenantId);
  }

  /**
   * Update bed status
   */
  @Patch('beds/:id/status')
  @RequirePermissions('ipd.update', 'IPD_UPDATE', 'BED_MANAGEMENT')
  @ApiOperation({ 
    summary: 'Update bed status',
    description: 'Updates the status of a specific bed (available, occupied, maintenance, etc.)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bed status updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Bed not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Bed ID',
    example: 'bed-uuid-123'
  })
  updateBedStatus(
    @Param('id') id: string,
    @Body() updateBedStatusDto: UpdateBedStatusDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.updateBedStatus(
      id,
      updateBedStatusDto,
      tenantId,
    );
  }

  /**
   * Get IPD statistics
   */
  @Get('stats')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_REPORTS')
  @ApiOperation({ 
    summary: 'Get IPD statistics',
    description: 'Retrieves IPD statistics including ward and bed occupancy rates'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'IPD statistics retrieved successfully'
  })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }

  // ==================== Admission Management ====================

  /**
   * Create a new admission
   */
  @Post('admissions')
  @RequirePermissions('ipd.create', 'IPD_CREATE', 'ADMISSION_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new admission',
    description: 'Admits a patient to IPD with bed assignment'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Admission created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid data or bed not available'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Patient, ward, or bed not found'
  })
  createAdmission(
    @Body() createAdmissionDto: CreateAdmissionDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.createAdmission(createAdmissionDto, tenantId);
  }

  /**
   * Get all admissions with filters
   */
  @Get('admissions')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_ADMISSIONS')
  @ApiOperation({ 
    summary: 'Get all admissions',
    description: 'Retrieves paginated list of admissions with optional filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Admissions retrieved successfully'
  })
  findAllAdmissions(
    @Query() filters: AdmissionFilterDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.findAllAdmissions(tenantId, filters);
  }

  /**
   * Get admission by ID
   */
  @Get('admissions/:id')
  @RequirePermissions('ipd.view', 'IPD_READ', 'VIEW_ADMISSIONS')
  @ApiOperation({ 
    summary: 'Get admission by ID',
    description: 'Retrieves a specific admission with all details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Admission retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Admission not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Admission ID',
    example: 'admission-uuid-123'
  })
  findOneAdmission(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.service.findOneAdmission(id, tenantId);
  }

  /**
   * Update admission
   */
  @Patch('admissions/:id')
  @RequirePermissions('ipd.update', 'IPD_UPDATE', 'ADMISSION_UPDATE')
  @ApiOperation({ 
    summary: 'Update admission',
    description: 'Updates an existing admission'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Admission updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Admission not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Admission ID',
    example: 'admission-uuid-123'
  })
  updateAdmission(
    @Param('id') id: string,
    @Body() updateAdmissionDto: UpdateAdmissionDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.updateAdmission(id, updateAdmissionDto, tenantId);
  }

  /**
   * Discharge patient
   */
  @Post('admissions/:id/discharge')
  @RequirePermissions('ipd.update', 'IPD_UPDATE', 'DISCHARGE_PATIENT')
  @ApiOperation({ 
    summary: 'Discharge patient',
    description: 'Discharges a patient and frees up the bed'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient discharged successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Admission not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Admission ID',
    example: 'admission-uuid-123'
  })
  dischargePatient(
    @Param('id') id: string,
    @Body() dischargeDto: DischargePatientDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.dischargePatient(id, dischargeDto, tenantId);
  }

  /**
   * Cancel admission
   */
  @Delete('admissions/:id')
  @RequirePermissions('ipd.delete', 'IPD_DELETE', 'ADMISSION_CANCEL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Cancel admission',
    description: 'Cancels an admission and frees up the bed'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Admission cancelled successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Admission not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Admission ID',
    example: 'admission-uuid-123'
  })
  cancelAdmission(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.service.cancelAdmission(id, tenantId);
  }
}
