import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateLabTestDto,
  UpdateLabTestDto,
  CreateLabOrderDto,
  UpdateLabOrderDto,
  UpdateLabTestResultDto,
  LabOrderQueryDto,
  LabTestQueryDto,
} from './dto';

@Injectable()
export class LaboratoryService {
  private readonly logger = new Logger(LaboratoryService.name);

  constructor(private readonly prisma: CustomPrismaService) {}

  // ==================== Lab Tests Management ====================

  async createLabTest(createLabTestDto: CreateLabTestDto, tenantId: string) {
    try {
      // Check if test code already exists
      const existing = await this.prisma.labTest.findFirst({
        where: { code: createLabTestDto.code, tenantId },
      });

      if (existing) {
        throw new BadRequestException('Lab test with this code already exists');
      }

      const labTest = await this.prisma.labTest.create({
        data: {
          ...createLabTestDto,
          tenantId,
        },
      });

      this.logger.log(`Lab test created: ${labTest.id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Lab test created successfully',
        data: labTest,
      };
    } catch (error) {
      this.logger.error(`Error creating lab test: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create lab test');
    }
  }

  async findAllLabTests(tenantId: string, query: LabTestQueryDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where = this.buildLabTestWhereClause(tenantId, query);

    const [tests, total] = await Promise.all([
      this.prisma.labTest.findMany({
        where,
        skip,
        take: parseInt(limit.toString()),
        orderBy: { name: 'asc' },
      }),
      this.prisma.labTest.count({ where }),
    ]);

    return {
      success: true,
      data: {
        tests,
        pagination: {
          total,
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneLabTest(id: string, tenantId: string) {
    const test = await this.prisma.labTest.findFirst({
      where: { id, tenantId },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    return {
      success: true,
      data: test,
    };
  }

  async updateLabTest(
    id: string,
    updateLabTestDto: UpdateLabTestDto,
    tenantId: string,
  ) {
    try {
      const test = await this.prisma.labTest.update({
        where: { id, tenantId },
        data: updateLabTestDto,
      });

      this.logger.log(`Lab test updated: ${id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Lab test updated successfully',
        data: test,
      };
    } catch (error) {
      this.logger.error(`Error updating lab test: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update lab test');
    }
  }

  async removeLabTest(id: string, tenantId: string) {
    try {
      await this.prisma.labTest.update({
        where: { id, tenantId },
        data: { isActive: false },
      });

      this.logger.log(`Lab test deactivated: ${id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Lab test deactivated successfully',
      };
    } catch (error) {
      this.logger.error(`Error deactivating lab test: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to deactivate lab test');
    }
  }

  // ==================== Lab Orders Management ====================

  async createLabOrder(createLabOrderDto: CreateLabOrderDto, tenantId: string) {
    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber(tenantId);

      // Create lab order with tests
      const labOrder = await this.prisma.labOrder.create({
        data: {
          orderNumber,
          patientId: createLabOrderDto.patientId,
          doctorId: createLabOrderDto.doctorId,
          notes: createLabOrderDto.notes,
          status: 'PENDING',
          tenantId,
          tests: {
            create: createLabOrderDto.tests.map((testId) => ({
              testId,
              status: 'PENDING',
              tenantId,
            })),
          },
        },
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
          tests: {
            include: {
              test: true,
            },
          },
        },
      });

      this.logger.log(`Lab order created: ${labOrder.id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Lab order created successfully',
        data: labOrder,
      };
    } catch (error) {
      this.logger.error(`Error creating lab order: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create lab order');
    }
  }

  async findAllLabOrders(tenantId: string, query: LabOrderQueryDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where = this.buildLabOrderWhereClause(tenantId, query);

    const [orders, total] = await Promise.all([
      this.prisma.labOrder.findMany({
        where,
        skip,
        take: parseInt(limit.toString()),
        orderBy: { orderDate: 'desc' },
        include: this.getLabOrderIncludes(),
      }),
      this.prisma.labOrder.count({ where }),
    ]);

    return {
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneLabOrder(id: string, tenantId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id, tenantId },
      include: this.getLabOrderIncludes(),
    });

    if (!order) {
      throw new NotFoundException('Lab order not found');
    }

    return {
      success: true,
      data: order,
    };
  }

  async updateLabOrder(
    id: string,
    updateLabOrderDto: UpdateLabOrderDto,
    tenantId: string,
  ) {
    try {
      const order = await this.prisma.labOrder.update({
        where: { id, tenantId },
        data: {
          ...updateLabOrderDto,
          completedDate: updateLabOrderDto.completedDate
            ? new Date(updateLabOrderDto.completedDate)
            : undefined,
        },
        include: {
          patient: true,
          doctor: true,
          tests: {
            include: {
              test: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Lab order updated successfully',
        data: order,
      };
    } catch (error) {
      console.error('Error updating lab order:', error);
      throw new BadRequestException('Failed to update lab order');
    }
  }

  async updateLabTestResult(
    orderId: string,
    testId: string,
    updateResultDto: UpdateLabTestResultDto,
    tenantId: string,
  ) {
    try {
      // Find the specific lab order test
      const labOrderTest = await this.prisma.labOrderTest.findFirst({
        where: {
          orderId,
          testId,
          tenantId,
        },
      });

      if (!labOrderTest) {
        throw new NotFoundException('Lab test in order not found');
      }

      // Update the test result
      const updatedTest = await this.prisma.labOrderTest.update({
        where: { id: labOrderTest.id },
        data: {
          result: updateResultDto.result,
          resultDate: updateResultDto.resultDate
            ? new Date(updateResultDto.resultDate)
            : new Date(),
          referenceRange: updateResultDto.referenceRange,
          notes: updateResultDto.notes,
          status: updateResultDto.status || 'COMPLETED',
        },
        include: {
          test: true,
        },
      });

      // Check if all tests in the order are completed
      const allTests = await this.prisma.labOrderTest.findMany({
        where: { orderId, tenantId },
      });

      const allCompleted = allTests.every((t) => t.status === 'COMPLETED');

      // If all tests are completed, update the order status
      if (allCompleted) {
        await this.prisma.labOrder.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            completedDate: new Date(),
          },
        });
      }

      return {
        success: true,
        message: 'Lab test result updated successfully',
        data: updatedTest,
      };
    } catch (error) {
      console.error('Error updating lab test result:', error);
      throw new BadRequestException(
        error.message || 'Failed to update lab test result',
      );
    }
  }

  async cancelLabOrder(id: string, tenantId: string) {
    try {
      await this.prisma.labOrder.update({
        where: { id, tenantId },
        data: { status: 'CANCELLED' },
      });

      return {
        success: true,
        message: 'Lab order cancelled successfully',
      };
    } catch (error) {
      console.error('Error cancelling lab order:', error);
      throw new BadRequestException('Failed to cancel lab order');
    }
  }

  async getLabStats(tenantId: string) {
    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalTests,
      activeTests,
      todayOrders,
    ] = await Promise.all([
      this.prisma.labOrder.count({ where: { tenantId } }),
      this.prisma.labOrder.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.labOrder.count({
        where: { tenantId, status: 'IN_PROGRESS' },
      }),
      this.prisma.labOrder.count({ where: { tenantId, status: 'COMPLETED' } }),
      this.prisma.labTest.count({ where: { tenantId } }),
      this.prisma.labTest.count({ where: { tenantId, isActive: true } }),
      this.prisma.labOrder.count({
        where: {
          tenantId,
          orderDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders:
          totalOrders - pendingOrders - inProgressOrders - completedOrders,
        totalTests,
        activeTests,
        todayOrders,
      },
    };
  }

  private getLabOrderIncludes() {
    return {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          medicalRecordNumber: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          email: true,
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
      tests: {
        include: {
          test: true,
        },
      },
    };
  }

  private buildLabOrderWhereClause(tenantId: string, query: LabOrderQueryDto) {
    const {
      search,
      status,
      patientId,
      doctorId,
      startDate,
      endDate,
    } = query;

    const where: any = {
      tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        {
          patient: {
            medicalRecordNumber: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    return where;
  }

  private buildLabTestWhereClause(tenantId: string, query: LabTestQueryDto) {
    const { search, category, isActive = true } = query;

    const where: any = {
      tenantId,
      isActive,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.labOrder.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `LAB${year}${month}${String(count + 1).padStart(5, '0')}`;
  }
}
