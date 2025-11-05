@echo off
echo Verifying database connection and listing tables...

:: Set PostgreSQL password
set PGPASSWORD=Partha@123

echo.
echo === Testing database connection ===
psql -h localhost -U postgres -d hms_saas -c "SELECT version();"

echo.
echo === Listing all tables ===
psql -h localhost -U postgres -d hms_saas -c "\dt"

echo.
echo === Patients table structure ===
psql -h localhost -U postgres -d hms_saas -c "\d+ patients"

echo.
echo === Sample patient data (first 3 rows) ===
psql -h localhost -U postgres -d hms_saas -c "SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\" FROM patients LIMIT 3;"

echo.
echo === Tenants table data ===
psql -h localhost -U postgres -d hms_saas -c "SELECT * FROM tenants LIMIT 3;"

echo.
set PGPASSWORD=
pause
