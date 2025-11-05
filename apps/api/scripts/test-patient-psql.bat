@echo off
echo Testing Patient CRUD operations with psql...

:: Set PostgreSQL connection parameters
set PGHOST=localhost
set PGUSER=postgres
set PGDATABASE=hms_saas

:: Generate a unique ID for the test patient
set TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set PATIENT_ID=pat_%TIMESTAMP%
set PATIENT_EMAIL=test.patient.%TIMESTAMP%@example.com
set PATIENT_MRN=MRN-%TIMESTAMP%
set PATIENT_PHONE=+1%RANDOM:~0,3%%RANDOM:~0,3%%RANDOM:~0,4%

:: 1. Check if tenants table exists and has data
echo.
echo Checking tenants table...
psql -c "SELECT id, name FROM tenants LIMIT 1;"

:: 2. Create a test tenant if none exists
echo.
echo Creating a test tenant if none exists...
psql -c "
  INSERT INTO tenants (id, name, slug, "isActive")
  SELECT 'test_tenant_%RANDOM%', 'Test Hospital', 'test-hospital', true
  WHERE NOT EXISTS (SELECT 1 FROM tenants LIMIT 1)
  RETURNING *;
"

:: 3. Get or create a tenant ID
echo.
echo Getting tenant ID...
for /f "tokens=*" %%a in ('psql -t -A -c "SELECT id FROM tenants LIMIT 1;"') do set TENANT_ID=%%a

echo Tenant ID: %TENANT_ID%

:: 4. Create a test patient
echo.
echo Creating a test patient...
psql -c "
  INSERT INTO patients (
    id, "firstName", "lastName", email, phone, 
    gender, dob, address, "medicalRecordNumber", "tenantId"
  ) VALUES (
    '%PATIENT_ID%', 'Test', 'Patient', '%PATIENT_EMAIL%', '%PATIENT_PHONE%',
    'MALE', '1990-01-01', '123 Test St', '%PATIENT_MRN%', '%TENANT_ID%'
  )
  RETURNING id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\";
"

:: 5. List all patients
echo.
echo Listing all patients...
psql -c "
  SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\" 
  FROM patients 
  WHERE \"tenantId\" = '%TENANT_ID%' 
  ORDER BY \"createdAt\" DESC 
  LIMIT 5;
"

:: 6. Clean up (uncomment if you want to delete the test data)
:: echo.
:: echo Cleaning up test data...
:: psql -c "DELETE FROM patients WHERE id = '%PATIENT_ID%';"

echo.
echo Test completed. Press any key to exit...
pause >nul
