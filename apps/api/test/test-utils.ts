import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Prisma } from '@prisma/client';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

const prisma = new PrismaClient();

const TEST_TENANT_ID = 'test-tenant-id';
const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  tenantId: TEST_TENANT_ID,
  role: 'ADMIN',
  permissions: ['patients:read', 'patients:write', 'patients:delete']
};

const logger = new Logger('TestApp');

export class TestApp {
  public app: INestApplication;
  public moduleFixture: TestingModule;
  public authToken: string;
  public tenantId: string;

  async init() {
    try {
      logger.log('Initializing test application...');
      
      // Test database connection first
      await this.testDatabaseConnection();
      
      // Initialize the testing module
      this.moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

      this.app = this.moduleFixture.createNestApplication();
      
      // Disable rate limiting for tests
      const reflector = this.app.get(Reflector);
      const storageService = this.app.get(ThrottlerStorage);
      const configService = this.app.get(ConfigService);
      this.app.useGlobalGuards(new ThrottlerGuard({ throttlers: [] }, storageService, reflector));
      
      // Enable validation pipe
      this.app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }));
      
      // Generate auth token
      const jwtService = this.app.get(JwtService);
      this.authToken = jwtService.sign(TEST_USER);
      this.tenantId = TEST_TENANT_ID;
      
      await this.app.init();
      logger.log('Test application initialized successfully');
      
      return this;
    } catch (error) {
      logger.error('Failed to initialize test application', error);
      throw error;
    }
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  getRequest() {
    return request(this.getHttpServer())
      .set('Authorization', `Bearer ${this.authToken}`)
      .set('x-tenant-id', TEST_TENANT_ID);
  }

  async close() {
    await this.cleanupDatabase();
    await this.app.close();
  }

  private async testDatabaseConnection() {
    try {
      await prisma.$connect();
      logger.log('✅ Database connection successful');
      
      // Test a simple query
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw new Error('Failed to connect to test database. Please check your DATABASE_URL in .env.test');
    }
  }

  async cleanupDatabase() {
    try {
      logger.log('🧹 Cleaning up test database...');
      
      // Get all tables except migrations and enums
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename != '_prisma_migrations'
        AND tablename NOT LIKE '\_%';
      `;

      if (tables.length === 0) {
        logger.warn('No tables found in the database. Is the connection configured correctly?');
        return;
      }

      // Disable foreign key constraints
      await prisma.$executeRaw`SET session_replication_role = 'replica'`;

      // Truncate all tables
      for (const { tablename } of tables as any[]) {
        try {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${tablename}" CASCADE;`
          );
          logger.debug(`✅ Truncated table: ${tablename}`);
        } catch (error) {
          logger.error(`❌ Error truncating table ${tablename}:`, error);
          throw error;
        }
      }

      // Re-enable foreign key constraints
      await prisma.$executeRaw`SET session_replication_role = 'origin'`;
      
      logger.log('✨ Test database cleanup completed');
    } catch (error) {
      logger.error('❌ Error during database cleanup:', error);
      throw error;
    }
  }

  // Helper methods for test data setup
  async createTestPatient(data: any = {}) {
    return prisma.patient.create({
      data: {
        firstName: 'Test',
        lastName: 'Patient',
        email: `test-${Date.now()}@example.com`,
        medicalRecordNumber: `MRN-${Date.now()}`,
        tenantId: TEST_TENANT_ID,
        ...data,
      },
    });
  }
}
