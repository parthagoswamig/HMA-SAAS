# ================================================================================
# HMS SAAS - Serverless Deployment Script (Vercel + Supabase)
# ================================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('setup', 'backend', 'frontend', 'all', 'check')]
    [string]$Action = 'check',
    
    [Parameter(Mandatory=$false)]
    [switch]$Production
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host "HMS SAAS - SERVERLESS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    $allGood = $true
    
    # Check Node.js
    if (Test-Command "node") {
        $nodeVersion = node --version
        Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check npm
    if (Test-Command "npm") {
        $npmVersion = npm --version
        Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ npm not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check Vercel CLI
    if (Test-Command "vercel") {
        $vercelVersion = vercel --version
        Write-Host "✓ Vercel CLI: $vercelVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Vercel CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g vercel
        if (Test-Command "vercel") {
            Write-Host "✓ Vercel CLI installed successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to install Vercel CLI" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    # Check Prisma CLI
    if (Test-Command "prisma") {
        Write-Host "✓ Prisma CLI found" -ForegroundColor Green
    } else {
        Write-Host "⚠ Prisma CLI not found globally (will use local)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    return $allGood
}

# Function to setup environment
function Setup-Environment {
    Write-Host "Setting up serverless environment..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if .env files exist
    $apiEnvExists = Test-Path "apps/api/.env"
    $webEnvExists = Test-Path "apps/web/.env.local"
    
    if (-not $apiEnvExists) {
        Write-Host "⚠ API .env not found. Creating from template..." -ForegroundColor Yellow
        Copy-Item "apps/api/.env.serverless" "apps/api/.env"
        Write-Host "✓ Created apps/api/.env - PLEASE UPDATE WITH YOUR VALUES" -ForegroundColor Green
    }
    
    if (-not $webEnvExists) {
        Write-Host "⚠ Web .env.local not found. Creating template..." -ForegroundColor Yellow
        @"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_ENV=development
"@ | Out-File -FilePath "apps/web/.env.local" -Encoding UTF8
        Write-Host "✓ Created apps/web/.env.local - PLEASE UPDATE WITH YOUR VALUES" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Environment setup complete!" -ForegroundColor Green
    Write-Host "IMPORTANT: Update .env files with your actual values before deploying" -ForegroundColor Yellow
    Write-Host ""
}

# Function to deploy backend
function Deploy-Backend {
    Write-Host "Deploying backend API to Vercel..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location "apps/api"
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npm run prisma:generate
    
    # Build
    Write-Host "Building backend..." -ForegroundColor Cyan
    npm run build
    
    # Deploy
    if ($Production) {
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Red
        vercel --prod
    } else {
        Write-Host "Deploying to PREVIEW..." -ForegroundColor Cyan
        vercel
    }
    
    Set-Location "../.."
    
    Write-Host ""
    Write-Host "✓ Backend deployment complete!" -ForegroundColor Green
    Write-Host ""
}

# Function to deploy frontend
function Deploy-Frontend {
    Write-Host "Deploying frontend to Vercel..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location "apps/web"
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    # Build
    Write-Host "Building frontend..." -ForegroundColor Cyan
    npm run build
    
    # Deploy
    if ($Production) {
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Red
        vercel --prod
    } else {
        Write-Host "Deploying to PREVIEW..." -ForegroundColor Cyan
        vercel
    }
    
    Set-Location "../.."
    
    Write-Host ""
    Write-Host "✓ Frontend deployment complete!" -ForegroundColor Green
    Write-Host ""
}

# Function to run migrations
function Run-Migrations {
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location "apps/api"
    
    # Check if DIRECT_DATABASE_URL is set
    if (-not $env:DIRECT_DATABASE_URL) {
        Write-Host "⚠ DIRECT_DATABASE_URL not set in environment" -ForegroundColor Yellow
        Write-Host "Please set it before running migrations:" -ForegroundColor Yellow
        Write-Host '$env:DIRECT_DATABASE_URL="postgresql://..."' -ForegroundColor Cyan
        Write-Host ""
        Set-Location "../.."
        return
    }
    
    # Run migrations
    npm run prisma:migrate:deploy
    
    Set-Location "../.."
    
    Write-Host ""
    Write-Host "✓ Migrations complete!" -ForegroundColor Green
    Write-Host ""
}

# Main execution
switch ($Action) {
    'check' {
        $prereqsOk = Check-Prerequisites
        if ($prereqsOk) {
            Write-Host "✓ All prerequisites met!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Run: .\deploy-serverless.ps1 -Action setup" -ForegroundColor White
            Write-Host "2. Update .env files with your values" -ForegroundColor White
            Write-Host "3. Run migrations (if needed)" -ForegroundColor White
            Write-Host "4. Deploy: .\deploy-serverless.ps1 -Action all" -ForegroundColor White
        } else {
            Write-Host "✗ Some prerequisites are missing. Please install them first." -ForegroundColor Red
        }
    }
    
    'setup' {
        $prereqsOk = Check-Prerequisites
        if ($prereqsOk) {
            Setup-Environment
        }
    }
    
    'backend' {
        $prereqsOk = Check-Prerequisites
        if ($prereqsOk) {
            Deploy-Backend
        }
    }
    
    'frontend' {
        $prereqsOk = Check-Prerequisites
        if ($prereqsOk) {
            Deploy-Frontend
        }
    }
    
    'all' {
        $prereqsOk = Check-Prerequisites
        if ($prereqsOk) {
            Write-Host "Deploying full stack..." -ForegroundColor Cyan
            Write-Host ""
            
            # Deploy backend first
            Deploy-Backend
            
            # Wait a bit
            Start-Sleep -Seconds 2
            
            # Deploy frontend
            Deploy-Frontend
            
            Write-Host ""
            Write-Host "=================================================================================" -ForegroundColor Cyan
            Write-Host "✓ DEPLOYMENT COMPLETE!" -ForegroundColor Green
            Write-Host "=================================================================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. Check Vercel dashboard for deployment URLs" -ForegroundColor White
            Write-Host "2. Update NEXT_PUBLIC_API_URL in frontend environment variables" -ForegroundColor White
            Write-Host "3. Test API: curl https://your-api.vercel.app/health" -ForegroundColor White
            Write-Host "4. Test frontend: Open https://your-frontend.vercel.app" -ForegroundColor White
            Write-Host ""
        }
    }
}

Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""
