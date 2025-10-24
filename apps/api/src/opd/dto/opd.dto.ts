import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Enum for OPD visit status
 */
export enum OpdVisitStatus {
  WAITING = 'WAITING',
  ARRIVED = 'ARRIVED',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

/**
 * DTO for creating OPD visits
 */
export class CreateOpdVisitDto {
  @ApiProperty({ 
    example: 'patient-uuid-123',
    description: 'ID of the patient visiting OPD'
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ 
    example: 'doctor-uuid-123',
    description: 'ID of the doctor for the consultation'
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @ApiPropertyOptional({ 
    example: 'department-uuid-123',
    description: 'ID of the department (optional)'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ 
    example: 'Severe headache for past 3 days',
    description: 'Chief complaint of the patient'
  })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiPropertyOptional({ 
    example: 'Nausea, dizziness, blurred vision',
    description: 'Additional symptoms reported by patient'
  })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({ 
    example: 'Migraine - suspected tension headache',
    description: 'Initial or final diagnosis'
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ 
    example: 'Prescribed pain medication and rest',
    description: 'Treatment provided or recommended'
  })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional({ 
    example: 'Patient advised to monitor symptoms',
    description: 'Additional notes about the visit'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-17T10:00:00.000Z',
    description: 'Follow-up appointment date if required'
  })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ 
    enum: OpdVisitStatus,
    example: OpdVisitStatus.WAITING,
    default: OpdVisitStatus.WAITING,
    description: 'Current status of the visit'
  })
  @IsOptional()
  @IsEnum(OpdVisitStatus)
  status?: OpdVisitStatus;
}

/**
 * DTO for updating OPD visits
 */
export class UpdateOpdVisitDto {
  @ApiPropertyOptional({ 
    example: 'doctor-uuid-456',
    description: 'Updated doctor ID for the consultation'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ 
    example: 'department-uuid-456',
    description: 'Updated department ID'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ 
    example: 'Persistent headache with light sensitivity',
    description: 'Updated chief complaint'
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({ 
    example: 'Added photophobia and phonophobia',
    description: 'Updated symptoms'
  })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({ 
    example: 'Confirmed migraine diagnosis',
    description: 'Updated diagnosis'
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ 
    example: 'Increased medication dosage',
    description: 'Updated treatment plan'
  })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiPropertyOptional({ 
    example: 'Patient responding well to treatment',
    description: 'Updated visit notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-20T14:00:00.000Z',
    description: 'Updated follow-up date'
  })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ 
    enum: OpdVisitStatus,
    example: OpdVisitStatus.IN_CONSULTATION,
    description: 'Updated visit status'
  })
  @IsOptional()
  @IsEnum(OpdVisitStatus)
  status?: OpdVisitStatus;
}

/**
 * DTO for filtering OPD visits
 */
export class OpdVisitFilterDto {
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
    enum: OpdVisitStatus,
    example: OpdVisitStatus.WAITING,
    description: 'Filter by visit status'
  })
  @IsOptional()
  @IsEnum(OpdVisitStatus)
  status?: OpdVisitStatus;

  @ApiPropertyOptional({ 
    example: 'doctor-uuid-123',
    description: 'Filter by doctor ID'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ 
    example: 'department-uuid-123',
    description: 'Filter by department ID'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-10',
    description: 'Filter by specific date (YYYY-MM-DD format)'
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ 
    example: 'patient-uuid-123',
    description: 'Filter by patient ID'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ 
    example: 'headache',
    description: 'Search in chief complaint, symptoms, or diagnosis'
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for queue filters
 */
export class OpdQueueFilterDto {
  @ApiPropertyOptional({ 
    example: 'doctor-uuid-123',
    description: 'Filter queue by specific doctor'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ 
    example: 'department-uuid-123',
    description: 'Filter queue by specific department'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;
}