import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  
  emailQueue: Queue;
  reportQueue: Queue;
  cleanupQueue: Queue;

  onModuleInit() {
    try {
      this.emailQueue = new Queue('email', { connection });
      this.reportQueue = new Queue('report', { connection });
      this.cleanupQueue = new Queue('cleanup', { connection });
      
      this.logger.log('BullMQ queues initialized successfully');
    } catch (error) {
      this.logger.warn('Failed to initialize BullMQ queues. Redis may not be available:', error.message);
      // Create mock queues that don't actually queue
      this.emailQueue = { add: async () => ({ id: 'mock' }) } as any;
      this.reportQueue = { add: async () => ({ id: 'mock' }) } as any;
      this.cleanupQueue = { add: async () => ({ id: 'mock' }) } as any;
    }
  }

  async addEmailJob(data: { to: string; subject: string; html: string }) {
    return this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addReportJob(data: { type: string; id: string; tenantId: string }) {
    return this.reportQueue.add('generate-report', data, {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });
  }

  async addCleanupJob(data: { type: string; olderThan: Date }) {
    return this.cleanupQueue.add('cleanup', data, {
      attempts: 1,
    });
  }
}
