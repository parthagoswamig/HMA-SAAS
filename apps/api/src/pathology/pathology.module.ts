import { Module } from '@nestjs/common';
import { PathologyController } from './pathology.controller';
import { PathologyService } from './pathology.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PathologyController],
  providers: [PathologyService],
  exports: [PathologyService],
})
export class PathologyModule {}
