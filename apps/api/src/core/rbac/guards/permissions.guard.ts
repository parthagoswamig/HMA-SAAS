import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permissions.enum';
import { getPermissionsForRole, roleHasAnyPermission, roleHasAllPermissions } from '../role-permission.mapping';

/**
 * Permissions Guard
 * Protects routes based on user permissions
 * Works with @Permissions() decorator
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check for regular permissions
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Check for require all permissions
    const requireAll = this.reflector.get<{ permissions: Permission[]; requireAll: boolean }>(
      'require_all_permissions',
      context.getHandler()
    );

    // Check for require any permission
    const requireAny = this.reflector.get<{ permissions: Permission[]; requireAll: boolean }>(
      'require_any_permission',
      context.getHandler()
    );

    // If no permissions required, allow access
    if (!requiredPermissions && !requireAll && !requireAny) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Get user's permissions based on their role
    const userPermissions = getPermissionsForRole(user.role);

    // Handle require all permissions
    if (requireAll) {
      const hasAllPermissions = roleHasAllPermissions(user.role, requireAll.permissions);
      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Access denied. You must have ALL of these permissions: ${requireAll.permissions.join(', ')}`
        );
      }
      return true;
    }

    // Handle require any permission
    if (requireAny) {
      const hasAnyPermission = roleHasAnyPermission(user.role, requireAny.permissions);
      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Access denied. You must have at least ONE of these permissions: ${requireAny.permissions.join(', ')}`
        );
      }
      return true;
    }

    // Handle regular permissions (any permission is sufficient)
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
        );
      }
    }

    return true;
  }
}

/**
 * Alternative: Check permissions directly against user object if permissions are stored per-user
 */
@Injectable()
export class UserPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has custom permissions assigned (overrides role permissions)
    const userPermissions = user.permissions || getPermissionsForRole(user.role);

    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
