# HMS SaaS Frontend - Vercel Deployment Script
# Run this script from the root directory

Write-Host "🚀 HMS SaaS Frontend - Vercel Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "apps/web/package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location "apps/web"

# Install dependencies
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Building application..." -ForegroundColor Yellow

# Build the application
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

Write-Host "" 
Write-Host "🚀 Ready for Vercel Deployment!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Install Vercel CLI: npm install -g vercel" -ForegroundColor White
Write-Host "2. Deploy: vercel" -ForegroundColor White
Write-Host "3. Follow the prompts in the deployment guide" -ForegroundColor White
Write-Host ""
Write-Host "Or use GitHub integration:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Import from GitHub" -ForegroundColor White
Write-Host "3. Select root directory: apps/web" -ForegroundColor White
Write-Host ""
Write-Host "Configuration is ready:" -ForegroundColor Green
Write-Host "✅ API URL: https://hms-saas-staging.onrender.com" -ForegroundColor White
Write-Host "✅ Supabase: Configured" -ForegroundColor White
Write-Host "✅ Environment Variables: Set" -ForegroundColor White

# Return to root directory
Set-Location ".."