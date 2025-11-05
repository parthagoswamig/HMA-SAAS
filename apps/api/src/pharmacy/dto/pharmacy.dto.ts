import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsPositive,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums for Pharmacy module
export enum DosageForm {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  SYRUP = 'SYRUP',
  INJECTION = 'INJECTION',
  CREAM = 'CREAM',
  OINTMENT = 'OINTMENT',
  DROPS = 'DROPS',
  INHALER = 'INHALER',
  PATCH = 'PATCH',
  SUPPOSITORY = 'SUPPOSITORY',
  OTHER = 'OTHER',
}

export enum MedicationRoute {
  ORAL = 'ORAL',
  TOPICAL = 'TOPICAL',
  INTRAVENOUS = 'INTRAVENOUS',
  INTRAMUSCULAR = 'INTRAMUSCULAR',
  SUBCUTANEOUS = 'SUBCUTANEOUS',
  INHALATION = 'INHALATION',
  RECTAL = 'RECTAL',
  OTHER = 'OTHER',
}

export enum PharmacyOrderStatus {
  PENDING = 'PENDING',
  DISPENSED = 'DISPENSED',
  PARTIALLY_DISPENSED = 'PARTIALLY_DISPENSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PharmacyOrderItemStatus {
  PENDING = 'PENDING',
  DISPENSED = 'DISPENSED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  CANCELLED = 'CANCELLED',
}

// Medication DTOs
export class CreateMedicationDto {
  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Acetaminophen' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  genericName?: string;

  @ApiPropertyOptional({ example: 'Pain reliever and fever reducer' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '500mg' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  strength?: string;

  @ApiPropertyOptional({ example: 'mg' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ enum: DosageForm, example: DosageForm.TABLET })
  @IsOptional()
  @IsEnum(DosageForm)
  dosageForm?: DosageForm;

  @ApiPropertyOptional({ enum: MedicationRoute, example: MedicationRoute.ORAL })
  @IsOptional()
  @IsEnum(MedicationRoute)
  route?: MedicationRoute;

  @ApiPropertyOptional({ example: { morning: 1, evening: 1 } })
  @IsOptional()
  schedule?: any;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMedicationDto {
  @ApiPropertyOptional({ example: 'Paracetamol' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Acetaminophen' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  genericName?: string;

  @ApiPropertyOptional({ example: 'Pain reliever and fever reducer' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '500mg' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  strength?: string;

  @ApiPropertyOptional({ example: 'mg' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ enum: DosageForm, example: DosageForm.TABLET })
  @IsOptional()
  @IsEnum(DosageForm)
  dosageForm?: DosageForm;

  @ApiPropertyOptional({ enum: MedicationRoute, example: MedicationRoute.ORAL })
  @IsOptional()
  @IsEnum(MedicationRoute)
  route?: MedicationRoute;

  @ApiPropertyOptional({ example: { morning: 1, evening: 1 } })
  @IsOptional()
  schedule?: any;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Pharmacy Order Item DTO
export class PharmacyOrderItemDto {
  @ApiProperty({ example: 'medication-uuid-123' })
  @IsUUID()
  medicationId: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: '1 tablet' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dosage?: string;

  @ApiPropertyOptional({ example: 'Twice daily' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  frequency?: string;

  @ApiPropertyOptional({ example: '7 days' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @ApiPropertyOptional({ example: 'Take after meals' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;
}

// Pharmacy Order DTOs
export class CreatePharmacyOrderDto {
  @ApiProperty({ example: 'patient-uuid-123' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ example: 'doctor-uuid-123' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty({ type: [PharmacyOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PharmacyOrderItemDto)
  items: PharmacyOrderItemDto[];

  @ApiPropertyOptional({ example: 'Urgent prescription' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdatePharmacyOrderDto {
  @ApiPropertyOptional({ enum: PharmacyOrderStatus, example: PharmacyOrderStatus.DISPENSED })
  @IsOptional()
  @IsEnum(PharmacyOrderStatus)
  status?: PharmacyOrderStatus;

  @ApiPropertyOptional({ example: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  dispensedDate?: Date;
}

export class UpdatePharmacyOrderItemDto {
  @ApiPropertyOptional({ enum: PharmacyOrderItemStatus, example: PharmacyOrderItemStatus.DISPENSED })
  @IsOptional()
  @IsEnum(PharmacyOrderItemStatus)
  status?: PharmacyOrderItemStatus;
}

// Query DTOs
export class PharmacyOrderQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 'patient name or order number', description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PharmacyOrderStatus, example: PharmacyOrderStatus.PENDING })
  @IsOptional()
  @IsEnum(PharmacyOrderStatus)
  status?: PharmacyOrderStatus;

  @ApiPropertyOptional({ example: 'patient-uuid-123' })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ example: 'doctor-uuid-123' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class MedicationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 'paracetamol', description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DosageForm, example: DosageForm.TABLET })
  @IsOptional()
  @IsEnum(DosageForm)
  dosageForm?: DosageForm;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
