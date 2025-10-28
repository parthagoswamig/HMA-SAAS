# Debug: Patient Create Logout Issue

## Problem
When clicking "Create Patient" button, user gets logged out automatically.

## Root Cause
401 Unauthorized error → Token refresh fails → Auto logout

## Possible Reasons

### 1. Token Expired
- Access token expired
- Refresh token also expired
- Need to login again

### 2. Role Not in JWT Token
- Database has HOSPITAL_ADMIN
- But JWT token still has old role (SUPER_ADMIN)
- Backend rejects request

### 3. Permission Check Failing
- HOSPITAL_ADMIN bypass not working
- Permission guard still checking TenantRole

## Debugging Steps

### Step 1: Check Browser Console (F12)

Look for these logs when clicking "Create Patient":

```
✅ Token attached to request
API Request: POST /patients
❌ API Response Error: 401 Unauthorized
```

### Step 2: Check Token Payload

Run this in browser console:

```javascript
// Get current token
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode JWT (without verification)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const payload = parseJwt(token);
console.log('Token Payload:', payload);
console.log('Role in token:', payload?.role);
console.log('Token expires:', new Date(payload?.exp * 1000));
```

### Step 3: Check Render Logs

Look for this in Render logs:

```
[HTTP] ➡️  POST /patients - ...
[HTTP] ⬅️  POST /patients 401 ... - ...ms
```

Or:

```
[HTTP] ⬅️  POST /patients 403 ... - ...ms
Error: User has no role assigned
```

## Solutions

### Solution 1: Logout & Login Again (Recommended)

The JWT token still has old role. Need fresh token:

1. Logout from app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again with subha1to100@gmail.com
4. Try creating patient again

**Why:** New login will generate JWT with HOSPITAL_ADMIN role

### Solution 2: Check Token Expiry

If token expired:

```javascript
// Check if token expired
const token = localStorage.getItem('accessToken');
const payload = parseJwt(token);
const expiryDate = new Date(payload?.exp * 1000);
const now = new Date();

console.log('Token expires:', expiryDate);
console.log('Current time:', now);
console.log('Is expired:', now > expiryDate);
```

If expired, just logout and login again.

### Solution 3: Check Refresh Token

```javascript
// Check refresh token
const refreshToken = localStorage.getItem('refreshToken');
console.log('Has refresh token:', !!refreshToken);

// Try manual refresh
fetch('https://hma-saas-1.onrender.com/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
})
.then(res => res.json())
.then(data => console.log('Refresh result:', data))
.catch(err => console.error('Refresh failed:', err));
```

## Quick Fix

### IMMEDIATE ACTION:

1. **Logout** from your app
2. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   ```
3. **Login again** with `subha1to100@gmail.com`
4. **Try creating patient**

This will:
- ✅ Generate new JWT with HOSPITAL_ADMIN role
- ✅ Fresh access & refresh tokens
- ✅ Proper role in token payload

## Expected After Fix

### Browser Console:
```
✅ Token attached to request
API Request: POST /patients { firstName: "...", ... }
API Response: { success: true, data: { id: "...", ... } }
✅ Patient Registered Successfully!
```

### Render Logs:
```
[HTTP] ➡️  POST /patients - ...
[HTTP] ⬅️  POST /patients 201 567b - 123ms  ✅
```

### UI:
```
✅ Patient created
✅ Modal closes
✅ Patient appears in list
✅ No logout!
```

## Prevention

To avoid this in future:

1. **Token expiry** is normal - just login again when needed
2. **After role changes** in database, always logout & login
3. **Refresh token** should auto-refresh, but if it fails, manual login needed

## Technical Details

### Why Logout Happens:

```typescript
// api-client.ts Line 90-96
catch (refreshError) {
  // Refresh failed, logout user
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';  // ← This causes logout
}
```

### JWT Token Structure:

```json
{
  "userId": "cmh0dcsbt0002et080urkqzip",
  "email": "subha1to100@gmail.com",
  "role": "HOSPITAL_ADMIN",  // ← This must match database
  "tenantId": "cmh0dcq060000et08uys6zwgv",
  "iat": 1234567890,
  "exp": 1234567890  // ← Token expiry time
}
```

## Summary

**Most Likely Cause:** JWT token has old role or expired

**Quick Fix:** Logout → Clear cache → Login → Try again

**Why It Works:** New login generates fresh JWT with correct HOSPITAL_ADMIN role
