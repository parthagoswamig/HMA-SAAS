import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    // Get actual stats from database
    try {
      const [tenantCount, userCount, patientCount] = await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.patient.count(),
      ]);

      return {
        message: 'HMS SaaS API - Hospital Management System',
        version: '1.0.0',
        status: 'operational',
        stats: {
          tenants: tenantCount,
          users: userCount,
          patients: patientCount,
        },
        endpoints: {
          health: '/health',
          docs: '/api-docs',
          auth: '/auth/login',
        },
      };
    } catch (error) {
      return {
        message: 'HMS SaaS API - Hospital Management System',
        version: '1.0.0',
        status: 'operational',
        note: 'Database stats unavailable',
      };
    }
  }

  async getHealthStatus() {
    try {
      // Actually test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      const dbStats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          current_database() as database,
          version() as postgres_version,
          pg_size_pretty(pg_database_size(current_database())) as size
      `;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'HMS SaaS API',
        database: {
          status: 'connected',
          name: dbStats[0]?.database || 'unknown',
          size: dbStats[0]?.size || 'unknown',
          type: 'PostgreSQL (Supabase)',
        },
        environment: process.env.NODE_ENV || 'development',
        serverless: process.env.VERCEL === '1',
      };
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        service: 'HMS SaaS API',
        database: {
          status: 'disconnected',
          error: error.message,
        },
        environment: process.env.NODE_ENV || 'development',
        serverless: process.env.VERCEL === '1',
      };
    }
  }
}
