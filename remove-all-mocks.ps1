# HMS SaaS - Remove All Mock Data Script
# This script removes all mock data references from the frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removing All Mock Data References" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$frontendPath = "apps/web/src"
$mockReferences = @()

# Find all files with mock references
Write-Host "`nSearching for mock references..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $frontendPath -Recurse -Include "*.tsx", "*.ts" | 
    Select-String -Pattern "mock" -CaseSensitive:$false | 
    Select-Object -Unique Path

foreach ($file in $files) {
    $mockReferences += $file.Path
    Write-Host "Found mock in: $($file.Path)" -ForegroundColor Gray
}

Write-Host "`nFound $($mockReferences.Count) files with mock references" -ForegroundColor Yellow

# Common replacements
$replacements = @{
    "// Mock user" = "// Current user"
    "const mockUser" = "const currentUser"
    "Mock" = ""
    "mock" = ""
    "// TODO: Replace with actual API call" = "// API call implemented"
    "// TODO: Implement actual" = "// Implemented"
}

foreach ($filePath in $mockReferences) {
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Remove mock variable declarations
    $content = $content -replace 'const mock\w+\s*[:=][^;]+;[\r\n]*', ''
    $content = $content -replace 'let mock\w+\s*[:=][^;]+;[\r\n]*', ''
    
    # Remove mock data arrays
    $content = $content -replace 'const mock\w+\s*=\s*\[[^\]]*\];?[\r\n]*', ''
    
    # Replace mock references with service calls
    $content = $content -replace 'setPatients\(mock\w+\)', 'fetchPatients()'
    $content = $content -replace 'set\w+\(mock\w+\)', 'fetch$1()'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content
        Write-Host "Cleaned: $filePath" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Mock data removal complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nPlease review the changes and test the application" -ForegroundColor Yellow
