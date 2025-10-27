-- ========================================
-- SIMPLEST SQL: Fix User Roles (No WHERE clause issues)
-- ========================================

-- Step 1: Create ADMIN roles for ALL tenants (skip isActive check)
INSERT INTO tenant_roles (id, name, description, tenant_id, is_active, created_at, updated_at)
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
  WHERE tr.tenant_id = t.id AND tr.name = 'ADMIN'
);

-- Step 2: Assign all permissions to ADMIN roles
INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at)
SELECT 
  'rp_' || tr.id || '_' || p.id,
  tr.id,
  p.id,
  NOW(),
  NOW()
FROM tenant_roles tr
CROSS JOIN permissions p
WHERE tr.name = 'ADMIN'
  AND p.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = tr.id AND rp.permission_id = p.id
  );

-- Step 3: Assign ADMIN role to all users without roles
UPDATE users u
SET role_id = tr.id
FROM tenant_roles tr
WHERE u.tenant_id = tr.tenant_id
  AND tr.name = 'ADMIN'
  AND u.role_id IS NULL;

-- Step 4: Verify - Check results
SELECT 
  u.email,
  t.name as tenant_name,
  tr.name as role_name,
  COUNT(DISTINCT rp.id) as permission_count
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN tenant_roles tr ON u.role_id = tr.id
LEFT JOIN role_permissions rp ON tr.id = rp.role_id
GROUP BY u.email, t.name, tr.name
ORDER BY t.name, u.email;

-- Step 5: Count users still without roles
SELECT 
  COUNT(*) as users_without_roles
FROM users
WHERE role_id IS NULL;
