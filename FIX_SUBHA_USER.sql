-- ========================================
-- Fix role for subha1to100@gmail.com user
-- HMS SaaS - Fix Subha User (subha1to100@gmail.com)
-- Run this in Supabase SQL Editor

-- PROBLEM: User has role in User table but no TenantRole entry
-- SOLUTION: Create TenantRole and assign permissions

-- Step 1: Check current user status
SELECT 
    u.id as user_id,
    u.email,
    u.role as user_role,
    u."tenantId",
    tr.id as tenant_role_id,
    tr.name as tenant_role_name
FROM "User" u
LEFT JOIN "TenantRole" tr ON u.id = tr."userId"
WHERE u.email = 'subha1to100@gmail.com';

-- Step 2: Check if TenantRole exists for this tenant
SELECT * FROM "TenantRole" 
WHERE "tenantId" = 'cmh0dcq060000et08uys6zwgv'
AND name = 'HOSPITAL_ADMIN';

-- Step 3: Create TenantRole if not exists
-- First, let's create the HOSPITAL_ADMIN role for the tenant
INSERT INTO "TenantRole" (
    id,
    name,
    description,
    "tenantId",
    "userId",
    "isActive",
    "createdAt",
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    'HOSPITAL_ADMIN',
    'Hospital Administrator with full access',
    'cmh0dcq060000et08uys6zwgv',
    'cmh0dcsbt0002et080urkqzip', -- Subha's user ID
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Step 4: Verify TenantRole created
SELECT 
    u.id as user_id,
    u.email,
    u.role as user_role,
    tr.id as tenant_role_id,
    tr.name as tenant_role_name,
    tr."isActive"
FROM "User" u
LEFT JOIN "TenantRole" tr ON u.id = tr."userId"
WHERE u.email = 'subha1to100@gmail.com';

-- Step 5: Get all permissions for HOSPITAL_ADMIN
SELECT * FROM "Permission" 
WHERE "isActive" = true
ORDER BY name;

-- Step 6: Assign all permissions to the TenantRole
-- This will give full access
INSERT INTO "RolePermission" ("roleId", "permissionId", "createdAt", "updatedAt")
SELECT 
    tr.id as "roleId",
    p.id as "permissionId",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM "TenantRole" tr
CROSS JOIN "Permission" p
WHERE tr."userId" = 'cmh0dcsbt0002et080urkqzip'
AND tr."tenantId" = 'cmh0dcq060000et08uys6zwgv'
AND p."isActive" = true
ON CONFLICT DO NOTHING;

-- Step 7: Final verification
SELECT 
    u.email,
    u.role,
    tr.name as tenant_role,
    COUNT(rp.id) as permission_count
FROM "User" u
LEFT JOIN "TenantRole" tr ON u.id = tr."userId"
LEFT JOIN "RolePermission" rp ON tr.id = rp."roleId"
WHERE u.email = 'subha1to100@gmail.com'
GROUP BY u.email, u.role, tr.name;
