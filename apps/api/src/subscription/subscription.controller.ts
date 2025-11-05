import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubscriptionDto, UpdateSubscriptionDto, CreateInvoiceDto } from './dto/subscription.dto';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Get current subscription for tenant
  @Get('current')
  async getCurrentSubscription(@Request() req) {
    return this.subscriptionService.getCurrentSubscription(req.user.tenantId);
  }

  // Get subscription history
  @Get('history')
  async getSubscriptionHistory(@Request() req) {
    return this.subscriptionService.getSubscriptionHistory(req.user.tenantId);
  }

  // Get available subscription plans
  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  // Get specific plan
  @Get('plans/:id')
  async getPlan(@Param('id') planId: string) {
    return this.subscriptionService.getPlan(planId);
  }

  // Create new subscription
  @Post()
  async createSubscription(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.createSubscription(req.user.tenantId, createSubscriptionDto);
  }

  // Update subscription (upgrade/downgrade)
  @Put(':id')
  async updateSubscription(
    @Request() req,
    @Param('id') subscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.updateSubscription(req.user.tenantId, subscriptionId, updateSubscriptionDto);
  }

  // Cancel subscription
  @Delete(':id/cancel')
  async cancelSubscription(@Request() req, @Param('id') subscriptionId: string) {
    return this.subscriptionService.cancelSubscription(req.user.tenantId, subscriptionId);
  }

  // Check if subscription is active
  @Get('active')
  async isSubscriptionActive(@Request() req) {
    const isActive = await this.subscriptionService.isSubscriptionActive(req.user.tenantId);
    return { active: isActive };
  }
}
