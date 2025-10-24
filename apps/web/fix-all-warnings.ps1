# PowerShell script to fix all ESLint warnings automatically
# Run this from apps/web directory: .\fix-all-warnings.ps1

Write-Host "🔧 Starting automatic warning fixes..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from apps/web directory" -ForegroundColor Red
    exit 1
}

# Step 1: Run ESLint auto-fix
Write-Host "📝 Step 1: Running ESLint auto-fix..." -ForegroundColor Yellow
npm run lint -- --fix
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  ESLint auto-fix completed with some issues" -ForegroundColor Yellow
} else {
    Write-Host "✅ ESLint auto-fix completed successfully" -ForegroundColor Green
}
Write-Host ""

# Step 2: Count remaining warnings
Write-Host "📊 Step 2: Counting remaining warnings..." -ForegroundColor Yellow
$lintOutput = npm run lint 2>&1 | Out-String
$warningCount = ([regex]::Matches($lintOutput, "Warning:")).Count

Write-Host "Remaining warnings: $warningCount" -ForegroundColor $(if ($warningCount -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

# Step 3: Build to verify
Write-Host "🏗️  Step 3: Running build to verify..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check errors above" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ ESLint auto-fix: DONE" -ForegroundColor Green
Write-Host "✅ Build verification: PASSED" -ForegroundColor Green
Write-Host "⚠️  Remaining warnings: $warningCount" -ForegroundColor $(if ($warningCount -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($warningCount -gt 0) {
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Review remaining warnings with: npm run lint" -ForegroundColor White
    Write-Host "   2. Fix React Hooks warnings manually" -ForegroundColor White
    Write-Host "   3. Remove remaining unused imports" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: Use VS Code 'Organize Imports' (Shift+Alt+O) for each file" -ForegroundColor Cyan
} else {
    Write-Host "🎉 All warnings fixed! Ready to deploy!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! ✨" -ForegroundColor Cyan
