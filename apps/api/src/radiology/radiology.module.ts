import { Module } from '@nestjs/common';
import { RadiologyController } from './radiology.controller';
import { RadiologyService } from './radiology.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RadiologyController],
  providers: [RadiologyService, PrismaService],
  exports: [RadiologyService],
})
export class RadiologyModule {}
