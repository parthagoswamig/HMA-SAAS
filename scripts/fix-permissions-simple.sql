-- HMS SaaS - Simple Permission Fix
-- This script creates missing permissions and assigns them to Admin
-- Run this in Supabase SQL Editor

-- ============================================
-- Step 1: Create missing permissions (one by one to avoid errors)
-- ============================================

-- Laboratory permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'lab.order.view', 'View laboratory orders', 'laboratory', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'lab.order.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'LAB_ORDER_READ', 'Read laboratory orders', 'laboratory', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'LAB_ORDER_READ');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'VIEW_LAB_ORDERS', 'View lab orders', 'laboratory', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'VIEW_LAB_ORDERS');

-- Pharmacy permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'pharmacy.order.view', 'View pharmacy orders', 'pharmacy', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'pharmacy.order.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'PHARMACY_ORDER_READ', 'Read pharmacy orders', 'pharmacy', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'PHARMACY_ORDER_READ');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'VIEW_PHARMACY_ORDERS', 'View pharmacy orders', 'pharmacy', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'VIEW_PHARMACY_ORDERS');

-- HR/Departments permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'hr.view', 'View HR data', 'hr', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'hr.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'HR_READ', 'Read HR data', 'hr', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'HR_READ');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'VIEW_DEPARTMENTS', 'View departments', 'hr', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'VIEW_DEPARTMENTS');

-- EMR permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'medical.record.view', 'View medical records', 'emr', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'medical.record.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'MEDICAL_RECORD_READ', 'Read medical records', 'emr', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'MEDICAL_RECORD_READ');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'VIEW_MEDICAL_RECORDS', 'View medical records', 'emr', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'VIEW_MEDICAL_RECORDS');

-- OPD permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'opd.queue.view', 'View OPD queue', 'opd', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'opd.queue.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'OPD_QUEUE_READ', 'Read OPD queue', 'opd', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'OPD_QUEUE_READ');

-- Emergency permissions
INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'emergency.case.view', 'View emergency cases', 'emergency', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'emergency.case.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'EMERGENCY_CASE_READ', 'Read emergency cases', 'emergency', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'EMERGENCY_CASE_READ');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'emergency.queue.view', 'View emergency queue', 'emergency', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'emergency.queue.view');

INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
SELECT gen_random_uuid()::text, 'EMERGENCY_QUEUE_READ', 'Read emergency queue', 'emergency', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'EMERGENCY_QUEUE_READ');

-- ============================================
-- Step 2: Assign ALL permissions to Admin role
-- ============================================

INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
SELECT 
    gen_random_uuid()::text,
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
-- Step 3: Verify the fix
-- ============================================

-- Count permissions assigned to Admin
SELECT 
    r.name as role_name,
    COUNT(DISTINCT rp.id) as assigned_permissions,
    (SELECT COUNT(*) FROM permissions WHERE "is_active" = true) as total_permissions
FROM tenant_roles r
LEFT JOIN role_permissions rp ON r.id = rp."role_id"
WHERE r.name = 'Admin'
AND r."is_active" = true
GROUP BY r.id, r.name;

-- List permissions by category
SELECT 
    p.category,
    COUNT(*) as permission_count,
    string_agg(p.name, ', ' ORDER BY p.name) as permissions
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
-- ✅ All permissions created
-- ✅ All permissions assigned to Admin role
-- ✅ Re-run validation should show 80%+ readiness
-- ============================================

-- Next step: Re-run validation
-- node scripts/validate-production.js
