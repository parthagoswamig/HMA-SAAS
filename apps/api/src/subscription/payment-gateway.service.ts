import { Injectable, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';

export type PaymentGateway = 'stripe' | 'razorpay';

export interface PaymentOrderResult {
  gateway: PaymentGateway;
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string; // For Razorpay
  clientSecret?: string; // For Stripe
}

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly razorpayService: RazorpayService,
  ) {}

  /**
   * Get available payment gateways
   */
  getAvailableGateways(): PaymentGateway[] {
    const gateways: PaymentGateway[] = [];
    
    // Check Stripe
    try {
      if (this.stripeService) {
        gateways.push('stripe');
      }
    } catch (error) {
      // Stripe not configured
    }

    // Check Razorpay
    if (this.razorpayService.isConfigured()) {
      gateways.push('razorpay');
    }

    return gateways;
  }

  /**
   * Create a payment order using the specified gateway
   */
  async createPaymentOrder(
    gateway: PaymentGateway,
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentOrderResult> {
    switch (gateway) {
      case 'stripe':
        return await this.createStripePayment(amount, currency, metadata);
      
      case 'razorpay':
        return await this.createRazorpayPayment(amount, currency, metadata);
      
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }

  /**
   * Create Stripe payment
   */
  private async createStripePayment(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentOrderResult> {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      metadata?.customerId,
    );

    return {
      gateway: 'stripe',
      orderId: paymentIntent.id,
      amount,
      currency,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  /**
   * Create Razorpay payment
   */
  private async createRazorpayPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentOrderResult> {
    const order = await this.razorpayService.createOrder(
      amount,
      currency,
      metadata?.receipt,
      metadata?.notes,
    );

    return {
      gateway: 'razorpay',
      orderId: order.id,
      amount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify payment
   */
  async verifyPayment(
    gateway: PaymentGateway,
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<boolean> {
    switch (gateway) {
      case 'razorpay':
        return this.razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
      
      case 'stripe':
        // Stripe verification is done via webhooks
        return true;
      
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(gateway: PaymentGateway, paymentId: string) {
    switch (gateway) {
      case 'razorpay':
        return await this.razorpayService.fetchPayment(paymentId);
      
      case 'stripe':
        // Implement Stripe payment fetch if needed
        throw new BadRequestException('Stripe payment fetch not implemented');
      
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    gateway: PaymentGateway,
    paymentId: string,
    amount?: number,
  ) {
    switch (gateway) {
      case 'razorpay':
        return await this.razorpayService.createRefund(paymentId, amount);
      
      case 'stripe':
        // Implement Stripe refund if needed
        throw new BadRequestException('Stripe refund not implemented');
      
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }
}
