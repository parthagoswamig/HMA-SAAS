import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../auth/user-tenant.decorators';
import { SettingsHospitalService } from './settings-hospital.service';
import { UpsertHospitalSettingDto } from './dto/upsert-hospital-setting.dto';

@ApiTags('settings/hospital')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings/hospital')
export class SettingsHospitalController {
  constructor(private readonly service: SettingsHospitalService) {}

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST)
  @Get() get(@TenantId() tenantId: string) {
    return this.service.get(tenantId);
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Put() upsert(@TenantId() tenantId: string, @Body() dto: UpsertHospitalSettingDto) {
    return this.service.upsert(tenantId, dto);
  }
}
