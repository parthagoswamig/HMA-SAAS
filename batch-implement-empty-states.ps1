# Batch Implementation of EmptyState Components
# This script adds EmptyState to all dashboard pages

$pages = @(
    @{
        Path = "opd\page.tsx"
        Icon = "IconStethoscope"
        Title = "No OPD consultations"
        Description = "Register your first outpatient consultation to get started"
        DataVar = "opdPatients"
    },
    @{
        Path = "billing\page.tsx"
        Icon = "IconReceipt"
        Title = "No bills generated"
        Description = "Create your first bill to start billing management"
        DataVar = "bills"
    },
    @{
        Path = "laboratory\page.tsx"
        Icon = "IconTestPipe"
        Title = "No lab tests"
        Description = "Order your first lab test to begin diagnostics"
        DataVar = "labTests"
    },
    @{
        Path = "pharmacy\page.tsx"
        Icon = "IconPill"
        Title = "No medications"
        Description = "Add medications to your pharmacy inventory"
        DataVar = "medications"
    },
    @{
        Path = "radiology\page.tsx"
        Icon = "IconRadiology"
        Title = "No radiology orders"
        Description = "Order your first imaging study"
        DataVar = "radiologyOrders"
    },
    @{
        Path = "emergency\page.tsx"
        Icon = "IconAmbulance"
        Title = "No emergency cases"
        Description = "Register emergency cases as they arrive"
        DataVar = "emergencyCases"
    },
    @{
        Path = "staff\page.tsx"
        Icon = "IconUsers"
        Title = "No staff members"
        Description = "Add staff members to your hospital"
        DataVar = "staff"
    },
    @{
        Path = "pathology\page.tsx"
        Icon = "IconMicroscope"
        Title = "No pathology tests"
        Description = "Order pathology tests for patients"
        DataVar = "pathologyTests"
    },
    @{
        Path = "surgery\page.tsx"
        Icon = "IconScalpel"
        Title = "No surgeries scheduled"
        Description = "Schedule your first surgery"
        DataVar = "surgeries"
    },
    @{
        Path = "hr\page.tsx"
        Icon = "IconBriefcase"
        Title = "No HR records"
        Description = "Add employee records to get started"
        DataVar = "employees"
    },
    @{
        Path = "finance\page.tsx"
        Icon = "IconCash"
        Title = "No financial records"
        Description = "Add financial transactions"
        DataVar = "transactions"
    },
    @{
        Path = "emr\page.tsx"
        Icon = "IconFileText"
        Title = "No medical records"
        Description = "Create electronic medical records"
        DataVar = "records"
    },
    @{
        Path = "inventory\page.tsx"
        Icon = "IconPackage"
        Title = "No inventory items"
        Description = "Add items to your inventory"
        DataVar = "items"
    },
    @{
        Path = "insurance\page.tsx"
        Icon = "IconShield"
        Title = "No insurance records"
        Description = "Add insurance information"
        DataVar = "insuranceRecords"
    },
    @{
        Path = "quality\page.tsx"
        Icon = "IconChartBar"
        Title = "No quality metrics"
        Description = "Quality metrics will appear here"
        DataVar = "metrics"
    },
    @{
        Path = "reports\page.tsx"
        Icon = "IconFileReport"
        Title = "No reports generated"
        Description = "Generate your first report"
        DataVar = "reports"
    },
    @{
        Path = "telemedicine\page.tsx"
        Icon = "IconVideo"
        Title = "No telemedicine sessions"
        Description = "Schedule your first virtual consultation"
        DataVar = "sessions"
    },
    @{
        Path = "communications\page.tsx"
        Icon = "IconMessage"
        Title = "No messages"
        Description = "Communication history will appear here"
        DataVar = "messages"
    },
    @{
        Path = "research\page.tsx"
        Icon = "IconFlask"
        Title = "No research projects"
        Description = "Add your first research project"
        DataVar = "projects"
    },
    @{
        Path = "integration\page.tsx"
        Icon = "IconPlug"
        Title = "No integrations"
        Description = "Connect external systems"
        DataVar = "integrations"
    },
    @{
        Path = "ai-assistant\page.tsx"
        Icon = "IconRobot"
        Title = "No AI interactions"
        Description = "Start using AI assistant"
        DataVar = "interactions"
    },
    @{
        Path = "patient-portal\page.tsx"
        Icon = "IconUserCircle"
        Title = "No portal activity"
        Description = "Patient portal activity will appear here"
        DataVar = "activities"
    },
    @{
        Path = "pharmacy-management\page.tsx"
        Icon = "IconPill"
        Title = "No pharmacy records"
        Description = "Manage pharmacy operations"
        DataVar = "pharmacyRecords"
    }
)

$dashboardPath = "c:\Users\HP\Desktop\HMS\apps\web\src\app\dashboard"

Write-Host "=== Batch EmptyState Implementation ===" -ForegroundColor Cyan
Write-Host ""

$implemented = 0
$skipped = 0

foreach ($page in $pages) {
    $filePath = Join-Path $dashboardPath $page.Path
    
    if (-not (Test-Path $filePath)) {
        Write-Host "Skip: $($page.Path) - File not found" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $content = Get-Content $filePath -Raw
    
    # Skip if already has EmptyState
    if ($content -match 'EmptyState') {
        Write-Host "Skip: $($page.Path) - Already has EmptyState" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    Write-Host "Processing: $($page.Path)" -ForegroundColor Green
    
    # Add EmptyState import if not present
    if ($content -notmatch "import.*EmptyState") {
        $content = $content -replace "(import.*from '@mantine/core';)", "`$1`nimport { EmptyState } from '../../../components/EmptyState';"
        Write-Host "  Added EmptyState import" -ForegroundColor Green
    }
    
    # Save
    Set-Content -Path $filePath -Value $content -NoNewline
    $implemented++
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Implemented: $implemented" -ForegroundColor Green
Write-Host "Skipped: $skipped" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: EmptyState imports added. You need to manually add the component usage in render logic." -ForegroundColor Yellow
