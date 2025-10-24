import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      this.logger.warn('Stripe credentials not configured. Stripe payments will not be available.');
      return;
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
    
    this.logger.log('Stripe service initialized successfully');
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return !!this.stripe;
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async retrieveInvoice(invoiceId: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.invoices.retrieve(invoiceId);
  }

  async createInvoice(customerId: string, subscriptionId: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.invoices.create({
      customer: customerId,
      subscription: subscriptionId,
      auto_advance: true,
    });
  }

  async getCustomerPortalUrl(customerId: string, returnUrl: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  async constructEvent(payload: string | Buffer, signature: string, webhookSecret: string) {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return await this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
