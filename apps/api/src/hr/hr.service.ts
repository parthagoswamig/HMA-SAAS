import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async createStaff(createDto: any, tenantId: string) {
    const staff = await this.prisma.staff.create({
      data: {
        ...createDto,
        tenantId,
      },
      include: {
        user: true,
        department: true,
      },
    });

    return {
      success: true,
      message: 'Staff created successfully',
      data: staff,
    };
  }

  async findAllStaff(tenantId: string, query: any) {
    const { page = 1, limit = 10, departmentId, designation, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (departmentId) where.departmentId = departmentId;
    if (designation) where.designation = designation;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: true,
          department: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: staff,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOneStaff(id: string, tenantId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, tenantId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return { success: true, data: staff };
  }

  async updateStaff(id: string, updateDto: any, tenantId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const updated = await this.prisma.staff.update({
      where: { id },
      data: updateDto,
      include: {
        user: true,
        department: true,
      },
    });

    return {
      success: true,
      message: 'Staff updated successfully',
      data: updated,
    };
  }

  async removeStaff(id: string, tenantId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    await this.prisma.staff.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Staff deactivated successfully',
    };
  }

  async findAllDepartments(tenantId: string, query: any) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where: { tenantId, isActive: true },
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: { staff: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.department.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        items: departments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getStats(tenantId: string) {
    const [
      totalStaff,
      activeStaff,
      inactiveStaff,
      totalDepartments,
      staffByDepartment,
    ] = await Promise.all([
      this.prisma.staff.count({ where: { tenantId } }),
      this.prisma.staff.count({ where: { tenantId, isActive: true } }),
      this.prisma.staff.count({ where: { tenantId, isActive: false } }),
      this.prisma.department.count({ where: { tenantId, isActive: true } }),
      this.prisma.staff.groupBy({
        by: ['departmentId'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        staff: {
          total: totalStaff,
          active: activeStaff,
          inactive: inactiveStaff,
        },
        departments: {
          total: totalDepartments,
          distribution: staffByDepartment,
        },
      },
    };
  }

  async getAttendance(tenantId: string, query: any) {
    const { startDate, endDate, staffId } = query;

    // This is a placeholder for attendance tracking
    // In a real system, you'd have an Attendance model
    return {
      success: true,
      message: 'Attendance feature requires Attendance model',
      data: {
        startDate,
        endDate,
        staffId,
        records: [],
      },
    };
  }
}
