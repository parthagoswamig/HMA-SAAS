# FINAL COMPLETE MOCK DATA CLEANUP
# Cleans ALL .tsx and .ts files in the entire frontend

$appPath = "c:\Users\HP\Desktop\HMS\apps\web\src\app"

Write-Host "=== FINAL COMPLETE MOCK DATA REMOVAL ===" -ForegroundColor Red
Write-Host "Scanning entire frontend application..." -ForegroundColor Yellow
Write-Host ""

$files = Get-ChildItem -Path $appPath -Include "*.tsx","*.ts" -Recurse -Exclude "*.test.*","*.spec.*"

$totalFiles = 0
$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanges = 0
    
    # Only process if file contains mock references
    if ($content -match 'mock[A-Z]') {
        Write-Host "Cleaning: $($file.FullName.Replace($appPath, ''))" -ForegroundColor Cyan
        
        # Replace mock array operations
        $content = $content -replace 'mock[A-Z][a-zA-Z0-9]*\.(map|filter|find|some|every|reduce|slice)', '[].$1 /* TODO: API */'
        $content = $content -replace 'mock[A-Z][a-zA-Z0-9]*\.length', '0'
        $content = $content -replace '\|\|\s*mock[A-Z][a-zA-Z0-9]*([;\s\)])', '|| []$1'
        $content = $content -replace ':\s*mock[A-Z][a-zA-Z0-9]*([,\s\}])', ': []$1'
        $content = $content -replace '=\s*mock[A-Z][a-zA-Z0-9]*;', '= []; // TODO: Fetch from API'
        $content = $content -replace 'mock[A-Z][a-zA-Z0-9]*\?\.[a-zA-Z0-9]+', '0'
        $content = $content -replace 'mock[A-Z][a-zA-Z0-9]*\.[a-zA-Z0-9]+', '0'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $totalFiles++
            Write-Host "  ✓ Cleaned" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "Files cleaned: $totalFiles" -ForegroundColor Cyan
Write-Host ""
Write-Host "All mock data has been replaced with empty arrays or zeros." -ForegroundColor Yellow
Write-Host "Next step: Implement proper API integration for each module." -ForegroundColor Yellow
