import { Injectable } from '@nestjs/common';
import { CreatePharmacyDrugDto } from './dto/create-pharmacy-drug.dto';
import { UpdatePharmacyDrugDto } from './dto/update-pharmacy-drug.dto';

@Injectable()
export class PharmacyDrugsService {
  create(createPharmacyDrugDto: CreatePharmacyDrugDto) {
    return 'This action adds a new pharmacyDrug';
  }

  findAll() {
    return `This action returns all pharmacyDrugs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pharmacyDrug`;
  }

  update(id: number, updatePharmacyDrugDto: UpdatePharmacyDrugDto) {
    return `This action updates a #${id} pharmacyDrug`;
  }

  remove(id: number) {
    return `This action removes a #${id} pharmacyDrug`;
  }
}
