-- ========================================
-- VERIFY: Check if roles are assigned
-- ========================================

-- 1. Check your user's role
SELECT 
  u.id,
  u.email,
  u.role_id,
  tr.name as role_name,
  t.name as tenant_name
FROM users u
LEFT JOIN tenant_roles tr ON u.role_id = tr.id
LEFT JOIN tenants t ON u.tenant_id = t.id
ORDER BY u.email;

-- 2. Check how many permissions ADMIN role has
SELECT 
  tr.name as role_name,
  t.name as tenant_name,
  COUNT(rp.id) as permission_count
FROM tenant_roles tr
LEFT JOIN tenants t ON tr.tenant_id = t.id
LEFT JOIN role_permissions rp ON tr.id = rp.role_id
WHERE tr.name = 'ADMIN'
GROUP BY tr.name, t.name;

-- 3. Check if patient permissions exist
SELECT 
  p.name,
  p.is_active
FROM permissions p
WHERE p.name IN ('patient.view', 'PATIENT_READ', 'VIEW_PATIENTS')
ORDER BY p.name;

-- 4. Count users without roles
SELECT 
  COUNT(*) as users_without_roles
FROM users
WHERE role_id IS NULL;
