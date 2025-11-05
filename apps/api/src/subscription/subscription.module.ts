import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionWebhookController } from './subscription-webhook.controller';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { PaymentController } from './payment.controller';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule],
  controllers: [
    SubscriptionController,
    SubscriptionWebhookController,
    RazorpayWebhookController,
    PaymentController,
  ],
  providers: [
    SubscriptionService,
    StripeService,
    RazorpayService,
    PaymentGatewayService,
  ],
  exports: [
    SubscriptionService,
    StripeService,
    RazorpayService,
    PaymentGatewayService,
  ],
})
export class SubscriptionModule {}
