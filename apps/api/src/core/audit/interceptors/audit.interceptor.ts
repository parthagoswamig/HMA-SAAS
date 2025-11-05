import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import { Reflector } from '@nestjs/core';

/**
 * Decorator to mark routes for audit logging
 */
export const AuditLog = (
  action: AuditAction,
  entityType: AuditEntityType,
  options?: {
    description?: string;
    isSensitive?: boolean;
    captureRequest?: boolean;
    captureResponse?: boolean;
  },
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('audit:action', action, descriptor.value);
    Reflect.defineMetadata('audit:entityType', entityType, descriptor.value);
    Reflect.defineMetadata('audit:options', options || {}, descriptor.value);
    return descriptor;
  };
};

/**
 * Decorator to skip audit logging for specific routes
 */
export const SkipAudit = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('audit:skip', true, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const skipAudit = Reflect.getMetadata('audit:skip', handler);

    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Extract audit metadata from decorator
    const action = Reflect.getMetadata('audit:action', handler);
    const entityType = Reflect.getMetadata('audit:entityType', handler);
    const options = Reflect.getMetadata('audit:options', handler) || {};

    // If no audit metadata, skip logging
    if (!action || !entityType) {
      return next.handle();
    }

    // Extract user info from request (set by auth guard)
    const user = request.user;
    if (!user) {
      // Skip audit if no authenticated user
      return next.handle();
    }

    // Extract entity ID from params or body
    const entityId = request.params?.id || request.body?.id;

    // Capture request data if needed
    const requestData = options.captureRequest
      ? this.sanitizeData(request.body)
      : undefined;

    return next.handle().pipe(
      tap({
        next: (data) => {
          const durationMs = Date.now() - startTime;

          // Capture response data if needed
          const responseData = options.captureResponse
            ? this.sanitizeData(data)
            : undefined;

          // Create audit log asynchronously (don't block response)
          this.auditService
            .log({
              userId: user.sub,
              userEmail: user.email,
              userRole: user.role,
              tenantId: user.tenantId || request.headers['x-tenant-id'],
              action,
              entityType,
              entityId,
              description: options.description,
              method: request.method,
              endpoint: request.url,
              statusCode: response.statusCode,
              ipAddress: this.getClientIp(request),
              userAgent: request.headers['user-agent'],
              oldValues: requestData,
              newValues: responseData,
              isSensitive: options.isSensitive || false,
              durationMs,
            })
            .catch((error) => {
              // Log audit errors but don't fail the request
              console.error('Audit logging failed:', error);
            });
        },
        error: (error) => {
          const durationMs = Date.now() - startTime;

          // Log failed requests
          this.auditService
            .log({
              userId: user.sub,
              userEmail: user.email,
              userRole: user.role,
              tenantId: user.tenantId || request.headers['x-tenant-id'],
              action,
              entityType,
              entityId,
              description: `Failed: ${error.message}`,
              method: request.method,
              endpoint: request.url,
              statusCode: error.status || 500,
              ipAddress: this.getClientIp(request),
              userAgent: request.headers['user-agent'],
              isSuspicious: true,
              requiresReview: error.status >= 500,
              metadata: {
                error: error.message,
                stack: error.stack,
              },
              durationMs,
            })
            .catch((auditError) => {
              console.error('Audit logging failed:', auditError);
            });
        },
      }),
    );
  }

  /**
   * Extract client IP address
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
      'twoFASecret',
    ];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(data);
  }
}
