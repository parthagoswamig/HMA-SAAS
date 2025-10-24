@echo off
echo 🚀 Starting HMS SaaS Backend Server...

REM Kill any existing processes on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo 🔄 Stopping process PID: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

timeout /t 2 /nobreak >nul

echo ✅ Port 3001 is ready
echo 📍 Backend will be available at: http://localhost:3001
echo ❤️  Health Check: http://localhost:3001/health
echo 🔐 Auth Endpoints: http://localhost:3001/auth/*
echo.
echo Press Ctrl+C to stop the server
echo.

npm run start:dev