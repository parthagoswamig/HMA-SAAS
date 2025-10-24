import { Module } from '@nestjs/common';
import { PharmacyManagementController } from './pharmacy-management.controller';
import { PharmacyManagementService } from './pharmacy-management.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PharmacyManagementController],
  providers: [PharmacyManagementService, PrismaService],
  exports: [PharmacyManagementService],
})
export class PharmacyManagementModule {}
