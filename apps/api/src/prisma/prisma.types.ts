import { PrismaClient as BasePrismaClient } from '@prisma/client';

// Define the token blacklist model type
export interface TokenBlacklist {
  id: string;
  jti: string;
  userId: string;
  tenantId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extend the PrismaClient type to include our custom methods
export interface PrismaClient extends BasePrismaClient {
  tokenBlacklist: {
    findUnique: (args: {
      where: { jti: string; tenantId: string };
    }) => Promise<TokenBlacklist | null>;

    upsert: (args: {
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
    }) => Promise<any>;

    updateMany: (args: {
      where: {
        userId: string;
        revoked: boolean;
      };
      data: {
        revoked: boolean;
        reason: string;
        updatedAt: Date;
      };
    }) => Promise<{ count: number }>;
  };
}
