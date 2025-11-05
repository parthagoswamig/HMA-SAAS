# Aggressive Mock Data Cleanup Script
# Replaces ALL mock data usage with empty arrays

$dashboardPath = "c:\Users\HP\Desktop\HMS\apps\web\src\app\dashboard"

Write-Host "=== AGGRESSIVE MOCK DATA CLEANUP ===" -ForegroundColor Red
Write-Host "This will replace ALL mock data references with empty arrays" -ForegroundColor Yellow
Write-Host ""

# Get all .tsx files in dashboard
$files = Get-ChildItem -Path $dashboardPath -Filter "*.tsx" -Recurse

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $replacements = 0
    
    # Pattern 1: Replace mock array usage in map/filter
    # mockSomething.map(...) => [].map(...)
    $pattern1 = 'mock[A-Z][a-zA-Z0-9]*\.(map|filter|find|some|every|reduce)'
    if ($content -match $pattern1) {
        $content = $content -replace $pattern1, '[].$1 /* TODO: Fetch from API */'
        $replacements++
    }
    
    # Pattern 2: Replace mock array length checks
    # mockSomething.length => 0
    $pattern2 = 'mock[A-Z][a-zA-Z0-9]*\.length'
    if ($content -match $pattern2) {
        $content = $content -replace $pattern2, '0 /* TODO: Fetch from API */'
        $replacements++
    }
    
    # Pattern 3: Replace direct mock array references
    # return mockSomething => return []
    $pattern3 = '(return|const\s+\w+\s*=)\s+mock[A-Z][a-zA-Z0-9]*;'
    if ($content -match $pattern3) {
        $content = $content -replace $pattern3, '$1 []; // TODO: Fetch from API'
        $replacements++
    }
    
    # Pattern 4: Replace mock object property access
    # mockStats.something => 0 or ''
    $pattern4 = 'mock[A-Z][a-zA-Z0-9]*\.[a-zA-Z0-9]+'
    if ($content -match $pattern4) {
        $content = $content -replace $pattern4, '0 /* TODO: Fetch from API */'
        $replacements++
    }
    
    # Pattern 5: Replace mock in ternary/logical operators
    # something || mockData => something || []
    $pattern5 = '\|\|\s*mock[A-Z][a-zA-Z0-9]*'
    if ($content -match $pattern5) {
        $content = $content -replace $pattern5, '|| []'
        $replacements++
    }
    
    # Pattern 6: Replace mock in function calls
    # setData(mockSomething) => setData([])
    $pattern6 = '\(mock[A-Z][a-zA-Z0-9]*\)'
    if ($content -match $pattern6) {
        $content = $content -replace $pattern6, '([] /* TODO: Fetch from API */)'
        $replacements++
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Cleaned: $replacements pattern(s) replaced" -ForegroundColor Green
        $totalFiles++
        $totalReplacements += $replacements
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "Files modified: $totalFiles" -ForegroundColor Cyan
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Please review the changes and implement proper API calls!" -ForegroundColor Yellow
