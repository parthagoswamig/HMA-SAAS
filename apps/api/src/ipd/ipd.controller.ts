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
import { IpdService } from './ipd.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreateWardDto,
  UpdateWardDto,
  CreateBedDto,
  UpdateBedStatusDto,
  WardFilterDto,
  BedFilterDto,
} from './dto';

@ApiTags('IPD')
@ApiBearerAuth()
@Controller('ipd')
@UseGuards(JwtAuthGuard)
export class IpdController {
  constructor(private readonly service: IpdService) {}

  // ==================== Ward Management ====================

  /**
   * Create a new ward
   */
  @Post('wards')
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
}
