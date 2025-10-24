import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SurgeryService } from './surgery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('surgery')
@UseGuards(JwtAuthGuard)
export class SurgeryController {
  constructor(private readonly service: SurgeryService) {}

  @Post()
  create(@Body() createDto: any, @Req() req: any) {
    return this.service.create(createDto, req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.service.update(id, updateDto, req.user.tenantId);
  }

  @Get('schedule/upcoming')
  getUpcoming(@Req() req: any) {
    return this.service.getUpcoming(req.user.tenantId);
  }

  @Get('theaters/available')
  getAvailableTheaters(@Req() req: any) {
    return this.service.getAvailableTheaters(req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.tenantId);
  }
}
