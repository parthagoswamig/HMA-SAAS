import { Module } from '@nestjs/common';
import { IpdController } from './ipd.controller';
import { IpdService } from './ipd.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IpdController],
  providers: [IpdService, PrismaService],
  exports: [IpdService],
})
export class IpdModule {}
