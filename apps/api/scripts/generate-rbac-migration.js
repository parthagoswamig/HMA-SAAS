#!/usr/bin/env node
/**
 * Script to generate RBAC migration
 * This creates the necessary SQL migration file for RBAC tables
 */

const fs = require('fs');
const path = require('path');

const migrationName = `${Date.now()}_add_rbac_system`;
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
const migrationDir = path.join(migrationsDir, migrationName);

// Create migrations directory if it doesn't exist
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Create migration folder
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

const migrationSQL = `-- RBAC System Migration
-- This migration adds Role-Based Access Control tables and columns

-- CreateTable: permissions
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: tenant_roles
CREATE TABLE IF NOT EXISTS "tenant_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: role_permissions
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Add roleId column to User table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'roleId'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "roleId" TEXT;
    END IF;
END $$;

-- Add roleId column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "role_id" TEXT;
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_code_key" ON "permissions"("code");
CREATE INDEX IF NOT EXISTS "permissions_category_idx" ON "permissions"("category");
CREATE INDEX IF NOT EXISTS "permissions_is_system_idx" ON "permissions"("is_system");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tenant_roles_tenant_id_idx" ON "tenant_roles"("tenant_id");
CREATE INDEX IF NOT EXISTS "tenant_roles_is_active_idx" ON "tenant_roles"("is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "tenant_roles_tenant_id_name_key" ON "tenant_roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");
CREATE INDEX IF NOT EXISTS "role_permissions_role_id_idx" ON "role_permissions"("role_id");
CREATE INDEX IF NOT EXISTS "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex on User.roleId
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");

-- CreateIndex on users.role_id
CREATE INDEX IF NOT EXISTS "users_role_id_idx" ON "users"("role_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tenant_roles_tenant_id_fkey'
    ) THEN
        ALTER TABLE "tenant_roles" ADD CONSTRAINT "tenant_roles_tenant_id_fkey" 
        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_role_id_fkey'
    ) THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" 
        FOREIGN KEY ("role_id") REFERENCES "tenant_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_permission_id_fkey'
    ) THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" 
        FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey for User.roleId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_roleId_fkey'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" 
        FOREIGN KEY ("roleId") REFERENCES "tenant_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey for users.role_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_role_id_fkey'
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" 
        FOREIGN KEY ("role_id") REFERENCES "tenant_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
`;

// Write migration file
const migrationFile = path.join(migrationDir, 'migration.sql');
fs.writeFileSync(migrationFile, migrationSQL);

console.log(`✅ Migration created: ${migrationName}`);
console.log(`📁 Location: ${migrationFile}`);
console.log('');
console.log('Next steps:');
console.log('1. Commit this migration to git');
console.log('2. Push to GitHub');
console.log('3. Render will automatically run the migration on next deploy');
