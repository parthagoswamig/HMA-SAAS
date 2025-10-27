-- ========================================
-- QUICK FIX: Assign Roles to All Users
-- ========================================
-- Run this SQL in your Supabase/PostgreSQL database

-- Step 1: Check current status
SELECT 
  u.id,
  u.email,
  u."tenantId",
  u."roleId",
  t.name as tenant_name
FROM users u
LEFT JOIN tenants t ON u."tenantId" = t.id
WHERE u."roleId" IS NULL;

-- Step 2: Create ADMIN role for each tenant (if not exists)
INSERT INTO tenant_roles (id, name, description, "tenantId", "is_active", created_at, updated_at)
SELECT 
  'role_admin_' || t.id,
  'ADMIN',
  'Administrator with full access',
  t.id,
  true,
  NOW(),
  NOW()
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_roles tr 
  WHERE tr."tenantId" = t.id AND tr.name = 'ADMIN'
)
AND t."is_active" = true;

-- Step 3: Assign all permissions to ADMIN roles
INSERT INTO role_permissions (id, "roleId", "permissionId", created_at, updated_at)
SELECT 
  'rp_' || tr.id || '_' || p.id,
  tr.id,
  p.id,
  NOW(),
  NOW()
FROM tenant_roles tr
CROSS JOIN permissions p
WHERE tr.name = 'ADMIN'
  AND p."is_active" = true
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp."roleId" = tr.id AND rp."permissionId" = p.id
  );

-- Step 4: Assign ADMIN role to all users without roles
UPDATE users u
SET "roleId" = tr.id
FROM tenant_roles tr
WHERE u."tenantId" = tr."tenantId"
  AND tr.name = 'ADMIN'
  AND u."roleId" IS NULL;

-- Step 5: Verify the fix
SELECT 
  u.email,
  t.name as tenant_name,
  tr.name as role_name,
  COUNT(DISTINCT rp.id) as permission_count
FROM users u
LEFT JOIN tenants t ON u."tenantId" = t.id
LEFT JOIN tenant_roles tr ON u."roleId" = tr.id
LEFT JOIN role_permissions rp ON tr.id = rp."roleId"
GROUP BY u.email, t.name, tr.name
ORDER BY t.name, u.email;

-- Step 6: Check if any users still don't have roles
SELECT 
  COUNT(*) as users_without_roles
FROM users
WHERE "roleId" IS NULL;
