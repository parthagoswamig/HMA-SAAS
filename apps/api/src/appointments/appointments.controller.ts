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
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  UpdateAppointmentStatusDto,
  CheckAvailabilityDto,
  CalendarQueryDto,
} from './dto/appointment.dto';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @TenantId() tenantId: string,
  ) {
    return this.appointmentsService.create(tenantId, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: AppointmentQueryDto,
  ) {
    return this.appointmentsService.findAll(tenantId, query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get appointments in calendar view' })
  @ApiResponse({ status: 200, description: 'Calendar data retrieved successfully' })
  async getCalendar(
    @TenantId() tenantId: string,
    @Query() query: CalendarQueryDto,
  ) {
    return this.appointmentsService.getCalendar(tenantId, query);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Check doctor availability for a specific date' })
  @ApiResponse({ status: 200, description: 'Availability slots retrieved' })
  async checkAvailability(
    @TenantId() tenantId: string,
    @Query() query: CheckAvailabilityDto,
  ) {
    return this.appointmentsService.checkAvailability(tenantId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.appointmentsService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @TenantId() tenantId: string,
  ) {
    return this.appointmentsService.update(tenantId, id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @TenantId() tenantId: string,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      updateStatusDto.status,
      tenantId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete appointment by ID' })
  @ApiResponse({ status: 204, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.appointmentsService.remove(tenantId, id);
  }
}
