import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../auth/user-tenant.decorators';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN) @Get('kpis') async kpis(@TenantId() tenantId: string) {
    const [patients, invoices, payments] = await Promise.all([
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.invoice.aggregate({
        where: { tenantId },
        _sum: { totalAmount: true },
      }),
      this.prisma.billingPayment.aggregate({
        where: { subscription: { tenantId } },
        _sum: { amountCents: true },
      }),
    ]);

    const revenueCents = payments._sum.amountCents || 0;
    const arpu = patients ? Math.round(revenueCents / patients) : 0;

    return {
      patients,
      invoiceTotal: invoices._sum.totalAmount || 0,
      revenueCents,
      arpuCents: arpu,
    };
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN) @Get('trend/monthly') async monthly(@TenantId() tenantId: string) {
    // Simple monthly payments trend (last 6 months)
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT to_char(date_trunc('month', "paid_at"), 'YYYY-MM') AS month,
             SUM("amount_cents")::int AS revenueCents
      FROM "billing_payments" p
      JOIN "billing_subscriptions" s ON s.id = p."subscription_id"
      WHERE s."tenantId" = $1 AND p."status" = 'succeeded' AND p."paid_at" IS NOT NULL
      GROUP BY 1 ORDER BY 1 DESC LIMIT 6;
    `, tenantId);
    return result.reverse();
  }
}
