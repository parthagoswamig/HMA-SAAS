import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubscriptionDto, UpdateSubscriptionDto, CreateInvoiceDto } from './dto/subscription.dto';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('Subscription & Billing')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Get current subscription for tenant
  @Get('current')
  @RequirePermissions('subscription.view', 'SUBSCRIPTION_READ', 'VIEW_SUBSCRIPTION')
  @ApiOperation({ summary: 'Get current subscription for tenant' })
  @ApiResponse({ status: 200, description: 'Current subscription retrieved successfully' })
  async getCurrentSubscription(@TenantId() tenantId: string) {
    return this.subscriptionService.getCurrentSubscription(tenantId);
  }

  // Get subscription history
  @Get('history')
  @RequirePermissions('subscription.view', 'SUBSCRIPTION_READ', 'VIEW_SUBSCRIPTION')
  @ApiOperation({ summary: 'Get subscription history' })
  @ApiResponse({ status: 200, description: 'Subscription history retrieved successfully' })
  async getSubscriptionHistory(@TenantId() tenantId: string) {
    return this.subscriptionService.getSubscriptionHistory(tenantId);
  }

  // Get available subscription plans
  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  // Get specific plan
  @Get('plans/:id')
  @ApiOperation({ summary: 'Get specific subscription plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(@Param('id') planId: string) {
    return this.subscriptionService.getPlan(planId);
  }

  // Create new subscription
  @Post()
  @RequirePermissions('subscription.create', 'SUBSCRIPTION_CREATE', 'MANAGE_SUBSCRIPTION')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSubscription(
    @TenantId() tenantId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto
  ) {
    return this.subscriptionService.createSubscription(tenantId, createSubscriptionDto);
  }

  // Update subscription (upgrade/downgrade)
  @Patch(':id')
  @RequirePermissions('subscription.update', 'SUBSCRIPTION_UPDATE', 'MANAGE_SUBSCRIPTION')
  @ApiOperation({ summary: 'Update subscription (upgrade/downgrade)' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(
    @TenantId() tenantId: string,
    @Param('id') subscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.updateSubscription(tenantId, subscriptionId, updateSubscriptionDto);
  }

  // Cancel subscription
  @Delete(':id/cancel')
  @RequirePermissions('subscription.delete', 'SUBSCRIPTION_DELETE', 'MANAGE_SUBSCRIPTION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancelSubscription(
    @TenantId() tenantId: string,
    @Param('id') subscriptionId: string
  ) {
    return this.subscriptionService.cancelSubscription(tenantId, subscriptionId);
  }

  // Check if subscription is active
  @Get('active')
  @RequirePermissions('subscription.view', 'SUBSCRIPTION_READ', 'VIEW_SUBSCRIPTION')
  @ApiOperation({ summary: 'Check if subscription is active' })
  @ApiResponse({ status: 200, description: 'Subscription status retrieved' })
  async isSubscriptionActive(@TenantId() tenantId: string) {
    const isActive = await this.subscriptionService.isSubscriptionActive(tenantId);
    return { active: isActive };
  }
}
