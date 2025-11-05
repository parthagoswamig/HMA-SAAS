import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsHospitalController } from './settings-hospital.controller';
import { SettingsHospitalService } from './settings-hospital.service';

@Module({ imports: [PrismaModule], controllers: [SettingsHospitalController], providers: [SettingsHospitalService] })
export class SettingsHospitalModule {}
