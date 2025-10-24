import { Module } from '@nestjs/common';
import { PatientPortalController } from './patient-portal.controller';
import { PatientPortalService } from './patient-portal.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PatientPortalController],
  providers: [PatientPortalService, PrismaService],
  exports: [PatientPortalService],
})
export class PatientPortalModule {}
