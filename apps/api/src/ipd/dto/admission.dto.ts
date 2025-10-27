import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Enum for admission types
 */
export enum AdmissionType {
  ELECTIVE = 'ELECTIVE',
  EMERGENCY = 'EMERGENCY',
  TRANSFER = 'TRANSFER',
}

/**
 * Enum for admission status
 */
export enum AdmissionStatus {
  ADMITTED = 'ADMITTED',
  CRITICAL = 'CRITICAL',
  STABLE = 'STABLE',
  DISCHARGED = 'DISCHARGED',
  TRANSFERRED = 'TRANSFERRED',
}

/**
 * DTO for creating admissions
 */
export class CreateAdmissionDto {
  @ApiProperty({ 
    example: 'patient-uuid-123',
    description: 'ID of the patient being admitted'
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ 
    example: 'ward-uuid-123',
    description: 'ID of the ward for admission'
  })
  @IsString()
  @IsNotEmpty()
  wardId: string;

  @ApiProperty({ 
    example: 'bed-uuid-123',
    description: 'ID of the bed assigned'
  })
  @IsString()
  @IsNotEmpty()
  bedId: string;

  @ApiPropertyOptional({ 
    example: 'doctor-uuid-123',
    description: 'ID of the primary doctor'
  })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ 
    enum: AdmissionType,
    example: AdmissionType.ELECTIVE,
    description: 'Type of admission'
  })
  @IsEnum(AdmissionType)
  @IsNotEmpty()
  admissionType: AdmissionType;

  @ApiProperty({ 
    example: 'Acute appendicitis',
    description: 'Primary diagnosis'
  })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiPropertyOptional({ 
    example: 'Patient admitted for emergency surgery',
    description: 'Additional notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-01T10:00:00Z',
    description: 'Expected discharge date'
  })
  @IsOptional()
  @IsString()
  expectedDischargeDate?: string;
}

/**
 * DTO for updating admissions
 */
export class UpdateAdmissionDto {
  @ApiPropertyOptional({ 
    enum: AdmissionStatus,
    example: AdmissionStatus.STABLE,
    description: 'Updated status of the admission'
  })
  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @ApiPropertyOptional({ 
    example: 'Updated diagnosis after tests',
    description: 'Updated diagnosis'
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ 
    example: 'Patient condition improving',
    description: 'Updated notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-05T10:00:00Z',
    description: 'Updated expected discharge date'
  })
  @IsOptional()
  @IsString()
  expectedDischargeDate?: string;

  @ApiPropertyOptional({ 
    example: 'doctor-uuid-456',
    description: 'Updated primary doctor'
  })
  @IsOptional()
  @IsString()
  doctorId?: string;
}

/**
 * DTO for discharging patients
 */
export class DischargePatientDto {
  @ApiProperty({ 
    example: 'Patient recovered fully. Discharged with medications.',
    description: 'Discharge summary'
  })
  @IsString()
  @IsNotEmpty()
  dischargeSummary: string;

  @ApiPropertyOptional({ 
    example: 'Follow-up in 2 weeks. Continue medications.',
    description: 'Follow-up instructions'
  })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-15T10:00:00Z',
    description: 'Follow-up appointment date'
  })
  @IsOptional()
  @IsString()
  followUpDate?: string;
}

/**
 * DTO for filtering admissions
 */
export class AdmissionFilterDto {
  @ApiPropertyOptional({ 
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number for pagination'
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page'
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    enum: AdmissionStatus,
    example: AdmissionStatus.ADMITTED,
    description: 'Filter by admission status'
  })
  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @ApiPropertyOptional({ 
    example: 'ward-uuid-123',
    description: 'Filter by ward ID'
  })
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional({ 
    example: 'patient-uuid-123',
    description: 'Filter by patient ID'
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ 
    example: 'John',
    description: 'Search by patient name'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
