import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Enum for invoice item types
 */
export enum InvoiceItemType {
  CONSULTATION = 'CONSULTATION',
  LAB_TEST = 'LAB_TEST', 
  MEDICATION = 'MEDICATION',
  PROCEDURE = 'PROCEDURE',
  OTHER = 'OTHER',
}

/**
 * DTO for creating invoice items
 */
export class CreateInvoiceItemDto {
  @ApiProperty({ 
    enum: InvoiceItemType, 
    example: InvoiceItemType.CONSULTATION,
    description: 'Type of the invoice item'
  })
  @IsEnum(InvoiceItemType)
  @IsNotEmpty()
  itemType: InvoiceItemType;

  @ApiProperty({ 
    example: 'appointment-uuid-123',
    description: 'ID of the related entity (appointment, lab order, pharmacy order, etc.)'
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ 
    example: 'General Consultation - Dr. Smith',
    description: 'Description of the invoice item'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    example: 1,
    minimum: 1,
    description: 'Quantity of the item'
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    example: 150.00,
    minimum: 0,
    description: 'Unit price of the item'
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ 
    example: 10.00,
    minimum: 0,
    description: 'Discount amount for the item'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ 
    example: 5.0,
    minimum: 0,
    description: 'Tax rate percentage for the item'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

/**
 * DTO for creating an invoice
 */
export class CreateInvoiceDto {
  @ApiProperty({ 
    example: 'patient-uuid-123',
    description: 'ID of the patient for the invoice'
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ 
    example: '2024-12-10T10:00:00.000Z',
    description: 'Date of the invoice (defaults to current date)'
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ 
    example: '2024-12-17T10:00:00.000Z',
    description: 'Due date for payment'
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ 
    type: [CreateInvoiceItemDto],
    description: 'List of invoice items',
    minItems: 1
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @ArrayMinSize(1)
  items: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ 
    example: 25.00,
    minimum: 0,
    description: 'Global discount amount for the invoice'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({ 
    example: 15.75,
    minimum: 0,
    description: 'Total tax amount for the invoice'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @ApiPropertyOptional({ 
    example: 'Special consultation package',
    description: 'Additional notes for the invoice'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    example: 'staff-uuid-123',
    description: 'ID of the user who created the invoice'
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

/**
 * DTO for updating an invoice
 */
export class UpdateInvoiceDto {
  @ApiPropertyOptional({ 
    enum: InvoiceStatus, 
    example: InvoiceStatus.PAID,
    description: 'Status of the invoice'
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({ 
    example: '2024-12-20T10:00:00.000Z',
    description: 'New due date for payment'
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ 
    example: 30.00,
    minimum: 0,
    description: 'Updated discount amount'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({ 
    example: 'Updated invoice notes',
    description: 'Additional notes for the invoice'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    example: 'staff-uuid-123',
    description: 'ID of the user who updated the invoice'
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}

/**
 * DTO for creating a payment
 */
export class CreatePaymentDto {
  @ApiProperty({ 
    example: 'invoice-uuid-123',
    description: 'ID of the invoice being paid'
  })
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ 
    example: 150.00,
    minimum: 0.01,
    description: 'Payment amount'
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ 
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    description: 'Method of payment'
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ 
    example: '2024-12-10T14:30:00.000Z',
    description: 'Date when payment was made (defaults to current date)'
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional({ 
    example: 'TXN-12345678',
    description: 'Reference number from payment gateway or bank'
  })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ 
    example: 'Paid via online banking',
    description: 'Additional notes about the payment'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    example: 'staff-uuid-123',
    description: 'ID of the user who recorded the payment'
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

/**
 * DTO for updating a payment
 */
export class UpdatePaymentDto {
  @ApiPropertyOptional({ 
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    description: 'Status of the payment'
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ 
    example: 'Payment confirmed by bank',
    description: 'Updated notes about the payment'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for filtering invoices
 */
export class InvoiceFilterDto {
  @ApiPropertyOptional({ 
    example: 'patient-uuid-123',
    description: 'Filter by patient ID'
  })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({ 
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING,
    description: 'Filter by invoice status'
  })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({ 
    example: '2024-12-01T00:00:00.000Z',
    description: 'Filter invoices from this date'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-31T23:59:59.999Z',
    description: 'Filter invoices until this date'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ 
    example: 'INV-202412',
    description: 'Search by invoice number or patient name'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ 
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number for pagination'
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 10,
    minimum: 1,
    default: 10,
    description: 'Number of items per page'
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

/**
 * DTO for filtering payments
 */
export class PaymentFilterDto {
  @ApiPropertyOptional({ 
    example: 'invoice-uuid-123',
    description: 'Filter by invoice ID'
  })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({ 
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    description: 'Filter by payment method'
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ 
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    description: 'Filter by payment status'
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ 
    example: '2024-12-01T00:00:00.000Z',
    description: 'Filter payments from this date'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-31T23:59:59.999Z',
    description: 'Filter payments until this date'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ 
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number for pagination'
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 10,
    minimum: 1,
    default: 10,
    description: 'Number of items per page'
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
