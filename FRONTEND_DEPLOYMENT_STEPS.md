# 🚀 Frontend Deployment Guide

## Current Status
- ✅ Backend API: https://hma-saas-api.vercel.app (LIVE)
- ❌ Frontend Web: Not deployed yet

---

## 📋 Deploy Frontend to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   ```
   https://vercel.com/new
   ```

2. **Import Repository:**
   - Click "Add New" → "Project"
   - Select: `parthagoswamig/HMA-SAAS`
   - Click "Import"

3. **Configure Build Settings:**
   ```
   Project Name: hma-saas-web
   Framework: Next.js
   Root Directory: apps/web
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Node Version: 20.x
   ```

4. **Environment Variables:**
   Add these in the "Environment Variables" section:
   
   ```env
   NEXT_PUBLIC_API_URL=https://hma-saas-api.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_NAME=HMS SaaS
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! ✅

---

### Method 2: Vercel CLI (Advanced)

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```powershell
   vercel login
   ```

3. **Deploy Frontend:**
   ```powershell
   cd apps/web
   vercel --prod
   ```

4. **Follow Prompts:**
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: hma-saas-web
   - Directory: ./
   - Override settings: No

---

## 🎯 After Deployment

### Your URLs:
- **Backend API:** https://hma-saas-api.vercel.app
- **Frontend Web:** https://hma-saas-web.vercel.app (or your custom URL)

### Update Backend CORS:
After frontend deploys, add the frontend URL to backend CORS:

1. Go to Vercel Dashboard → hma-saas-api → Settings → Environment Variables
2. Update `CORS_ORIGINS`:
   ```
   https://hma-saas-web.vercel.app,http://localhost:3000
   ```
3. Redeploy backend

---

## ✅ Verification

After deployment, test:

1. **Open Frontend:**
   ```
   https://hma-saas-web.vercel.app
   ```

2. **Test Login:**
   - Email: admin@test.com
   - Password: Admin@123
   - Tenant: test-tenant-001

3. **Check API Connection:**
   - Open browser console (F12)
   - Should see API calls to: https://hma-saas-api.vercel.app

---

## 🎉 Success!

Both frontend and backend will be live on Vercel, completely free!

- ✅ Backend: Serverless NestJS API
- ✅ Frontend: Next.js 14 App Router
- ✅ Database: Supabase PostgreSQL
- ✅ Cost: $0/month (free tier)
