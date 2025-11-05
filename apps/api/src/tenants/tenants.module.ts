import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantOnboardingController } from './tenant-onboarding.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantsController, TenantOnboardingController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
