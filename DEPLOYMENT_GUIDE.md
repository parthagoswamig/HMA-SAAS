# HMS SaaS Deployment Guide

## 🚀 Production Deployment (Vercel + Supabase)

### Prerequisites
- Vercel account
- Supabase account (PostgreSQL database)
- GitHub repository

---

## 📋 Step-by-Step Deployment

### 1. Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Wait for database provisioning

2. **Get Database URL**
   - Go to Project Settings → Database
   - Copy the connection string (Direct Connection)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

3. **Run Migrations**
   ```bash
   # Set DATABASE_URL in apps/api/.env
   DATABASE_URL="postgresql://..."
   
   # Run migrations
   cd apps/api
   npx prisma migrate deploy
   ```

4. **Seed Permissions**
   ```bash
   npm run seed
   ```

---

### 2. Backend Deployment (Render/Railway/Vercel)

#### Option A: Deploy to Render (Recommended for NestJS)

1. **Create New Web Service**
   - Connect GitHub repository
   - Select `apps/api` as root directory
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

2. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   DEFAULT_TENANT_ID=default
   CORS_ORIGINS=https://your-frontend.vercel.app
   NODE_ENV=production
   PORT=3001
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the service URL (e.g., `https://hms-api.onrender.com`)

#### Option B: Deploy to Vercel

1. **Update vercel.json**
   - Already configured in `apps/api/vercel.json`

2. **Deploy**
   ```bash
   cd apps/api
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from above

---

### 3. Frontend Deployment (Vercel)

1. **Update Environment Variables**
   Create `apps/web/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   NEXT_PUBLIC_APP_ENV=production
   ```

2. **Deploy to Vercel**
   ```bash
   # From root directory
   vercel --prod
   ```

   Or use Vercel Dashboard:
   - Import GitHub repository
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm install && npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables in Vercel**
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_APP_ENV`: `production`

---

### 4. Update CORS Configuration

Update backend `.env` or Render environment variables:
```env
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
```

Update `apps/api/src/main.ts` Swagger configuration:
```typescript
.addServer('https://your-api.onrender.com', 'Production')
```

---

### 5. Post-Deployment Verification

1. **Test API Health**
   ```bash
   curl https://your-api.onrender.com/health
   ```

2. **Test Swagger Docs**
   - Visit: `https://your-api.onrender.com/docs`
   - Should see Swagger UI

3. **Test Authentication**
   - POST `/auth/register` with test user
   - POST `/auth/login` to get JWT token
   - Use token in Authorization header for protected routes

4. **Test Frontend**
   - Visit: `https://your-frontend.vercel.app`
   - Try login/register
   - Navigate through modules

---

## 🔒 Security Checklist

- ✅ JWT_SECRET is strong (min 32 characters)
- ✅ CORS_ORIGINS is restricted to your domains only
- ✅ DATABASE_URL uses SSL connection
- ✅ All environment variables are set in production
- ✅ Audit logging is enabled
- ✅ RBAC permissions are seeded
- ✅ Rate limiting is configured
- ✅ Input validation is enabled

---

## 🔧 Environment Variables Reference

### Backend (API)
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
DEFAULT_TENANT_ID=default

# CORS
CORS_ORIGINS=https://frontend1.vercel.app,https://frontend2.com

# Application
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### Frontend (Web)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api.onrender.com

# Application
NEXT_PUBLIC_APP_ENV=production
```

---

## 📊 Monitoring & Logs

### Backend Logs (Render)
- Go to your service dashboard
- Click "Logs" tab
- Monitor for errors

### Frontend Logs (Vercel)
- Go to project dashboard
- Click "Deployments" → Select deployment → "Functions"
- View function logs

### Database Monitoring (Supabase)
- Go to project dashboard
- Click "Database" → "Query Performance"
- Monitor slow queries

---

## 🔄 CI/CD Setup

### Automatic Deployments

1. **Connect GitHub to Vercel**
   - Vercel will auto-deploy on push to main branch

2. **Connect GitHub to Render**
   - Enable auto-deploy in service settings
   - Select branch (e.g., `main`)

### Manual Deployment Commands

```bash
# Deploy frontend
cd apps/web
vercel --prod

# Deploy backend (if using Vercel)
cd apps/api
vercel --prod

# Or push to GitHub for auto-deployment
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## 🐛 Troubleshooting

### Issue: Prisma Client not generated
**Solution:**
```bash
cd apps/api
npx prisma generate
```

### Issue: CORS errors
**Solution:**
- Check CORS_ORIGINS includes your frontend URL
- Ensure no trailing slashes in URLs

### Issue: Database connection fails
**Solution:**
- Verify DATABASE_URL is correct
- Check Supabase database is running
- Ensure SSL mode is configured

### Issue: JWT authentication fails
**Solution:**
- Verify JWT_SECRET is set
- Check token expiration settings
- Ensure Authorization header format: `Bearer <token>`

---

## 📈 Performance Optimization

1. **Enable Prisma Connection Pooling**
   ```typescript
   // In prisma.service.ts
   connection_limit=10
   ```

2. **Configure Vercel Edge Functions** (if needed)
   - Move static content to Edge
   - Use ISR for dynamic pages

3. **Database Indexing**
   - Already configured in Prisma schema
   - Monitor slow queries in Supabase

4. **Caching Strategy**
   - Implement Redis for session storage (optional)
   - Use Vercel Edge caching for static assets

---

## 🎯 Next Steps After Deployment

1. ✅ Set up custom domain
2. ✅ Configure SSL certificates (auto with Vercel)
3. ✅ Set up monitoring (Sentry, LogRocket)
4. ✅ Configure backup strategy for database
5. ✅ Set up staging environment
6. ✅ Create admin user accounts
7. ✅ Test all critical user flows
8. ✅ Set up error tracking
9. ✅ Configure email service (SendGrid, etc.)
10. ✅ Set up analytics (Google Analytics, Mixpanel)

---

## 📞 Support

For issues or questions:
- Check logs in Vercel/Render dashboard
- Review Swagger docs at `/docs`
- Check database connection in Supabase
- Verify all environment variables are set

**Production Ready!** 🚀
