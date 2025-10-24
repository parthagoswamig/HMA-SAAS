# HMS SAAS - Server Status Check Script

Write-Host ""
Write-Host "🔍 Checking HMS SAAS Server Status..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check Backend (Port 3001)
$backend = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue

if ($backend) {
    $backendPID = $backend.OwningProcess
    $backendProcess = Get-Process -Id $backendPID -ErrorAction SilentlyContinue
    Write-Host "✅ Backend Server: RUNNING" -ForegroundColor Green
    Write-Host "   Port: 3001" -ForegroundColor Gray
    Write-Host "   PID: $backendPID" -ForegroundColor Gray
    Write-Host "   Process: $($backendProcess.ProcessName)" -ForegroundColor Gray
    Write-Host "   URL: http://localhost:3001" -ForegroundColor Gray
    
    # Test backend connection
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "   Status: Responding ✓" -ForegroundColor Green
    } catch {
        Write-Host "   Status: Not responding (may still be starting)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Backend Server: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Port: 3001 (not listening)" -ForegroundColor Gray
    Write-Host "   To start: cd apps\api && npm run start:dev" -ForegroundColor Yellow
}

Write-Host ""

# Check Frontend (Port 3000)
$frontend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($frontend) {
    $frontendPID = $frontend.OwningProcess
    $frontendProcess = Get-Process -Id $frontendPID -ErrorAction SilentlyContinue
    Write-Host "✅ Frontend Server: RUNNING" -ForegroundColor Green
    Write-Host "   Port: 3000" -ForegroundColor Gray
    Write-Host "   PID: $frontendPID" -ForegroundColor Gray
    Write-Host "   Process: $($frontendProcess.ProcessName)" -ForegroundColor Gray
    Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray
    
    # Test frontend connection
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "   Status: Responding ✓" -ForegroundColor Green
    } catch {
        Write-Host "   Status: Not responding (may still be starting)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Frontend Server: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Port: 3000 (not listening)" -ForegroundColor Gray
    Write-Host "   To start: cd apps\web && npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Summary
if ($backend -and $frontend) {
    Write-Host "🎉 All servers are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access your application:" -ForegroundColor Yellow
    Write-Host "   Main App:        http://localhost:3000" -ForegroundColor White
    Write-Host "   Patients:        http://localhost:3000/dashboard/patients" -ForegroundColor White
    Write-Host "   Appointments:    http://localhost:3000/appointments-new" -ForegroundColor White
} elseif ($backend -or $frontend) {
    Write-Host "⚠️  Some servers are not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this to start all servers:" -ForegroundColor Yellow
    Write-Host "   .\start-servers.ps1" -ForegroundColor White
} else {
    Write-Host "❌ No servers are running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run this to start all servers:" -ForegroundColor Yellow
    Write-Host "   .\start-servers.ps1" -ForegroundColor White
}

Write-Host ""
