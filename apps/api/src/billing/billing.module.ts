import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeBillingService } from './stripe-billing.service';
import { StripeBillingController } from './stripe-billing.controller';

@Module({
  imports: [PrismaModule],
  providers: [BillingService, StripeBillingService],
  controllers: [BillingController, StripeWebhookController, StripeBillingController],
  exports: [BillingService, StripeBillingService],
})
export class BillingModule implements NestModule {
  configure(_: MiddlewareConsumer) {}
}
