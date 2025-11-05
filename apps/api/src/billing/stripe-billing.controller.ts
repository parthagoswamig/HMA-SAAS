import { Controller, Get, Post, Body } from '@nestjs/common';
import { StripeBillingService } from './stripe-billing.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantId } from '../auth/user-tenant.decorators';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';

@ApiTags('stripe-billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stripe-billing')
export class StripeBillingController {
  constructor(private billing: StripeBillingService) {}

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Get('plans')
  listPlans() {
    return this.billing.listPlans();
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Post('subscribe')
  subscribe(@TenantId() tenantId: string, @Body() dto: { planId: string }) {
    return this.billing.attachPlanToTenant(tenantId, dto.planId);
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @Post('cancel')
  cancel(@TenantId() tenantId: string) {
    return this.billing.cancelSubscription(tenantId);
  }
}
