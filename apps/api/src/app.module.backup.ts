import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import Joi from 'joi';

// Core modules that exist and work
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

// Basic controllers and services
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        // Optional CORS configuration
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
      }),
    }),

    // Rate limiting for security
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core database module
    PrismaModule,

    // Authentication module
    AuthModule,

    // HMS modules
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
