import { Controller, Post, Body, Headers, Logger, BadRequestException } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { CustomPrismaService } from '../prisma/custom-prisma.service';

@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
  private readonly logger = new Logger(RazorpayWebhookController.name);

  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly prisma: CustomPrismaService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    this.logger.log('Received Razorpay webhook');

    // Verify webhook signature
    const isValid = this.razorpayService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const event = payload.event;
    const eventPayload = payload.payload;

    this.logger.log(`Processing Razorpay event: ${event}`);

    try {
      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(eventPayload.payment.entity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(eventPayload.payment.entity);
          break;

        case 'subscription.activated':
          await this.handleSubscriptionActivated(eventPayload.subscription.entity);
          break;

        case 'subscription.charged':
          await this.handleSubscriptionCharged(eventPayload.subscription.entity);
          break;

        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(eventPayload.subscription.entity);
          break;

        case 'subscription.completed':
          await this.handleSubscriptionCompleted(eventPayload.subscription.entity);
          break;

        case 'subscription.paused':
          await this.handleSubscriptionPaused(eventPayload.subscription.entity);
          break;

        case 'subscription.resumed':
          await this.handleSubscriptionResumed(eventPayload.subscription.entity);
          break;

        case 'order.paid':
          await this.handleOrderPaid(eventPayload.order.entity);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handlePaymentCaptured(payment: any) {
    this.logger.log(`Payment captured: ${payment.id}, Amount: ${payment.amount / 100}`);
    
    // Update subscription or invoice status in database
    // You can add custom logic here based on your needs
  }

  private async handlePaymentFailed(payment: any) {
    this.logger.warn(`Payment failed: ${payment.id}, Reason: ${payment.error_description}`);
    
    // Handle failed payment - maybe send notification to user
  }

  private async handleSubscriptionActivated(subscription: any) {
    this.logger.log(`Subscription activated: ${subscription.id}`);

    // Update subscription status in database
    const razorpaySubscriptionId = subscription.id;
    
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: razorpaySubscriptionId }, // We'll use this field for Razorpay too
      data: { status: 'ACTIVE' },
    });
  }

  private async handleSubscriptionCharged(subscription: any) {
    this.logger.log(`Subscription charged: ${subscription.id}`);
    
    // Record the payment in your system
  }

  private async handleSubscriptionCancelled(subscription: any) {
    this.logger.log(`Subscription cancelled: ${subscription.id}`);

    const razorpaySubscriptionId = subscription.id;
    
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: razorpaySubscriptionId },
      data: { 
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
      },
    });
  }

  private async handleSubscriptionCompleted(subscription: any) {
    this.logger.log(`Subscription completed: ${subscription.id}`);

    const razorpaySubscriptionId = subscription.id;
    
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: razorpaySubscriptionId },
      data: { status: 'CANCELLED' },
    });
  }

  private async handleSubscriptionPaused(subscription: any) {
    this.logger.log(`Subscription paused: ${subscription.id}`);

    const razorpaySubscriptionId = subscription.id;
    
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: razorpaySubscriptionId },
      data: { status: 'SUSPENDED' },
    });
  }

  private async handleSubscriptionResumed(subscription: any) {
    this.logger.log(`Subscription resumed: ${subscription.id}`);

    const razorpaySubscriptionId = subscription.id;
    
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: razorpaySubscriptionId },
      data: { status: 'ACTIVE' },
    });
  }

  private async handleOrderPaid(order: any) {
    this.logger.log(`Order paid: ${order.id}, Amount: ${order.amount / 100}`);
    
    // Handle one-time order payment
  }
}
