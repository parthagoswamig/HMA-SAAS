-- ============================================
-- ADD SUBSCRIPTION TABLES
-- ============================================

BEGIN;

-- Create subscription status enum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'SUSPENDED', 'PAST_DUE', 'TRIALING');

-- Create subscription_plans table
CREATE TABLE "subscription_plans" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "interval" TEXT NOT NULL,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE "subscriptions" (
    "id" TEXT PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") 
        REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") 
        REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions"("tenant_id");
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- Insert default subscription plans
INSERT INTO "subscription_plans" ("id", "name", "description", "price", "interval", "features", "isActive") VALUES
('plan_free', 'Free Plan', 'Basic features for small clinics', 0, 'monthly', '{"maxUsers": 5, "maxPatients": 100, "storage": "1GB"}', true),
('plan_basic', 'Basic Plan', 'Essential features for growing practices', 29.99, 'monthly', '{"maxUsers": 10, "maxPatients": 500, "storage": "10GB", "support": "email"}', true),
('plan_pro', 'Professional Plan', 'Advanced features for established hospitals', 99.99, 'monthly', '{"maxUsers": 50, "maxPatients": 5000, "storage": "100GB", "support": "priority", "analytics": true}', true),
('plan_enterprise', 'Enterprise Plan', 'Full features for large hospital networks', 299.99, 'monthly', '{"maxUsers": -1, "maxPatients": -1, "storage": "unlimited", "support": "24/7", "analytics": true, "customization": true}', true);

COMMIT;

SELECT 'Subscription tables created successfully!' as message;
