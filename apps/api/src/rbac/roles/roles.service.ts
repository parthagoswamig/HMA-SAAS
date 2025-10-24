import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CustomPrismaService } from '../../prisma/custom-prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: CustomPrismaService) {}

  /**
   * Create a new role for a tenant
   */
  async create(tenantId: string, createRoleDto: CreateRoleDto, userId: string) {
    const { name, description, permissionIds, isActive } = createRoleDto;

    // Check if role name already exists for this tenant
    const existingRole = await this.prisma.tenantRole.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name,
        },
      },
    });

    if (existingRole) {
      throw new BadRequestException(`Role '${name}' already exists for this tenant`);
    }

    // Create role
    const role = await this.prisma.tenantRole.create({
      data: {
        tenantId,
        name,
        description,
        isActive: isActive ?? true,
        isSystem: false,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Assign permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissions(role.id, permissionIds);
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        tenantId,
        action: 'ROLE_CREATED',
        entityType: 'TenantRole',
        entityId: role.id,
        newValues: { name, description, permissionIds },
      },
    });

    return this.findOne(tenantId, role.id);
  }

  /**
   * Get all roles for a tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.tenantRole.findMany({
      where: { tenantId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * Get a single role by ID
   */
  async findOne(tenantId: string, roleId: string) {
    const role = await this.prisma.tenantRole.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return role;
  }

  /**
   * Update a role
   */
  async update(
    tenantId: string,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
    userId: string,
  ) {
    const role = await this.findOne(tenantId, roleId);

    // Prevent modification of system roles
    if (role.isSystem) {
      throw new ForbiddenException('Cannot modify system roles');
    }

    const { name, description, permissionIds, isActive } = updateRoleDto;

    // Check if new name conflicts with existing role
    if (name && name !== role.name) {
      const existingRole = await this.prisma.tenantRole.findUnique({
        where: {
          tenantId_name: {
            tenantId,
            name,
          },
        },
      });

      if (existingRole) {
        throw new BadRequestException(`Role '${name}' already exists for this tenant`);
      }
    }

    // Update role
    const updatedRole = await this.prisma.tenantRole.update({
      where: { id: roleId },
      data: {
        name,
        description,
        isActive,
      },
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove all existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await this.assignPermissions(roleId, permissionIds);
      }
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        tenantId,
        action: 'ROLE_UPDATED',
        entityType: 'TenantRole',
        entityId: roleId,
        oldValues: role as any,
        newValues: updateRoleDto as any,
      },
    });

    return this.findOne(tenantId, roleId);
  }

  /**
   * Delete a role
   */
  async remove(tenantId: string, roleId: string, userId: string) {
    const role = await this.findOne(tenantId, roleId);

    // Prevent deletion of system roles
    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system roles');
    }

    // Check if role has users assigned
    if (role._count.users > 0) {
      throw new BadRequestException(
        `Cannot delete role '${role.name}' because it has ${role._count.users} user(s) assigned. Please reassign these users first.`,
      );
    }

    // Delete role (cascade will handle rolePermissions)
    await this.prisma.tenantRole.delete({
      where: { id: roleId },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        tenantId,
        action: 'ROLE_DELETED',
        entityType: 'TenantRole',
        entityId: roleId,
        oldValues: role,
      },
    });

    return { message: `Role '${role.name}' deleted successfully` };
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissions(roleId: string, permissionIds: string[]) {
    // Validate all permission IDs exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
        isActive: true,
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more invalid permission IDs');
    }

    // Create role permissions
    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });

    return permissions;
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(tenantId: string, roleId: string) {
    const role = await this.findOne(tenantId, roleId);
    return role.rolePermissions.map((rp) => rp.permission);
  }

  /**
   * Assign role to a user
   */
  async assignRoleToUser(
    tenantId: string,
    userId: string,
    roleId: string,
    assignedBy: string,
  ) {
    // Verify role belongs to tenant
    const role = await this.findOne(tenantId, roleId);

    // Verify user belongs to tenant
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found in this tenant`);
    }

    // Update user's role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
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

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId: assignedBy,
        tenantId,
        action: 'ROLE_ASSIGNED',
        entityType: 'User',
        entityId: userId,
        newValues: { roleId, roleName: role.name },
      },
    });

    return updatedUser;
  }

  /**
   * Remove role from a user
   */
  async removeRoleFromUser(tenantId: string, userId: string, removedBy: string) {
    // Verify user belongs to tenant
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found in this tenant`);
    }

    // Remove role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId: null },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId: removedBy,
        tenantId,
        action: 'ROLE_REMOVED',
        entityType: 'User',
        entityId: userId,
        oldValues: { roleId: user.roleId },
      },
    });

    return updatedUser;
  }
}
