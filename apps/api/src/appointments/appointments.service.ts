import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  CheckAvailabilityDto,
  CalendarQueryDto,
} from './dto/appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly DEFAULT_DURATION_MINUTES = 30;

  constructor(private readonly prisma: CustomPrismaService) {}

  async create(tenantId: string, createAppointmentDto: CreateAppointmentDto) {
    try {
      const { appointmentDateTime, ...rest } = createAppointmentDto;
      const startTime = new Date(appointmentDateTime);
      const endTime = new Date(
        startTime.getTime() + this.DEFAULT_DURATION_MINUTES * 60 * 1000,
      );

      // Check if slot is available
      const isAvailable = await this.isSlotAvailable(
        rest.doctorId,
        startTime,
        tenantId,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          'This time slot is not available for the selected doctor',
        );
      }

      const appointment = await this.prisma.appointment.create({
        data: {
          patientId: rest.patientId,
          doctorId: rest.doctorId,
          departmentId: rest.departmentId,
          startTime,
          endTime,
          reason: rest.reason,
          notes: rest.notes,
          status: rest.status || AppointmentStatus.SCHEDULED,
          tenantId,
        },
        include: this.getAppointmentIncludes(),
      });

      this.logger.log(
        `Appointment created: ${appointment.id} for tenant: ${tenantId}`,
      );

      return {
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      };
    } catch (error) {
      this.logger.error(
        `Error creating appointment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(tenantId: string, query: AppointmentQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      doctorId,
      patientId,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(
      tenantId,
      search,
      status,
      doctorId,
      patientId,
      startDate,
      endDate,
    );

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: this.getAppointmentIncludes(),
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      success: true,
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
      include: this.getAppointmentIncludes(),
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return {
      success: true,
      data: appointment,
    };
  }

  async update(
    tenantId: string,
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ) {
    try {
      // Verify appointment exists
      await this.findOne(tenantId, id);

      const { appointmentDateTime, ...rest } = updateAppointmentDto;
      const updateData: any = { ...rest };

      if (appointmentDateTime) {
        const startTime = new Date(appointmentDateTime);
        const endTime = new Date(
          startTime.getTime() + this.DEFAULT_DURATION_MINUTES * 60 * 1000,
        );
        updateData.startTime = startTime;
        updateData.endTime = endTime;
      }

      const appointment = await this.prisma.appointment.update({
        where: { id },
        data: updateData,
        include: this.getAppointmentIncludes(),
      });

      this.logger.log(
        `Appointment updated: ${id} for tenant: ${tenantId}`,
      );

      return {
        success: true,
        message: 'Appointment updated successfully',
        data: appointment,
      };
    } catch (error) {
      this.logger.error(
        `Error updating appointment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(tenantId: string, id: string) {
    try {
      // Verify appointment exists
      await this.findOne(tenantId, id);

      await this.prisma.appointment.delete({
        where: { id },
      });

      this.logger.log(
        `Appointment deleted: ${id} for tenant: ${tenantId}`,
      );

      return {
        success: true,
        message: 'Appointment deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting appointment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getCalendarView(tenantId: string, startDate: string, endDate: string) {
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    // Basic implementation - in real scenario this would check doctor's schedule
    const appointedTimes = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        startTime: {
          gte: new Date(date + 'T00:00:00Z'),
          lt: new Date(date + 'T23:59:59Z'),
        },
      },
      select: { startTime: true },
    });

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const slots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(
          date +
            `T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`,
        );
        const isBooked = appointedTimes.some(
          (apt) =>
            Math.abs(apt.startTime.getTime() - slotTime.getTime()) <
            30 * 60 * 1000,
        );

        if (!isBooked) {
          slots.push({
            time: slotTime.toTimeString().substring(0, 5),
            available: true,
          });
        }
      }
    }

    return slots;
  }

  async getStats(tenantId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
    ] = await Promise.all([
      this.prisma.appointment.count({ where: { tenantId } }),
      this.prisma.appointment.count({
        where: {
          tenantId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      this.prisma.appointment.count({
        where: { tenantId, status: 'SCHEDULED' },
      }),
      this.prisma.appointment.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
    ]);

    return {
      total: totalAppointments,
      today: todayAppointments,
      pending: pendingAppointments,
      completed: completedAppointments,
    };
  }

  async getCalendar(tenantId: string, query: CalendarQueryDto) {
    const { startDate, endDate } = query;
    const appointments = await this.getCalendarView(tenantId, startDate, endDate);
    
    return {
      success: true,
      data: appointments,
    };
  }

  async checkAvailability(tenantId: string, query: CheckAvailabilityDto) {
    const { doctorId, date } = query;
    const slots = await this.getAvailableSlots(doctorId, date);
    
    return {
      success: true,
      data: slots,
    };
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    tenantId: string,
  ) {
    try {
      // Verify appointment exists
      await this.findOne(tenantId, id);

      const appointment = await this.prisma.appointment.update({
        where: { id },
        data: { status },
        include: this.getAppointmentIncludes(),
      });

      this.logger.log(
        `Appointment status updated: ${id} to ${status} for tenant: ${tenantId}`,
      );

      return {
        success: true,
        message: 'Appointment status updated successfully',
        data: appointment,
      };
    } catch (error) {
      this.logger.error(
        `Error updating appointment status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Private helper methods
  private getAppointmentIncludes() {
    return {
      patient: {
        select: {
          id: true,
          medicalRecordNumber: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    };
  }

  private buildWhereClause(
    tenantId: string,
    search?: string,
    status?: AppointmentStatus,
    doctorId?: string,
    patientId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = { tenantId };

    if (search) {
      where.OR = [
        {
          patient: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { medicalRecordNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          doctor: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startTime = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.startTime = {
        lte: new Date(endDate),
      };
    }

    return where;
  }

  private async isSlotAvailable(
    doctorId: string,
    startTime: Date,
    tenantId: string,
  ): Promise<boolean> {
    const endTime = new Date(
      startTime.getTime() + this.DEFAULT_DURATION_MINUTES * 60 * 1000,
    );

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        tenantId,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    return !conflictingAppointment;
  }
}
