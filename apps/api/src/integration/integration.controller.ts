import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('integration')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(private readonly service: IntegrationService) {}

  @Post('configs')
  create(@Body() createDto: any, @Req() req: any) {
    return this.service.create(createDto, req.user.tenantId);
  }

  @Get('configs')
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Get('configs/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Patch('configs/:id')
  update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.service.update(id, updateDto, req.user.tenantId);
  }

  @Post('configs/:id/test')
  testConnection(@Param('id') id: string, @Req() req: any) {
    return this.service.testConnection(id, req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.tenantId);
  }
}
