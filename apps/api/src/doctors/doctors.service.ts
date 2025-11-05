import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateDoctorDto) { return this.prisma.doctor.create({ data: dto as any }); }
  async list(q: PaginationDto) {
    const page = q.page ?? 1, take = q.limit ?? 10, skip = (page-1)*take;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.doctor.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.doctor.count()
    ]);
    return { items, total, page, pages: Math.ceil(total/take) };
  }
  async get(id: string) {
    const row = await this.prisma.doctor.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Doctor not found');
    return row;
  }
  update(id: string, dto: UpdateDoctorDto) { return this.prisma.doctor.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.doctor.delete({ where: { id } }); }
}
