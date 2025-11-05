import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../als/async-context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
    const headerTenant = (req.headers['x-tenant'] || req.headers['x-tenant-id'] || '') as string;
    const subdomain = typeof host === 'string' ? host.split('.')[0] : '';

    const tenantId = headerTenant || subdomain || process.env.DEFAULT_TENANT_ID || 'default';

    requestContext.run({ tenantId }, () => {
      next();
    });
  }
}
