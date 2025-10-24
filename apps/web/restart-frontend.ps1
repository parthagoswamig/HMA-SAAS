# Restart Frontend Server Script

Write-Host "🔄 Restarting Frontend Server..." -ForegroundColor Cyan

# Stop frontend process on port 3000
$frontend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($frontend) {
    $processId = $frontend.OwningProcess
    Write-Host "Stopping process on port 3000 (PID: $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Green
npm run dev
