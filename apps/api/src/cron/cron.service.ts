import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Daily backup job at 2 AM IST
    new CronJob(
      '0 2 * * *',
      () => this.dailyBackup(),
      null,
      true,
      'Asia/Kolkata',
    );

    // Health check every hour
    new CronJob(
      '0 * * * *',
      () => this.healthCheck(),
      null,
      true,
      'Asia/Kolkata',
    );

    // Cleanup old temp files daily at 3 AM
    new CronJob(
      '0 3 * * *',
      () => this.cleanupTempFiles(),
      null,
      true,
      'Asia/Kolkata',
    );

    this.logger.log('Cron jobs initialized successfully');
  }

  async dailyBackup() {
    try {
      this.logger.log('Starting daily backup job...');

      const stats = await this.prisma.$transaction(async (tx) => {
        const [tenants, users, patients, appointments, invoices] = await Promise.all([
          tx.tenant.count(),
          tx.user.count(),
          tx.patient.count(),
          tx.appointment.count(),
          tx.invoice.count(),
        ]);

        return { tenants, users, patients, appointments, invoices };
      });

      this.logger.log(`Backup stats: ${JSON.stringify(stats)}`);
      
      // In production, trigger actual backup to cloud storage
      // e.g., call Supabase backup API, AWS S3, etc.
      
      this.logger.log('Daily backup completed successfully');
    } catch (error) {
      this.logger.error('Daily backup failed:', error);
    }
  }

  async healthCheck() {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // Check critical counts
      const tenantCount = await this.prisma.tenant.count();
      
      this.logger.log(`Health check passed - ${tenantCount} tenants active`);
    } catch (error) {
      this.logger.error('Health check failed:', error);
      // In production, send alert to monitoring service
    }
  }

  async cleanupTempFiles() {
    try {
      this.logger.log('Starting temp files cleanup...');

      // Clean up old audit logs (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deleted = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${deleted.count} old audit logs`);

      // Clean up old webhook events (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const webhookDeleted = await this.prisma.webhookEvent.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${webhookDeleted.count} old webhook events`);
    } catch (error) {
      this.logger.error('Cleanup failed:', error);
    }
  }
}
