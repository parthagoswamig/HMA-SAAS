import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RadiologyPriority {
  STAT = 'STAT',
  HIGH = 'HIGH',
  ROUTINE = 'ROUTINE',
  LOW = 'LOW',
}

export enum StudyStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REPORTED = 'REPORTED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REPORTED = 'REPORTED',
  CANCELLED = 'CANCELLED',
}

export class CreateStudyDto {
  @ApiProperty({ example: 'patient-uuid-123' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'modality-uuid-123' })
  @IsString()
  @IsNotEmpty()
  modalityId: string;

  @ApiPropertyOptional({ example: 'Chest X-Ray examination' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Patient has shortness of breath' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: RadiologyPriority, example: RadiologyPriority.ROUTINE })
  @IsOptional()
  @IsEnum(RadiologyPriority)
  priority?: RadiologyPriority;

  @ApiPropertyOptional({ enum: StudyStatus, example: StudyStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(StudyStatus)
  status?: StudyStatus;
}

export class UpdateStudyDto {
  @ApiPropertyOptional({ example: 'Updated examination description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Updated clinical notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: RadiologyPriority })
  @IsOptional()
  @IsEnum(RadiologyPriority)
  priority?: RadiologyPriority;

  @ApiPropertyOptional({ enum: StudyStatus })
  @IsOptional()
  @IsEnum(StudyStatus)
  status?: StudyStatus;
}

export class CreateReportDto {
  @ApiProperty({ example: 'study-uuid-123' })
  @IsString()
  @IsNotEmpty()
  studyId: string;

  @ApiPropertyOptional({ example: 'No acute findings observed' })
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional({ example: 'Normal chest X-ray' })
  @IsOptional()
  @IsString()
  impression?: string;

  @ApiPropertyOptional({ example: 'Continue clinical observation' })
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional({ example: 'template-uuid-123' })
  @IsOptional()
  @IsString()
  reportTemplateId?: string;
}

export class UpdateReportDto {
  @ApiPropertyOptional({ example: 'Updated findings' })
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional({ example: 'Updated impression' })
  @IsOptional()
  @IsString()
  impression?: string;

  @ApiPropertyOptional({ example: 'Updated conclusion' })
  @IsOptional()
  @IsString()
  conclusion?: string;
}

export class CreateRadiologyOrderDto {
  @ApiProperty({ example: 'consultation-uuid-123' })
  @IsString()
  @IsNotEmpty()
  consultationId: string;

  @ApiProperty({ example: 'patient-uuid-123' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'doctor-uuid-123' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: 'modality-uuid-123' })
  @IsString()
  @IsNotEmpty()
  modalityId: string;

  @ApiProperty({ example: 'Chest X-Ray' })
  @IsString()
  @IsNotEmpty()
  studyType: string;

  @ApiPropertyOptional({ enum: RadiologyPriority, example: RadiologyPriority.ROUTINE })
  @IsOptional()
  @IsEnum(RadiologyPriority)
  priority?: RadiologyPriority;

  @ApiPropertyOptional({ example: 'Suspected pneumonia' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Patient with fever and cough' })
  @IsOptional()
  @IsString()
  clinicalHistory?: string;

  @ApiPropertyOptional({ example: '2024-12-10T14:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class UpdateRadiologyOrderDto {
  @ApiPropertyOptional({ example: 'Updated study type' })
  @IsOptional()
  @IsString()
  studyType?: string;

  @ApiPropertyOptional({ enum: RadiologyPriority })
  @IsOptional()
  @IsEnum(RadiologyPriority)
  priority?: RadiologyPriority;

  @ApiPropertyOptional({ example: 'Updated clinical reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Updated clinical history' })
  @IsOptional()
  @IsString()
  clinicalHistory?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class RadiologyFilterDto {
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

  @ApiPropertyOptional({ enum: RadiologyPriority })
  @IsOptional()
  @IsEnum(RadiologyPriority)
  priority?: RadiologyPriority;

  @ApiPropertyOptional({ enum: StudyStatus })
  @IsOptional()
  @IsEnum(StudyStatus)
  status?: StudyStatus;
}