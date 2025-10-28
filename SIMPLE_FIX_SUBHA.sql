-- SIMPLE FIX for subha1to100@gmail.com
-- Since TenantRole table doesn't exist in database yet

-- Step 1: Check current user
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

-- Step 2: Update role to SUPER_ADMIN (bypasses permission checks)
UPDATE "User"
SET role = 'SUPER_ADMIN'
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
-- role should now be 'SUPER_ADMIN' instead of 'HOSPITAL_ADMIN'

-- Note: SUPER_ADMIN role bypasses ALL permission checks
-- This is the highest level access in the system
-- No TenantRole or Permission entries needed
