# 🚀 HMS SaaS - Production Deployment Guide

**Deployment Stack:**
- 🌐 **Frontend:** Vercel
- 🔧 **Backend:** Render
- 💾 **Database:** Supabase PostgreSQL

---

## 📋 Deployment Checklist

### ✅ Pre-Deployment

- [ ] Supabase project active and accessible
- [ ] Database migrations ready
- [ ] Test data seeded (optional)
- [ ] All environment variables prepared
- [ ] Git repository ready

### 🔧 Render Backend Deployment

- [ ] Create Render Web Service
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Get Render URL
- [ ] Test health endpoint

### 🌐 Vercel Frontend Deployment

- [ ] Create Vercel project
- [ ] Configure environment variables (with Render URL)
- [ ] Deploy frontend
- [ ] Get Vercel URL
- [ ] Test frontend

### 🔄 Post-Deployment

- [ ] Update Render CORS with Vercel URL
- [ ] Redeploy Render backend
- [ ] Test full authentication flow
- [ ] Verify all modules working

---

## 🔧 STEP 1: Deploy Backend to Render

### 1.1 Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `hms-saas-backend` (or your choice)
   - **Region:** Singapore (closest to Supabase)
   - **Branch:** `main`
   - **Root Directory:** `apps/api`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free (or Starter)

### 1.2 Add Environment Variables

In Render Dashboard → Environment, add these **exactly**:

```env
NODE_ENV=production
PORT=10000

# Database - Supabase PostgreSQL (Optimized for Production)
DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20&pool_timeout=10&connect_timeout=10
DIRECT_DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Database Configuration
DATABASE_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DATABASE_PORT=6543
DATABASE_USERNAME=postgres.uoxyyqbwuzjraxhaypko
DATABASE_PASSWORD=9800975588pG
DATABASE_NAME=postgres
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
DATABASE_SSL=true

# Supabase
SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NTM0MywiZXhwIjoyMDc1MTQxMzQzfQ.17ZYMGLqzcntTgpQwm1YzCT6eE8OGkGUCOONBgPC9DE

# JWT Configuration
JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==
JWT_EXPIRES_IN=1d
JWT_ACCESS_TOKEN_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=
JWT_REFRESH_TOKEN_EXPIRY=7d

# Legacy JWT (backwards compatibility)
JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_SALT_ROUNDS=12
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# App Configuration
APP_NAME=HMS SaaS
APP_VERSION=1.0.0
LOG_LEVEL=info
LOG_TO_FILE=false
SWAGGER_ENABLED=true
SWAGGER_PATH=api-docs

# CORS - TEMPORARY (Update after Vercel deployment)
CORS_ORIGINS=https://hms-saas-staging.onrender.com
CORS_ORIGIN=https://hms-saas-staging.onrender.com
FRONTEND_URL=https://hms-saas-staging.onrender.com
RESET_PASSWORD_URL=https://hms-saas-staging.onrender.com/reset-password
APP_URL=https://hms-saas-staging.onrender.com
```

### 1.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your Render URL: `https://hms-saas-staging.onrender.com`

### 1.4 Run Database Migrations

**Option 1: Using Render Shell**
1. Go to Render Dashboard → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```

**Option 2: Using Local Terminal**
```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

cd apps/api
npx prisma migrate deploy
npm run prisma:seed
```

### 1.5 Test Backend

```bash
# Health check
curl https://hms-saas-staging.onrender.com/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## 🌐 STEP 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### 2.2 Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Backend API URL (Use your Render URL)
NEXT_PUBLIC_API_URL=https://hms-saas-staging.onrender.com

# Supabase (for direct client access if needed)
NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw

# App Configuration
NEXT_PUBLIC_APP_NAME=HMS SaaS
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Important:** Set these for **all environments** (Production, Preview, Development)

### 2.3 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Note your Vercel URL: `https://hms-saas-staging.vercel.app`

### 2.4 Test Frontend

Visit: `https://hms-saas-staging.vercel.app`

**Expected:** Login page loads

---

## 🔄 STEP 3: Update CORS Configuration

### 3.1 Update Render Environment Variables

Go back to Render Dashboard → Environment and **UPDATE** these variables:

