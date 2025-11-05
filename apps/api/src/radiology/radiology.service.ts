import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateStudyDto,
  UpdateStudyDto,
  CreateReportDto,
  UpdateReportDto,
  CreateRadiologyOrderDto,
  UpdateRadiologyOrderDto,
  RadiologyFilterDto,
} from './dto';

@Injectable()
export class RadiologyService {
  private readonly logger = new Logger(RadiologyService.name);

  constructor(private prisma: CustomPrismaService) {}

  /**
   * Build where clause for radiology queries
   */
  private buildWhereClause(tenantId: string, filters: Partial<RadiologyFilterDto> = {}) {
    const where: any = {
      tenantId,
      isActive: true,
    };

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    return where;
  }

  /**
   * Get standard includes for study queries
   */
  private getStudyIncludes() {
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
      modality: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
        },
      },
    };
  }

  /**
   * Get standard includes for report queries
   */
  private getReportIncludes() {
    return {
      study: {
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
            },
          },
          modality: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
    };
  }

  /**
   * Get standard includes for order queries
   */
  private getOrderIncludes() {
    return {
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
      modality: {
        select: {
          id: true,
          name: true,
          type: true,
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

  // Studies
  async createStudy(createDto: any, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: createDto.patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const studyId = `STD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const study = await this.prisma.study.create({
      data: {
        studyId,
        patientId: createDto.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        modalityId: createDto.modalityId,
        description: createDto.description,
        notes: createDto.notes,
        priority: createDto.priority || 'ROUTINE',
        tenantId,
      },
      include: {
        patient: true,
        modality: true,
      },
    });

    return {
      success: true,
      message: 'Study created successfully',
      data: study,
    };
  }

  async findAllStudies(tenantId: string, query: any) {
    const { page = 1, limit = 10, status, patientId } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isActive: true };
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const [studies, total] = await Promise.all([
      this.prisma.study.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          patient: true,
          modality: true,
          radReports: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.study.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: studies,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneStudy(id: string, tenantId: string) {
    const study = await this.prisma.study.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        patient: true,
        modality: true,
        radReports: true,
        series: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!study) {
      throw new NotFoundException('Study not found');
    }

    return { success: true, data: study };
  }

  async updateStudy(id: string, updateDto: any, tenantId: string) {
    const study = await this.prisma.study.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!study) {
      throw new NotFoundException('Study not found');
    }

    const updated = await this.prisma.study.update({
      where: { id },
      data: updateDto,
      include: {
        patient: true,
        modality: true,
      },
    });

    return {
      success: true,
      message: 'Study updated successfully',
      data: updated,
    };
  }

  async removeStudy(id: string, tenantId: string) {
    const study = await this.prisma.study.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!study) {
      throw new NotFoundException('Study not found');
    }

    await this.prisma.study.update({
      where: { id },
      data: { isActive: false, status: 'DELETED' },
    });

    return {
      success: true,
      message: 'Study deleted successfully',
    };
  }

  // Reports
  async createReport(createDto: any, tenantId: string) {
    const study = await this.prisma.study.findFirst({
      where: { id: createDto.studyId, tenantId },
    });

    if (!study) {
      throw new NotFoundException('Study not found');
    }

    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const report = await this.prisma.radReport.create({
      data: {
        reportId,
        studyId: createDto.studyId,
        findings: createDto.findings,
        impression: createDto.impression,
        conclusion: createDto.conclusion,
        reportTemplateId: createDto.reportTemplateId,
        tenantId,
      },
      include: {
        study: {
          include: {
            patient: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Report created successfully',
      data: report,
    };
  }

  async findAllReports(tenantId: string, query: any) {
    const { page = 1, limit = 10, status, studyId } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isActive: true };
    if (status) where.status = status;
    if (studyId) where.studyId = studyId;

    const [reports, total] = await Promise.all([
      this.prisma.radReport.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          study: {
            include: {
              patient: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.radReport.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: reports,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneReport(id: string, tenantId: string) {
    const report = await this.prisma.radReport.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        study: {
          include: {
            patient: true,
            modality: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return { success: true, data: report };
  }

  async updateReport(id: string, updateDto: any, tenantId: string) {
    const report = await this.prisma.radReport.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updated = await this.prisma.radReport.update({
      where: { id },
      data: updateDto,
      include: {
        study: {
          include: {
            patient: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Report updated successfully',
      data: updated,
    };
  }

  // Orders
  async createOrder(createDto: any, tenantId: string) {
    const order = await this.prisma.radiologyOrder.create({
      data: {
        ...createDto,
        tenantId,
      },
      include: {
        patient: true,
        doctor: true,
        modality: true,
      },
    });

    return {
      success: true,
      message: 'Radiology order created successfully',
      data: order,
    };
  }

  async findAllOrders(tenantId: string, query: any) {
    const { page = 1, limit = 10, status, patientId } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isActive: true };
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const [orders, total] = await Promise.all([
      this.prisma.radiologyOrder.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          patient: true,
          doctor: true,
          modality: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.radiologyOrder.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneOrder(id: string, tenantId: string) {
    const order = await this.prisma.radiologyOrder.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        patient: true,
        doctor: true,
        modality: true,
        study: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return { success: true, data: order };
  }

  async updateOrder(id: string, updateDto: any, tenantId: string) {
    const order = await this.prisma.radiologyOrder.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prisma.radiologyOrder.update({
      where: { id },
      data: updateDto,
      include: {
        patient: true,
        doctor: true,
        modality: true,
      },
    });

    return {
      success: true,
      message: 'Order updated successfully',
      data: updated,
    };
  }

  async getStats(tenantId: string) {
    const [
      totalStudies,
      pendingStudies,
      completedStudies,
      totalReports,
      pendingReports,
      totalOrders,
    ] = await Promise.all([
      this.prisma.study.count({ where: { tenantId, isActive: true } }),
      this.prisma.study.count({
        where: { tenantId, isActive: true, status: 'SCHEDULED' },
      }),
      this.prisma.study.count({
        where: { tenantId, isActive: true, status: 'COMPLETED' },
      }),
      this.prisma.radReport.count({ where: { tenantId, isActive: true } }),
      this.prisma.radReport.count({
        where: { tenantId, isActive: true, status: 'DRAFT' },
      }),
      this.prisma.radiologyOrder.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        studies: {
          total: totalStudies,
          pending: pendingStudies,
          completed: completedStudies,
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
        },
        orders: {
          total: totalOrders,
        },
      },
    };
  }
}
