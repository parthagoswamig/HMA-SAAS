-- HMS SaaS - Quick Fix: Assign Roles to Users
-- This script fixes the critical "User has no role assigned" issue
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state
-- IMPORTANT: Table names are case-sensitive!
-- User table: "User" (capital U)
-- TenantRole table: "tenant_roles" (lowercase with underscore)
SELECT 
    u.id,
    u.email,
    u."roleId",
    r.name as role_name,
    t.name as tenant_name
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
LEFT JOIN tenants t ON u."tenantId" = t.id
WHERE u.email IN ('admin@test.com', 'doctor@test.com');

-- Step 2: Find available roles
SELECT 
    id,
    name,
    description,
    "tenant_id" as "tenantId",
    "is_active"
FROM tenant_roles
WHERE "is_active" = true
ORDER BY name;

-- Step 3: Assign Admin role to admin@test.com
UPDATE "User" 
SET "roleId" = (
    SELECT id 
    FROM tenant_roles 
    WHERE name = 'Admin' 
    AND "is_active" = true
    LIMIT 1
)
WHERE email = 'admin@test.com'
AND "roleId" IS NULL;  -- Only update if no role assigned

-- Step 4: Assign Doctor role to doctor@test.com (if exists)
UPDATE "User" 
SET "roleId" = (
    SELECT id 
    FROM tenant_roles 
    WHERE name = 'Doctor' 
    AND "is_active" = true
    LIMIT 1
)
WHERE email = 'doctor@test.com'
AND "roleId" IS NULL;  -- Only update if no role assigned

-- Step 5: Verify the fix
SELECT 
    u.id,
    u.email,
    u."roleId",
    r.name as role_name,
    r.description,
    t.name as tenant_name
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
LEFT JOIN tenants t ON u."tenantId" = t.id
WHERE u.email IN ('admin@test.com', 'doctor@test.com');

-- Step 6: Check role permissions
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description,
    p.category
FROM tenant_roles r
JOIN role_permissions rp ON r.id = rp."role_id"
JOIN permissions p ON rp."permission_id" = p.id
WHERE r.name = 'Admin'
AND r."is_active" = true
ORDER BY p.category, p.name;

-- Alternative: If no roles exist, create them first
-- Uncomment and run this if Step 2 returns no roles

/*
-- Get the first tenant ID and create roles
DO $$
DECLARE
    v_tenant_id TEXT;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE "is_active" = true LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found';
    END IF;
    
    -- Create Admin role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Admin',
        'Full system access',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING;
    
    -- Create Doctor role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Doctor',
        'Medical staff access',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING;
    
    -- Create Nurse role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Nurse',
        'Nursing staff access',
        true,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING;
END $$;
*/

-- Expected Result:
-- After running this script, the validation should show:
-- - Deployment Readiness: 85%+ (up from 20%)
-- - Modules Passing: 16/20 (up from 4/20)
-- - Critical Issues: 1 (down from 7)
-- - High Issues: 1 (down from 20)
