import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
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
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(
          `Attempting to connect to database... (attempt ${retries + 1}/${maxRetries})`,
        );
        await this.$connect();
        console.log('✅ Database connected successfully');
        break;
      } catch (error) {
        retries++;
        console.error(
          `Failed to connect to database (attempt ${retries}/${maxRetries}): ${error.message}`,
        );

        if (retries < maxRetries) {
          const delay = retries * 3000; // Exponential backoff: 3s, 6s, 9s
          console.log(`Retrying in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(
            '❌ Failed to connect to database after all retries',
          );
          console.warn('⚠️ Continuing without database connection - some features may not work');
          return;
        }
      }
    }

    // Initialize tokenBlacklist with proper typing
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
    await this.$disconnect();
  }
}
