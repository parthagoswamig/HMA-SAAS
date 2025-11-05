import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSystemSettingDto } from './dto/upsert-system-setting.dto';

@Injectable()
export class SettingsSystemService {
  constructor(private prisma: PrismaService) {}

  async get(tenantId: string) {
    // TODO: Add systemSetting model to Prisma schema
    return { tenantId, timezone: 'UTC', locale: 'en', maintenanceMode: false };
  }

  async upsert(tenantId: string, dto: UpsertSystemSettingDto) {
    // TODO: Add systemSetting model to Prisma schema
    return { tenantId, ...dto };
  }
}
