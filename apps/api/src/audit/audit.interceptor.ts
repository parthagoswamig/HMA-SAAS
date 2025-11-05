import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, body, ip, headers } = req;
    
    // Extract tenant ID from request context
    const tenantId = req.tenantId || req.headers['x-tenant-id'] || 'default';

    return next.handle().pipe(
      tap({
        next: async (result) => {
          // Only log write operations
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
              // Extract entity info from URL
              const urlParts = url.split('/').filter(Boolean);
              const entityType = urlParts[0] || 'unknown';
              const entityId = urlParts[1] || null;

              await this.prisma.auditLog.create({
                data: {
                  action: `${method} ${url}`,
                  userId: user?.id || user?.sub || 'anonymous',
                  tenantId: tenantId,
                  entityType: entityType,
                  entityId: entityId,
                  oldValues: method === 'PUT' || method === 'PATCH' ? body : null,
                  newValues: result,
                  ipAddress: ip || headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
                  userAgent: headers['user-agent'] || 'unknown',
                },
              });
            } catch (error) {
              // Log error but don't fail the request
              console.error('Audit logging failed:', error.message);
            }
          }
        },
        error: async (error) => {
          // Log failed operations too
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
              const urlParts = url.split('/').filter(Boolean);
              const entityType = urlParts[0] || 'unknown';
              const entityId = urlParts[1] || null;

              await this.prisma.auditLog.create({
                data: {
                  action: `${method} ${url} [FAILED]`,
                  userId: user?.id || user?.sub || 'anonymous',
                  tenantId: tenantId,
                  entityType: entityType,
                  entityId: entityId,
                  oldValues: { error: error.message, status: error.status },
                  newValues: body,
                  ipAddress: ip || headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
                  userAgent: headers['user-agent'] || 'unknown',
                },
              });
            } catch (auditError) {
              console.error('Audit logging failed:', auditError.message);
            }
          }
        },
      }),
    );
  }
}
