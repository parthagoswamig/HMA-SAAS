#!/bin/sh

echo "🚀 Starting HMS SaaS Backend Deployment..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Check if migrations should be skipped
if [ "$SKIP_MIGRATIONS" = "true" ]; then
    echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
    echo "🎯 Starting application..."
    cd /app
    exec node apps/api/dist/main.js
fi

# Convert DATABASE_URL from pooler (6543) to direct connection (5432) for migrations
# PgBouncer (port 6543) doesn't support migrations, need direct connection (port 5432)
if [ -n "$DATABASE_URL" ]; then
    # Replace :6543 with :5432 for direct connection
    MIGRATION_DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/:6543/:5432/g')
    # Also add pgbouncer=false parameter
    if echo "$MIGRATION_DATABASE_URL" | grep -q "?"; then
        MIGRATION_DATABASE_URL="${MIGRATION_DATABASE_URL}&pgbouncer=false"
    else
        MIGRATION_DATABASE_URL="${MIGRATION_DATABASE_URL}?pgbouncer=false"
    fi
    echo "📡 Using direct connection for migrations (port 5432)"
fi

# Run Prisma migrations
echo "📦 Running database migrations..."
cd /app/apps/api

# Run migration with the direct connection URL
if [ -n "$MIGRATION_DATABASE_URL" ]; then
    DATABASE_URL="$MIGRATION_DATABASE_URL" npx prisma migrate deploy
else
    npx prisma migrate deploy
fi

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed"
    # Don't exit - let app start anyway
    echo "⚠️  Continuing to start app despite migration failure"
fi

# Start the application
echo "🎯 Starting application..."
cd /app
exec node apps/api/dist/main.js
