import { Module } from '@nestjs/common';
import { TelemedicineController } from './telemedicine.controller';
import { TelemedicineService } from './telemedicine.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TelemedicineController],
  providers: [TelemedicineService, PrismaService],
  exports: [TelemedicineService],
})
export class TelemedicineModule {}
