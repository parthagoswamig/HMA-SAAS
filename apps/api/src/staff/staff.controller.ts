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
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from './dto';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('staff')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @RequirePermissions('staff.create', 'STAFF_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createStaffDto: CreateStaffDto,
    @TenantId() tenantId: string,
  ) {
    return this.staffService.create(createStaffDto, tenantId);
  }

  @Get()
  @RequirePermissions('staff.view', 'STAFF_READ')
  @ApiOperation({ summary: 'Get all staff members with pagination' })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: StaffQueryDto,
  ) {
    return this.staffService.findAll(tenantId, query);
  }

  @Get('search')
  @RequirePermissions('staff.view', 'STAFF_READ')
  @ApiOperation({ summary: 'Search staff members by query' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async search(
    @TenantId() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.staffService.search(tenantId, query);
  }

  @Get('stats')
  @RequirePermissions('staff.view', 'STAFF_READ')
  @ApiOperation({ summary: 'Get staff statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.staffService.getStats(tenantId);
  }

  @Get(':id')
  @RequirePermissions('staff.view', 'STAFF_READ')
  @ApiOperation({ summary: 'Get staff member by ID' })
  @ApiResponse({ status: 200, description: 'Staff member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.staffService.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('staff.update', 'STAFF_UPDATE')
  @ApiOperation({ summary: 'Update staff member by ID' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @TenantId() tenantId: string,
  ) {
    return this.staffService.update(id, updateStaffDto, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('staff.delete', 'STAFF_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete staff member by ID' })
  @ApiResponse({ status: 204, description: 'Staff member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async remove(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.staffService.remove(id, tenantId);
  }
}
