-- Fix user roles by assigning existing roles to users without roles

-- First, let's see which users don't have roles
SELECT 
  u.id, 
  u.email, 
  u.role as user_role,
  u."roleId" as tenant_role_id,
  u."tenantId",
  t.name as tenant_name
FROM users u
LEFT JOIN tenants t ON u."tenantId" = t.id
WHERE u."roleId" IS NULL;

-- Find existing tenant roles
SELECT 
  tr.id,
  tr.name,
  tr."tenantId",
  t.name as tenant_name
FROM tenant_roles tr
LEFT JOIN tenants t ON tr."tenantId" = t.id
ORDER BY t.name, tr.name;

-- Assign the first available ADMIN role to each user without a role
-- (Run this after checking the above queries)
UPDATE users u
SET "roleId" = (
  SELECT tr.id 
  FROM tenant_roles tr 
  WHERE tr."tenantId" = u."tenantId" 
    AND tr.name = 'ADMIN'
  LIMIT 1
)
WHERE u."roleId" IS NULL
  AND EXISTS (
    SELECT 1 
    FROM tenant_roles tr 
    WHERE tr."tenantId" = u."tenantId" 
      AND tr.name = 'ADMIN'
  );

-- If no ADMIN role exists, use any available role for that tenant
UPDATE users u
SET "roleId" = (
  SELECT tr.id 
  FROM tenant_roles tr 
  WHERE tr."tenantId" = u."tenantId"
  LIMIT 1
)
WHERE u."roleId" IS NULL
  AND EXISTS (
    SELECT 1 
    FROM tenant_roles tr 
    WHERE tr."tenantId" = u."tenantId"
  );

-- Verify the fix
SELECT 
  u.id, 
  u.email, 
  u.role as user_role,
  u."roleId" as tenant_role_id,
  tr.name as tenant_role_name,
  t.name as tenant_name
FROM users u
LEFT JOIN tenant_roles tr ON u."roleId" = tr.id
LEFT JOIN tenants t ON u."tenantId" = t.id
ORDER BY t.name, u.email;
