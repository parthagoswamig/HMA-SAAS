import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { StripeService } from './stripe.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: CustomPrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Get current active subscription for a tenant
   */
  async getCurrentSubscription(tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found for this tenant');
    }

    return subscription;
  }

  /**
   * Get all subscription plans
   */
  async getPlans() {
    return await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Get a specific plan
   */
  async getPlan(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(tenantId: string, createDto: CreateSubscriptionDto) {
    const { planId } = createDto;

    // Get the plan
    const plan = await this.getPlan(planId);

    // Get tenant
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant already has an active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('Tenant already has an active subscription');
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create subscription in database
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      include: {
        plan: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return subscription;
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    tenantId: string,
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // If changing plan, validate new plan
    if (updateDto.planId) {
      await this.getPlan(updateDto.planId);
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(updateDto.planId && { planId: updateDto.planId }),
        ...(updateDto.status && { status: updateDto.status as any }),
        ...(typeof updateDto.autoRenew !== 'undefined' && {
          cancelAtPeriodEnd: !updateDto.autoRenew,
        }),
      },
      include: {
        plan: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(tenantId: string, subscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Mark for cancellation at period end
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
      },
      include: {
        plan: true,
      },
    });

    return updated;
  }

  /**
   * Get subscription history for a tenant
   */
  async getSubscriptionHistory(tenantId: string) {
    return await this.prisma.subscription.findMany({
      where: { tenantId },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check if subscription is active and not expired
   */
  async isSubscriptionActive(tenantId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gte: new Date(),
        },
      },
    });

    return !!subscription;
  }
}
