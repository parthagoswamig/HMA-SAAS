import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Controller('stripe')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2024-06-20' as any, // Using compatible API version
    });
  }

  @ApiExcludeEndpoint()
  @Post('webhook')
  async handle(@Req() req: any, @Res() res: any) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Store for audit/debug
    await this.prisma.webhookEvent.create({
      data: { type: event.type, payload: event as any },
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId as string;
        const subscriptionId = session.metadata?.subscriptionId as string;

        const stripeSubId = session.subscription as string;
        const stripeSub: any = await this.stripe.subscriptions.retrieve(stripeSubId);

        await this.prisma.billingSubscription.update({
          where: { id: subscriptionId },
          data: {
            stripeSubId,
            status: stripeSub.status,
            currentPeriodStart: new Date((stripeSub.current_period_start || 0) * 1000),
            currentPeriodEnd: new Date((stripeSub.current_period_end || 0) * 1000),
          },
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subId = invoice.subscription || '';
        const sub = await this.prisma.billingSubscription.findFirst({ where: { stripeSubId: subId } });
        if (sub) {
          await this.prisma.billingPayment.create({
            data: {
              subscriptionId: sub.id,
              amountCents: invoice.amount_paid ?? 0,
              currency: invoice.currency?.toUpperCase() ?? 'INR',
              stripePaymentId: invoice.payment_intent || '',
              status: 'succeeded',
              paidAt: invoice.status_transitions?.paid_at
                ? new Date(invoice.status_transitions.paid_at * 1000)
                : new Date(),
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await this.prisma.billingSubscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date((subscription.current_period_start || 0) * 1000),
            currentPeriodEnd: new Date((subscription.current_period_end || 0) * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          },
        });
        break;
      }
      default:
        break;
    }

    return res.json({ received: true });
  }
}
