import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  planId!: string;

  @IsOptional()
  @IsString()
  billingCycle?: 'monthly' | 'yearly';

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  paymentMethodId?: string; // Stripe payment method ID
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsEnum(['monthly', 'yearly'])
  billingCycle?: 'monthly' | 'yearly';

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsEnum(['ACTIVE', 'CANCELLED', 'SUSPENDED'])
  status?: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED';
}

export class CreateInvoiceDto {
  @IsUUID()
  subscriptionId!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
