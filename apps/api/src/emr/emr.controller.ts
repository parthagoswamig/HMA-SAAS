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
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  EmrFilterDto,
} from './dto';

@ApiTags('Electronic Medical Records (EMR)')
@Controller('emr')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmrController {
  constructor(private readonly emrService: EmrService) {}

  @Post('records')
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
  @ApiOperation({ summary: 'Get all medical records with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical records retrieved successfully',
  })
  findAll(@TenantId() tenantId: string, @Query() query: EmrFilterDto) {
    return this.emrService.findAll(tenantId, query);
  }

  @Get('records/patient/:patientId')
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
  @ApiOperation({ summary: 'Get EMR statistics and analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'EMR statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: string) {
    return this.emrService.getStats(tenantId);
  }
}
