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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientPortalService } from './patient-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('Patient Portal')
@ApiBearerAuth()
@Controller('patient-portal')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientPortalController {
  constructor(private readonly service: PatientPortalService) {}

  @Get('my-profile')
  @RequirePermissions('patient.view.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@CurrentUser() user: any, @TenantId() tenantId: string) {
    return this.service.getProfile(user.id, tenantId);
  }

  @Patch('my-profile')
  @RequirePermissions('patient.update.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @Body() updateDto: any,
    @CurrentUser() user: any,
    @TenantId() tenantId: string
  ) {
    return this.service.updateProfile(user.id, updateDto, tenantId);
  }

  @Get('my-appointments')
  @RequirePermissions('patient.view.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Get patient appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  getMyAppointments(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
    @Query() query: any
  ) {
    return this.service.getMyAppointments(user.id, tenantId, query);
  }

  @Post('book-appointment')
  @RequirePermissions('appointment.create.own', 'PATIENT_PORTAL_ACCESS', 'BOOK_ONLINE')
  @ApiOperation({ summary: 'Book an appointment' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  bookAppointment(
    @Body() createDto: any,
    @CurrentUser() user: any,
    @TenantId() tenantId: string
  ) {
    return this.service.bookAppointment(user.id, createDto, tenantId);
  }

  @Get('my-medical-records')
  @RequirePermissions('patient.view.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Get patient medical records' })
  @ApiResponse({ status: 200, description: 'Medical records retrieved successfully' })
  getMyRecords(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
    @Query() query: any
  ) {
    return this.service.getMyRecords(user.id, tenantId, query);
  }

  @Get('my-lab-results')
  @RequirePermissions('patient.view.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Get patient lab results' })
  @ApiResponse({ status: 200, description: 'Lab results retrieved successfully' })
  getMyLabResults(
    @CurrentUser() user: any,
    @TenantId() tenantId: string
  ) {
    return this.service.getMyLabResults(user.id, tenantId);
  }

  @Get('my-prescriptions')
  @RequirePermissions('patient.view.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Get patient prescriptions' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  getMyPrescriptions(
    @CurrentUser() user: any,
    @TenantId() tenantId: string
  ) {
    return this.service.getMyPrescriptions(user.id, tenantId);
  }

  @Get('my-invoices')
  @RequirePermissions('patient.view.own', 'PATIENT_PORTAL_ACCESS')
  @ApiOperation({ summary: 'Get patient invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  getMyInvoices(
    @CurrentUser() user: any,
    @TenantId() tenantId: string
  ) {
    return this.service.getMyInvoices(user.id, tenantId);
  }
}
