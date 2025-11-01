-- Fix ALL Form Submission Permissions
-- Run this in Supabase SQL Editor
-- Note: Table names are lowercase (permissions, not Permission)

-- Grant Patient create permissions
INSERT INTO permissions (id, name, description, category, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'patient.create', 'Create patients', 'patient', true, NOW(), NOW()),
  (gen_random_uuid(), 'PATIENT_CREATE', 'Create patients (legacy)', 'patient', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Grant Appointment create permissions
INSERT INTO permissions (id, name, description, category, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'appointment.create', 'Create appointments', 'appointment', true, NOW(), NOW()),
  (gen_random_uuid(), 'APPOINTMENT_CREATE', 'Create appointments (legacy)', 'appointment', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Grant OPD create permissions
INSERT INTO permissions (id, name, description, category, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'opd.create', 'Create OPD visits', 'opd', true, NOW(), NOW()),
  (gen_random_uuid(), 'OPD_CREATE', 'Create OPD visits (legacy)', 'opd', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Grant Staff create permissions
INSERT INTO permissions (id, name, description, category, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'staff.create', 'Create staff', 'staff', true, NOW(), NOW()),
  (gen_random_uuid(), 'STAFF_CREATE', 'Create staff (legacy)', 'staff', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Grant HR/Department create permissions
INSERT INTO permissions (id, name, description, category, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'hr.create', 'Create HR records', 'hr', true, NOW(), NOW()),
  (gen_random_uuid(), 'HR_CREATE', 'Create HR records (legacy)', 'hr', true, NOW(), NOW()),
  (gen_random_uuid(), 'department.create', 'Create departments', 'department', true, NOW(), NOW()),
  (gen_random_uuid(), 'DEPARTMENT_CREATE', 'Create departments (legacy)', 'department', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Get Admin role ID from tenant_roles
DO $$
DECLARE
  admin_role_id TEXT;
BEGIN
  -- Find Admin role
  SELECT id INTO admin_role_id FROM tenant_roles WHERE name = 'Admin' LIMIT 1;
  
  IF admin_role_id IS NULL THEN
    RAISE NOTICE 'Admin role not found!';
  ELSE
    -- Assign ALL permissions to Admin role
    INSERT INTO role_permissions (id, role_id, permission_id, created_at)
    SELECT gen_random_uuid(), admin_role_id, p.id, NOW()
    FROM permissions p
    WHERE NOT EXISTS (
      SELECT 1 FROM role_permissions rp 
      WHERE rp.role_id = admin_role_id AND rp.permission_id = p.id
    );
    
    RAISE NOTICE 'Permissions assigned to Admin role';
  END IF;
END $$;

-- Verify
SELECT 
  r.name as role_name,
  COUNT(DISTINCT rp.permission_id) as permission_count
FROM tenant_roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'Admin'
GROUP BY r.name;
