import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController, RolesController],
  providers: [PermissionsService, RolesService, PermissionsGuard],
  exports: [PermissionsService, RolesService, PermissionsGuard],
})
export class RbacModule {}
