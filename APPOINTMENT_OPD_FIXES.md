# Appointment & OPD Module Fixes

## 🐛 Root Cause

Both Appointment and OPD modules had **two critical issues**:

### Issue 1: UUID Validation on cuid2 IDs
- **Problem:** DTOs were using `@IsUUID()` validation
- **Reality:** Database uses `cuid2` format IDs (e.g., `cmhgbr0ff0003jv1w9zpyz2w9`)
- **Result:** 400 Bad Request errors

### Issue 2: Wrong ID Type (Staff ID vs User ID)
- **Problem:** Frontend was sending `Staff.id` for `doctorId`
- **Reality:** `Appointment.doctorId` references `User` table, not `Staff` table
- **Result:** Foreign key constraint violation (500 error)

---

## ✅ Files Fixed

### Backend (API)

1. **apps/api/src/appointments/dto/appointment.dto.ts**
   - Removed `@IsUUID()` validation from:
     - `CreateAppointmentDto`: patientId, doctorId, departmentId
     - `UpdateAppointmentDto`: patientId, doctorId, departmentId
     - `AppointmentQueryDto`: doctorId, patientId
     - `CheckAvailabilityDto`: doctorId
   - Changed to `@IsString()` validation

2. **apps/api/src/opd/dto/opd.dto.ts**
   - Removed `@IsUUID()` validation from:
     - `CreateOpdVisitDto`: patientId, doctorId, departmentId
     - `UpdateOpdVisitDto`: doctorId, departmentId
     - `OpdVisitFilterDto`: doctorId, departmentId, patientId
     - `OpdQueueFilterDto`: doctorId, departmentId
   - Changed to `@IsString()` validation

### Frontend (Web)

3. **apps/web/src/app/dashboard/appointments/page.tsx**
   - Fixed doctor dropdown mapping (3 places):
     ```typescript
     // Before
     value: doc.id  // ❌ Staff ID
     
     // After
     value: doc.user?.id || doc.userId || doc.id  // ✅ User ID
     ```

4. **apps/web/src/components/opd/OpdVisitForm.tsx**
   - Fixed doctor dropdown mapping:
     ```typescript
     // Before
     value: d.id  // ❌ Staff ID
     
     // After
     value: d.user?.id || d.userId || d.id  // ✅ User ID
     ```

5. **apps/web/src/app/dashboard/patients/page.tsx**
   - Fixed authentication check:
     ```typescript
     // Before
     if (!user) { window.location.href = '/login'; }  // ❌ user object was null
     
     // After
     const token = localStorage.getItem('accessToken');
     if (!token) { window.location.href = '/login'; }  // ✅ Check actual token
     ```

6. **apps/web/src/lib/api-client.ts**
   - Added proper 403 error handling (don't redirect to login)
   - Improved error logging

---

## 📊 Database Schema Reference

```prisma
model Appointment {
  id           String
  patientId    String
  doctorId     String  // ⚠️ References User.id, NOT Staff.id
  
  patient      Patient  @relation(fields: [patientId], references: [id])
  doctor       User     @relation("DoctorAppointments", fields: [doctorId], references: [id])
}

model Staff {
  id       String
  userId   String  // ⚠️ This is what links to User
  user     User    @relation("UserStaff", fields: [userId], references: [id])
}
```

**Key Insight:** 
- `Appointment.doctorId` → `User.id`
- `Staff.userId` → `User.id`
- Frontend must send `Staff.user.id` or `Staff.userId`, NOT `Staff.id`

---

## 🎯 Testing

After deploying these fixes:

1. **Appointments Module:**
   - ✅ Create appointment
   - ✅ Update appointment
   - ✅ Filter by doctor
   - ✅ Check availability

2. **OPD Module:**
   - ✅ Create OPD visit
   - ✅ Update visit
   - ✅ Filter by doctor/department
   - ✅ View queue

3. **Patients Module:**
   - ✅ Create patient (no redirect to login)

---

## 🚀 Deployment Steps

1. **Commit backend changes:**
   ```bash
   git add apps/api/src/appointments/dto/appointment.dto.ts
   git add apps/api/src/opd/dto/opd.dto.ts
   git commit -m "Fix UUID validation for cuid2 IDs in appointments and OPD"
   git push
   ```

2. **Commit frontend changes:**
   ```bash
   git add apps/web/src/app/dashboard/appointments/page.tsx
   git add apps/web/src/components/opd/OpdVisitForm.tsx
   git add apps/web/src/app/dashboard/patients/page.tsx
   git add apps/web/src/lib/api-client.ts
   git commit -m "Fix doctor ID mapping to use User ID instead of Staff ID"
   git push
   ```

3. **Wait for deployment:**
   - Render (backend): 2-3 minutes
   - Vercel (frontend): 2-3 minutes

4. **Test:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Test appointment creation
   - Test OPD visit creation

---

## 📝 Lessons Learned

1. **Always check Prisma schema** for foreign key relationships
2. **UUID validation** should only be used for actual UUID format
3. **cuid2 IDs** need `@IsString()` validation
4. **Staff vs User** - understand the relationship between tables
5. **Frontend ID mapping** - always use the correct ID type for foreign keys

---

## ✅ Status

- [x] Backend validation fixed
- [x] Frontend ID mapping fixed
- [x] Patient form redirect fixed
- [x] Error handling improved
- [ ] Deploy and test (user's responsibility)
