import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertHospitalSettingDto } from './dto/upsert-hospital-setting.dto';

@Injectable()
export class SettingsHospitalService {
  constructor(private prisma: PrismaService) {}

  async get(tenantId: string) {
    // TODO: Add hospitalSetting model to Prisma schema
    return { tenantId, name: '', address: '', phone: '', logoUrl: '' };
  }

  async upsert(tenantId: string, dto: UpsertHospitalSettingDto) {
    // TODO: Add hospitalSetting model to Prisma schema
    return { tenantId, ...dto };
  }
}
