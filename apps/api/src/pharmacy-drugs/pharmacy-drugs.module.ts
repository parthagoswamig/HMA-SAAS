import { Module } from '@nestjs/common';
import { PharmacyDrugsService } from './pharmacy-drugs.service';
import { PharmacyDrugsController } from './pharmacy-drugs.controller';

@Module({
  controllers: [PharmacyDrugsController],
  providers: [PharmacyDrugsService],
})
export class PharmacyDrugsModule {}
