import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../auth/user-tenant.decorators';
import { SettingsSystemService } from './settings-system.service';
import { UpsertSystemSettingDto } from './dto/upsert-system-setting.dto';

@ApiTags('settings/system')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings/system')
export class SettingsSystemController {
  constructor(private readonly service: SettingsSystemService) {}

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST)
  @Get() get(@TenantId() tenantId: string) {
    return this.service.get(tenantId);
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Put() upsert(@TenantId() tenantId: string, @Body() dto: UpsertSystemSettingDto) {
    return this.service.upsert(tenantId, dto);
  }
}
