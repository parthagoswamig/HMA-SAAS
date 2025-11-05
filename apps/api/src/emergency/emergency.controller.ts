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
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreateEmergencyCaseDto,
  UpdateEmergencyCaseDto,
  UpdateTriageDto,
  EmergencyFilterDto,
} from './dto';

@ApiTags('Emergency')
@ApiBearerAuth()
@Controller('emergency')
@UseGuards(JwtAuthGuard)
export class EmergencyController {
  constructor(private readonly service: EmergencyService) {}

  @Post('cases')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create emergency case' })
  @ApiResponse({ status: 201, description: 'Emergency case created successfully' })
  create(
    @Body() createEmergencyCaseDto: CreateEmergencyCaseDto, 
    @TenantId() tenantId: string
  ) {
    return this.service.create(createEmergencyCaseDto, tenantId);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get all emergency cases' })
  @ApiResponse({ status: 200, description: 'Emergency cases retrieved successfully' })
  findAll(
    @Query() filters: EmergencyFilterDto,
    @TenantId() tenantId: string
  ) {
    return this.service.findAll(tenantId, filters);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get emergency case by ID' })
  @ApiResponse({ status: 200, description: 'Emergency case retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Emergency case not found' })
  @ApiParam({ name: 'id', description: 'Emergency case ID' })
  findOne(
    @Param('id') id: string, 
    @TenantId() tenantId: string
  ) {
    return this.service.findOne(id, tenantId);
  }

  @Patch('cases/:id')
  @ApiOperation({ summary: 'Update emergency case' })
  @ApiResponse({ status: 200, description: 'Emergency case updated successfully' })
  @ApiResponse({ status: 404, description: 'Emergency case not found' })
  @ApiParam({ name: 'id', description: 'Emergency case ID' })
  update(
    @Param('id') id: string, 
    @Body() updateEmergencyCaseDto: UpdateEmergencyCaseDto, 
    @TenantId() tenantId: string
  ) {
    return this.service.update(id, updateEmergencyCaseDto, tenantId);
  }

  @Patch('cases/:id/triage')
  @ApiOperation({ summary: 'Update triage level' })
  @ApiResponse({ status: 200, description: 'Triage level updated successfully' })
  @ApiResponse({ status: 404, description: 'Emergency case not found' })
  @ApiParam({ name: 'id', description: 'Emergency case ID' })
  updateTriage(
    @Param('id') id: string,
    @Body() updateTriageDto: UpdateTriageDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.updateTriage(id, updateTriageDto, tenantId);
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get emergency queue' })
  @ApiResponse({ status: 200, description: 'Emergency queue retrieved successfully' })
  getQueue(@TenantId() tenantId: string) {
    return this.service.getQueue(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get emergency statistics' })
  @ApiResponse({ status: 200, description: 'Emergency statistics retrieved successfully' })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }
}
