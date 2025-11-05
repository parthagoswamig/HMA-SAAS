import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/roles.enum';

export const SKIP_TENANT_CHECK = 'skipTenantCheck';

/**
 * Skip Tenant Check Decorator
 * Use this to skip tenant isolation for specific routes (e.g., platform admin routes)
 */
export const SkipTenantCheck = () => Reflect.metadata(SKIP_TENANT_CHECK, true);

/**
 * Tenant Guard
 * Ensures data isolation between tenants
 * Validates that users can only access data from their own tenant
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if tenant check should be skipped
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK,
      [context.getHandler(), context.getClass()]
    );

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admins can access all tenants
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Ensure user has a tenant
    if (!user.tenantId) {
      throw new ForbiddenException('User tenant not found');
    }

    // Extract tenant ID from request (can be from params, query, body, or headers)
    const requestTenantId = this.extractTenantId(request);

    // If tenant ID is in request, validate it matches user's tenant
    if (requestTenantId) {
      if (user.tenantId !== requestTenantId) {
        throw new ForbiddenException(
          'Access denied. You cannot access data from another tenant'
        );
      }
    }

    // Attach tenant ID to request for downstream use
    request.tenantId = user.tenantId;

    return true;
  }

  /**
   * Extract tenant ID from various sources in the request
   */
  private extractTenantId(request: any): string | null {
    // Check URL params
    if (request.params?.tenantId) {
      return request.params.tenantId;
    }

    // Check query params
    if (request.query?.tenantId) {
      return request.query.tenantId;
    }

    // Check body
    if (request.body?.tenantId) {
      return request.body.tenantId;
    }

    // Check custom header
    if (request.headers['x-tenant-id']) {
      return request.headers['x-tenant-id'];
    }

    // Check subdomain (if using subdomain-based multi-tenancy)
    if (request.headers.host) {
      const subdomain = request.headers.host.split('.')[0];
      // You would need to validate/lookup the subdomain
      // return subdomain;
    }

    return null;
  }
}

/**
 * Enhanced Tenant Guard with Row-Level Security
 * Automatically adds tenant filter to database queries
 */
@Injectable()
export class TenantRLSGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK,
      [context.getHandler(), context.getClass()]
    );

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    if (!user.tenantId) {
      throw new ForbiddenException('User tenant not found');
    }

    // Attach tenant context for ORM/database queries
    request.tenantId = user.tenantId;
    request.tenantContext = {
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
    };

    return true;
  }
}
