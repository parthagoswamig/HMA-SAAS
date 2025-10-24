import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export class QueryAuditLogsDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsArray()
  @IsEnum(AuditAction, { each: true })
  actions?: AuditAction[];

  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @IsOptional()
  @IsArray()
  @IsEnum(AuditEntityType, { each: true })
  entityTypes?: AuditEntityType[];

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isSensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isSuspicious?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  requiresReview?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;
}

export class GetStatisticsDto {
  @IsUUID()
  tenantId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class MarkReviewedDto {
  @IsUUID()
  reviewedBy: string;
}
