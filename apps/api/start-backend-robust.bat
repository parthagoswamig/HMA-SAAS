@echo off
echo 🚀 Starting HMS SaaS Backend Server (Robust Version)...

REM Kill any existing processes on port 3001
echo 🔄 Cleaning up any existing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo   Stopping process PID: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Wait a moment for processes to clean up
timeout /t 3 /nobreak >nul

echo ✅ Port 3001 is ready

REM Ensure Prisma client is generated
echo 🔧 Ensuring Prisma client is up to date...
npx prisma generate >nul 2>&1

REM Build the project to ensure it's up to date
echo 🏗️  Building project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check for compilation errors.
    pause
    exit /b 1
)

echo ✅ Build successful

echo 📍 Backend will be available at: http://localhost:3001
echo ❤️  Health Check: http://localhost:3001/health
echo 🔐 Auth Endpoints: http://localhost:3001/auth/*
echo.
echo 🏥 Starting NestJS server in production mode for stability...
echo Press Ctrl+C to stop the server
echo.

REM Start in production mode for better stability
npm run start:prod