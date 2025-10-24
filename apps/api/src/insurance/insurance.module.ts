import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InsuranceController],
  providers: [InsuranceService, PrismaService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
