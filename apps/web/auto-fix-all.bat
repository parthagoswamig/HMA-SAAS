@echo off
echo ========================================
echo  AUTO-FIX ALL WARNINGS - BATCH SCRIPT
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this from apps/web directory
    pause
    exit /b 1
)

echo [1/4] Running ESLint auto-fix on all files...
echo.
call npm run lint -- --fix
echo.

echo [2/4] Fixing specific high-impact files...
echo.

REM Fix dashboard files
call npx eslint src/app/dashboard/ai-assistant/page.tsx --fix
call npx eslint src/app/dashboard/communications/page.tsx --fix
call npx eslint src/app/dashboard/telemedicine/page.tsx --fix
call npx eslint src/app/dashboard/patient-portal/page.tsx --fix
call npx eslint src/app/dashboard/radiology/page.tsx --fix
call npx eslint src/app/dashboard/pathology/page.tsx --fix
call npx eslint src/app/dashboard/pharmacy/page.tsx --fix
call npx eslint src/app/dashboard/quality/page.tsx --fix
call npx eslint src/app/dashboard/surgery/page.tsx --fix
call npx eslint src/app/dashboard/finance/page.tsx --fix
call npx eslint src/app/dashboard/appointments/page.tsx --fix
call npx eslint src/app/dashboard/billing/page.tsx --fix
call npx eslint src/app/dashboard/emergency/page.tsx --fix

REM Fix app files
call npx eslint src/app/appointments-new/page.tsx --fix
call npx eslint src/app/billing-new/page.tsx --fix
call npx eslint src/app/emergency-new/page.tsx --fix

REM Fix component files
call npx eslint src/components/patients/PatientForm.tsx --fix
call npx eslint src/components/patients/PatientDetails.tsx --fix
call npx eslint src/components/patients/PatientAnalytics.tsx --fix
call npx eslint src/components/patients/PatientExportReport.tsx --fix

echo.
echo [3/4] Running build verification...
echo.
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo Please check the errors above.
    pause
    exit /b 1
)

echo.
echo [4/4] Checking remaining warnings...
echo.
call npm run lint > lint-output.txt 2>&1
findstr /C:"Warning:" lint-output.txt > warnings-count.txt
for /f %%i in ('find /c /v "" ^< warnings-count.txt') do set WARNING_COUNT=%%i
del warnings-count.txt
del lint-output.txt

echo.
echo ========================================
echo           SUMMARY
echo ========================================
echo Status: COMPLETED
echo Remaining warnings: %WARNING_COUNT%
echo Build: PASSED
echo.
echo Next steps:
echo 1. Review remaining warnings with: npm run lint
echo 2. Commit changes: git add . ^&^& git commit -m "fix: auto-fix ESLint warnings"
echo 3. Push to deploy: git push
echo.
echo Done!
pause
