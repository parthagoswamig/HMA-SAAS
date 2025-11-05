import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import Joi from 'joi';

// Tenants module
import { TenantsModule } from './tenants/tenants.module';

// Users module (new)
import { UsersModule } from './users/users.module';

// Existing Prisma-based modules (keep as is for now)
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { StaffModule } from './staff/staff.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { BillingModule } from './billing/billing.module';
import { OpdModule } from './opd/opd.module';
import { EmrModule } from './emr/emr.module';
import { RadiologyModule } from './radiology/radiology.module';
import { PathologyModule } from './pathology/pathology.module';
import { FinanceModule } from './finance/finance.module';
import { HrModule } from './hr/hr.module';
import { ReportsModule } from './reports/reports.module';
import { PatientPortalModule } from './patient-portal/patient-portal.module';
import { TelemedicineModule } from './telemedicine/telemedicine.module';
import { PharmacyManagementModule } from './pharmacy-management/pharmacy-management.module';
import { IpdModule } from './ipd/ipd.module';
import { EmergencyModule } from './emergency/emergency.module';
import { SurgeryModule } from './surgery/surgery.module';
import { InventoryModule } from './inventory/inventory.module';
import { InsuranceModule } from './insurance/insurance.module';
import { CommunicationsModule } from './communications/communications.module';
import { QualityModule } from './quality/quality.module';
import { ResearchModule } from './research/research.module';
import { IntegrationModule } from './integration/integration.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { RbacModule } from './rbac/rbac.module';

// Phase 3 Modules
import { DoctorsModule } from './doctors/doctors.module';
import { PharmacyDrugsModule } from './pharmacy-drugs/pharmacy-drugs.module';

// Phase 5 Modules
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminRbacModule } from './admin-rbac/admin-rbac.module';

// Phase 6 Modules
import { PdfReportsModule } from './pdf-reports/pdf-reports.module';
import { QueueModule } from './queue/queue.module';
import { CronModule } from './cron/cron.module';
import { SettingsSystemModule } from './settings-system/settings-system.module';
import { SettingsHospitalModule } from './settings-hospital/settings-hospital.module';
import { AuditLogModule } from './audit-log/audit-log.module';

// Basic controllers and services
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        
        // Prisma (existing)
        DATABASE_URL: Joi.string().required(),
        
        // Stripe (optional - only needed if SubscriptionModule is enabled)
        STRIPE_SECRET_KEY: Joi.string().optional(),
        STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),
        STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
        
        // Razorpay (optional - for UPI and Indian payment methods)
        RAZORPAY_KEY_ID: Joi.string().optional(),
        RAZORPAY_KEY_SECRET: Joi.string().optional(),
        RAZORPAY_WEBHOOK_SECRET: Joi.string().optional(),
        
        // Optional
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
      }),
    }),

    // Rate limiting for security
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Existing Prisma database module
    PrismaModule,

    // Tenant management
    TenantsModule,

    // Users management (new)
    UsersModule,

    // Auth module (Phase 2 JWT)
    AuthModule,

    // Existing HMS modules (Prisma-based)
    PatientsModule,
    AppointmentsModule,
    StaffModule,
    LaboratoryModule,
    PharmacyModule,
    BillingModule,
    OpdModule,
    EmrModule,
    RadiologyModule,
    PathologyModule,
    FinanceModule,
    HrModule,
    ReportsModule,
    PatientPortalModule,
    TelemedicineModule,
    PharmacyManagementModule,
    IpdModule,
    EmergencyModule,
    SurgeryModule,
    InventoryModule,
    InsuranceModule,
    CommunicationsModule,
    QualityModule,
    ResearchModule,
    IntegrationModule,
    SubscriptionModule,
    RbacModule,
    
    // Phase 3 Modules
    DoctorsModule,
    PharmacyDrugsModule,
    
    // Phase 5 Modules
    NotificationsModule,
    AnalyticsModule,
    AdminRbacModule,
    
    // Phase 6 Modules
    PdfReportsModule,
    QueueModule,
    CronModule,
    SettingsSystemModule,
    SettingsHospitalModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    
    // Uncomment to make JWT auth global for ALL routes
    // (requires @Public() decorator on public routes)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, TenantMiddleware)
      .forRoutes('*');
  }
}
