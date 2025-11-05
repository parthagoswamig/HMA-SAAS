import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsSystemController } from './settings-system.controller';
import { SettingsSystemService } from './settings-system.service';

@Module({ imports: [PrismaModule], controllers: [SettingsSystemController], providers: [SettingsSystemService] })
export class SettingsSystemModule {}
