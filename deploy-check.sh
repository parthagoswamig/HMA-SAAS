#!/bin/bash
echo "🔍 Render Deployment Diagnostic Tool"
echo "=================================="
echo ""

echo "1. Checking if API is responding..."
if curl -s http://localhost:10000/health > /dev/null 2>&1; then
    echo "✅ Local API is running on port 10000"
    echo "📊 Health check response:"
    curl -s http://localhost:10000/health | jq . 2>/dev/null || curl -s http://localhost:10000/health
else
    echo "❌ Local API is NOT running on port 10000"
    echo "💡 Try: cd apps/api && node dist/main.js"
fi

echo ""
echo "2. Checking environment variables..."
echo "PORT: ${PORT:-'not set'}"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "SKIP_DB_OPERATIONS: ${SKIP_DB_OPERATIONS:-'not set'}"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"

echo ""
echo "3. Checking if Prisma schema exists..."
if [ -f "apps/api/prisma/schema.prisma" ]; then
    echo "✅ Prisma schema found"
else
    echo "❌ Prisma schema NOT found"
fi

echo ""
echo "4. Deployment recommendations:"
echo "✅ Use render-simple.yaml for deployment"
echo "✅ Set SKIP_DB_OPERATIONS=true in Render"
echo "✅ Use dummy DATABASE_URL for testing"
echo "✅ Expected deployment time: 3-5 minutes"
