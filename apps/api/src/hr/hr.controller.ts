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
} from '@nestjs/swagger';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('HR Management')
@ApiBearerAuth()
@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('staff')
  @RequirePermissions('hr.create', 'HR_CREATE', 'STAFF_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  createStaff(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.hrService.createStaff(createDto, tenantId);
  }

  @Get('staff')
  @RequirePermissions('hr.view', 'HR_READ', 'VIEW_STAFF')
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  findAllStaff(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.findAllStaff(tenantId, query);
  }

  @Get('staff/:id')
  @RequirePermissions('hr.view', 'HR_READ', 'VIEW_STAFF')
  @ApiOperation({ summary: 'Get staff member by ID' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({ status: 200, description: 'Staff member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  findOneStaff(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.findOneStaff(id, tenantId);
  }

  @Patch('staff/:id')
  @RequirePermissions('hr.update', 'HR_UPDATE', 'STAFF_UPDATE')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  updateStaff(
    @Param('id') id: string,
    @Body() updateDto: any,
    @TenantId() tenantId: string,
  ) {
    return this.hrService.updateStaff(id, updateDto, tenantId);
  }

  @Delete('staff/:id')
  @RequirePermissions('hr.delete', 'HR_DELETE', 'STAFF_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({ status: 204, description: 'Staff member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  removeStaff(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.removeStaff(id, tenantId);
  }

  @Post('departments')
  @RequirePermissions('hr.create', 'HR_CREATE', 'DEPARTMENT_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  createDepartment(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.hrService.createDepartment(createDto, tenantId);
  }

  @Get('departments')
  @RequirePermissions('hr.view', 'HR_READ', 'VIEW_DEPARTMENTS')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  findAllDepartments(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.findAllDepartments(tenantId, query);
  }

  @Get('departments/:id')
  @RequirePermissions('hr.view', 'HR_READ', 'VIEW_DEPARTMENTS')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOneDepartment(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.findOneDepartment(id, tenantId);
  }

  @Patch('departments/:id')
  @RequirePermissions('hr.update', 'HR_UPDATE', 'DEPARTMENT_UPDATE')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  updateDepartment(
    @Param('id') id: string,
    @Body() updateDto: any,
    @TenantId() tenantId: string,
  ) {
    return this.hrService.updateDepartment(id, updateDto, tenantId);
  }

  @Delete('departments/:id')
  @RequirePermissions('hr.delete', 'HR_DELETE', 'DEPARTMENT_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 204, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  removeDepartment(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.removeDepartment(id, tenantId);
  }

  @Get('stats')
  @RequirePermissions('hr.view', 'HR_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get HR statistics' })
  @ApiResponse({ status: 200, description: 'HR statistics retrieved successfully' })
  getStats(@TenantId() tenantId: string) {
    return this.hrService.getStats(tenantId);
  }

  @Get('attendance')
  @RequirePermissions('hr.view', 'HR_READ', 'VIEW_ATTENDANCE')
  @ApiOperation({ summary: 'Get attendance records' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  getAttendance(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.getAttendance(tenantId, query);
  }
}
