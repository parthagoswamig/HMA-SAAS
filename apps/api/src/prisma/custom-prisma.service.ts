import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient as BasePrismaClient } from '@prisma/client';

// This is a custom Prisma client that includes our custom methods
@Injectable()
export class CustomPrismaService
  extends BasePrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CustomPrismaService.name);

  constructor() {
    // Use pooled connection for serverless (pgBouncer)
    // For migrations, use DIRECT_DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    
    // Optimize for serverless with minimal connections
    const connectionUrl = databaseUrl?.includes('?')
      ? `${databaseUrl}&connection_limit=1&pool_timeout=10&connect_timeout=10`
      : `${databaseUrl}?connection_limit=1&pool_timeout=10&connect_timeout=10`;

    super({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    // For serverless, we don't connect on init
    // Connection happens on first query (lazy connection)
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      this.logger.log('Serverless environment detected - using lazy connection');
      return;
    }

    // For traditional servers, connect on init
    const maxRetries = 2;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        this.logger.log(
          `Attempting to connect to database... (attempt ${retries + 1}/${maxRetries})`,
        );
        await this.$connect();
        this.logger.log('✅ Database connected successfully');
        return;
      } catch (error) {
        retries++;
        this.logger.error(
          `Failed to connect to database (attempt ${retries}/${maxRetries}): ${error.message}`,
        );

        if (retries < maxRetries) {
          const delay = 1000; // 1 second
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.logger.warn('⚠️ Continuing without database connection');
          return;
        }
      }
    }
  }

  async onModuleDestroy() {
    // Disconnect in serverless is handled automatically
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  // Add custom methods for tokenBlacklist
  async findTokenByJti(jti: string) {
    return this
      .$queryRaw`SELECT * FROM "RefreshToken" WHERE jti = ${jti} LIMIT 1`.then(
      (result: unknown) => {
        const tokens = Array.isArray(result) ? result : [];
        return tokens[0] || null;
      },
    );
  }

  async upsertTokenBlacklist(params: {
    jti: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
  }) {
    const { jti, userId, token, expiresAt, revoked } = params;

    return this.$executeRaw`
      INSERT INTO "RefreshToken" (jti, "userId", token, "expiresAt", revoked, "createdAt", "updatedAt")
      VALUES (${jti}, ${userId}, ${token}, ${expiresAt}, ${revoked}, NOW(), NOW())
      ON CONFLICT (jti) 
      DO UPDATE SET 
        revoked = EXCLUDED.revoked,
        "updatedAt" = NOW()
      RETURNING *
    `;
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string) {
    return this.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const token = await this.refreshToken.findFirst({
      where: {
        jti,
        OR: [{ revoked: true }, { expiresAt: { lt: new Date() } }],
      },
      select: { id: true },
    });

    return !!token;
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}

// This is the type that will be used throughout the app
export type PrismaService = CustomPrismaService;
