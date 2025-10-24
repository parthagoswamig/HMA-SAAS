import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import Joi from 'joi';

// Tenants module
import { TenantsModule } from './tenants/tenants.module';

// Existing Prisma-based modules (keep as is for now)
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule as OldAuthModule } from './auth/auth.module';
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

// Basic controllers and services
import { AppController } from './app.controller';
import { AppService } from './app.service';

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

    // Keep existing auth for backward compatibility
    OldAuthModule,

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    
    // Global validation pipe for DTOs
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
    
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
export class AppModule {}
