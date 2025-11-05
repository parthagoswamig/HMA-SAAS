import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TelemedicineService } from './telemedicine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('telemedicine')
@UseGuards(JwtAuthGuard)
export class TelemedicineController {
  constructor(private readonly service: TelemedicineService) {}

  @Post('consultations')
  create(@Body() createDto: any, @Req() req: any) {
    return this.service.create(createDto, req.user.tenantId);
  }

  @Get('consultations')
  findAll(@Req() req: any, @Query() query: any) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get('consultations/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Patch('consultations/:id')
  update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.service.update(id, updateDto, req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.tenantId);
  }
}
