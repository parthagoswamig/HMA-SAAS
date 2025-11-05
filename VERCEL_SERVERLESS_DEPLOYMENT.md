# 🚀 Vercel Serverless + Supabase Deployment Guide

## ✅ Your Stack: 100% Serverless

- **Frontend:** Vercel (Next.js)
- **Backend API:** Vercel Serverless Functions (NestJS)
- **Database:** Supabase PostgreSQL
- **File Storage:** Vercel Blob / Supabase Storage
- **Redis:** Upstash (serverless Redis)
- **Monitoring:** Sentry (optional)

**No traditional servers needed!** Everything runs serverless on Vercel.

---

## 📋 Pre-Deployment Checklist

### ✅ **What's Ready:**
- [x] Backend API with Vercel serverless handler (`apps/api/api/index.ts`)
- [x] Frontend Next.js app
- [x] Prisma schema valid
- [x] All TypeScript errors fixed
- [x] Dependencies installed
- [x] Environment variables documented

### ⏳ **What You Need:**
- [ ] Supabase account & database
- [ ] Vercel account
- [ ] Stripe account (for billing)
- [ ] Upstash Redis (optional - for queues)
- [ ] SMTP service (Mailgun, SendGrid, etc.)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Set Up Supabase Database**

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose region closest to your users
   - Wait for database to provision

2. **Get Database URL**
   ```
   Go to Project Settings → Database → Connection String
   Copy the "Connection pooling" URL (recommended for serverless)
   ```

3. **Enable Connection Pooling**
   ```
   Mode: Transaction
   Pool Size: 15-20 (for serverless)
   ```

4. **Save Credentials**
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

---

### **Step 2: Deploy Backend API to Vercel**

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Phase 6 complete - ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: apps/api
   Build Command: npm install && npx prisma generate && npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   
   Click "Environment Variables" and add all these:

   **Database:**
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

   **JWT Secrets:**
   ```env
   JWT_SECRET=your-super-secure-64-char-random-string-here
   JWT_ACCESS_SECRET=your-access-secret-64-char-random-string
   JWT_REFRESH_SECRET=your-refresh-secret-64-char-random-string
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d
   ```

   **Server Config:**
   ```env
   NODE_ENV=production
   PORT=10000
   LOG_LEVEL=info
   ```

   **CORS (will update after frontend deploys):**
   ```env
   CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-*.vercel.app
   ```

   **Supabase:**
   ```env
   SUPABASE_URL=https://[PROJECT-ID].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **Stripe (Phase 5):**
   ```env
   STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   PUBLIC_WEB_URL=https://your-frontend.vercel.app
   ```

   **Email (Phase 5):**
   ```env
   EMAIL_SMTP_HOST=smtp.mailgun.org
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=postmaster@your-domain.com
   EMAIL_SMTP_PASS=your-smtp-password
   EMAIL_FROM="HMS SaaS <noreply@your-domain.com>"
   ```

   **Redis (Phase 6 - Optional):**
   ```env
   REDIS_HOST=redis-xxxxx.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   ```

   **Sentry (Phase 6 - Optional):**
   ```env
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```

   **Rate Limiting:**
   ```env
   THROTTLE_TTL=60
   THROTTLE_LIMIT=100
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)
   - Note your API URL: `https://your-api-project.vercel.app`

6. **Run Database Migrations**
   ```bash
   # From your local machine
   cd apps/api
   DATABASE_URL="your-supabase-connection-string" npx prisma migrate deploy
   ```

---

### **Step 3: Deploy Frontend to Vercel**

1. **Import Frontend Project**
   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Import same GitHub repository
   - Select the repository again

2. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: npm install && npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your frontend URL: `https://your-frontend.vercel.app`

5. **Update Backend CORS**
   - Go back to API project settings
   - Update `CORS_ORIGINS` env var with your frontend URL
   - Redeploy API

---

### **Step 4: Configure Third-Party Services**

#### **Stripe Webhooks**
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-api-project.vercel.app/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel API env vars
6. Redeploy API

#### **Upstash Redis (Optional)**
1. Go to https://upstash.com
2. Create Redis database
3. Copy connection details
4. Add to Vercel API env vars:
   ```env
   REDIS_HOST=redis-xxxxx.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=xxxxx
   ```
