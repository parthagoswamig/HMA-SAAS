import { Global, Module } from '@nestjs/common';
import { CustomPrismaService } from './custom-prisma.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [CustomPrismaService, PrismaService],
  exports: [CustomPrismaService, PrismaService],
})
export class PrismaModule {}
