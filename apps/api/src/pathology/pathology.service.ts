import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PathologyService {
  constructor(private prisma: PrismaService) {}

  // Lab Tests
  async createTest(createDto: any, tenantId: string) {
    const existing = await this.prisma.labTest.findFirst({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new ConflictException('Test code already exists');
    }

    const test = await this.prisma.labTest.create({
      data: {
        ...createDto,
        tenantId,
      },
    });

    return {
      success: true,
      message: 'Lab test created successfully',
      data: test,
    };
  }

  async findAllTests(tenantId: string, query: any) {
    const { page = 1, limit = 10, category, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tests, total] = await Promise.all([
      this.prisma.labTest.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      this.prisma.labTest.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: tests,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneTest(id: string, tenantId: string) {
    const test = await this.prisma.labTest.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    return { success: true, data: test };
  }

  async updateTest(id: string, updateDto: any, tenantId: string) {
    const test = await this.prisma.labTest.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    const updated = await this.prisma.labTest.update({
      where: { id },
      data: updateDto,
    });

    return {
      success: true,
      message: 'Lab test updated successfully',
      data: updated,
    };
  }

  async removeTest(id: string, tenantId: string) {
    const test = await this.prisma.labTest.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    await this.prisma.labTest.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Lab test deleted successfully',
    };
  }

  // Lab Orders
  async createOrder(createDto: any, tenantId: string) {
    const orderNumber = `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = await this.prisma.labOrder.create({
      data: {
        orderNumber,
        patientId: createDto.patientId,
        doctorId: createDto.doctorId,
        notes: createDto.notes,
        tenantId,
        tests: {
          create: createDto.tests.map((testId: string) => ({
            testId,
            tenantId,
          })),
        },
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
      message: 'Lab order created successfully',
      data: order,
    };
  }

  async findAllOrders(tenantId: string, query: any) {
    const { page = 1, limit = 10, status, patientId } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const [orders, total] = await Promise.all([
      this.prisma.labOrder.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          patient: true,
          doctor: true,
          tests: {
            include: {
              test: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.labOrder.count({ where }),
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
    const order = await this.prisma.labOrder.findFirst({
      where: { id, tenantId },
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

    if (!order) {
      throw new NotFoundException('Lab order not found');
    }

    return { success: true, data: order };
  }

  async updateOrder(id: string, updateDto: any, tenantId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Lab order not found');
    }

    const updated = await this.prisma.labOrder.update({
      where: { id },
      data: updateDto,
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
      data: updated,
    };
  }

  async removeOrder(id: string, tenantId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Lab order not found');
    }

    await this.prisma.labOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return {
      success: true,
      message: 'Lab order cancelled successfully',
    };
  }

  async updateTestResult(
    orderId: string,
    testId: string,
    resultDto: any,
    tenantId: string,
  ) {
    const orderTest = await this.prisma.labOrderTest.findFirst({
      where: {
        orderId,
        testId,
        tenantId,
      },
    });

    if (!orderTest) {
      throw new NotFoundException('Test not found in order');
    }

    const updated = await this.prisma.labOrderTest.update({
      where: { id: orderTest.id },
      data: {
        result: resultDto.result,
        notes: resultDto.notes,
        status: 'COMPLETED',
        resultDate: new Date(),
      },
      include: {
        test: true,
        order: true,
      },
    });

    // Check if all tests are completed
    const allTests = await this.prisma.labOrderTest.findMany({
      where: { orderId },
    });

    const allCompleted = allTests.every((t) => t.status === 'COMPLETED');

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
      message: 'Test result updated successfully',
      data: updated,
    };
  }

  async getStats(tenantId: string) {
    const [
      totalTests,
      activeTests,
      totalOrders,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      this.prisma.labTest.count({ where: { tenantId } }),
      this.prisma.labTest.count({ where: { tenantId, isActive: true } }),
      this.prisma.labOrder.count({ where: { tenantId } }),
      this.prisma.labOrder.count({
        where: { tenantId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }),
      this.prisma.labOrder.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
    ]);

    return {
      success: true,
      data: {
        tests: {
          total: totalTests,
          active: activeTests,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
        },
      },
    };
  }
}
