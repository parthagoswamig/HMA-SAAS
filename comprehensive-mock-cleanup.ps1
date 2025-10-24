# Comprehensive Mock Data Cleanup Script
# HMS SaaS - Remove ALL mock, demo, fake, dummy, and sample data

$dashboardPath = "c:\Users\HP\Desktop\HMS\apps\web\src\app\dashboard"

# List of all dashboard pages to clean
$pagesToClean = @(
    "laboratory\page.tsx",
    "patient-portal\page.tsx",
    "hr\page.tsx",
    "pathology\page.tsx",
    "quality\page.tsx",
    "pharmacy\page.tsx",
    "radiology\page.tsx",
    "inventory\page.tsx",
    "finance\page.tsx",
    "emr\page.tsx",
    "integration\page.tsx",
    "ai-assistant\page.tsx",
    "surgery\page.tsx",
    "insurance\page.tsx",
    "pharmacy-management\page.tsx",
    "billing\page.tsx",
    "communications\page.tsx",
    "research\page.tsx",
    "staff\page.tsx",
    "reports\page.tsx"
)

Write-Host "=== HMS SaaS Comprehensive Mock Data Cleanup ===" -ForegroundColor Cyan
Write-Host ""

$totalCleaned = 0
$totalErrors = 0

foreach ($page in $pagesToClean) {
    $fullPath = Join-Path $dashboardPath $page
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $page" -ForegroundColor Yellow
        
        try {
            $content = Get-Content $fullPath -Raw
            $originalLength = $content.Length
            
            # Remove mock data import lines
            $content = $content -replace "import\s*\{[^}]*\}\s*from\s*['\`"]\.\.\/\.\.\/\.\.\/lib\/mockData\/[^'\`"]*['\`"];?", "// Mock data imports removed"
            
            # Remove standalone mock import lines
            $content = $content -replace "import\s+\{[^}]*mock[^}]*\}[^;]*;", "// Mock data imports removed"
            
            # Clean up multiple consecutive comment lines
            $content = $content -replace "(?m)^//\s*Mock data import[s]? removed\s*\n(?://\s*Mock data import[s]? removed\s*\n)+", "// Mock data imports removed`n"
            
            # Save the file
            Set-Content -Path $fullPath -Value $content -NoNewline
            
            $newLength = $content.Length
            $removed = $originalLength - $newLength
            
            if ($removed -gt 0) {
                Write-Host "  Cleaned: Removed $removed characters" -ForegroundColor Green
                $totalCleaned++
            } else {
                Write-Host "  No changes needed" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
            $totalErrors++
        }
    } else {
        Write-Host "  File not found: $page" -ForegroundColor Red
        $totalErrors++
    }
}

Write-Host ""
Write-Host "=== Cleanup Summary ===" -ForegroundColor Cyan
Write-Host "Files cleaned: $totalCleaned" -ForegroundColor Green
Write-Host "Errors: $totalErrors" -ForegroundColor $(if ($totalErrors -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Note: You'll need to manually replace mock data usage with API calls or empty arrays." -ForegroundColor Yellow