```env
CORS_ORIGINS=https://hms-saas-staging.vercel.app,https://hms-saas-staging.onrender.com
CORS_ORIGIN=https://hms-saas-staging.vercel.app
FRONTEND_URL=https://hms-saas-staging.vercel.app
RESET_PASSWORD_URL=https://hms-saas-staging.vercel.app/reset-password
```

### 3.2 Redeploy Render

1. Go to Render Dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for redeployment (2-3 minutes)

---

## ✅ STEP 4: Verify Deployment

### 4.1 Test Backend

```bash
# Health check
curl https://hms-saas-staging.onrender.com/health

# Test login
curl -X POST https://hms-saas-staging.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin@123"}'
```

### 4.2 Test Frontend

1. Visit: `https://hms-saas-staging.vercel.app`
2. Login with: `admin@test.com` / `Admin@123`
3. Verify dashboard loads
4. Test patient creation
5. Test appointment scheduling

### 4.3 Test Full Flow

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays data
- [ ] CRUD operations work
- [ ] File uploads work
- [ ] RBAC permissions enforced

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Database connection fails

**Solution:**
```bash
# Verify DATABASE_URL in Render
# Check Supabase project is active
# Ensure connection_limit is appropriate
```

**Problem:** Migrations fail

**Solution:**
```bash
# Use DIRECT_DATABASE_URL for migrations
# Run from Render Shell or local with direct URL
```

### Frontend Issues

**Problem:** CORS errors

**Solution:**
1. Verify CORS_ORIGINS in Render includes Vercel URL
2. Redeploy Render backend
3. Clear browser cache

**Problem:** API calls fail

**Solution:**
1. Verify NEXT_PUBLIC_API_URL in Vercel
2. Check Render backend is running
3. Test backend health endpoint

### Database Issues

**Problem:** Supabase connection timeout

**Solution:**
1. Check Supabase project status
2. Verify connection string
3. Increase pool_timeout and connect_timeout
4. Reduce connection_limit if needed

---

## 📊 Production Optimization

### Backend (Render)

**Recommended Settings:**
```env
# Connection pooling
DATABASE_URL=...?pgbouncer=true&connection_limit=20&pool_timeout=10&connect_timeout=10

# Logging
LOG_LEVEL=warn
LOG_TO_FILE=false

# Rate limiting
THROTTLE_LIMIT=100

# Database logging
DATABASE_LOGGING=false
```

### Frontend (Vercel)

**Build Optimization:**
- Enable automatic optimization
- Configure caching headers
- Use Vercel Analytics
- Enable Speed Insights

### Database (Supabase)

**Optimization:**
- Enable connection pooling
- Configure appropriate pool size
- Set up read replicas (if needed)
- Monitor query performance

---

## 🔐 Security Checklist

- [ ] All JWT secrets are strong and unique
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables not in code
- [ ] Supabase RLS policies configured
- [ ] API endpoints protected with auth guards

---

## 📈 Monitoring

### Render

- Monitor logs: Dashboard → Logs
- Check metrics: Dashboard → Metrics
- Set up alerts for errors

### Vercel

- Analytics: Dashboard → Analytics
- Speed Insights: Dashboard → Speed Insights
- Error tracking: Integrate Sentry

### Supabase

- Database metrics: Dashboard → Database
- Query performance: Dashboard → SQL Editor
- Connection pooling: Dashboard → Settings

---

## 🚀 Deployment URLs

**Production:**
- Frontend: `https://hms-saas-staging.vercel.app`
- Backend: `https://hms-saas-staging.onrender.com`
- API Docs: `https://hms-saas-staging.onrender.com/api-docs`
- Database: Supabase (Singapore region)

**Test Credentials:**
- Email: `admin@test.com`
- Password: `Admin@123`
- Tenant: `test-tenant-001`

---

## 📝 Post-Deployment Tasks

### Immediate

- [ ] Test all critical features
- [ ] Verify RBAC permissions
- [ ] Test file uploads
- [ ] Check email notifications
- [ ] Verify payment processing

### Short-term

- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Add custom domain
- [ ] Set up SSL certificates
- [ ] Configure CDN

### Long-term

- [ ] Performance optimization
- [ ] Scale database
- [ ] Add caching layer (Redis)
- [ ] Implement CI/CD pipeline
- [ ] Set up staging environment

---

**Deployment Complete!** 🎉

Your HMS SaaS application is now live in production!
