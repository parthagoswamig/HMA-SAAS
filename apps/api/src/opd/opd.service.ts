import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma, AppointmentStatus } from '@prisma/client';
import {
  CreateOpdVisitDto,
  UpdateOpdVisitDto,
  OpdVisitFilterDto,
  OpdQueueFilterDto,
  OpdVisitStatus,
} from './dto';

@Injectable()
export class OpdService {
  private readonly logger = new Logger(OpdService.name);

  constructor(private prisma: CustomPrismaService) {}

  // ==================== Helper Methods ====================

  /**
   * Get OPD visit include options
   */
  private getOpdVisitIncludes() {
    return {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          medicalRecordNumber: true,
          dateOfBirth: true,
          gender: true,
        },
      },
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialization: true,
          licenseNumber: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    };
  }

  /**
   * Build where clause for OPD visit queries
   */
  private buildOpdVisitWhereClause(tenantId: string, filters: OpdVisitFilterDto): Prisma.AppointmentWhereInput {
    const { status, doctorId, departmentId, date, patientId, search } = filters;
    
    const where: Prisma.AppointmentWhereInput = {
      tenantId,
    };

    if (status) {
      where.status = status as any;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.startTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (search) {
      where.OR = [
        { reason: { contains: search } },
        { notes: { contains: search } },
        {
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { medicalRecordNumber: { contains: search } },
            ],
          },
        },
      ];
    }

    return where;
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(page: any, limit: any): { page: number; limit: number } {
    const validatedPage = Math.max(1, parseInt(page?.toString() || '1', 10));
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit?.toString() || '10', 10)));
    
    return { page: validatedPage, limit: validatedLimit };
  }

  /**
   * Create a new OPD visit
   */
  async createVisit(createDto: CreateOpdVisitDto, tenantId: string) {
    try {
      this.logger.log(`Creating OPD visit for patient: ${createDto.patientId}, doctor: ${createDto.doctorId}, tenant: ${tenantId}`);
      
      // Verify patient exists
      const patient = await this.prisma.patient.findFirst({
        where: { id: createDto.patientId, tenantId },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Verify doctor exists
      const doctor = await this.prisma.staff.findFirst({
        where: { id: createDto.doctorId, tenantId },
      });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      // Create appointment for OPD visit
      const visit = await this.prisma.appointment.create({
        data: {
          patientId: createDto.patientId,
          doctorId: createDto.doctorId,
          departmentId: createDto.departmentId,
          startTime: new Date(),
          endTime: new Date(Date.now() + 30 * 60000), // 30 min default
          status: (createDto.status || OpdVisitStatus.WAITING) as any,
          reason: createDto.chiefComplaint,
          notes: createDto.notes,
          tenantId,
        },
        include: this.getOpdVisitIncludes(),
      });

      this.logger.log(`Successfully created OPD visit with ID: ${visit.id}`);
      return {
        success: true,
        message: 'OPD visit created successfully',
        data: visit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error creating OPD visit:', error.message, error.stack);
      throw new BadRequestException(
        error.message || 'Failed to create OPD visit',
      );
    }
  }

  /**
   * Get all OPD visits with filters
   */
  async findAllVisits(tenantId: string, filters: OpdVisitFilterDto = {}) {
    try {
      this.logger.log(`Finding OPD visits for tenant: ${tenantId} with filters:`, filters);
      
      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildOpdVisitWhereClause(tenantId, filters);

      const [visits, total] = await Promise.all([
        this.prisma.appointment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startTime: 'desc' },
          include: this.getOpdVisitIncludes(),
        }),
        this.prisma.appointment.count({ where }),
      ]);

      this.logger.log(`Found ${visits.length} OPD visits out of ${total} total`);
      return {
        success: true,
        data: {
          visits,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding OPD visits:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch OPD visits');
    }
  }

  /**
   * Get OPD visit by ID
   */
  async findOneVisit(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding OPD visit with ID: ${id} for tenant: ${tenantId}`);
      
      const visit = await this.prisma.appointment.findFirst({
        where: { id, tenantId },
        include: this.getOpdVisitIncludes(),
      });

      if (!visit) {
        this.logger.warn(`OPD visit not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('OPD visit not found');
      }

      this.logger.log(`Successfully found OPD visit: ${visit.id}`);
      return {
        success: true,
        data: visit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding OPD visit:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch OPD visit');
    }
  }

  /**
   * Update OPD visit
   */
  async updateVisit(
    id: string,
    updateDto: UpdateOpdVisitDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Updating OPD visit with ID: ${id} for tenant: ${tenantId}`);
      
      const updateData: any = {};
      if (updateDto.doctorId) updateData.doctorId = updateDto.doctorId;
      if (updateDto.departmentId) updateData.departmentId = updateDto.departmentId;
      if (updateDto.chiefComplaint) updateData.reason = updateDto.chiefComplaint;
      if (updateDto.notes) updateData.notes = updateDto.notes;
      if (updateDto.status) updateData.status = updateDto.status;
      if (updateDto.followUpDate) updateData.followUpDate = new Date(updateDto.followUpDate);

      const visit = await this.prisma.appointment.update({
        where: { id, tenantId },
        data: updateData,
        include: this.getOpdVisitIncludes(),
      });

      this.logger.log(`Successfully updated OPD visit: ${visit.id}`);
      return {
        success: true,
        message: 'OPD visit updated successfully',
        data: visit,
      };
    } catch (error) {
      this.logger.error('Error updating OPD visit:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('OPD visit not found');
      }
      throw new BadRequestException('Failed to update OPD visit');
    }
  }

  /**
   * Cancel OPD visit
   */
  async removeVisit(id: string, tenantId: string) {
    try {
      this.logger.log(`Cancelling OPD visit with ID: ${id} for tenant: ${tenantId}`);
      
      await this.prisma.appointment.update({
        where: { id, tenantId },
        data: {
          status: OpdVisitStatus.CANCELLED as any,
        },
      });

      this.logger.log(`Successfully cancelled OPD visit: ${id}`);
      return {
        success: true,
        message: 'OPD visit cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Error cancelling OPD visit:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('OPD visit not found');
      }
      throw new BadRequestException('Failed to cancel OPD visit');
    }
  }

  /**
   * Get OPD queue
   */
  async getQueue(tenantId: string, filters: OpdQueueFilterDto = {}) {
    try {
      this.logger.log(`Getting OPD queue for tenant: ${tenantId} with filters:`, filters);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const where: any = {
        tenantId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: [OpdVisitStatus.WAITING, OpdVisitStatus.ARRIVED],
        },
      };

      if (filters.doctorId) {
        where.doctorId = filters.doctorId;
      }

      if (filters.departmentId) {
        where.departmentId = filters.departmentId;
      }

      const queue = await this.prisma.appointment.findMany({
        where,
        orderBy: { startTime: 'asc' },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Found ${queue.length} patients in OPD queue`);
      return {
        success: true,
        data: {
          queue,
          count: queue.length,
        },
      };
    } catch (error) {
      this.logger.error('Error getting OPD queue:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch OPD queue');
    }
  }

  /**
   * Get OPD statistics
   */
  async getStats(tenantId: string) {
    try {
      this.logger.log(`Getting OPD stats for tenant: ${tenantId}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalToday, completed, waiting, inConsultation, cancelled] = await Promise.all([
        this.prisma.appointment.count({
          where: {
            tenantId,
            startTime: {
              gte: today,
            },
          },
        }),
        this.prisma.appointment.count({
          where: {
            tenantId,
            startTime: {
              gte: today,
            },
            status: OpdVisitStatus.COMPLETED,
          },
        }),
        this.prisma.appointment.count({
          where: {
            tenantId,
            startTime: {
              gte: today,
            },
            status: {
              in: [AppointmentStatus.SCHEDULED, AppointmentStatus.ARRIVED],
            },
          },
        }),
        this.prisma.appointment.count({
          where: {
            tenantId,
            startTime: {
              gte: today,
            },
            status: AppointmentStatus.IN_PROGRESS,
          },
        }),
        this.prisma.appointment.count({
          where: {
            tenantId,
            startTime: {
              gte: today,
            },
            status: OpdVisitStatus.CANCELLED,
          },
        }),
      ]);

      this.logger.log(`Successfully retrieved OPD stats for tenant: ${tenantId}`);
      return {
        success: true,
        data: {
          totalToday,
          completed,
          waiting,
          inConsultation,
          cancelled,
        },
      };
    } catch (error) {
      this.logger.error('Error getting OPD stats:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch OPD statistics');
    }
  }
}
