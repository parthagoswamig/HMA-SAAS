import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { Permissions } from '../../rbac/decorators/permissions.decorator';
import { Permission } from '../../rbac/enums/permissions.enum';
import { QueryAuditLogsDto, GetStatisticsDto, MarkReviewedDto } from '../dto/audit.dto';
import { AuditEntityType } from '../entities/audit-log.entity';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Query audit logs with filters
   * GET /audit/logs
   */
  @Get('logs')
  @Permissions(Permission.VIEW_AUDIT_LOGS)
  @ApiOperation({ summary: 'Query audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async queryLogs(@Query() query: QueryAuditLogsDto) {
    return this.auditService.query({
      ...query,
      action: query.actions ? undefined : query.action,
      entityType: query.entityTypes ? undefined : query.entityType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }

  /**
   * Get audit trail for specific entity
   * GET /audit/entity/:entityType/:entityId
   */
  @Get('entity/:entityType/:entityId')
  @Permissions(Permission.VIEW_AUDIT_LOGS)
  @ApiOperation({ summary: 'Get audit trail for specific entity' })
  @ApiParam({ name: 'entityType', description: 'Type of entity' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity trail retrieved successfully' })
  async getEntityTrail(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.auditService.getEntityTrail(entityType, entityId, tenantId);
  }

  /**
   * Get user activity history
   * GET /audit/user/:userId
   */
  @Get('user/:userId')
  @Permissions(Permission.VIEW_AUDIT_LOGS)
  @ApiOperation({ summary: 'Get user activity history' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  async getUserActivity(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getUserActivity(userId, tenantId, limit);
  }

  /**
   * Get suspicious activities
   * GET /audit/suspicious
   */
  @Get('suspicious')
  @Permissions(Permission.VIEW_AUDIT_LOGS)
  async getSuspiciousActivities(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getSuspiciousActivities(tenantId, limit);
  }

  /**
   * Get activities requiring review
   * GET /audit/review
   */
  @Get('review')
  @Permissions(Permission.VIEW_AUDIT_LOGS)
  async getActivitiesForReview(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getActivitiesForReview(tenantId, limit);
  }

  /**
   * Get audit statistics
   * POST /audit/statistics
   */
  @Post('statistics')
  @Permissions(Permission.VIEW_AUDIT_LOGS)
  async getStatistics(@Body() dto: GetStatisticsDto) {
    return this.auditService.getStatistics(
      dto.tenantId,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  /**
   * Mark audit log as reviewed
   * POST /audit/logs/:id/reviewed
   */
  @Post('logs/:id/reviewed')
  @Permissions(Permission.MANAGE_AUDIT_LOGS)
  async markAsReviewed(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkReviewedDto,
  ) {
    await this.auditService.markAsReviewed(id, dto.reviewedBy);
    return { message: 'Audit log marked as reviewed' };
  }
}
