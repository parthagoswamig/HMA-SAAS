-- HMS SaaS - Fix User Role
-- Run this in Supabase SQL Editor

-- Step 1: Check all users and their roles
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "tenantId",
    "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;

-- Step 2: Update specific user role to ADMIN
-- REPLACE 'your-email@example.com' with your actual email
UPDATE "User" 
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';

-- Step 3: Verify the update
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "tenantId"
FROM "User" 
WHERE email = 'your-email@example.com';

-- Step 4: If you want to update ALL users to ADMIN (use carefully!)
-- UPDATE "User" SET role = 'ADMIN' WHERE role IS NULL;

-- Available Roles:
-- 'SUPER_ADMIN'  - Full system access
-- 'ADMIN'        - Hospital admin
-- 'DOCTOR'       - Doctor access
-- 'NURSE'        - Nurse access
-- 'RECEPTIONIST' - Front desk
-- 'PATIENT'      - Patient portal
