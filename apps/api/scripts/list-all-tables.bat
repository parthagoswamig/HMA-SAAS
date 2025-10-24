@echo off
echo Listing all tables in the database...
psql -h localhost -U postgres -d hms_saas -c "\dt"

echo.
echo Showing structure of patients table...
psql -h localhost -U postgres -d hms_saas -c "\d+ patients"

echo.
echo Showing sample data from patients table...
psql -h localhost -U postgres -d hms_saas -c "SELECT id, \"firstName\", \"lastName\", email, \"medicalRecordNumber\" FROM patients LIMIT 5;"

pause
