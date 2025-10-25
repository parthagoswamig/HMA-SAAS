import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto, UpdateShiftDto, ShiftQueryDto } from './dto/shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto, tenantId: string) {
    const shift = await this.prisma.shift.create({
      data: {
        staffId: createShiftDto.staffId,
        departmentId: createShiftDto.departmentId,
        shiftType: createShiftDto.shiftType,
        startTime: new Date(createShiftDto.startTime),
        endTime: new Date(createShiftDto.endTime),
        date: new Date(createShiftDto.date),
        notes: createShiftDto.notes,
        status: createShiftDto.status || 'SCHEDULED',
        tenantId,
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Shift created successfully',
      data: shift,
    };
  }

  async findAll(tenantId: string, query: ShiftQueryDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(tenantId, query);

    const [shifts, total] = await Promise.all([
      this.prisma.shift.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        include: {
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.shift.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: shifts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, tenantId },
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return { success: true, data: shift };
  }

  async update(id: string, updateShiftDto: UpdateShiftDto, tenantId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, tenantId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const updateData: any = { ...updateShiftDto };
    
    if (updateShiftDto.startTime) {
      updateData.startTime = new Date(updateShiftDto.startTime);
    }
    if (updateShiftDto.endTime) {
      updateData.endTime = new Date(updateShiftDto.endTime);
    }
    if (updateShiftDto.date) {
      updateData.date = new Date(updateShiftDto.date);
    }

    const updated = await this.prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        staff: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Shift updated successfully',
      data: updated,
    };
  }

  async remove(id: string, tenantId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, tenantId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    await this.prisma.shift.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Shift deactivated successfully',
    };
  }

  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalShifts,
      todayShifts,
      scheduledShifts,
      inProgressShifts,
      completedShifts,
      shiftsByType,
    ] = await Promise.all([
      this.prisma.shift.count({ where: { tenantId, isActive: true } }),
      this.prisma.shift.count({
        where: {
          tenantId,
          isActive: true,
          date: { gte: today },
        },
      }),
      this.prisma.shift.count({
        where: { tenantId, isActive: true, status: 'SCHEDULED' },
      }),
      this.prisma.shift.count({
        where: { tenantId, isActive: true, status: 'IN_PROGRESS' },
      }),
      this.prisma.shift.count({
        where: { tenantId, isActive: true, status: 'COMPLETED' },
      }),
      this.prisma.shift.groupBy({
        by: ['shiftType'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        totalShifts,
        todayShifts,
        scheduledShifts,
        inProgressShifts,
        completedShifts,
        shiftsByType: shiftsByType.map((item) => ({
          type: item.shiftType,
          count: item._count,
        })),
      },
    };
  }

  private buildWhereClause(tenantId: string, query: ShiftQueryDto) {
    const where: any = {
      tenantId,
      isActive: true,
    };

    if (query.staffId) {
      where.staffId = query.staffId;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.shiftType) {
      where.shiftType = query.shiftType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.date) {
      const date = new Date(query.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.date = {
        gte: date,
        lt: nextDay,
      };
    }

    if (query.startDate && query.endDate) {
      where.date = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    } else if (query.startDate) {
      where.date = {
        gte: new Date(query.startDate),
      };
    } else if (query.endDate) {
      where.date = {
        lte: new Date(query.endDate),
      };
    }

    return where;
  }
}
