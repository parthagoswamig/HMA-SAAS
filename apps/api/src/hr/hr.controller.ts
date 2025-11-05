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
  Req,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('staff')
  createStaff(@Body() createDto: any, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.createStaff(createDto, tenantId);
  }

  @Get('staff')
  findAllStaff(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.findAllStaff(tenantId, query);
  }

  @Get('staff/:id')
  findOneStaff(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.findOneStaff(id, tenantId);
  }

  @Patch('staff/:id')
  updateStaff(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Req() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.hrService.updateStaff(id, updateDto, tenantId);
  }

  @Delete('staff/:id')
  removeStaff(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.removeStaff(id, tenantId);
  }

  @Get('departments')
  findAllDepartments(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.findAllDepartments(tenantId, query);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.getStats(tenantId);
  }

  @Get('attendance')
  getAttendance(@Req() req: any, @Query() query: any) {
    const tenantId = req.user.tenantId;
    return this.hrService.getAttendance(tenantId, query);
  }
}
