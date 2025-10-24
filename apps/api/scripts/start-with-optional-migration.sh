#!/bin/sh
set -e

echo "🚀 Starting HMS SaaS Backend Deployment..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"

# Check if we should skip migrations (useful for troubleshooting)
if [ "$SKIP_MIGRATIONS" = "true" ]; then
    echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
else
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
        
        # Run migrations in background with timeout
        echo "📦 Running database migrations..."
        cd /app/apps/api
        
        # Try to run migrations with a simple approach
        (
            DATABASE_URL="$MIGRATION_DATABASE_URL" npx prisma migrate deploy &
            MIGRATION_PID=$!
            
            # Wait up to 90 seconds for migration
            COUNTER=0
            while kill -0 $MIGRATION_PID 2>/dev/null && [ $COUNTER -lt 90 ]; do
                sleep 1
                COUNTER=$((COUNTER + 1))
            done
            
            # If still running, kill it
            if kill -0 $MIGRATION_PID 2>/dev/null; then
                echo "⚠️  Migration taking too long, killing process..."
                kill $MIGRATION_PID 2>/dev/null || true
                echo "⚠️  Starting app without waiting for migrations"
            else
                wait $MIGRATION_PID
                if [ $? -eq 0 ]; then
                    echo "✅ Migrations completed successfully"
                else
                    echo "⚠️  Migration failed, but continuing to start app"
                fi
            fi
        )
    fi
fi

# Start the application
echo "🎯 Starting application..."
cd /app
exec node apps/api/dist/main.js
