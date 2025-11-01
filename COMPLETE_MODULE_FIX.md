# 🔧 Complete Module Fix - All Forms Redirect to Login

## 🐛 The Problem

**Symptom:** When you submit ANY form (create patient, OPD visit, etc.), it redirects to login page.

**From your logs:**
```
POST /opd/visits 400 247b - 18ms
POST /opd/visits 400 247b - 20ms
```

The backend returns **400 Bad Request**, but frontend redirects to login.

---

## 🔍 Root Causes (Multiple Issues)

### Issue 1: Backend Validation Errors
The backend DTO validation is **too strict**:
- Requires exact UUID format
- Requires all fields
- Returns 400 error for any validation failure

### Issue 2: Frontend Not Handling 400 Errors
When backend returns 400, frontend might:
- Not catch the error properly
- Token might actually be expiring
- Error response format mismatch

### Issue 3: Token Expiration
Your JWT tokens might be expiring too quickly.

---

## ✅ COMPLETE FIX

### Fix 1: Relax Backend Validation

**File:** `apps/api/src/main.ts`

Find the ValidationPipe configuration and update it:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,  // ← Change to false
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    skipMissingProperties: false,
    skipNullProperties: false,
    skipUndefinedProperties: false,
  }),
);
```

### Fix 2: Add Better Error Logging

**File:** `apps/api/src/opd/opd.service.ts`

Update the `createVisit` method:

```typescript
async createVisit(createDto: CreateOpdVisitDto, tenantId: string) {
  try {
    this.logger.log(`Creating OPD visit for tenant: ${tenantId}`);
    this.logger.log(`DTO received:`, JSON.stringify(createDto, null, 2));
    
    // Validate patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: createDto.patientId, tenantId },
    });
    
    if (!patient) {
      this.logger.error(`Patient not found: ${createDto.patientId}`);
      throw new BadRequestException('Patient not found');
    }
    
    // Validate doctor exists
    const doctor = await this.prisma.staff.findFirst({
      where: { id: createDto.doctorId, tenantId },
    });
    
    if (!doctor) {
      this.logger.error(`Doctor not found: ${createDto.doctorId}`);
      throw new BadRequestException('Doctor not found');
    }
    
    // Rest of your code...
    
  } catch (error) {
    this.logger.error('Error creating OPD visit:', error.message, error.stack);
    throw error;
  }
}
```

### Fix 3: Fix Frontend API Client

**File:** `apps/web/src/lib/api-client.ts`

Update error handling to NOT redirect on 400 errors:

```typescript
// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 Unauthorized (NOT 400 Bad Request!)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Only redirect on refresh failure
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For 400, 403, 404, 500 etc - DON'T redirect, just reject
    return Promise.reject(error);
  }
);
```

### Fix 4: Increase Token Expiration

**File:** `apps/api/src/auth/auth.service.ts`

```typescript
async login(loginDto: LoginDto) {
  // ... existing code ...
  
  const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
  
  return {
    accessToken: this.jwtService.sign(payload, {
      expiresIn: '24h',  // ← Increase from 1h to 24h
    }),
    refreshToken: this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    }),
    user: { ... },
  };
}
```

---

## 🚀 Quick Deploy Fix

### Step 1: Check Current Backend Logs

The logs show `400 247b` - this means backend is returning a 247-byte error message.

Let's see what that message is:

```bash
# In Render dashboard, look for the actual error message
# It should show what validation failed
```

### Step 2: Temporary Workaround

Add this to `apps/api/src/opd/opd.controller.ts`:

```typescript
@Post('visits')
@RequirePermissions('opd.create', 'OPD_CREATE')
@HttpCode(HttpStatus.CREATED)
async createVisit(
  @Body() createOpdVisitDto: CreateOpdVisitDto,
  @TenantId() tenantId: string,
) {
  try {
    // Log everything for debugging
    console.log('=== OPD Visit Creation ===');
    console.log('Tenant ID:', tenantId);
    console.log('DTO:', JSON.stringify(createOpdVisitDto, null, 2));
    
    const result = await this.opdService.createVisit(createOpdVisitDto, tenantId);
    
    console.log('Success!', result);
    return result;
  } catch (error) {
    console.error('=== OPD Visit Creation FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}
```

### Step 3: Deploy and Test

```bash
git add apps/api/src/opd/opd.controller.ts
git commit -m "debug: Add detailed logging for OPD visit creation"
git push origin main

# Wait 5-10 minutes for deployment
# Then try creating OPD visit again
# Check Render logs to see exact error
```

---

## 🎯 Most Likely Issue

Based on the logs showing `400 247b`, the backend is returning a validation error like:

```json
{
  "statusCode": 400,
  "message": [
    "patientId must be a UUID",
    "doctorId must be a UUID",
    "chiefComplaint should not be empty"
  ],
  "error": "Bad Request"
}
```

This happens when:
1. Frontend sends wrong data format
2. Backend validation is too strict
3. DTO doesn't match what frontend sends

---

## 💡 IMMEDIATE ACTION

Run this to see the exact error:

```bash
# Open browser console (F12)
# Try to create OPD visit
# Look at Network tab
# Find the POST /opd/visits request
# Check the Response tab
# Copy the error message here
```

Then I can give you the exact fix!

---

## 📝 Summary

**The issue is NOT:**
- ❌ Frontend pages
- ❌ Authentication system
- ❌ Permissions

**The issue IS:**
- ✅ Backend validation rejecting form data
- ✅ Frontend not showing the validation error
- ✅ Possibly token expiring during form fill

**Next Step:**
1. Check browser console for actual error
2. Or check Render logs for validation details
3. Then I'll fix the exact validation issue
