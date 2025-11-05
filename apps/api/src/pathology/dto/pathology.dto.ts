import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  IN_TESTING = 'IN_TESTING',
  COMPLETED = 'COMPLETED',
  REPORTED = 'REPORTED',
  CANCELLED = 'CANCELLED',
}

export enum TestCategory {
  HEMATOLOGY = 'HEMATOLOGY',
  BIOCHEMISTRY = 'BIOCHEMISTRY',
  MICROBIOLOGY = 'MICROBIOLOGY',
  IMMUNOLOGY = 'IMMUNOLOGY',
  PATHOLOGY = 'PATHOLOGY',
  MOLECULAR = 'MOLECULAR',
  CYTOLOGY = 'CYTOLOGY',
  HISTOLOGY = 'HISTOLOGY',
}

export class CreateLabTestDto {
  @ApiProperty({ example: 'Complete Blood Count' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CBC' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Complete blood count with differential' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TestCategory, example: TestCategory.HEMATOLOGY })
  @IsEnum(TestCategory)
  @IsNotEmpty()
  category: TestCategory;

  @ApiPropertyOptional({ example: 25.00 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 'mL' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiPropertyOptional({ example: '2-4 hours' })
  @IsOptional()
  @IsString()
  turnaroundTime?: string;
}

export class UpdateLabTestDto {
  @ApiPropertyOptional({ example: 'Updated test name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TestCategory })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;

  @ApiPropertyOptional({ example: 30.00 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 'Updated sample type' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiPropertyOptional({ example: 'Updated turnaround time' })
  @IsOptional()
  @IsString()
  turnaroundTime?: string;
}

export class CreateLabOrderDto {
  @ApiProperty({ example: 'patient-uuid-123' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'doctor-uuid-123' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ 
    example: ['test-uuid-1', 'test-uuid-2'],
    description: 'Array of test IDs to be ordered'
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tests: string[];

  @ApiPropertyOptional({ example: 'Routine checkup tests' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'Fasting required' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateLabOrderDto {
  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'Updated instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateTestResultDto {
  @ApiProperty({ example: 'Normal range values observed' })
  @IsString()
  @IsNotEmpty()
  result: string;

  @ApiPropertyOptional({ example: 'All parameters within normal limits' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Normal' })
  @IsOptional()
  @IsString()
  interpretation?: string;

  @ApiPropertyOptional({ enum: TestStatus, example: TestStatus.COMPLETED })
  @IsOptional()
  @IsEnum(TestStatus)
  status?: TestStatus;
}

export class PathologyFilterDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'patient-uuid-123' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ enum: TestCategory })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'CBC' })
  @IsOptional()
  @IsString()
  search?: string;
}