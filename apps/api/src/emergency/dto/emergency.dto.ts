import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum EmergencyStatus {
  WAITING = 'WAITING',
  IN_TREATMENT = 'IN_TREATMENT',
  DISCHARGED = 'DISCHARGED',
  ADMITTED = 'ADMITTED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum TriageLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export class CreateEmergencyCaseDto {
  @ApiProperty({ example: 'patient-uuid-123' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'Chest pain, difficulty breathing' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiPropertyOptional({ enum: TriageLevel, example: TriageLevel.HIGH })
  @IsOptional()
  @IsEnum(TriageLevel)
  triageLevel?: TriageLevel;

  @ApiPropertyOptional({ example: 'Patient conscious, BP elevated' })
  @IsOptional()
  @IsString()
  vitalSigns?: string;

  @ApiPropertyOptional({ example: 'No known allergies' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: '2024-12-10T14:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  arrivalTime?: string;
}

export class UpdateEmergencyCaseDto {
  @ApiPropertyOptional({ enum: EmergencyStatus, example: EmergencyStatus.IN_TREATMENT })
  @IsOptional()
  @IsEnum(EmergencyStatus)
  status?: EmergencyStatus;

  @ApiPropertyOptional({ example: 'Updated condition notes' })
  @IsOptional()
  @IsString()
  treatmentNotes?: string;

  @ApiPropertyOptional({ example: 'doctor-uuid-123' })
  @IsOptional()
  @IsString()
  assignedDoctorId?: string;
}

export class UpdateTriageDto {
  @ApiProperty({ enum: TriageLevel, example: TriageLevel.CRITICAL })
  @IsEnum(TriageLevel)
  @IsNotEmpty()
  triageLevel: TriageLevel;

  @ApiPropertyOptional({ example: 'Reassessed due to worsening symptoms' })
  @IsOptional()
  @IsString()
  triageNotes?: string;
}

export class EmergencyFilterDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: EmergencyStatus, example: EmergencyStatus.WAITING })
  @IsOptional()
  @IsEnum(EmergencyStatus)
  status?: EmergencyStatus;

  @ApiPropertyOptional({ enum: TriageLevel, example: TriageLevel.HIGH })
  @IsOptional()
  @IsEnum(TriageLevel)
  triageLevel?: TriageLevel;

  @ApiPropertyOptional({ example: 'chest pain' })
  @IsOptional()
  @IsString()
  search?: string;
}