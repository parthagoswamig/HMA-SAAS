@echo off
echo Starting HMS SAAS Frontend Locally...

REM Set environment variables for local development
set NODE_ENV=development
set NEXT_PUBLIC_API_URL=http://localhost:3001
set NEXT_PUBLIC_APP_NAME=HMS SAAS
set NEXT_PUBLIC_APP_VERSION=1.0.0

echo Environment set for local development
echo API URL: %NEXT_PUBLIC_API_URL%

REM Start the frontend
npm run dev -- -p 3000

pause