import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'cmhgbr0ff0003jv1w9zpyz2w9' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'cmh7l0zbz0009v4d8vulskzil' })
  @IsString()
  doctorId: string;

  @ApiPropertyOptional({ example: 'cmh7l0zbz0009v4d8vulskzil' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  appointmentDateTime: string;

  @ApiPropertyOptional({ example: 'Regular checkup' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Patient has mild fever' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, example: AppointmentStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: 'cmhgbr0ff0003jv1w9zpyz2w9' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ example: 'cmh7l0zbz0009v4d8vulskzil' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'cmh7l0zbz0009v4d8vulskzil' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  appointmentDateTime?: string;

  @ApiPropertyOptional({ example: 'Follow-up visit' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, example: AppointmentStatus.COMPLETED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}

export class AppointmentQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, example: AppointmentStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: 'cmh7l0zbz0009v4d8vulskzil' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'cmhgbr0ff0003jv1w9zpyz2w9' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.COMPLETED })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

export class CheckAvailabilityDto {
  @ApiProperty({ example: 'cmh7l0zbz0009v4d8vulskzil' })
  @IsString()
  doctorId: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;
}

export class CalendarQueryDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  endDate: string;
}
