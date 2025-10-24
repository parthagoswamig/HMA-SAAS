import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import Joi from 'joi';

// TypeORM Database Configuration
import { getDatabaseConfig } from './config/database.config';

// New Core Platform (TypeORM-based)
import { CoreModule } from './core/core.module';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';

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
        
        // TypeORM/PostgreSQL (new core platform)
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().default('postgres'),
        DATABASE_PASSWORD: Joi.string().default('postgres'),
        DATABASE_NAME: Joi.string().default('hms_db'),
        
        // JWT
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
        JWT_REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),
        
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

    // NEW: TypeORM Database for Core Platform
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // NEW: Core Platform (Auth, Tenant, Audit) - TypeORM-based
    CoreModule,

    // Existing Prisma database module
    PrismaModule,

    // Keep existing auth for backward compatibility
    // (can be removed once fully migrated to new auth)
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
