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
} from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('staff')
  createStaff(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.hrService.createStaff(createDto, tenantId);
  }

  @Get('staff')
  findAllStaff(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.findAllStaff(tenantId, query);
  }

  @Get('staff/:id')
  findOneStaff(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.findOneStaff(id, tenantId);
  }

  @Patch('staff/:id')
  updateStaff(
    @Param('id') id: string,
    @Body() updateDto: any,
    @TenantId() tenantId: string,
  ) {
    return this.hrService.updateStaff(id, updateDto, tenantId);
  }

  @Delete('staff/:id')
  removeStaff(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.removeStaff(id, tenantId);
  }

  @Post('departments')
  createDepartment(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.hrService.createDepartment(createDto, tenantId);
  }

  @Get('departments')
  findAllDepartments(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.findAllDepartments(tenantId, query);
  }

  @Get('departments/:id')
  findOneDepartment(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.findOneDepartment(id, tenantId);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() updateDto: any,
    @TenantId() tenantId: string,
  ) {
    return this.hrService.updateDepartment(id, updateDto, tenantId);
  }

  @Delete('departments/:id')
  removeDepartment(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.hrService.removeDepartment(id, tenantId);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.hrService.getStats(tenantId);
  }

  @Get('attendance')
  getAttendance(@TenantId() tenantId: string, @Query() query: any) {
    return this.hrService.getAttendance(tenantId, query);
  }
}
