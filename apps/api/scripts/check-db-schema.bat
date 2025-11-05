@echo off
echo Checking database schema...

:: List all tables
echo.
echo === List of all tables ===
psql -h localhost -U postgres -d hms_saas -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

:: Show structure of patients table
echo.
echo === Patients table structure ===
psql -h localhost -U postgres -d hms_saas -c "\d+ patients"

:: Show sample data from patients table
echo.
echo === Sample patient data (first 5 records) ===
psql -h localhost -U postgres -d hms_saas -c "SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\", \"deletedAt\" FROM patients ORDER BY \"createdAt\" DESC LIMIT 5;"

:: Show enum types
echo.
echo === Enum types ===
psql -h localhost -U postgres -d hms_saas -c "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public';"

:: Show table constraints
echo.
echo === Table constraints ===
psql -h localhost -U postgres -d hms_saas -c "SELECT conname, conrelid::regclass, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'patients'::regclass;"

:: Show triggers
echo.
echo === Triggers ===
psql -h localhost -U postgres -d hms_saas -c "SELECT tgname, tgtype, tgenabled, tgisinternal, tgnargs FROM pg_trigger WHERE tgrelid = 'patients'::regclass;"

pause
