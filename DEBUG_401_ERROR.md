# Debug 401 Error - Patient Create

## Current Status
- ✅ JWT Token has: HOSPITAL_ADMIN
- ✅ Token not expired: Oct 29, 2025 11:28 AM
- ❌ Still getting 401 and logout

## Debug Steps

### Step 1: Check Full Error in Browser Console

When you click "Create Patient", open browser console (F12) and look for:

```
API Response Error: { ... }
```

Run this to see full error:

```javascript
// Enable detailed error logging
localStorage.setItem('DEBUG', 'true');

// Then try creating patient and check console
```

### Step 2: Check JWT Payload Structure

Run this in console:

```javascript
const token = localStorage.getItem('accessToken');

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

const payload = parseJwt(token);
console.log('Full JWT Payload:', JSON.stringify(payload, null, 2));
```

**Look for:**
- `role` field name
- `userId` vs `id` vs `sub`
- `tenantId` field

### Step 3: Check Render Deployment Status

Go to: https://dashboard.render.com

Check:
1. Is latest commit deployed?
2. Commit hash: `32adc6b` (should match)
3. Deploy status: "Live" ✅

### Step 4: Check Render Logs

Look for when you try to create patient:

```
[HTTP] ➡️  POST /patients - ...
[HTTP] ⬅️  POST /patients 401 ... - ...ms
```

Or any error message.

### Step 5: Test with Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Click "Create Patient"
4. Find the POST request to `/patients`
5. Click on it
6. Check:
   - **Request Headers:** Authorization header present?
   - **Response:** What's the error message?
   - **Status Code:** 401 or 403?

## Possible Issues

### Issue 1: JWT Field Name Mismatch

Backend expects `user.role` but JWT has different field name.

**Check JWT payload for:**
```json
{
  "role": "HOSPITAL_ADMIN",      // ← This
  "userRole": "HOSPITAL_ADMIN",  // ← Or this?
  "roles": ["HOSPITAL_ADMIN"],   // ← Or this?
}
```

### Issue 2: Render Not Deployed

Backend code updated locally but not deployed to Render.

**Solution:** Check Render dashboard for deploy status.

### Issue 3: Different Guard Running

Maybe `JwtAuthGuard` is rejecting before `PermissionsGuard` runs.

**Check:** Render logs for exact error.

### Issue 4: TenantId Mismatch

JWT has different tenantId than database.

**Check JWT payload:**
```javascript
console.log('JWT tenantId:', payload.tenantId);
console.log('User tenantId:', JSON.parse(localStorage.getItem('user')).tenantId);
```

## Quick Tests

### Test 1: Check Backend Health

```javascript
fetch('https://hma-saas-1.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Backend health:', d));
```

### Test 2: Test Auth Endpoint

```javascript
const token = localStorage.getItem('accessToken');
fetch('https://hma-saas-1.onrender.com/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Profile response:', d))
  .catch(e => console.error('Profile error:', e));
```

### Test 3: Manual Patient Create API Call

```javascript
const token = localStorage.getItem('accessToken');
const testPatient = {
  firstName: "Test",
  lastName: "Patient",
  dateOfBirth: "1990-01-01",
  gender: "MALE",
  email: "test@test.com",
  phone: "1234567890",
  address: "Test Address"
};

fetch('https://hma-saas-1.onrender.com/patients', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testPatient)
})
  .then(r => r.json())
  .then(d => console.log('Create patient response:', d))
  .catch(e => console.error('Create patient error:', e));
```

## What to Share

Please share:

1. **Full JWT Payload** (from Step 2)
2. **Network tab response** (from Step 5)
3. **Render logs** (from Step 4)
4. **Any error messages** from browser console

This will help identify the exact issue!
