@echo off
echo Listing database tables with psql...

:: Set PostgreSQL password
set PGPASSWORD=Partha@123

:: List all tables
echo.
echo === Listing all tables ===
psql -h localhost -U postgres -d hms_saas -c "\dt"

:: Show structure of patients table
echo.
echo === Patients table structure ===
psql -h localhost -U postgres -d hms_saas -c "\d+ patients"

:: Show sample data
echo.
echo === Sample patient data ===
psql -h localhost -U postgres -d hms_saas -c "SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\" FROM patients LIMIT 5;"

:: Show enum types
echo.
echo === Enum types ===
psql -h localhost -U postgres -d hms_saas -c "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public';"

pause
