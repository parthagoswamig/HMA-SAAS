@echo off
echo Starting HMS SAAS Backend Locally...

REM Set environment variables for local development
set NODE_ENV=development
set PORT=3001
set DATABASE_URL=postgresql://postgres.fjksvfkxrguxiilnlbek:Y5oSmUCw3YYtBXMh@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
set JWT_SECRET=your-super-secure-jwt-secret-key-here-change-in-production
set ALLOWED_ORIGINS=http://localhost:3000,https://vercel.com,https://*.vercel.app

echo Environment set for local development
echo Port: %PORT%
echo Database: %DATABASE_URL%

REM Start the backend
npm run start:dev

pause