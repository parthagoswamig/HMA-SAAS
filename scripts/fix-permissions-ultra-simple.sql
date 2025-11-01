-- HMS SaaS - Ultra Simple Permission Fix
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN

-- This will:
-- 1. Create any missing permissions
-- 2. Assign ALL permissions to Admin role
-- 3. Show you the results

DO $$
DECLARE
    v_admin_role_id TEXT;
    v_permission_id TEXT;
    v_permissions_added INTEGER := 0;
BEGIN
    -- Get Admin role ID
    SELECT id INTO v_admin_role_id 
    FROM tenant_roles 
    WHERE name = 'Admin' 
    AND "is_active" = true 
    LIMIT 1;
    
    IF v_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found!';
    END IF;
    
    RAISE NOTICE 'Found Admin role: %', v_admin_role_id;
    
    -- Create and assign lab.order.view
    INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
    VALUES (gen_random_uuid()::text, 'lab.order.view', 'View laboratory orders', 'laboratory', true, NOW(), NOW())
    ON CONFLICT (name) DO UPDATE SET "updated_at" = NOW()
    RETURNING id INTO v_permission_id;
    
    INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
    VALUES (gen_random_uuid()::text, v_admin_role_id, v_permission_id, NOW())
    ON CONFLICT DO NOTHING;
    v_permissions_added := v_permissions_added + 1;
    
    -- Create and assign pharmacy.order.view
    INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
    VALUES (gen_random_uuid()::text, 'pharmacy.order.view', 'View pharmacy orders', 'pharmacy', true, NOW(), NOW())
    ON CONFLICT (name) DO UPDATE SET "updated_at" = NOW()
    RETURNING id INTO v_permission_id;
    
    INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
    VALUES (gen_random_uuid()::text, v_admin_role_id, v_permission_id, NOW())
    ON CONFLICT DO NOTHING;
    v_permissions_added := v_permissions_added + 1;
    
    -- Create and assign hr.view
    INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
    VALUES (gen_random_uuid()::text, 'hr.view', 'View HR data', 'hr', true, NOW(), NOW())
    ON CONFLICT (name) DO UPDATE SET "updated_at" = NOW()
    RETURNING id INTO v_permission_id;
    
    INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
    VALUES (gen_random_uuid()::text, v_admin_role_id, v_permission_id, NOW())
    ON CONFLICT DO NOTHING;
    v_permissions_added := v_permissions_added + 1;
    
    -- Create and assign medical.record.view
    INSERT INTO permissions (id, name, description, category, "is_active", "created_at", "updated_at")
    VALUES (gen_random_uuid()::text, 'medical.record.view', 'View medical records', 'emr', true, NOW(), NOW())
    ON CONFLICT (name) DO UPDATE SET "updated_at" = NOW()
    RETURNING id INTO v_permission_id;
    
    INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
    VALUES (gen_random_uuid()::text, v_admin_role_id, v_permission_id, NOW())
    ON CONFLICT DO NOTHING;
    v_permissions_added := v_permissions_added + 1;
    
    -- Now assign ALL existing permissions to Admin
    INSERT INTO role_permissions (id, "role_id", "permission_id", "created_at")
    SELECT 
        gen_random_uuid()::text,
        v_admin_role_id,
        p.id,
        NOW()
    FROM permissions p
    WHERE p."is_active" = true
    AND NOT EXISTS (
        SELECT 1 
        FROM role_permissions rp 
        WHERE rp."role_id" = v_admin_role_id 
        AND rp."permission_id" = p.id
    );
    
    GET DIAGNOSTICS v_permissions_added = ROW_COUNT;
    
    RAISE NOTICE 'Successfully assigned % permissions to Admin role', v_permissions_added;
    
END $$;

-- Verify the results
SELECT 
    '✅ Admin Role Permissions' as status,
    r.name as role_name,
    COUNT(rp.id) as total_permissions
FROM tenant_roles r
LEFT JOIN role_permissions rp ON r.id = rp."role_id"
WHERE r.name = 'Admin'
AND r."is_active" = true
GROUP BY r.id, r.name;

-- Show permissions by category
SELECT 
    COALESCE(p.category, 'uncategorized') as category,
    COUNT(*) as count,
    string_agg(p.name, ', ') as permission_names
FROM tenant_roles r
JOIN role_permissions rp ON r.id = rp."role_id"
JOIN permissions p ON rp."permission_id" = p.id
WHERE r.name = 'Admin'
AND r."is_active" = true
GROUP BY p.category
ORDER BY category;
