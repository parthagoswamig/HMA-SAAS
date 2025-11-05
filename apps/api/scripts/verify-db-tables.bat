@echo off
echo Verifying database tables...

:: Set PostgreSQL connection parameters
set PGHOST=localhost
set PGUSER=postgres
set PGDATABASE=hms_saas

:: Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: psql command not found. Please make sure PostgreSQL is installed and added to PATH.
    pause
    exit /b 1
)

echo.
echo Listing all tables in the database...
psql -c "\dt"

echo.
echo Showing structure of patients table...
psql -c "\d+ patients"

echo.
echo Showing sample data from patients table...
psql -c "SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\" FROM patients LIMIT 5;"

echo.
echo Showing sample data from tenants table...
psql -c "SELECT * FROM tenants LIMIT 5;"

pause
