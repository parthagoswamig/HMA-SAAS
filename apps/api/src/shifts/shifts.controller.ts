import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { CreateShiftDto, UpdateShiftDto, ShiftQueryDto } from './dto/shift.dto';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  create(@Body() createShiftDto: CreateShiftDto, @TenantId() tenantId: string) {
    return this.shiftsService.create(createShiftDto, tenantId);
  }

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: ShiftQueryDto) {
    return this.shiftsService.findAll(tenantId, query);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.shiftsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.shiftsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @TenantId() tenantId: string,
  ) {
    return this.shiftsService.update(id, updateShiftDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.shiftsService.remove(id, tenantId);
  }
}
