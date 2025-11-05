#!/bin/bash

echo "🚀 Setting up HMS Subscription System..."

# Check if we're in the right directory
if [ ! -d "apps/api" ]; then
    echo "❌ Error: Please run this script from the HMS project root"
    exit 1
fi

echo "📊 Running database migrations..."
cd apps/api
npx prisma generate
npx prisma db push

echo "🌱 Seeding subscription plans..."
npx ts-node ../../node_modules/.bin/tsx prisma/seed-subscriptions.ts

echo "✅ Subscription system setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Add Stripe environment variables to apps/api/.env"
echo "2. Install Stripe CLI: npm install -g stripe"
echo "3. Start backend: npm run start:dev"
echo "4. Start frontend: cd ../web && npm run dev"
echo ""
echo "🔧 Environment Variables Needed:"
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo "STRIPE_PUBLISHABLE_KEY=pk_test_..."
