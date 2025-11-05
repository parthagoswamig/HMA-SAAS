import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PharmacyManagementService } from './pharmacy-management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pharmacy-management')
@UseGuards(JwtAuthGuard)
export class PharmacyManagementController {
  constructor(private readonly service: PharmacyManagementService) {}

  @Post('medications')
  createMedication(@Body() createDto: any, @Req() req: any) {
    return this.service.createMedication(createDto, req.user.tenantId);
  }

  @Get('medications')
  findAllMedications(@Req() req: any, @Query() query: any) {
    return this.service.findAllMedications(req.user.tenantId, query);
  }

  @Get('orders')
  findAllOrders(@Req() req: any, @Query() query: any) {
    return this.service.findAllOrders(req.user.tenantId, query);
  }

  @Patch('orders/:id/dispense')
  dispenseOrder(@Param('id') id: string, @Req() req: any) {
    return this.service.dispenseOrder(id, req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.service.getStats(req.user.tenantId);
  }
}
