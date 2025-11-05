import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      this.logger.warn('Razorpay credentials not configured. Razorpay payments will not be available.');
      return;
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    this.logger.log('Razorpay service initialized successfully');
  }

  /**
   * Check if Razorpay is configured
   */
  isConfigured(): boolean {
    return !!this.razorpay;
  }

  /**
   * Create a Razorpay order for subscription payment
   */
  async createOrder(amount: number, currency: string = 'INR', receipt?: string, notes?: Record<string, string>) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: receipt || `order_${Date.now()}`,
        notes: notes || {},
      });

      this.logger.log(`Razorpay order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error);
      throw error;
    }
  }

  /**
   * Create a subscription plan in Razorpay
   */
  async createSubscriptionPlan(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: number,
    amount: number,
    currency: string = 'INR',
    description?: string,
  ) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const plan = await this.razorpay.plans.create({
        period,
        interval,
        item: {
          name: description || 'Subscription Plan',
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          description,
        },
      });

      this.logger.log(`Razorpay plan created: ${plan.id}`);
      return plan;
    } catch (error) {
      this.logger.error('Failed to create Razorpay plan', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    planId: string,
    customerId: string,
    totalCount: number,
    quantity: number = 1,
    startAt?: number,
    notes?: Record<string, string>,
  ) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity,
        total_count: totalCount,
        start_at: startAt,
        notes: notes || {},
      });

      this.logger.log(`Razorpay subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create Razorpay subscription', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
      this.logger.log(`Razorpay subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to cancel Razorpay subscription', error);
      throw error;
    }
  }

  /**
   * Fetch subscription details
   */
  async fetchSubscription(subscriptionId: string) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      return await this.razorpay.subscriptions.fetch(subscriptionId);
    } catch (error) {
      this.logger.error('Failed to fetch Razorpay subscription', error);
      throw error;
    }
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(
    amount: number,
    currency: string = 'INR',
    description: string,
    customerName?: string,
    customerEmail?: string,
    customerContact?: string,
    callbackUrl?: string,
    callbackMethod?: 'get' | 'post',
  ) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const paymentLinkData: any = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        description,
        callback_url: callbackUrl,
        callback_method: callbackMethod,
      };

      // Add customer details if provided
      if (customerName || customerEmail || customerContact) {
        paymentLinkData.customer = {
          name: customerName,
          email: customerEmail,
          contact: customerContact,
        };
      }

      const paymentLink = await this.razorpay.paymentLink.create(paymentLinkData);

      this.logger.log(`Razorpay payment link created: ${(paymentLink as any).id}`);
      return paymentLink;
    } catch (error) {
      this.logger.error('Failed to create Razorpay payment link', error);
      throw error;
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      const generatedSignature = crypto
        .createHmac('sha256', keySecret!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;
      
      if (isValid) {
        this.logger.log(`Payment signature verified for order: ${orderId}`);
      } else {
        this.logger.warn(`Invalid payment signature for order: ${orderId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error('Failed to verify payment signature', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.warn('Razorpay webhook secret not configured');
        return false;
      }

      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      this.logger.error('Failed to verify webhook signature', error);
      return false;
    }
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      this.logger.error('Failed to fetch payment', error);
      throw error;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    name: string,
    email: string,
    contact: string,
    notes?: Record<string, string>,
  ) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const customer = await this.razorpay.customers.create({
        name,
        email,
        contact,
        notes: notes || {},
      });

      this.logger.log(`Razorpay customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Failed to create Razorpay customer', error);
      throw error;
    }
  }

  /**
   * Fetch customer details
   */
  async fetchCustomer(customerId: string) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      return await this.razorpay.customers.fetch(customerId);
    } catch (error) {
      this.logger.error('Failed to fetch customer', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(paymentId: string, amount?: number, notes?: Record<string, string>) {
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured');
    }

    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
        notes: notes || {},
      });

      this.logger.log(`Refund created for payment: ${paymentId}`);
      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund', error);
      throw error;
    }
  }
}
