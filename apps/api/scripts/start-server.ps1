# HMS SaaS Backend Server Startup Script
# This script ensures the backend server starts reliably

Write-Host "🚀 Starting HMS SaaS Backend Server..." -ForegroundColor Green

# Check if port 3001 is in use
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($process) {
    Write-Host "⚠️  Port $port is already in use. Checking processes..." -ForegroundColor Yellow
    
    # Find and kill the process using the port
    $processIds = (Get-NetTCPConnection -LocalPort $port).OwningProcess | Sort-Object | Get-Unique
    
    foreach ($processId in $processIds) {
        if ($processId -ne 0) {
            try {
                $processInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($processInfo) {
                    Write-Host "🔄 Stopping process: $($processInfo.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force
                    Start-Sleep -Seconds 2
                }
            } catch {
                Write-Host "⚠️  Could not stop process $processId" -ForegroundColor Yellow
            }
        }
    }
}

# Verify port is free
Start-Sleep -Seconds 1
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "❌ Port $port is still in use. Please manually stop the process and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Port $port is free" -ForegroundColor Green

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
}

# Generate Prisma client if needed
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

# Start the development server
Write-Host "🎉 Starting NestJS development server..." -ForegroundColor Green
Write-Host "📍 Backend URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host "❤️  Health Check: http://localhost:$port/health" -ForegroundColor Cyan
Write-Host "🔐 Auth Endpoints: http://localhost:$port/auth/*" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

npm run start:dev