import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { CustomPrismaService } from '../../prisma/custom-prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: CustomPrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admins bypass permission checks
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Get user with role and permissions
    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: user.userId },
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

    if (!userWithPermissions || !userWithPermissions.tenantRole) {
      throw new ForbiddenException('User has no role assigned');
    }

    // Get user's permission names
    const userPermissions = userWithPermissions.tenantRole.rolePermissions.map(
      (rp) => rp.permission.name,
    );

    // Check if user has at least one of the required permissions (OR logic)
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(' or ')}`,
      );
    }

    // Attach permissions to request for later use
    request.user.permissions = userPermissions;

    return true;
  }
}
