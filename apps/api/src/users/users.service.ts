import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  constructor(private readonly prisma: CustomPrismaService) {}

  async create(dto: CreateUserDto, tenantId: string) {
    const userData = {
      ...dto,
      role: dto.role || Role.RECEPTIONIST,
      tenantId,
    };
    
    return this.prisma.user.create({ 
      data: userData as any
    });
  }

  async findAll(q: PaginationDto) {
    const page = q.page ?? 1;
    const take = q.limit ?? 10;
    const skip = (page - 1) * take;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          specialization: true,
          experience: true,
          licenseNumber: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        specialization: true,
        experience: true,
        licenseNumber: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) throw new NotFoundException('User not found');
    return row;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        // Remove tenantId from update data as it should not be changed
        tenantId: undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
