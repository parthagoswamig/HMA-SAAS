import { Module } from '@nestjs/common';
import { SurgeryController } from './surgery.controller';
import { SurgeryService } from './surgery.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SurgeryController],
  providers: [SurgeryService, PrismaService],
  exports: [SurgeryService],
})
export class SurgeryModule {}
