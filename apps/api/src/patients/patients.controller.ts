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
  BadRequestException,
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

interface User {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @TenantId() tenantId: string,
  ) {
    console.log('🔵 [DEBUG] Patient creation request received');
    console.log('🔵 [DEBUG] DTO:', createPatientDto);
    console.log('🔵 [DEBUG] TenantId:', tenantId);
    
    try {
      // TEMPORARY: Skip validation and create patient directly
      console.log('🔧 [TEMP] Skipping validation - creating patient directly');
      const result = await this.patientsService.create(createPatientDto, tenantId);
      console.log('✅ [DEBUG] Patient created successfully');
      return result;
    } catch (error: any) {
      console.error('❌ [DEBUG] Patient creation failed:', error.message);
      console.error('❌ [DEBUG] Error details:', error);
      console.error('❌ [DEBUG] Full error:', JSON.stringify(error, null, 2));
      
      // Throw proper error with status code
      throw new BadRequestException({
        success: false,
        message: error.message || 'Failed to create patient',
        error: error,
        details: error.response?.data || error,
      });
    }
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test patient creation without validation' })
  async testCreate(@Body() data: any, @TenantId() tenantId: string) {
    console.log('🧪 [TEST] Test endpoint called');
    console.log('🧪 [TEST] Data:', data);
    console.log('🧪 [TEST] TenantId:', tenantId);
    
    return {
      success: true,
      message: 'Test endpoint working!',
      receivedData: data,
      tenantId: tenantId,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients with pagination' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: PatientQueryDto,
  ) {
    return this.patientsService.findAll(tenantId, query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search patients by query' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async search(@TenantId() tenantId: string, @Query('q') query: string) {
    return this.patientsService.search(tenantId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get patient statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.patientsService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.findOne(id, tenantId);
  }

  @Patch(':id')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete patient by ID' })
  @ApiResponse({ status: 204, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.patientsService.remove(id, tenantId);
  }
}
