@echo off
echo Fixing patients table schema...

:: Set PostgreSQL connection parameters
set PGHOST=localhost
set PGUSER=postgres
set PGDATABASE=hms_saas

:: 1. Check if patients table exists
echo.
echo Checking if patients table exists...
psql -c "\d+ patients"

:: 2. Create enum types if they don't exist
echo.
echo Creating enum types if they don't exist...
psql -c "
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
    CREATE TYPE \"public\".\"Gender\" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN', 'NOT_SPECIFIED');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BloodType') THEN
    CREATE TYPE \"public\".\"BloodType\" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN');
  END IF;
END
$$;
"

:: 3. Create or update patients table
echo.
echo Creating or updating patients table...
psql -c "
CREATE TABLE IF NOT EXISTS \"public\".\"patients\" (
  \"id\" TEXT NOT NULL,
  \"firstName\" TEXT NOT NULL,
  \"lastName\" TEXT NOT NULL,
  \"email\" TEXT,
  \"phone\" TEXT,
  \"gender\" \"public\".\"Gender\" NOT NULL DEFAULT 'UNKNOWN',
  \"dob\" TIMESTAMP(3),
  \"address\" TEXT,
  \"medicalRecordNumber\" TEXT NOT NULL,
  \"bloodType\" \"public\".\"BloodType\" DEFAULT 'UNKNOWN',
  \"allergies\" TEXT,
  \"notes\" TEXT,
  \"tenantId\" TEXT NOT NULL,
  \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \"deletedAt\" TIMESTAMP(3),
  CONSTRAINT \"patients_pkey\" PRIMARY KEY (\"id\")
);
"

:: 4. Add updatedAt trigger if it doesn't exist
echo.
echo Creating updatedAt trigger if it doesn't exist...
psql -c "
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
   NEW.\"updatedAt\" = NOW();
   RETURN NEW; 
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updatedat') THEN
    CREATE TRIGGER update_patients_updatedat
    BEFORE UPDATE ON \"public\".\"patients\"
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
  END IF;
END
$$;
"

:: 5. Create indexes if they don't exist
echo.
echo Creating indexes if they don't exist...
psql -c "
CREATE INDEX IF NOT EXISTS \"patients_tenantId_idx\" ON \"public\".\"patients\"(\"tenantId\");
CREATE INDEX IF NOT EXISTS \"patients_email_idx\" ON \"public\".\"patients\"(\"email\");
CREATE INDEX IF NOT EXISTS \"patients_medicalRecordNumber_idx\" ON \"public\".\"patients\"(\"medicalRecordNumber\");
"

echo.
echo Patients table schema verification complete!
echo.
pause
