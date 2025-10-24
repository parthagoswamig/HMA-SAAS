@echo off
echo Checking database tables...
psql -h localhost -U postgres -d hms_saas -c "\dt"
echo.
echo Checking patients table structure...
psql -h localhost -U postgres -d hms_saas -c "\d+ patients"
pause
