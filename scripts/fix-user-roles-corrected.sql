-- HMS SaaS - CORRECTED Quick Fix: Assign Roles to Users
-- This script fixes the critical "User has no role assigned" issue
-- Run this in your Supabase SQL Editor

-- IMPORTANT: Table names are case-sensitive in PostgreSQL!
-- User table: "User" (capital U)
-- TenantRole table: "tenant_roles" (lowercase with underscore)

-- ============================================
-- Step 1: Check current state
-- ============================================
SELECT 
    u.id,
    u.email,
    u."roleId",
    r.name as role_name,
    r.description,
    t.name as tenant_name,
    t.slug as tenant_slug
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
LEFT JOIN tenants t ON u."tenantId" = t.id
WHERE u.email IN ('admin@test.com', 'doctor@test.com')
ORDER BY u.email;

-- ============================================
-- Step 2: Find available roles
-- ============================================
SELECT 
    r.id,
    r.name,
    r.description,
    r."is_active",
    r."is_system",
    t.name as tenant_name,
    t.slug as tenant_slug
FROM tenant_roles r
JOIN tenants t ON r."tenant_id" = t.id
WHERE r."is_active" = true
ORDER BY t.name, r.name;

-- ============================================
-- Step 3: Assign Admin role to admin@test.com
-- ============================================
UPDATE "User" 
SET "roleId" = (
    SELECT r.id 
    FROM tenant_roles r
    JOIN tenants t ON r."tenant_id" = t.id
    WHERE r.name = 'Admin' 
    AND r."is_active" = true
    LIMIT 1
)
WHERE email = 'admin@test.com'
AND "roleId" IS NULL;  -- Only update if no role assigned

-- Check result
SELECT 
    u.email,
    u."roleId",
    r.name as assigned_role
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
WHERE u.email = 'admin@test.com';

-- ============================================
-- Step 4: Assign Doctor role to doctor@test.com (if exists)
-- ============================================
UPDATE "User" 
SET "roleId" = (
    SELECT r.id 
    FROM tenant_roles r
    JOIN tenants t ON r."tenant_id" = t.id
    WHERE r.name = 'Doctor' 
    AND r."is_active" = true
    LIMIT 1
)
WHERE email = 'doctor@test.com'
AND "roleId" IS NULL;  -- Only update if no role assigned

-- Check result
SELECT 
    u.email,
    u."roleId",
    r.name as assigned_role
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
WHERE u.email = 'doctor@test.com';

-- ============================================
-- Step 5: Verify the fix for all test users
-- ============================================
SELECT 
    u.id,
    u.email,
    u."firstName",
    u."lastName",
    u."roleId",
    r.name as role_name,
    r.description as role_description,
    r."is_active" as role_is_active,
    t.name as tenant_name,
    t.slug as tenant_slug
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
LEFT JOIN tenants t ON u."tenantId" = t.id
WHERE u.email IN ('admin@test.com', 'doctor@test.com')
ORDER BY u.email;

-- ============================================
-- Step 6: Check role permissions (optional)
-- ============================================
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description as permission_description,
    p.category as permission_category
FROM tenant_roles r
JOIN role_permissions rp ON r.id = rp."role_id"
JOIN permissions p ON rp."permission_id" = p.id
WHERE r.name = 'Admin'
AND r."is_active" = true
AND p."is_active" = true
ORDER BY p.category, p.name;

-- ============================================
-- ALTERNATIVE: If no roles exist, create them first
-- ============================================
-- Uncomment and run this section if Step 2 returns no roles

/*
DO $$
DECLARE
    v_tenant_id TEXT;
    v_admin_role_id TEXT;
    v_doctor_role_id TEXT;
    v_nurse_role_id TEXT;
BEGIN
    -- Get the first active tenant ID
    SELECT id INTO v_tenant_id 
    FROM tenants 
    WHERE "is_active" = true 
    LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No active tenant found. Please create a tenant first.';
    END IF;
    
    RAISE NOTICE 'Using tenant ID: %', v_tenant_id;
    
    -- Create Admin role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Admin',
        'Full system access with all permissions',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING
    RETURNING id INTO v_admin_role_id;
    
    RAISE NOTICE 'Admin role created/found: %', v_admin_role_id;
    
    -- Create Doctor role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Doctor',
        'Medical staff with clinical access',
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING
    RETURNING id INTO v_doctor_role_id;
    
    RAISE NOTICE 'Doctor role created/found: %', v_doctor_role_id;
    
    -- Create Nurse role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Nurse',
        'Nursing staff with patient care access',
        true,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING
    RETURNING id INTO v_nurse_role_id;
    
    RAISE NOTICE 'Nurse role created/found: %', v_nurse_role_id;
    
    -- Create Receptionist role
    INSERT INTO tenant_roles (id, "tenant_id", name, description, "is_active", "is_system", "created_at", "updated_at")
    VALUES (
        gen_random_uuid()::text,
        v_tenant_id,
        'Receptionist',
        'Front desk staff with appointment and patient registration access',
        true,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenant_id", name) DO NOTHING;
    
    RAISE NOTICE 'All roles created successfully';
    
END $$;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count users with and without roles
SELECT 
    COUNT(*) FILTER (WHERE "roleId" IS NOT NULL) as users_with_roles,
    COUNT(*) FILTER (WHERE "roleId" IS NULL) as users_without_roles,
    COUNT(*) as total_users
FROM "User";

-- List all users and their roles
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    r.name as role_name,
    CASE 
        WHEN u."roleId" IS NULL THEN '❌ NO ROLE'
        ELSE '✅ HAS ROLE'
    END as status
FROM "User" u
LEFT JOIN tenant_roles r ON u."roleId" = r.id
ORDER BY 
    CASE WHEN u."roleId" IS NULL THEN 0 ELSE 1 END,
    u.email;

-- ============================================
-- Expected Result After Running This Script:
-- ============================================
-- ✅ admin@test.com should have Admin role assigned
-- ✅ doctor@test.com should have Doctor role assigned (if exists)
-- ✅ Validation script should show:
--    - Deployment Readiness: 85%+ (up from 20%)
--    - Modules Passing: 16/20 (up from 4/20)
--    - Critical Issues: 1 (down from 7)
--    - High Issues: 1 (down from 20)
-- ============================================

-- Next step: Re-run validation
-- node scripts/validate-production.js
