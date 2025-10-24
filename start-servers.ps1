# HMS SAAS - Automated Server Startup Script
# This script starts both backend and frontend servers

Write-Host "🚀 HMS SAAS - Starting Servers..." -ForegroundColor Cyan
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Function to kill process on port
function Stop-PortProcess {
    param($Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            Write-Host "⚠️  Stopping process on port $Port (PID: $($conn.OwningProcess))..." -ForegroundColor Yellow
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    }
}

# Check and clean ports
Write-Host "🔍 Checking ports..." -ForegroundColor Yellow

if (Test-Port 3001) {
    Write-Host "⚠️  Port 3001 is already in use" -ForegroundColor Yellow
    $response = Read-Host "Do you want to kill the process? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-PortProcess 3001
    } else {
        Write-Host "❌ Cannot start backend - port 3001 is occupied" -ForegroundColor Red
        exit 1
    }
}

if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use" -ForegroundColor Yellow
    $response = Read-Host "Do you want to kill the process? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-PortProcess 3000
    } else {
        Write-Host "❌ Cannot start frontend - port 3000 is occupied" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Ports are available" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 3001)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "apps\api"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm run start:dev"

Write-Host "⏳ Waiting for backend to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if backend started
if (Test-Port 3001) {
    Write-Host "✅ Backend server started successfully on port 3001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend may still be starting..." -ForegroundColor Yellow
}

Write-Host ""

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "apps\web"

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; npm run dev"

Write-Host "⏳ Waiting for frontend to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if frontend started
if (Test-Port 3000) {
    Write-Host "✅ Frontend server started successfully on port 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend may still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Servers Started!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Server Status:" -ForegroundColor Yellow
Write-Host "  🔧 Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  🎨 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "  📱 Main App:        http://localhost:3000" -ForegroundColor White
Write-Host "  👥 Patients:        http://localhost:3000/dashboard/patients" -ForegroundColor White
Write-Host "  📅 Appointments:    http://localhost:3000/appointments-new" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  • Both servers will auto-reload on file changes" -ForegroundColor Gray
Write-Host "  • Press Ctrl+C in each terminal to stop servers" -ForegroundColor Gray
Write-Host "  • Check terminal windows for logs and errors" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Open browser
$openBrowser = Read-Host "Do you want to open the app in browser? (Y/N)"
if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "✨ Happy coding! ✨" -ForegroundColor Green
