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
import { PatientPortalService } from './patient-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patient-portal')
@UseGuards(JwtAuthGuard)
export class PatientPortalController {
  constructor(private readonly service: PatientPortalService) {}

  @Get('my-profile')
  getProfile(@Req() req: any) {
    return this.service.getProfile(req.user.id, req.user.tenantId);
  }

  @Patch('my-profile')
  updateProfile(@Body() updateDto: any, @Req() req: any) {
    return this.service.updateProfile(
      req.user.id,
      updateDto,
      req.user.tenantId,
    );
  }

  @Get('my-appointments')
  getMyAppointments(@Req() req: any, @Query() query: any) {
    return this.service.getMyAppointments(
      req.user.id,
      req.user.tenantId,
      query,
    );
  }

  @Post('book-appointment')
  bookAppointment(@Body() createDto: any, @Req() req: any) {
    return this.service.bookAppointment(
      req.user.id,
      createDto,
      req.user.tenantId,
    );
  }

  @Get('my-medical-records')
  getMyRecords(@Req() req: any, @Query() query: any) {
    return this.service.getMyRecords(req.user.id, req.user.tenantId, query);
  }

  @Get('my-lab-results')
  getMyLabResults(@Req() req: any) {
    return this.service.getMyLabResults(req.user.id, req.user.tenantId);
  }

  @Get('my-prescriptions')
  getMyPrescriptions(@Req() req: any) {
    return this.service.getMyPrescriptions(req.user.id, req.user.tenantId);
  }

  @Get('my-invoices')
  getMyInvoices(@Req() req: any) {
    return this.service.getMyInvoices(req.user.id, req.user.tenantId);
  }
}
