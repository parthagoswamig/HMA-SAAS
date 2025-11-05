import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quality')
@UseGuards(JwtAuthGuard)
export class QualityController {
  constructor(private readonly service: QualityService) {}

  @Post('metrics')
  createMetric(@Body() createDto: any, @Req() req: any) {
    return this.service.createMetric(createDto, req.user.tenantId);
  }

  @Get('metrics')
  getMetrics(@Req() req: any) {
    return this.service.getMetrics(req.user.tenantId);
  }

  @Post('incidents')
  reportIncident(@Body() createDto: any, @Req() req: any) {
    return this.service.reportIncident(createDto, req.user.tenantId);
  }

  @Get('incidents')
  getIncidents(@Req() req: any) {
    return this.service.getIncidents(req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.tenantId);
  }
}
