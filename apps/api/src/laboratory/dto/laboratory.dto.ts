import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums for Laboratory module
export enum LabTestCategory {
  BLOOD = 'BLOOD',
  URINE = 'URINE',
  STOOL = 'STOOL',
  MICROBIOLOGY = 'MICROBIOLOGY',
  BIOCHEMISTRY = 'BIOCHEMISTRY',
  HEMATOLOGY = 'HEMATOLOGY',
  SEROLOGY = 'SEROLOGY',
  HORMONES = 'HORMONES',
  GENETICS = 'GENETICS',
  OTHER = 'OTHER',
}

export enum LabOrderPriority {
  STAT = 'STAT',
  HIGH = 'HIGH',
  ROUTINE = 'ROUTINE',
  LOW = 'LOW',
}

export enum LabOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum LabTestResultStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Lab Test DTOs
export class CreateLabTestDto {
  @ApiProperty({ example: 'Complete Blood Count' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'CBC' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiPropertyOptional({ example: 'Complete blood count with differential' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: LabTestCategory, example: LabTestCategory.BLOOD })
  @IsEnum(LabTestCategory)
  category: LabTestCategory;

  @ApiPropertyOptional({ example: 500.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLabTestDto {
  @ApiPropertyOptional({ example: 'Complete Blood Count' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'CBC' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: 'Complete blood count with differential' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: LabTestCategory, example: LabTestCategory.BLOOD })
  @IsOptional()
  @IsEnum(LabTestCategory)
  category?: LabTestCategory;

  @ApiPropertyOptional({ example: 500.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Lab Order DTOs
export class CreateLabOrderDto {
  @ApiProperty({ example: 'patient-uuid-123' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ example: 'doctor-uuid-123' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty({ 
    example: ['test-uuid-1', 'test-uuid-2'], 
    description: 'Array of lab test IDs',
    type: [String]
  })
  @IsArray()
  @IsUUID(4, { each: true })
  tests: string[];

  @ApiPropertyOptional({ example: 'Patient complains of fatigue' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ enum: LabOrderPriority, example: LabOrderPriority.ROUTINE })
  @IsOptional()
  @IsEnum(LabOrderPriority)
  priority?: LabOrderPriority;
}

export class UpdateLabOrderDto {
  @ApiPropertyOptional({ enum: LabOrderStatus, example: LabOrderStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(LabOrderStatus)
  status?: LabOrderStatus;

  @ApiPropertyOptional({ example: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  completedDate?: Date;
}

// Lab Order Test Result DTOs
export class UpdateLabTestResultDto {
  @ApiProperty({ example: 'test-uuid-123' })
  @IsUUID()
  testId: string;

  @ApiPropertyOptional({ example: '12.5 g/dL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  result?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  resultDate?: Date;

  @ApiPropertyOptional({ example: '12.0-15.5 g/dL' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  referenceRange?: string;

  @ApiPropertyOptional({ example: 'Normal range' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ enum: LabTestResultStatus, example: LabTestResultStatus.COMPLETED })
  @IsOptional()
  @IsEnum(LabTestResultStatus)
  status?: LabTestResultStatus;
}

// Query DTOs
export class LabOrderQueryDto {
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

  @ApiPropertyOptional({ enum: LabOrderStatus, example: LabOrderStatus.PENDING })
  @IsOptional()
  @IsEnum(LabOrderStatus)
  status?: LabOrderStatus;

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

export class LabTestQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 'blood test', description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LabTestCategory, example: LabTestCategory.BLOOD })
  @IsOptional()
  @IsEnum(LabTestCategory)
  category?: LabTestCategory;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
