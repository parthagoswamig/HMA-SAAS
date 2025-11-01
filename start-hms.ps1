# HMS SaaS - Startup Script
# Starts both backend (3001) and frontend (3000)

Write-Host "=== HMS SaaS Startup ===" -ForegroundColor Cyan
Write-Host ""

# Check if database is accessible
Write-Host "Checking database connection..." -ForegroundColor Yellow
cd apps\api
$dbCheck = npx prisma db pull 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ DATABASE UNREACHABLE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Your Supabase database is not accessible." -ForegroundColor Yellow
    Write-Host "This is likely because your Supabase project is PAUSED." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "TO FIX:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://uoxyyqbwuzjraxhaypko.supabase.co" -ForegroundColor White
    Write-Host "2. Click 'Resume' or 'Restore' button" -ForegroundColor White
    Write-Host "3. Wait 2-3 minutes for database to start" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ Database accessible!" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migrations failed, but continuing..." -ForegroundColor Yellow
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Prisma generate failed, but continuing..." -ForegroundColor Yellow
}

# Seed database (optional, only if empty)
Write-Host "Checking if database needs seeding..." -ForegroundColor Yellow
$seedChoice = Read-Host "Seed test data? (y/n)"
if ($seedChoice -eq "y") {
    npm run prisma:seed
}

cd ..\..

Write-Host ""
Write-Host "=== Starting HMS SaaS ===" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers
npm run dev
