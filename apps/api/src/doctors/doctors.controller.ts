import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@ApiTags('doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly service: DoctorsService) {}
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST) @Post() create(@Body() dto: CreateDoctorDto) { return this.service.create(dto); }
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST) @Get() list(@Query() q: PaginationDto) { return this.service.list(q); }
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST) @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN) @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) { return this.service.update(id, dto); }
  @Roles(UserRole.SUPER_ADMIN) @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
