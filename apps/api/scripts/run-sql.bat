@echo off
echo Running SQL script to check database...
psql -h localhost -U postgres -d hms_saas -f scripts/check-db.sql
pause
