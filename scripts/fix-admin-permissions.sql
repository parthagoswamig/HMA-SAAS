-- HMS SaaS - Fix Admin Permissions
-- This script assigns all necessary permissions to the Admin role
-- Run this in Supabase SQL Editor after assigning roles

-- ============================================
-- Step 1: Check current Admin role permissions
-- ============================================
SELECT 
    r.name as role_name,
    COUNT(rp.id) as permission_count,
    array_agg(p.name ORDER BY p.name) as permissions
FROM tenant_roles r
LEFT JOIN role_permissions rp ON r.id = rp."role_id"
LEFT JOIN permissions p ON rp."permission_id" = p.id
WHERE r.name = 'Admin'
AND r."is_active" = true
GROUP BY r.id, r.name;

-- ============================================
-- Step 2: Check what permissions exist
-- ============================================
SELECT 
    category,
    COUNT(*) as permission_count,
    array_agg(name ORDER BY name) as permission_names
FROM permissions
WHERE "is_active" = true
GROUP BY category
ORDER BY category;

-- ============================================
-- Step 3: Create missing permissions
-- ============================================

-- Laboratory permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid()::text, 'lab.order.view', 'View laboratory orders', 'laboratory', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'LAB_ORDER_READ', 'Read laboratory orders', 'laboratory', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'VIEW_LAB_ORDERS', 'View lab orders', 'laboratory', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Pharmacy permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid()::text, 'pharmacy.order.view', 'View pharmacy orders', 'pharmacy', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'PHARMACY_ORDER_READ', 'Read pharmacy orders', 'pharmacy', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'VIEW_PHARMACY_ORDERS', 'View pharmacy orders', 'pharmacy', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- HR/Departments permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid()::text, 'hr.view', 'View HR data', 'hr', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'HR_READ', 'Read HR data', 'hr', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'VIEW_DEPARTMENTS', 'View departments', 'hr', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- EMR permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid()::text, 'medical.record.view', 'View medical records', 'emr', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'MEDICAL_RECORD_READ', 'Read medical records', 'emr', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'VIEW_MEDICAL_RECORDS', 'View medical records', 'emr', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- OPD permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid()::text, 'opd.queue.view', 'View OPD queue', 'opd', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'OPD_QUEUE_READ', 'Read OPD queue', 'opd', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Emergency permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
VALUES 
    (gen_random_uuid()::text, 'emergency.case.view', 'View emergency cases', 'emergency', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'EMERGENCY_CASE_READ', 'Read emergency cases', 'emergency', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'emergency.queue.view', 'View emergency queue', 'emergency', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'EMERGENCY_QUEUE_READ', 'Read emergency queue', 'emergency', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Step 4: Assign ALL permissions to Admin role
-- ============================================

-- This assigns every active permission to the Admin role
INSERT INTO role_permissions ("role_id", "permission_id", "created_at")
SELECT 
    r.id as role_id,
    p.id as permission_id,
    NOW() as created_at
FROM tenant_roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin'
AND r."is_active" = true
AND p."is_active" = true
AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp 
    WHERE rp."role_id" = r.id 
    AND rp."permission_id" = p.id
);

-- ============================================
-- Step 5: Verify Admin has all permissions
-- ============================================
SELECT 
    r.name as role_name,
    COUNT(DISTINCT rp.id) as assigned_permissions,
    COUNT(DISTINCT p.id) as total_permissions,
    CASE 
        WHEN COUNT(DISTINCT rp.id) = COUNT(DISTINCT p.id) THEN '✅ ALL PERMISSIONS ASSIGNED'
        ELSE '⚠️ MISSING PERMISSIONS'
    END as status
FROM tenant_roles r
CROSS JOIN permissions p
LEFT JOIN role_permissions rp ON r.id = rp."role_id" AND p.id = rp."permission_id"
WHERE r.name = 'Admin'
AND r."is_active" = true
AND p."is_active" = true
GROUP BY r.id, r.name;

-- ============================================
-- Step 6: List all Admin permissions by category
-- ============================================
SELECT 
    p.category,
    COUNT(*) as permission_count,
    array_agg(p.name ORDER BY p.name) as permissions
FROM tenant_roles r
JOIN role_permissions rp ON r.id = rp."role_id"
JOIN permissions p ON rp."permission_id" = p.id
WHERE r.name = 'Admin'
AND r."is_active" = true
AND p."is_active" = true
GROUP BY p.category
ORDER BY p.category;

-- ============================================
-- Expected Result:
-- ============================================
-- ✅ Admin role should have ALL permissions
-- ✅ Re-run validation should show 85%+ readiness
-- ✅ Only Shifts and Emergency modules may still have issues
--    (these are backend implementation problems, not permission issues)
-- ============================================
