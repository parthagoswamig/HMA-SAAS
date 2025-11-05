import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomPrismaService } from '../../prisma/custom-prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: CustomPrismaService) {}

  /**
   * Get all permissions
   */
  async findAll() {
    return this.prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get permissions by category
   */
  async findByCategory(category: string) {
    return this.prisma.permission.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all permission categories
   */
  async getCategories() {
    const permissions = await this.prisma.permission.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return permissions
      .map((p) => p.category)
      .filter((c) => c !== null)
      .sort();
  }

  /**
   * Get permission by ID
   */
  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  /**
   * Get permission by name
   */
  async findByName(name: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${name} not found`);
    }

    return permission;
  }

  /**
   * Check if a user has a specific permission
   */
  async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.tenantRole) {
      return false;
    }

    return user.tenantRole.rolePermissions.some(
      (rp) => rp.permission.name === permissionName && rp.permission.isActive
    );
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                permission: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.tenantRole) {
      return [];
    }

    return user.tenantRole.rolePermissions.map((rp) => rp.permission);
  }
}