5. Redeploy API

#### **Sentry (Optional)**
1. Go to https://sentry.io
2. Create new project (Node.js)
3. Copy DSN
4. Add to Vercel API env vars:
   ```env
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```
5. Redeploy API

---

## ✅ Post-Deployment Verification

### **1. Test API Health**
```bash
curl https://your-api-project.vercel.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### **2. Test Frontend**
```bash
curl https://your-frontend.vercel.app
# Should return HTML
```

### **3. Test Tenant Onboarding**
```bash
curl -X POST https://your-api-project.vercel.app/tenant-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "slug": "test-hospital",
    "email": "admin@test.com",
    "password": "Test@123456"
  }'
```

### **4. Test Authentication**
```bash
curl -X POST https://your-api-project.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test@123456"
  }'
```

### **5. Test Swagger Docs**
Visit: `https://your-api-project.vercel.app/docs`

---

## 🎯 Vercel Serverless Advantages

### **✅ Benefits:**
- **Zero Server Management** - No servers to maintain
- **Auto-Scaling** - Scales automatically with traffic
- **Global CDN** - Fast worldwide
- **Zero Downtime** - Atomic deployments
- **Git Integration** - Auto-deploy on push
- **Preview Deployments** - Every PR gets a preview URL
- **Environment Variables** - Easy to manage
- **Logs & Analytics** - Built-in monitoring
- **Free Tier** - Generous free tier for testing

### **⚠️ Limitations:**
- **10-second timeout** - Long-running tasks need workarounds
- **Cold starts** - First request may be slower
- **Stateless** - No persistent file storage (use Supabase Storage)
- **Memory limits** - 1GB default (can upgrade)

---

## 🔧 Troubleshooting

### **Issue: Database Connection Errors**
**Solution:** Use Supabase connection pooling URL with `?pgbouncer=true`

### **Issue: Cold Start Timeouts**
**Solution:** 
- Enable "Keep Warm" in Vercel settings
- Use Vercel Cron to ping API every 5 minutes

### **Issue: File Upload Fails**
**Solution:** Use Supabase Storage or Vercel Blob for file uploads

### **Issue: Background Jobs Not Running**
**Solution:** 
- Use Vercel Cron for scheduled tasks
- Use Upstash QStash for queued jobs
- Or use Supabase Edge Functions

---

## 📊 Monitoring & Logs

### **Vercel Dashboard:**
- Real-time logs
- Function invocations
- Error tracking
- Performance metrics

### **Sentry (if configured):**
- Error tracking
- Performance monitoring
- User impact analysis

### **Supabase Dashboard:**
- Database queries
- Connection pooling stats
- Storage usage

---

## 🚀 Continuous Deployment

### **Automatic Deployments:**
```bash
# Push to main branch
git push origin main
# Vercel automatically deploys both frontend and backend
```

### **Preview Deployments:**
```bash
# Create PR
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel creates preview URL
```

---

## 💰 Cost Estimate (Monthly)

### **Free Tier:**
- Vercel: Free (Hobby plan)
- Supabase: Free (up to 500MB database)
- Upstash: Free (10K requests/day)
- Total: **$0/month** for testing

### **Production (Small):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Upstash: $10/month
- Stripe: Pay as you go
- Total: **~$55/month**

### **Production (Medium):**
- Vercel Team: $50/month
- Supabase Pro: $25/month
- Upstash: $20/month
- Total: **~$95/month**

---

## 🎉 You're Live!

Your HMS SaaS is now running 100% serverless on:
- ✅ Vercel (Frontend + Backend)
- ✅ Supabase (Database)
- ✅ Upstash (Redis)
- ✅ Stripe (Payments)

**No servers to manage. Scales automatically. Deploys in seconds.** 🚀

---

## 📚 Next Steps

1. ✅ Set up custom domain
2. ✅ Configure SSL (automatic on Vercel)
3. ✅ Set up monitoring alerts
4. ✅ Create backup strategy
5. ✅ Load test your application
6. ✅ Set up CI/CD pipelines
7. ✅ Document API for users
8. ✅ Create user onboarding flow

**Your serverless HMS SaaS is production-ready!** 🎊
