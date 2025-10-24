import { Global, Module } from '@nestjs/common';
import { CustomPrismaService } from './custom-prisma.service';

@Global()
@Module({
  providers: [CustomPrismaService],
  exports: [CustomPrismaService],
})
export class PrismaModule {}
