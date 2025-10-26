import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithTenant extends Request {
  user?: any;
  tenantId?: string;
}

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantIsolationMiddleware.name);

  use(req: RequestWithTenant, res: Response, next: NextFunction) {
    // Skip tenant isolation for auth routes
    if (req.path.startsWith('/auth') || req.path === '/health' || req.path === '/') {
      return next();
    }

    // Extract tenant ID from authenticated user
    if (req.user && req.user.tenantId) {
      req.tenantId = req.user.tenantId;
      this.logger.debug(`Tenant ID set from user: ${req.tenantId}`);
    } else if (req.headers['x-tenant-id']) {
      // Allow tenant ID from header for testing (should be restricted in production)
      req.tenantId = req.headers['x-tenant-id'] as string;
      this.logger.debug(`Tenant ID set from header: ${req.tenantId}`);
    }

    // For authenticated routes, tenant ID is required
    if (req.user && !req.tenantId) {
      this.logger.error('No tenant ID found for authenticated user');
      throw new ForbiddenException('Tenant context is required');
    }

    next();
  }
}
