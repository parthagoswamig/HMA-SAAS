import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PharmacyDrugsService } from './pharmacy-drugs.service';
import { CreatePharmacyDrugDto } from './dto/create-pharmacy-drug.dto';
import { UpdatePharmacyDrugDto } from './dto/update-pharmacy-drug.dto';

@Controller('pharmacy-drugs')
export class PharmacyDrugsController {
  constructor(private readonly pharmacyDrugsService: PharmacyDrugsService) {}

  @Post()
  create(@Body() createPharmacyDrugDto: CreatePharmacyDrugDto) {
    return this.pharmacyDrugsService.create(createPharmacyDrugDto);
  }

  @Get()
  findAll() {
    return this.pharmacyDrugsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacyDrugsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePharmacyDrugDto: UpdatePharmacyDrugDto) {
    return this.pharmacyDrugsService.update(+id, updatePharmacyDrugDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyDrugsService.remove(+id);
  }
}
