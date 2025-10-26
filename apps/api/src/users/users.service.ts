import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  ChangeUserPasswordDto,
  AssignRoleDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: CustomPrismaService) {}

  async create(tenantId: string, createDto: CreateUserDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: createDto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createDto.email,
        passwordHash: hashedPassword,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        phone: createDto.phone,
        role: createDto.role,
        roleId: createDto.roleId,
        specialization: createDto.specialization,
        licenseNumber: createDto.licenseNumber,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        roleId: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        createdAt: true,
        tenantRole: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  async findAll(tenantId: string, query: UserQueryDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      tenantId,
    };

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          roleId: true,
          specialization: true,
          licenseNumber: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          tenantRole: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        roleId: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        tenantRole: {
          select: {
            id: true,
            name: true,
            description: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  async update(tenantId: string, userId: string, updateDto: UpdateUserDto) {
    // Check if user exists
    const existing = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        roleId: true,
        specialization: true,
        licenseNumber: true,
        isActive: true,
        tenantRole: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
      data: updated,
    };
  }

  async delete(tenantId: string, userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't allow deleting super admin
    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot delete super admin user');
    }

    // Soft delete
    const deleted = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'User deleted successfully',
      data: deleted,
    };
  }

  async changePassword(tenantId: string, userId: string, dto: ChangeUserPasswordDto) {
    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async assignRole(tenantId: string, userId: string, dto: AssignRoleDto) {
    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    const role = await this.prisma.tenantRole.findFirst({
      where: {
        id: dto.roleId,
        tenantId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Update user role
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId: dto.roleId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantRole: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Role assigned successfully',
      data: updated,
    };
  }

  async getUserStats(tenantId: string) {
    const [total, active, byRole] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        byRole: byRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}
