import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private isConnected = false;

  constructor() {
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    super({
      log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Optimize for serverless
      ...(isServerless && {
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      }),
    });
    
    // Apply middleware after initialization
    // TODO: Fix middleware type issues
    // setTimeout(() => {
    //   this.$use(tenantFilterMiddleware());
    // }, 0);
    
    console.log('[PrismaService] Initialized', {
      isServerless,
      hasDirectUrl: !!process.env.DIRECT_DATABASE_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
  }

  // Add tokenBlacklist property with proper typing
  tokenBlacklist: {
    findUnique: (args: {
      where: { jti: string; tenantId: string };
    }) => Promise<any>;
    upsert: (args: {
      where: { jti: string; tenantId: string };
      update: { revoked: boolean; reason: string; updatedAt: Date };
      create: {
        jti: string;
        userId: string;
        tenantId: string;
        token: string;
        expiresAt: Date;
        revoked: boolean;
        reason: string;
      };
    }) => Promise<any>;
    updateMany: (args: {
      where: { userId: string; tenantId: string };
      data: { revoked: boolean; reason: string; updatedAt: Date };
    }) => Promise<any>;
  };

  async onModuleInit() {
    // For serverless, use lazy connection (connect on first query)
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      console.log('[PrismaService] Serverless mode - using lazy connection');
      // Don't connect immediately in serverless - let Prisma connect on first query
      this.isConnected = false;
      
      // Initialize tokenBlacklist even in serverless mode
      this.initializeTokenBlacklist();
      
      // For serverless, we don't need to set up disconnect handlers
      // Vercel will handle cleanup automatically
      
      return;
    }

    // For traditional servers, connect immediately with retry logic
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(
          `[PrismaService] Connecting to database... (attempt ${retries + 1}/${maxRetries})`,
        );
        await this.$connect();
        console.log('[PrismaService] ✅ Database connected successfully');
        this.isConnected = true;
        break;
      } catch (error) {
        retries++;
        console.error(
          `[PrismaService] Failed to connect (attempt ${retries}/${maxRetries}):`,
          error.message,
        );

        if (retries < maxRetries) {
          const delay = retries * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`[PrismaService] Retrying in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error('[PrismaService] ❌ Failed to connect after all retries');
          console.warn('[PrismaService] ⚠️ Continuing without connection - queries will fail');
          return;
        }
      }
    }

    // Initialize tokenBlacklist
    this.initializeTokenBlacklist();
  }

  private initializeTokenBlacklist() {
    this.tokenBlacklist = {
      findUnique: async (args: {
        where: { jti: string; tenantId: string };
      }) => {
        return this.refreshToken.findFirst({
          where: {
            jti: args.where.jti,
            tenantId: args.where.tenantId,
          },
        });
      },

      upsert: async (args: {
        where: { jti: string; tenantId: string };
        update: {
          revoked: boolean;
          reason: string;
          updatedAt: Date;
        };
        create: {
          jti: string;
          userId: string;
          tenantId: string;
          token: string;
          expiresAt: Date;
          revoked: boolean;
          reason: string;
        };
      }) => {
        return this.refreshToken.upsert({
          where: {
            jti: args.where.jti,
          },
          update: args.update,
          create: args.create,
        });
      },

      updateMany: async (args: {
        where: { userId: string; tenantId: string };
        data: { revoked: boolean; reason: string; updatedAt: Date };
      }) => {
        return this.refreshToken.updateMany({
          where: {
            userId: args.where.userId,
            tenantId: args.where.tenantId,
          },
          data: args.data,
        });
      },
    };
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      console.log('[PrismaService] Disconnecting from database...');
      await this.$disconnect();
      this.isConnected = false;
      console.log('[PrismaService] Disconnected');
    }
  }

  // Helper method to ensure connection in serverless
  async ensureConnection() {
    if (!this.isConnected) {
      try {
        await this.$connect();
        this.isConnected = true;
        console.log('[PrismaService] Connected to database');
      } catch (error) {
        console.error('[PrismaService] Failed to connect:', error);
        throw error;
      }
    }
  }
}
