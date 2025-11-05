@echo off
echo Checking database with password...

:: Set PostgreSQL connection parameters with password
set PGPASSWORD=Partha@123

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
psql -h localhost -U postgres -d hms_saas -c "SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\", \"createdAt\", \"deletedAt\" FROM patients ORDER BY \"createdAt\" DESC LIMIT 5;"

:: Show enum types
echo.
echo === Enum types ===
psql -h localhost -U postgres -d hms_saas -c "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public';"

pause
