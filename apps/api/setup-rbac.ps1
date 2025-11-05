#!/usr/bin/env pwsh

Write-Host "🚀 Setting up RBAC System for HMS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate Prisma migration
Write-Host "Step 1: Generating Prisma migration..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name add_rbac_system --create-only
    if ($LASTEXITCODE -ne 0) {
        throw "Migration generation failed"
    }
    Write-Host "✅ Migration generated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to generate migration: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Review migration (optional - user can skip)
Write-Host "Step 2: Review the migration file if needed" -ForegroundColor Yellow
Write-Host "Migration files are in: apps/api/prisma/migrations/" -ForegroundColor Gray
$review = Read-Host "Do you want to apply the migration now? (y/n)"

if ($review -eq "y" -or $review -eq "Y") {
    Write-Host ""
    Write-Host "Step 3: Applying migration..." -ForegroundColor Yellow
    try {
        npx prisma migrate deploy
        if ($LASTEXITCODE -ne 0) {
            throw "Migration deployment failed"
        }
        Write-Host "✅ Migration applied successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to apply migration: $_" -ForegroundColor Red
        exit 1
    }

    Write-Host ""

    # Step 4: Generate Prisma Client
    Write-Host "Step 4: Generating Prisma Client..." -ForegroundColor Yellow
    try {
        npx prisma generate
        if ($LASTEXITCODE -ne 0) {
            throw "Prisma client generation failed"
        }
        Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to generate Prisma Client: $_" -ForegroundColor Red
        exit 1
    }

    Write-Host ""

    # Step 5: Seed permissions and default roles
    Write-Host "Step 5: Seeding permissions and default roles..." -ForegroundColor Yellow
    try {
        npx ts-node prisma/seeds/index.ts
        if ($LASTEXITCODE -ne 0) {
            throw "Seeding failed"
        }
        Write-Host "✅ Seeding completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to seed data: $_" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "🎉 RBAC System setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your API server" -ForegroundColor White
    Write-Host "2. Test the RBAC endpoints" -ForegroundColor White
    Write-Host "3. Configure roles and permissions for your tenants" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⏸️  Migration not applied. Run 'npx prisma migrate deploy' when ready." -ForegroundColor Yellow
    Write-Host "After applying migration, run: npx ts-node prisma/seeds/index.ts" -ForegroundColor Yellow
}
