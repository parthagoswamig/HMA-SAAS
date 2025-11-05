-- List all tables in the database
\dt

-- Show the structure of the patients table if it exists
\d+ patients

-- List all enum types
SELECT t.typname, e.enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public';

-- List all tables and their row counts
SELECT 
    table_name,
    (xpath('/row/cnt/text()', query_to_xml(format('SELECT COUNT(*) AS cnt FROM %I.%I', table_schema, table_name), false, true, '')))[1]::text::int as rows
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
