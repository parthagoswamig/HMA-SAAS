# Deploy CORS Fix

## Changes Made

Updated `apps/api/src/main.ts`:
- Added Vercel domain to default CORS origins
- Added logging to see which origins are configured

## Deploy Commands

Run these commands:

```bash
git add .
git commit -m "fix: Add Vercel domain to default CORS origins and add logging"
git push origin main
```

## Wait for Render Deploy

1. Go to https://dashboard.render.com
2. Wait for deployment to complete (2-3 minutes)
3. Check logs for: `🌐 CORS Origins: ...`

## After Deploy

Try logging in again from Vercel app.

## Expected Render Logs

You should see:
```
🌐 CORS Origins: http://localhost:3000, http://localhost:3001, https://hma-saas-web.vercel.app
```

## If Still Not Working

The code already has this (line 37-39 in main.ts):

```typescript
// Allow all Vercel domains
if (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com')) {
  return callback(null, true);
}
```

This should allow ANY Vercel domain including yours.

If still failing, it means:
1. Old code is still deployed
2. OR Render is caching
3. OR different issue

## Alternative: Manual Redeploy

In Render dashboard:
1. Click on your service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment

## Test After Deploy

From Vercel app, try login. Should work! ✅
