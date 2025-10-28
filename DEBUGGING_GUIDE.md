# 🔍 HMS SaaS - Debugging Guide

## Problem 1: Dashboard shows 5 patients but Patient Management shows none

### Root Cause Analysis

The issue is likely due to one of these reasons:

1. **Different API Endpoints**
   - Dashboard: `GET /dashboard/stats` (returns count only)
   - Patient Management: `GET /patients` (returns full list)

2. **Tenant Isolation**
   - Dashboard might show aggregate data
   - Patient Management shows tenant-specific data

3. **Pagination**
   - Patient Management might have default pagination
   - Data exists but not on current page

### Debugging Steps

#### Step 1: Check Browser Console

1. Open browser (F12)
2. Go to Console tab
3. Check for errors when loading Patient Management page

#### Step 2: Check Network Tab

1. Open browser (F12)
2. Go to Network tab
3. Reload Patient Management page
4. Look for `/patients` API call
5. Check:
   - **Status Code:** Should be 200
   - **Response:** Check if `data.patients` array is empty
   - **Request Headers:** Check `Authorization` token
   - **Query Params:** Check pagination params

#### Step 3: Verify User & Tenant

Open browser console and run:

```javascript
// Check stored user data
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Tenant ID:', user?.tenantId);
console.log('User Role:', user?.role);

// Check token
const token = localStorage.getItem('accessToken');
console.log('Token exists:', !!token);
```

#### Step 4: Test API Directly

Open browser console and run:

```javascript
// Test patients API
const token = localStorage.getItem('accessToken');
fetch('https://hms-saas-staging.onrender.com/patients', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Patients API Response:', data))
.catch(err => console.error('API Error:', err));
```

#### Step 5: Check Backend Logs

Now with logging enabled, check Render logs:

1. Go to Render Dashboard
2. Select your backend service
3. Go to "Logs" tab
4. You should see:
   ```
   ➡️  GET /patients - IP - User-Agent
   ⬅️  GET /patients 200 1234b - 45ms
   ```

### Common Solutions

#### Solution 1: Clear Cache & Reload

```javascript
// Clear all local storage
localStorage.clear();
// Reload and login again
window.location.href = '/login';
```

#### Solution 2: Check Pagination

Patient Management might be using pagination. Check if data exists on other pages:

```javascript
// Test with different pagination
const token = localStorage.getItem('accessToken');
fetch('https://hms-saas-staging.onrender.com/patients?page=1&limit=100', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('All Patients:', data));
```

#### Solution 3: Verify Tenant Data

Check if patients belong to your tenant:

```javascript
// Check dashboard stats
const token = localStorage.getItem('accessToken');
fetch('https://hms-saas-staging.onrender.com/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Dashboard Stats:', data));
```

---

## Problem 2: No activity in Render logs

### Solution: Request Logging Enabled

I've added HTTP request logging middleware. After deploying, you'll see:

```
[HTTP] ➡️  GET /patients - 192.168.1.1 - Mozilla/5.0...
[HTTP] ⬅️  GET /patients 200 1234b - 45ms

[HTTP] ➡️  POST /auth/login - 192.168.1.1 - Mozilla/5.0...
[HTTP] ⬅️  POST /auth/login 200 567b - 123ms
```

### Log Levels

- **Green (LOG):** Successful requests (200-299)
- **Yellow (WARN):** Client errors (400-499)
- **Red (ERROR):** Server errors (500-599)

### What to Look For

1. **Request Method & URL:** `GET /patients`
2. **Status Code:** `200`, `401`, `404`, etc.
3. **Response Size:** `1234b`
4. **Duration:** `45ms`

---

## Deployment Steps

### 1. Commit Changes

```bash
git add .
git commit -m "feat: Add HTTP request logging middleware"
git push origin main
```

### 2. Verify Deployment

After Render deploys:

1. Check Render logs for startup message
2. Test API endpoints
3. Check for request logs

### 3. Test Patient Management

1. Login to your app
2. Go to Patient Management
3. Check browser console for errors
4. Check Render logs for API calls

---

## Expected Behavior

### Dashboard Stats
```json
{
  "success": true,
  "data": {
    "totalPatients": 5,
    "todaysAppointments": 2,
    "pendingBills": 3,
    "activeDoctors": 4
  }
}
```

### Patient Management
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid-1",
        "firstName": "John",
        "lastName": "Doe",
        ...
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

## Quick Fixes

### Fix 1: Refresh Token

If you're getting 401 errors:

```javascript
// Logout and login again
localStorage.clear();
window.location.href = '/login';
```

### Fix 2: Check Backend URL

Verify frontend is pointing to correct backend:

```javascript
// Check .env.local in frontend
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
// Should be: https://hms-saas-staging.onrender.com
```

### Fix 3: Verify Database

Check if data exists in Supabase:

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run:
```sql
SELECT COUNT(*) FROM "Patient";
SELECT * FROM "Patient" LIMIT 5;
```

---

## Contact Points

- **Frontend:** Vercel (https://your-app.vercel.app)
- **Backend:** Render (https://hms-saas-staging.onrender.com)
- **Database:** Supabase

## Health Checks

- Backend Health: `https://hms-saas-staging.onrender.com/health`
- Backend Root: `https://hms-saas-staging.onrender.com/`
