# HMS Development Server Startup Script
# This script starts both backend and frontend servers

Write-Host "🏥 Starting HMS Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Get the HMS root directory
$HMSRoot = "C:\Users\HP\Desktop\HMS"

# Start backend in new window
Write-Host "🔧 Starting Backend (NestJS) on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\HP\Desktop\HMS\apps\api'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm run start:dev"

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "🎨 Starting Frontend (Next.js) on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\HP\Desktop\HMS\apps\web'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; npm run dev"

# Servers starting message
Write-Host "Starting servers in separate windows..." -ForegroundColor Green

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep both terminal windows open" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 Next: Open http://localhost:3000 in your browser" -ForegroundColor Green
