# Fix CORS Error - Vercel to Render

## Error
```
Access to fetch at 'https://hma-saas-1.onrender.com/auth/login' 
from origin 'https://hma-saas-web.vercel.app' 
has been blocked by CORS policy
```

## Root Cause
Backend CORS configuration not allowing Vercel domain properly.

## Solution: Add Environment Variable in Render

### Step 1: Go to Render Dashboard

https://dashboard.render.com

### Step 2: Select Your Backend Service

Click on `hma-saas-1` (or your backend service name)

### Step 3: Go to Environment Tab

Left sidebar → "Environment"

### Step 4: Add CORS_ORIGINS Variable

Click "Add Environment Variable"

**Key:** `CORS_ORIGINS`

**Value:** 
```
https://hma-saas-web.vercel.app,http://localhost:3000,http://localhost:3001
```

### Step 5: Save Changes

Click "Save Changes"

### Step 6: Redeploy

Render will automatically redeploy with new environment variable.

Wait 2-3 minutes for deployment to complete.

---

## Alternative: Quick Fix (Allow All Origins - Temporary)

If you want to test immediately, temporarily allow all origins:

### Edit main.ts:

Change line 27-51 to:

```typescript
app.enableCors({
  origin: true, // Allow all origins (TEMPORARY - for testing only!)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Tenant-Id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 3600,
});
```

Then:
```bash
git add .
git commit -m "fix: Allow all CORS origins temporarily"
git push origin main
```

**WARNING:** This allows ALL origins. Use only for testing!

---

## Proper Fix (Recommended)

Keep the existing code but ensure Render has the environment variable.

### Current Code (Already Good):

```typescript
// Allow all Vercel domains
if (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com')) {
  return callback(null, true);
}
```

This should work! But Render might be caching old deployment.

---

## Debugging Steps

### 1. Check Render Logs

Look for:
```
CORS: Rejected origin - https://hma-saas-web.vercel.app
```

If you see this, CORS is rejecting.

### 2. Check Environment Variables

In Render dashboard → Environment tab:
- Check if `CORS_ORIGINS` is set
- Check if `NODE_ENV` is `production`

### 3. Test CORS Manually

Run in browser console:

```javascript
fetch('https://hma-saas-1.onrender.com/health', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://hma-saas-web.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type,Authorization'
  }
})
.then(r => {
  console.log('CORS Headers:', r.headers.get('Access-Control-Allow-Origin'));
  console.log('Status:', r.status);
})
.catch(e => console.error('CORS Error:', e));
```

---

## Quick Summary

**Option 1: Add Environment Variable (Recommended)**
1. Render Dashboard → Environment
2. Add `CORS_ORIGINS` = `https://hma-saas-web.vercel.app,http://localhost:3000`
3. Save & Wait for redeploy

**Option 2: Temporary Allow All**
1. Change `origin: true` in main.ts
2. Push to GitHub
3. Test

**Option 3: Check Existing Code**
Code already allows `.vercel.app` domains. Might be deployment cache issue.
Try manual redeploy in Render.

---

## After Fix

Test login again. Should work! ✅

If still not working, share:
1. Render environment variables screenshot
2. Render logs after login attempt
3. Browser console error
