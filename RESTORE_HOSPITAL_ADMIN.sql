-- Restore HOSPITAL_ADMIN role for subha1to100@gmail.com
-- Now HOSPITAL_ADMIN has full access (backend updated)

-- Step 1: Check current role
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "tenantId",
    "isActive"
FROM "User"
WHERE email = 'subha1to100@gmail.com';

-- Step 2: Restore to HOSPITAL_ADMIN
UPDATE "User"
SET role = 'HOSPITAL_ADMIN'
WHERE email = 'subha1to100@gmail.com';

-- Step 3: Verify update
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "tenantId",
    "isActive"
FROM "User"
WHERE email = 'subha1to100@gmail.com';

-- Expected result:
-- role: HOSPITAL_ADMIN

-- Note: HOSPITAL_ADMIN now has full access to their hospital
-- No TenantRole or Permission entries needed
-- Same level as SUPER_ADMIN but scoped to their tenant
