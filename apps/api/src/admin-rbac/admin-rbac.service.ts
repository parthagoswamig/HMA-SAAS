import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminRbacService {
  constructor(private prisma: PrismaService) {}

  listRoles(tenantId: string) {
    return this.prisma.tenantRole.findMany({ 
      where: { tenantId }, 
      include: { rolePermissions: { include: { permission: true } } } 
    });
  }

  async attachPermission(roleId: string, permissionName: string) {
    const perm = await this.prisma.permission.findUnique({ where: { name: permissionName } });
    if (!perm) throw new BadRequestException('Permission not found');

    return this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId: perm.id } },
      create: { roleId, permissionId: perm.id },
      update: {},
    });
  }

  detachPermission(roleId: string, permissionName: string) {
    return this.prisma.$transaction(async (tx) => {
      const perm = await tx.permission.findUnique({ where: { name: permissionName } });
      if (!perm) throw new BadRequestException('Permission not found');
      await tx.rolePermission.deleteMany({ where: { roleId, permissionId: perm.id } });
      return { detached: true };
    });
  }

  assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { roleId } });
  }
}
