import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeBillingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2024-06-20' as any, // Using compatible API version
    });
  }

  async listPlans() {
    return this.prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceCents: 'asc' } });
  }

  async attachPlanToTenant(tenantId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new BadRequestException('Plan not found');

    const sub = await this.prisma.billingSubscription.create({
      data: {
        tenantId,
        planId,
        status: 'incomplete',
      },
    });

    // OPTIONAL: Create Stripe Customer for this tenant (once)
    let tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Tenant not found');

    // You can store tenant.stripeCustomerId in your schema if you want
    // For now, create a new checkout session each time:
    const priceId = plan.stripePrice;
    if (!priceId) throw new BadRequestException('Plan missing stripePrice');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${process.env.PUBLIC_WEB_URL}/dashboard/settings/subscription?success=1`,
      cancel_url: `${process.env.PUBLIC_WEB_URL}/dashboard/settings/subscription?canceled=1`,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { tenantId, subscriptionId: sub.id, planId },
    });

    return { sub, checkoutUrl: session.url };
  }

  async cancelSubscription(tenantId: string) {
    const sub = await this.prisma.billingSubscription.findFirst({
      where: { tenantId, status: { in: ['active', 'trialing', 'past_due', 'incomplete'] } },
    });
    if (!sub?.stripeSubId) throw new BadRequestException('No active Stripe subscription found');

    await this.stripe.subscriptions.update(sub.stripeSubId, { cancel_at_period_end: true });
    return this.prisma.billingSubscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });
  }
}
