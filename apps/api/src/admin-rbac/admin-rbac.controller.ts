import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../auth/user-tenant.decorators';
import { AdminRbacService } from './admin-rbac.service';

@ApiTags('admin-rbac')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin-rbac')
export class AdminRbacController {
  constructor(private svc: AdminRbacService) {}

  @Roles(UserRole.SUPER_ADMIN) @Get('roles') list(@TenantId() tenantId: string) { return this.svc.listRoles(tenantId); }
  @Roles(UserRole.SUPER_ADMIN) @Post('attach-permission') attach(@Body() dto: { roleId: string; permission: string }) { return this.svc.attachPermission(dto.roleId, dto.permission); }
  @Roles(UserRole.SUPER_ADMIN) @Post('detach-permission') detach(@Body() dto: { roleId: string; permission: string }) { return this.svc.detachPermission(dto.roleId, dto.permission); }
  @Roles(UserRole.SUPER_ADMIN) @Post('assign-role') assign(@Body() dto: { userId: string; roleId: string }) { return this.svc.assignRoleToUser(dto.userId, dto.roleId); }
}
