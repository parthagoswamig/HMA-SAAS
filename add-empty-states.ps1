# Add EmptyState Components to All Pages
# This script adds EmptyState import and usage to pages that need it

$dashboardPath = "c:\Users\HP\Desktop\HMS\apps\web\src\app\dashboard"

Write-Host "=== Adding EmptyState Components ===" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path $dashboardPath -Filter "page.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has EmptyState
    if ($content -match 'EmptyState') {
        Write-Host "Skip: $($file.Directory.Name) - Already has EmptyState" -ForegroundColor Gray
        continue
    }
    
    Write-Host "Processing: $($file.Directory.Name)" -ForegroundColor Yellow
    
    # Add EmptyState import after other imports
    if ($content -match "import.*from '@mantine/core';") {
        $content = $content -replace "(import.*from '@mantine/core';)", "`$1`nimport { EmptyState } from '../../../components/EmptyState';"
        Write-Host "  Added EmptyState import" -ForegroundColor Green
    }
    
    # Add icon import if not present
    if ($content -notmatch 'IconInbox') {
        $content = $content -replace "(import.*from '@tabler/icons-react';)", "`$1, IconInbox"
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Green
Write-Host "EmptyState component added to pages" -ForegroundColor Cyan
Write-Host "Next: Manually add EmptyState usage in render logic" -ForegroundColor Yellow
