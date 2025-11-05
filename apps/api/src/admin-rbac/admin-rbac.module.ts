import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminRbacController } from './admin-rbac.controller';
import { AdminRbacService } from './admin-rbac.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminRbacController],
  providers: [AdminRbacService],
})
export class AdminRbacModule {}
