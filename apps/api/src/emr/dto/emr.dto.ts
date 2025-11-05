import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RecordType {
  CONSULTATION = 'CONSULTATION',
  DIAGNOSIS = 'DIAGNOSIS',
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_RESULT = 'LAB_RESULT',
  IMAGING = 'IMAGING',
  SURGERY = 'SURGERY',
  DISCHARGE = 'DISCHARGE',
}

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'patient-uuid-123' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ enum: RecordType, example: RecordType.CONSULTATION })
  @IsEnum(RecordType)
  @IsNotEmpty()
  recordType: RecordType;

  @ApiProperty({ example: 'General Consultation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Patient reports headache' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-10T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'doctor-uuid-123' })
  @IsOptional()
  @IsString()
  doctorId?: string;
}

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({ example: 'Updated Consultation' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  recordType?: RecordType;
}

export class EmrFilterDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: RecordType })
  @IsOptional()
  @IsEnum(RecordType)
  recordType?: RecordType;

  @ApiPropertyOptional({ example: 'patient-uuid-123' })
  @IsOptional()
  @IsString()
  patientId?: string;
}