import { PartialType } from '@nestjs/swagger';
import { CreatePharmacyDrugDto } from './create-pharmacy-drug.dto';

export class UpdatePharmacyDrugDto extends PartialType(CreatePharmacyDrugDto) {}
