# ✅ HMS SaaS - Deployment Checklist

**Quick reference for deploying to production**

---

## 📋 Pre-Deployment

- [ ] **Supabase project is active**
  - Visit: https://uoxyyqbwuzjraxhaypko.supabase.co
  - Status should be "Active" (not paused)

- [ ] **Database migrations are ready**
  ```bash
  cd apps/api
  npx prisma migrate status
  ```

- [ ] **Test data seeded (optional)**
  ```bash
  npm run prisma:seed
  ```

- [ ] **Git repository is clean**
  ```bash
  git status
  git push origin main
  ```

---

## 🔧 STEP 1: Deploy Backend to Render

### 1.1 Create Render Service

- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure service:
  - Name: `hms-saas-backend`
  - Region: **Singapore** (closest to Supabase)
  - Branch: `main`
  - Root Directory: `apps/api`
  - Runtime: **Node**
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `npm run start:prod`

### 1.2 Add Environment Variables

- [ ] Copy ALL variables from `render.env`
- [ ] Paste into Render Dashboard → Environment
- [ ] **Important:** Leave CORS_ORIGINS as temporary value for now

### 1.3 Deploy

- [ ] Click "Create Web Service"
- [ ] Wait 5-10 minutes for deployment
- [ ] Note your Render URL: `https://______.onrender.com`

### 1.4 Run Migrations

**Option A: Render Shell**
- [ ] Go to Render Dashboard → Shell
- [ ] Run:
  ```bash
  npx prisma migrate deploy
  npm run prisma:seed
  ```

**Option B: Local Terminal**
- [ ] Run:
  ```bash
  cd apps/api
  npx prisma migrate deploy
  npm run prisma:seed
  ```

### 1.5 Test Backend

- [ ] Test health endpoint:
  ```bash
  curl https://YOUR-RENDER-URL.onrender.com/health
  ```
- [ ] Should return: `{"status":"ok",...}`

---

## 🌐 STEP 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project

- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Configure:
  - Framework: **Next.js**
  - Root Directory: `apps/web`
  - Build Command: `npm run build`
  - Output Directory: `.next`

### 2.2 Add Environment Variables

- [ ] Open `vercel.env` file
- [ ] **UPDATE** `NEXT_PUBLIC_API_URL` with your Render URL
- [ ] Copy ALL variables to Vercel Dashboard → Settings → Environment Variables
- [ ] Set for **ALL** environments (Production, Preview, Development)

### 2.3 Deploy

- [ ] Click "Deploy"
- [ ] Wait 3-5 minutes
- [ ] Note your Vercel URL: `https://______.vercel.app`

### 2.4 Test Frontend

- [ ] Visit your Vercel URL
- [ ] Login page should load
- [ ] **Note:** Login will fail until CORS is updated

---

## 🔄 STEP 3: Update CORS

### 3.1 Update Render Environment

- [ ] Go to Render Dashboard → Environment
- [ ] Update these variables with your **Vercel URL**:
  ```env
  CORS_ORIGINS=https://YOUR-APP.vercel.app,https://YOUR-RENDER.onrender.com
  CORS_ORIGIN=https://YOUR-APP.vercel.app
  FRONTEND_URL=https://YOUR-APP.vercel.app
  RESET_PASSWORD_URL=https://YOUR-APP.vercel.app/reset-password
  ```

### 3.2 Redeploy Render

- [ ] Click "Manual Deploy" → "Deploy latest commit"
- [ ] Wait 2-3 minutes

---

## ✅ STEP 4: Verify Deployment

### 4.1 Test Backend

- [ ] Health check:
  ```bash
  curl https://YOUR-RENDER-URL.onrender.com/health
  ```

- [ ] Test login:
  ```bash
  curl -X POST https://YOUR-RENDER-URL.onrender.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"Admin@123"}'
  ```

- [ ] Should return JWT token

### 4.2 Test Frontend

- [ ] Visit: `https://YOUR-APP.vercel.app`
- [ ] Login with: `admin@test.com` / `Admin@123`
- [ ] Dashboard should load
- [ ] Test creating a patient
- [ ] Test creating an appointment

### 4.3 Full Feature Test

- [ ] User registration
- [ ] User login
- [ ] Dashboard displays
- [ ] Patient CRUD
- [ ] Appointment scheduling
- [ ] Billing operations
- [ ] File uploads
- [ ] RBAC permissions

---

## 🎯 Quick Reference

### Your URLs

```
Frontend:  https://______.vercel.app
Backend:   https://______.onrender.com
API Docs:  https://______.onrender.com/api-docs
Database:  Supabase (Singapore)
```

### Test Credentials

```
Email:    admin@test.com
Password: Admin@123
Tenant:   test-tenant-001
```

### Important Files

```
render.env          - Render environment variables
vercel.env          - Vercel environment variables
DEPLOYMENT_GUIDE.md - Detailed deployment guide
```

---

## 🔧 Troubleshooting

### Backend won't start

- [ ] Check Render logs
- [ ] Verify DATABASE_URL is correct
- [ ] Ensure Supabase is active
- [ ] Check build command succeeded

### Frontend can't connect to backend

- [ ] Verify NEXT_PUBLIC_API_URL in Vercel
- [ ] Check CORS_ORIGINS in Render
- [ ] Ensure Render backend is running
- [ ] Clear browser cache

### Database connection fails

- [ ] Check Supabase project status
- [ ] Verify connection string
- [ ] Check connection_limit setting
- [ ] Try increasing pool_timeout

### CORS errors

- [ ] Verify Vercel URL in CORS_ORIGINS
- [ ] Redeploy Render after CORS update
- [ ] Check browser console for exact error
- [ ] Ensure HTTPS (not HTTP)

---

## 📊 Post-Deployment

### Immediate

- [ ] Monitor Render logs for errors
- [ ] Check Vercel analytics
- [ ] Test all critical features
- [ ] Verify email notifications work

### Short-term

- [ ] Set up monitoring alerts
- [ ] Configure automated backups
- [ ] Add custom domain
- [ ] Set up SSL certificates

### Long-term

- [ ] Performance optimization
- [ ] Scale resources as needed
- [ ] Implement caching (Redis)
- [ ] Set up CI/CD pipeline

---

## ✅ Deployment Complete!

Once all checkboxes are checked, your HMS SaaS application is live! 🎉

**Next Steps:**
1. Share URLs with team
2. Create user accounts
3. Import production data
4. Monitor performance
5. Gather user feedback

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
