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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OpdService } from './opd.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreateOpdVisitDto,
  UpdateOpdVisitDto,
  OpdVisitFilterDto,
  OpdQueueFilterDto,
} from './dto';

@ApiTags('OPD')
@ApiBearerAuth()
@Controller('opd')
@UseGuards(JwtAuthGuard)
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  /**
   * Create a new OPD visit
   */
  @Post('visits')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new OPD visit',
    description: 'Creates a new outpatient department visit for a patient'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'OPD visit created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid data provided'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Patient or doctor not found'
  })
  async createVisit(
    @Body() createOpdVisitDto: CreateOpdVisitDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.createVisit(createOpdVisitDto, tenantId);
  }

  /**
   * Get all OPD visits with filters
   */
  @Get('visits')
  @ApiOperation({ 
    summary: 'Get all OPD visits',
    description: 'Retrieves paginated list of OPD visits with optional filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OPD visits retrieved successfully'
  })
  async findAllVisits(
    @Query() filters: OpdVisitFilterDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.findAllVisits(tenantId, filters);
  }

  /**
   * Get OPD visit by ID
   */
  @Get('visits/:id')
  @ApiOperation({ 
    summary: 'Get OPD visit by ID',
    description: 'Retrieves a specific OPD visit with all details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OPD visit retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'OPD visit not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'OPD visit ID',
    example: 'visit-uuid-123'
  })
  async findOneVisit(
    @Param('id') id: string, 
    @TenantId() tenantId: string,
  ) {
    return this.opdService.findOneVisit(id, tenantId);
  }

  /**
   * Update OPD visit
   */
  @Patch('visits/:id')
  @ApiOperation({ 
    summary: 'Update OPD visit',
    description: 'Updates an existing OPD visit'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OPD visit updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'OPD visit not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'OPD visit ID',
    example: 'visit-uuid-123'
  })
  async updateVisit(
    @Param('id') id: string,
    @Body() updateOpdVisitDto: UpdateOpdVisitDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.updateVisit(
      id,
      updateOpdVisitDto,
      tenantId,
    );
  }

  /**
   * Cancel OPD visit
   */
  @Delete('visits/:id')
  @ApiOperation({ 
    summary: 'Cancel OPD visit',
    description: 'Cancels an existing OPD visit'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OPD visit cancelled successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'OPD visit not found'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'OPD visit ID',
    example: 'visit-uuid-123'
  })
  async removeVisit(
    @Param('id') id: string, 
    @TenantId() tenantId: string,
  ) {
    return this.opdService.removeVisit(id, tenantId);
  }

  /**
   * Get OPD queue
   */
  @Get('queue')
  @ApiOperation({ 
    summary: 'Get OPD queue',
    description: 'Retrieves the current OPD queue with waiting patients'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OPD queue retrieved successfully'
  })
  async getQueue(
    @Query() filters: OpdQueueFilterDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.getQueue(tenantId, filters);
  }

  /**
   * Get OPD statistics
   */
  @Get('stats')
  @ApiOperation({ 
    summary: 'Get OPD statistics',
    description: 'Retrieves OPD statistics for today including patient counts and status distribution'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OPD statistics retrieved successfully'
  })
  async getStats(@TenantId() tenantId: string) {
    return this.opdService.getStats(tenantId);
  }
}
