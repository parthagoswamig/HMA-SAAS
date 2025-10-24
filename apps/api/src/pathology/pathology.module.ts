import { Module } from '@nestjs/common';
import { PathologyController } from './pathology.controller';
import { PathologyService } from './pathology.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PathologyController],
  providers: [PathologyService, PrismaService],
  exports: [PathologyService],
})
export class PathologyModule {}
