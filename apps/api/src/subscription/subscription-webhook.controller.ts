import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';

@Controller('subscription/webhooks')
export class SubscriptionWebhookController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() payload: any,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: any;

    try {
      event = this.stripeService.constructEvent(
        JSON.stringify(payload),
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleSubscriptionCreated(subscription: any) {
    console.log('Subscription created:', subscription.id);
    // Webhook handler - implement custom logic as needed
  }

  private async handleSubscriptionUpdated(subscription: any) {
    console.log('Subscription updated:', subscription.id);
    // Webhook handler - implement custom logic as needed
  }

  private async handleSubscriptionDeleted(subscription: any) {
    console.log('Subscription deleted:', subscription.id);
    // Webhook handler - implement custom logic as needed
  }

  private async handlePaymentSucceeded(invoice: any) {
    console.log('Payment succeeded:', invoice.id);
    // Webhook handler - implement custom logic as needed
  }

  private async handlePaymentFailed(invoice: any) {
    console.log('Payment failed:', invoice.id);
    // Webhook handler - implement custom logic as needed
  }
}
