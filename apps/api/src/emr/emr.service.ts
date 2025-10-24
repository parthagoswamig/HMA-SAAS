import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  EmrFilterDto,
} from './dto';

@Injectable()
export class EmrService {
  private readonly logger = new Logger(EmrService.name);

  constructor(private prisma: CustomPrismaService) {}

  /**
   * Build where clause for medical record queries
   */
  private buildWhereClause(tenantId: string, filters: Partial<EmrFilterDto> = {}) {
    const where: any = {
      tenantId,
      isActive: true,
    };

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.recordType) {
      where.recordType = filters.recordType;
    }

    return where;
  }

  /**
   * Get standard includes for medical record queries
   */
  private getIncludes() {
    return {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          medicalRecordNumber: true,
          email: true,
          phone: true,
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
    };
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(page: number, limit: number) {
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
  }

  async create(
    createDto: CreateMedicalRecordDto,
    tenantId: string,
  ) {
    this.logger.log(
      `Creating medical record for patient ${createDto.patientId} in tenant ${tenantId}`,
    );

    try {
      const record = await this.prisma.medicalRecord.create({
        data: {
          patientId: createDto.patientId,
          recordType: createDto.recordType,
          title: createDto.title,
          description: createDto.description,
          date: createDto.date ? new Date(createDto.date) : new Date(),
          doctorId: createDto.doctorId,
          tenantId,
        },
        include: this.getIncludes(),
      });

      this.logger.log(
        `Successfully created medical record ${record.id} for patient ${createDto.patientId}`,
      );

      return {
        success: true,
        message: 'Medical record created successfully',
        data: record,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create medical record for patient ${createDto.patientId}`,
        error.stack,
      );
      
      if (error.code === 'P2002') {
        throw new BadRequestException('Duplicate medical record');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Patient or doctor not found');
      }
      throw error;
    }
  }

  async findAll(tenantId: string, filters: EmrFilterDto = {}) {
    this.logger.log(`Fetching medical records for tenant ${tenantId}`);

    const { page = 1, limit = 10 } = filters;
    this.validatePaginationParams(page, limit);

    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(tenantId, filters);

    try {
      const [records, total] = await Promise.all([
        this.prisma.medicalRecord.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'desc' },
          include: this.getIncludes(),
        }),
        this.prisma.medicalRecord.count({ where }),
      ]);

      this.logger.log(
        `Found ${records.length} medical records (${total} total) for tenant ${tenantId}`,
      );

      return {
        success: true,
        data: {
          records,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch medical records for tenant ${tenantId}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByPatient(patientId: string, tenantId: string) {
    this.logger.log(
      `Fetching medical records for patient ${patientId} in tenant ${tenantId}`,
    );

    try {
      const records = await this.prisma.medicalRecord.findMany({
        where: {
          patientId,
          tenantId,
          isActive: true,
        },
        orderBy: { date: 'desc' },
        include: this.getIncludes(),
      });

      this.logger.log(
        `Found ${records.length} medical records for patient ${patientId}`,
      );

      return {
        success: true,
        data: records,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch medical records for patient ${patientId}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string, tenantId: string) {
    this.logger.log(
      `Fetching medical record ${id} for tenant ${tenantId}`,
    );

    try {
      const record = await this.prisma.medicalRecord.findFirst({
        where: { id, tenantId, isActive: true },
        include: this.getIncludes(),
      });

      if (!record) {
        this.logger.warn(`Medical record ${id} not found in tenant ${tenantId}`);
        throw new NotFoundException('Medical record not found');
      }

      this.logger.log(
        `Successfully retrieved medical record ${id}`,
      );

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Failed to fetch medical record ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateDto: UpdateMedicalRecordDto,
    tenantId: string,
  ) {
    this.logger.log(
      `Updating medical record ${id} for tenant ${tenantId}`,
    );

    try {
      const record = await this.prisma.medicalRecord.update({
        where: { id, tenantId },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
        include: this.getIncludes(),
      });

      this.logger.log(
        `Successfully updated medical record ${id}`,
      );

      return {
        success: true,
        message: 'Medical record updated successfully',
        data: record,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update medical record ${id}`,
        error.stack,
      );
      
      if (error.code === 'P2025') {
        throw new NotFoundException('Medical record not found');
      }
      throw error;
    }
  }

  async remove(id: string, tenantId: string) {
    this.logger.log(
      `Soft deleting medical record ${id} for tenant ${tenantId}`,
    );

    try {
      await this.prisma.medicalRecord.update({
        where: { id, tenantId },
        data: { 
          isActive: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Successfully soft deleted medical record ${id}`,
      );

      return {
        success: true,
        message: 'Medical record deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete medical record ${id}`,
        error.stack,
      );
      
      if (error.code === 'P2025') {
        throw new NotFoundException('Medical record not found');
      }
      throw error;
    }
  }

  async getStats(tenantId: string) {
    this.logger.log(`Fetching EMR statistics for tenant ${tenantId}`);

    try {
      const [total, byType, recentRecords] = await Promise.all([
        this.prisma.medicalRecord.count({
          where: { tenantId, isActive: true },
        }),
        this.prisma.medicalRecord.groupBy({
          by: ['recordType'],
          where: { tenantId, isActive: true },
          _count: true,
        }),
        this.prisma.medicalRecord.count({
          where: {
            tenantId,
            isActive: true,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      this.logger.log(
        `Retrieved EMR statistics: ${total} total records for tenant ${tenantId}`,
      );

      return {
        success: true,
        data: {
          total,
          recentRecords,
          byType: byType.map(item => ({
            recordType: item.recordType,
            count: item._count,
          })),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch EMR statistics for tenant ${tenantId}`,
        error.stack,
      );
      throw error;
    }
  }
}
