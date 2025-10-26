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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

interface User {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @RequirePermissions('patient.create', 'PATIENT_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @TenantId() tenantId: string,
  ) {
    return this.patientsService.create(createPatientDto, tenantId);
  }

  @Get()
  @RequirePermissions('patient.view', 'PATIENT_READ', 'VIEW_PATIENTS')
  @ApiOperation({ summary: 'Get all patients with pagination' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: PatientQueryDto,
  ) {
    return this.patientsService.findAll(tenantId, query);
  }

  @Get('search')
  @RequirePermissions('patient.view', 'PATIENT_READ', 'VIEW_PATIENTS')
  @ApiOperation({ summary: 'Search patients by query' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async search(@TenantId() tenantId: string, @Query('q') query: string) {
    return this.patientsService.search(tenantId, query);
  }

  @Get('stats')
  @RequirePermissions('patient.view', 'PATIENT_READ', 'VIEW_PATIENTS')
  @ApiOperation({ summary: 'Get patient statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.patientsService.getStats(tenantId);
  }

  @Get(':id')
  @RequirePermissions('patient.view', 'PATIENT_READ', 'VIEW_PATIENTS')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('patient.update', 'PATIENT_UPDATE', 'UPDATE_PATIENTS')
  @ApiOperation({ summary: 'Update patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @TenantId() tenantId: string,
  ) {
    return this.patientsService.update(id, updatePatientDto, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('patient.delete', 'PATIENT_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete patient by ID' })
  @ApiResponse({ status: 204, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.remove(id, tenantId);
  }
}
