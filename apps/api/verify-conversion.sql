-- Verify the column types were converted
SELECT 
    t.table_name,
    c.column_name, 
    c.data_type,
    c.udt_name
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND c.column_name IN ('id', 'tenant_id')
  AND t.table_name IN ('tenants', 'users', 'tenant_roles')
ORDER BY t.table_name, c.column_name;

-- Check a sample tenant ID
SELECT id, name FROM tenants LIMIT 1;

-- Check foreign key constraints
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='tenant_roles';
