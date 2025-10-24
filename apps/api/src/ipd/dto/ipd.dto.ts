import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Enum for bed status
 */
export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

/**
 * Enum for ward types
 */
export enum WardType {
  GENERAL = 'GENERAL',
  ICU = 'ICU',
  CCU = 'CCU',
  MATERNITY = 'MATERNITY',
  PEDIATRIC = 'PEDIATRIC',
  SURGICAL = 'SURGICAL',
  MEDICAL = 'MEDICAL',
}

/**
 * DTO for creating wards
 */
export class CreateWardDto {
  @ApiProperty({ 
    example: 'General Ward A',
    description: 'Name of the ward'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: 'General medical and surgical cases',
    description: 'Description of the ward'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    enum: WardType,
    example: WardType.GENERAL,
    description: 'Type of the ward'
  })
  @IsEnum(WardType)
  @IsNotEmpty()
  type: WardType;

  @ApiProperty({ 
    example: 30,
    minimum: 1,
    description: 'Total capacity of beds in the ward'
  })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ 
    example: 'First Floor, East Wing',
    description: 'Location of the ward'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    example: 'Dr. Smith',
    description: 'Head nurse or responsible person'
  })
  @IsOptional()
  @IsString()
  headNurse?: string;
}

/**
 * DTO for updating wards
 */
export class UpdateWardDto {
  @ApiPropertyOptional({ 
    example: 'Updated General Ward A',
    description: 'Updated name of the ward'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ 
    example: 'Updated description',
    description: 'Updated description of the ward'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    enum: WardType,
    example: WardType.ICU,
    description: 'Updated type of the ward'
  })
  @IsOptional()
  @IsEnum(WardType)
  type?: WardType;

  @ApiPropertyOptional({ 
    example: 35,
    minimum: 1,
    description: 'Updated capacity of the ward'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ 
    example: 'Second Floor, West Wing',
    description: 'Updated location of the ward'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    example: 'Dr. Johnson',
    description: 'Updated head nurse'
  })
  @IsOptional()
  @IsString()
  headNurse?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether the ward is active'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for creating beds
 */
export class CreateBedDto {
  @ApiProperty({ 
    example: 'ward-uuid-123',
    description: 'ID of the ward this bed belongs to'
  })
  @IsString()
  @IsNotEmpty()
  wardId: string;

  @ApiProperty({ 
    example: 'A001',
    description: 'Unique bed number within the ward'
  })
  @IsString()
  @IsNotEmpty()
  bedNumber: string;

  @ApiPropertyOptional({ 
    enum: BedStatus,
    example: BedStatus.AVAILABLE,
    default: BedStatus.AVAILABLE,
    description: 'Current status of the bed'
  })
  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;

  @ApiPropertyOptional({ 
    example: 'Standard hospital bed with adjustable height',
    description: 'Description or notes about the bed'
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for updating bed status
 */
export class UpdateBedStatusDto {
  @ApiProperty({ 
    enum: BedStatus,
    example: BedStatus.OCCUPIED,
    description: 'New status of the bed'
  })
  @IsEnum(BedStatus)
  @IsNotEmpty()
  status: BedStatus;

  @ApiPropertyOptional({ 
    example: 'Patient admitted for surgery',
    description: 'Reason for status change'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for filtering wards
 */
export class WardFilterDto {
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
    enum: WardType,
    example: WardType.GENERAL,
    description: 'Filter by ward type'
  })
  @IsOptional()
  @IsEnum(WardType)
  type?: WardType;

  @ApiPropertyOptional({ 
    example: 'General',
    description: 'Search in ward name or description'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Filter by active status'
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

/**
 * DTO for filtering beds
 */
export class BedFilterDto {
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
    example: 'ward-uuid-123',
    description: 'Filter by ward ID'
  })
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional({ 
    enum: BedStatus,
    example: BedStatus.AVAILABLE,
    description: 'Filter by bed status'
  })
  @IsOptional()
  @IsEnum(BedStatus)
  status?: BedStatus;

  @ApiPropertyOptional({ 
    example: 'A001',
    description: 'Search by bed number'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Filter by active status'
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}