import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../auth/user-tenant.decorators';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditLogController {
  constructor(private prisma: PrismaService) {}

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  async list(@TenantId() tenantId: string, @Query() q: PaginationDto) {
    const page = q.page ?? 1, take = q.limit ?? 10, skip = (page - 1) * take;
    const where = { tenantId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, pages: Math.ceil(total / take) };
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Get(':id')
  get(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.prisma.auditLog.findFirst({ where: { id, tenantId } });
  }
}
