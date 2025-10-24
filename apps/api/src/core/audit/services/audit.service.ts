import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId: string;
  userEmail: string;
  userRole: string;
  tenantId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  description?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  location?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  isSensitive?: boolean;
  isSuspicious?: boolean;
  requiresReview?: boolean;
  durationMs?: number;
}

export interface AuditLogQuery {
  tenantId?: string;
  userId?: string;
  action?: AuditAction | AuditAction[];
  entityType?: AuditEntityType | AuditEntityType[];
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  isSensitive?: boolean;
  isSuspicious?: boolean;
  requiresReview?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create audit log entry
   */
  async log(logDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(logDto);
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Quick log methods for common actions
   */
  async logCreate(
    userId: string,
    userEmail: string,
    userRole: string,
    tenantId: string,
    entityType: AuditEntityType,
    entityId: string,
    newValues?: Record<string, any>,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      userRole,
      tenantId,
      action: AuditAction.CREATE,
      entityType,
      entityId,
      newValues,
      description: `Created ${entityType} ${entityId}`,
    });
  }

  async logUpdate(
    userId: string,
    userEmail: string,
    userRole: string,
    tenantId: string,
    entityType: AuditEntityType,
    entityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      userRole,
      tenantId,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      oldValues,
      newValues,
      description: `Updated ${entityType} ${entityId}`,
    });
  }

  async logDelete(
    userId: string,
    userEmail: string,
    userRole: string,
    tenantId: string,
    entityType: AuditEntityType,
    entityId: string,
    oldValues?: Record<string, any>,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      userRole,
      tenantId,
      action: AuditAction.DELETE,
      entityType,
      entityId,
      oldValues,
      description: `Deleted ${entityType} ${entityId}`,
    });
  }

  async logRead(
    userId: string,
    userEmail: string,
    userRole: string,
    tenantId: string,
    entityType: AuditEntityType,
    entityId: string,
    isSensitive: boolean = false,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      userRole,
      tenantId,
      action: AuditAction.READ,
      entityType,
      entityId,
      isSensitive,
      description: `Accessed ${entityType} ${entityId}`,
    });
  }

  async logLogin(
    userId: string,
    userEmail: string,
    userRole: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
  ): Promise<AuditLog> {
    return this.log({
      userId,
      userEmail,
      userRole,
      tenantId,
      action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
      entityType: AuditEntityType.USER,
      entityId: userId,
      ipAddress,
      userAgent,
      isSuspicious: !success,
      description: success ? 'User logged in' : 'Failed login attempt',
    });
  }

  /**
   * Query audit logs with filters
   */
  async query(query: AuditLogQuery): Promise<{ data: AuditLog[]; total: number }> {
    const {
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      ipAddress,
      isSensitive,
      isSuspicious,
      requiresReview,
      page = 1,
      limit = 50,
    } = query;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (entityId) where.entityId = entityId;
    if (ipAddress) where.ipAddress = ipAddress;
    if (isSensitive !== undefined) where.isSensitive = isSensitive;
    if (isSuspicious !== undefined) where.isSuspicious = isSuspicious;
    if (requiresReview !== undefined) where.requiresReview = requiresReview;

    if (action) {
      where.action = Array.isArray(action) ? In(action) : action;
    }

    if (entityType) {
      where.entityType = Array.isArray(entityType) ? In(entityType) : entityType;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  /**
   * Get audit trail for specific entity
   */
  async getEntityTrail(
    entityType: AuditEntityType,
    entityId: string,
    tenantId?: string,
  ): Promise<AuditLog[]> {
    const where: any = { entityType, entityId };
    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get user activity history
   */
  async getUserActivity(
    userId: string,
    tenantId?: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const where: any = { userId };
    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get suspicious activities
   */
  async getSuspiciousActivities(
    tenantId?: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    const where: any = { isSuspicious: true };
    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get activities requiring review
   */
  async getActivitiesForReview(
    tenantId?: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    const where: any = { requiresReview: true };
    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalLogs: number;
    byAction: Record<AuditAction, number>;
    byEntityType: Record<AuditEntityType, number>;
    suspiciousCount: number;
    sensitiveAccessCount: number;
  }> {
    const logs = await this.auditLogRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const byAction: any = {};
    const byEntityType: any = {};
    let suspiciousCount = 0;
    let sensitiveAccessCount = 0;

    logs.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
      if (log.isSuspicious) suspiciousCount++;
      if (log.isSensitive) sensitiveAccessCount++;
    });

    return {
      totalLogs: logs.length,
      byAction,
      byEntityType,
      suspiciousCount,
      sensitiveAccessCount,
    };
  }

  /**
   * Mark log as reviewed
   */
  async markAsReviewed(id: string, reviewedBy: string): Promise<void> {
    const log = await this.auditLogRepository.findOne({ where: { id } });
    if (log) {
      log.requiresReview = false;
      log.metadata = {
        ...log.metadata,
        reviewedBy,
        reviewedAt: new Date().toISOString(),
      };
      await this.auditLogRepository.save(log);
    }
  }

  /**
   * Cleanup old audit logs (retention policy)
   */
  async cleanup(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .andWhere('is_sensitive = false')
      .andWhere('requires_review = false')
      .execute();

    return result.affected || 0;
  }
}
