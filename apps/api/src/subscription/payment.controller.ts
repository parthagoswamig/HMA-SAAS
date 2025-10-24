import { Controller, Get, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentGatewayService, PaymentGateway } from './payment-gateway.service';

class CreatePaymentOrderDto {
  gateway!: PaymentGateway;
  amount!: number;
  currency?: string;
  planId?: string;
  metadata?: Record<string, any>;
}

class VerifyPaymentDto {
  gateway!: PaymentGateway;
  orderId!: string;
  paymentId!: string;
  signature!: string;
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  /**
   * Get available payment gateways
   */
  @Get('gateways')
  getAvailableGateways() {
    const gateways = this.paymentGatewayService.getAvailableGateways();
    
    return {
      success: true,
      data: {
        gateways,
        default: gateways.includes('razorpay') ? 'razorpay' : gateways[0],
        supported: {
          stripe: {
            available: gateways.includes('stripe'),
            methods: ['card', 'wallet'],
            currencies: ['USD', 'EUR', 'GBP', 'INR'],
          },
          razorpay: {
            available: gateways.includes('razorpay'),
            methods: ['upi', 'card', 'netbanking', 'wallet'],
            currencies: ['INR'],
          },
        },
      },
    };
  }

  /**
   * Create a payment order
   */
  @Post('create-order')
  async createPaymentOrder(@Body() dto: CreatePaymentOrderDto, @Request() req) {
    const { gateway, amount, currency = 'INR', metadata } = dto;

    if (!gateway) {
      throw new BadRequestException('Payment gateway is required');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('Valid amount is required');
    }

    // Add tenant info to metadata
    const enrichedMetadata = {
      ...metadata,
      tenantId: req.user.tenantId,
      userId: req.user.userId,
    };

    const order = await this.paymentGatewayService.createPaymentOrder(
      gateway,
      amount,
      currency,
      enrichedMetadata,
    );

    return {
      success: true,
      data: order,
    };
  }

  /**
   * Verify payment
   */
  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    const { gateway, orderId, paymentId, signature } = dto;

    if (!gateway || !orderId || !paymentId) {
      throw new BadRequestException('Gateway, orderId, and paymentId are required');
    }

    const isValid = await this.paymentGatewayService.verifyPayment(
      gateway,
      orderId,
      paymentId,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    return {
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId,
        paymentId,
        verified: true,
      },
    };
  }

  /**
   * Get payment details
   */
  @Get(':gateway/:paymentId')
  async getPaymentDetails(
    @Request() req,
    gateway: PaymentGateway,
    paymentId: string,
  ) {
    const payment = await this.paymentGatewayService.getPaymentDetails(
      gateway,
      paymentId,
    );

    return {
      success: true,
      data: payment,
    };
  }
}
