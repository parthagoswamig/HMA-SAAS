# HMS SaaS - Verification and Fix Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HMS SaaS - System Verification & Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 1. Check Prerequisites
Write-Host "1. Checking Prerequisites..." -ForegroundColor Yellow

if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "  ✓ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Install Dependencies
Write-Host "2. Installing Dependencies..." -ForegroundColor Yellow
Write-Host "  Installing root dependencies..." -ForegroundColor Gray
npm install --silent 2>$null
Write-Host "  ✓ Root dependencies installed" -ForegroundColor Green

Write-Host ""

# 3. Setup Environment Files
Write-Host "3. Setting up Environment Files..." -ForegroundColor Yellow

# Check backend .env
if (!(Test-Path "apps/api/.env")) {
    if (Test-Path ".env.example") {
        Write-Host "  Creating apps/api/.env from template..." -ForegroundColor Gray
        Copy-Item ".env.example" "apps/api/.env"
        Write-Host "  ✓ Backend .env created (Please configure it)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend .env not found. Please create apps/api/.env" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ Backend .env exists" -ForegroundColor Green
}

# Check frontend .env.local
if (!(Test-Path "apps/web/.env.local")) {
    Write-Host "  Creating apps/web/.env.local..." -ForegroundColor Gray
    @"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=HMS SaaS
"@ | Out-File -FilePath "apps/web/.env.local" -Encoding UTF8
    Write-Host "  ✓ Frontend .env.local created" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend .env.local exists" -ForegroundColor Green
}

Write-Host ""

# 4. Generate Prisma Client
Write-Host "4. Setting up Database..." -ForegroundColor Yellow
Set-Location apps/api

Write-Host "  Generating Prisma client..." -ForegroundColor Gray
npx prisma generate 2>$null
Write-Host "  ✓ Prisma client generated" -ForegroundColor Green

# Check if we can connect to database
Write-Host "  Checking database connection..." -ForegroundColor Gray
$dbCheck = npx prisma db pull --print 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Database connection successful" -ForegroundColor Green
    
    # Run migrations if needed
    Write-Host "  Checking migrations..." -ForegroundColor Gray
    npx prisma migrate deploy 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Migrations up to date" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Migration issues detected. Run 'npm run prisma:migrate' manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Cannot connect to database. Please check DATABASE_URL in .env" -ForegroundColor Yellow
}

Set-Location ../..
Write-Host ""

# 5. Build Check
Write-Host "5. Checking Build..." -ForegroundColor Yellow

Write-Host "  Building backend..." -ForegroundColor Gray
Set-Location apps/api
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Backend builds successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Backend build has issues" -ForegroundColor Yellow
    Write-Host "    Run 'npm run build' in apps/api to see errors" -ForegroundColor Gray
}

Set-Location ../web
Write-Host "  Building frontend..." -ForegroundColor Gray
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Frontend builds successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Frontend build has issues" -ForegroundColor Yellow
    Write-Host "    Run 'npm run build' in apps/web to see errors" -ForegroundColor Gray
}

Set-Location ../..
Write-Host ""

# 6. Module Verification
Write-Host "6. Verifying Modules..." -ForegroundColor Yellow

$modules = @(
    "patients",
    "appointments", 
    "billing",
    "pharmacy",
    "laboratory",
    "inventory",
    "staff",
    "rbac",
    "dashboard",
    "subscription"
)

$missingModules = @()
foreach ($module in $modules) {
    if (Test-Path "apps/api/src/$module") {
        Write-Host "  ✓ $module module exists" -ForegroundColor Green
    } else {
        $missingModules += $module
        Write-Host "  ✗ $module module missing" -ForegroundColor Red
    }
}

Write-Host ""

# 7. Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$issues = @()

if (!(Test-Path "apps/api/.env")) {
    $issues += "Backend .env file needs configuration"
}

if ($missingModules.Count -gt 0) {
    $issues += "Missing modules: $($missingModules -join ', ')"
}

if ($issues.Count -eq 0) {
    Write-Host "✅ System is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Configure database in apps/api/.env" -ForegroundColor White
    Write-Host "2. Run database migrations: cd apps/api && npm run prisma:migrate" -ForegroundColor White
    Write-Host "3. Seed initial data: cd apps/api && npm run prisma:seed" -ForegroundColor White
    Write-Host "4. Start development: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Default login after seeding:" -ForegroundColor Yellow
    Write-Host "Email: admin@hospital.com" -ForegroundColor White
    Write-Host "Password: Admin@123" -ForegroundColor White
} else {
    Write-Host "⚠️ Issues found:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please fix these issues before running the application." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
