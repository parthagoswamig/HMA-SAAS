import { Module, Global } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { AuditModule } from './audit/audit.module';

/**
 * Core Module - Global module that bundles all core platform services
 * 
 * This module is marked as @Global so all core services are available
 * throughout the application without explicit imports.
 * 
 * Includes:
 * - Authentication (JWT, login, registration, password management)
 * - Tenant Management (multi-tenancy, subscriptions)
 * - Audit Logging (compliance, activity tracking)
 * - RBAC (guards, decorators already available via exports)
 */
@Global()
@Module({
  imports: [
    AuthModule,
    TenantModule,
    AuditModule,
  ],
  exports: [
    AuthModule,
    TenantModule,
    AuditModule,
  ],
})
export class CoreModule {}
