-- ========================================
-- Fix role for subha1to100@gmail.com user
-- ========================================

-- Step 1: Check current status
SELECT 
  u.id,
  u.email,
  u.tenant_id,
  u.role_id,
  tr.name as role_name,
  t.name as tenant_name
FROM users u
LEFT JOIN tenant_roles tr ON u.role_id = tr.id
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'subha1to100@gmail.com';

-- Step 2: Assign ADMIN role to this user
UPDATE users 
SET role_id = (
  SELECT tr.id 
  FROM tenant_roles tr 
  WHERE tr.tenant_id = users.tenant_id 
    AND tr.name = 'ADMIN' 
  LIMIT 1
)
WHERE email = 'subha1to100@gmail.com'
  AND role_id IS NULL;

-- Step 3: Verify the fix
SELECT 
  u.email,
  u.role_id,
  tr.name as role_name,
  t.name as tenant_name,
  COUNT(rp.id) as permission_count
FROM users u
LEFT JOIN tenant_roles tr ON u.role_id = tr.id
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN role_permissions rp ON tr.id = rp.role_id
WHERE u.email = 'subha1to100@gmail.com'
GROUP BY u.email, u.role_id, tr.name, t.name;
