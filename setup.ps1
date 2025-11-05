Write-Host "🏥 HMS SaaS – One Click Setup with Docker"

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..."
npm install
cd apps/api; npm install; cd ../web; npm install; cd ../..

# Step 2: Setup environment files
Write-Host "⚙️ Setting up environment files..."
if (!(Test-Path "apps/api/.env")) { Copy-Item "apps/api/.env.example" "apps/api/.env" }
if (!(Test-Path "apps/web/.env.local")) { Copy-Item "apps/web/.env.example" "apps/web/.env.local" }

# Replace localhost with postgres in API env
(Get-Content apps/api/.env) -replace "localhost","postgres" | Set-Content apps/api/.env

# Step 3: Start PostgreSQL
Write-Host "🐘 Starting PostgreSQL..."
docker compose up postgres -d
Start-Sleep -Seconds 30

# Step 4: Migrate + Seed DB
Write-Host "🗃️ Running migrations..."
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
cd ../..

# Step 5: Start API + Web
Write-Host "🚀 Starting API + Frontend..."
docker compose up -d api web

# Final status
Write-Host "✅ Setup complete!"
Write-Host "🌐 API: http://localhost:3001"
Write-Host "🌐 Frontend: http://localhost:3000"