# PowerShell Script to Remove Mock Data Imports
# HMS SaaS Mock Data Cleanup Script

$files = @(
    "apps\web\src\app\dashboard\radiology\page.tsx",
    "apps\web\src\app\dashboard\pharmacy\page.tsx",
    "apps\web\src\app\dashboard\laboratory\page.tsx",
    "apps\web\src\app\dashboard\pathology\page.tsx",
    "apps\web\src\app\dashboard\emergency\page.tsx",
    "apps\web\src\app\dashboard\billing\page.tsx",
    "apps\web\src\app\dashboard\emr\page.tsx",
    "apps\web\src\app\dashboard\finance\page.tsx",
    "apps\web\src\app\dashboard\hr\page.tsx",
    "apps\web\src\app\dashboard\integration\page.tsx",
    "apps\web\src\app\dashboard\inventory\page.tsx",
    "apps\web\src\app\dashboard\patient-portal\page.tsx",
    "apps\web\src\app\dashboard\quality\page.tsx",
    "apps\web\src\app\dashboard\research\page.tsx"
)

$mockImportPattern = "import.*from.*['\`"]\.\.\/\.\.\/\.\.\/lib\/mockData\/.*['\`"];?"

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $originalLength = $content.Length
        
        # Remove mock data import lines
        $content = $content -replace $mockImportPattern, "// Mock data import removed"
        
        # Remove multiple consecutive comment lines
        $content = $content -replace "(?m)^//\s*Mock data import removed\s*\n(?://\s*Mock data import removed\s*\n)+", "// Mock data imports removed`n"
        
        # Save the file
        Set-Content -Path $fullPath -Value $content -NoNewline
        
        $newLength = $content.Length
        $removed = $originalLength - $newLength
        
        Write-Host "  ✅ Cleaned $file (removed $removed characters)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ Mock data import cleanup complete!" -ForegroundColor Green
Write-Host "Note: You may need to manually update mock data usage in the files." -ForegroundColor Cyan
