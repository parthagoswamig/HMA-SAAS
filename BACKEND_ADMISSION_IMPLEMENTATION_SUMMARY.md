# IPD Backend - Admission Management Implementation

## ✅ Completed Steps:

### 1. Created Admission DTOs ✅
**File:** `apps/api/src/ipd/dto/admission.dto.ts`

**Enums:**
- `AdmissionType`: ELECTIVE, EMERGENCY, TRANSFER
- `AdmissionStatus`: ADMITTED, CRITICAL, STABLE, DISCHARGED, TRANSFERRED

**DTOs:**
- `CreateAdmissionDto` - For creating new admissions
- `UpdateAdmissionDto` - For updating admission details
- `DischargePatientDto` - For discharging patients
- `AdmissionFilterDto` - For filtering admissions list

### 2. Updated DTO Index ✅
**File:** `apps/api/src/ipd/dto/index.ts`
- Exported all admission DTOs

### 3. Updated Controller ✅
**File:** `apps/api/src/ipd/ipd.controller.ts`

**New Endpoints Added:**
1. `POST /ipd/admissions` - Create admission
2. `GET /ipd/admissions` - Get all admissions (with filters)
3. `GET /ipd/admissions/:id` - Get admission by ID
4. `PATCH /ipd/admissions/:id` - Update admission
5. `POST /ipd/admissions/:id/discharge` - Discharge patient
6. `DELETE /ipd/admissions/:id` - Cancel admission

**Features:**
- JWT authentication
- RBAC permissions
- Swagger documentation
- Tenant isolation
- Proper HTTP status codes

---

## ⏳ Next Steps (Service Implementation):

### Need to Add to `ipd.service.ts`:

```typescript
// 1. Create Admission
async createAdmission(createDto: CreateAdmissionDto, tenantId: string) {
  // Verify patient exists
  // Verify ward exists
  // Verify bed exists and is AVAILABLE
  // Create admission record
  // Update bed status to OCCUPIED
  // Return admission with relations
}

// 2. Find All Admissions
async findAllAdmissions(tenantId: string, filters: AdmissionFilterDto) {
  // Build where clause with filters
  // Pagination
  // Include patient, ward, bed, doctor relations
  // Return paginated list
}

// 3. Find One Admission
async findOneAdmission(id: string, tenantId: string) {
  // Find admission by ID
  // Include all relations
  // Return admission or throw NotFoundException
}

// 4. Update Admission
async updateAdmission(id: string, updateDto: UpdateAdmissionDto, tenantId: string) {
  // Find admission
  // Update fields
  // Return updated admission
}

// 5. Discharge Patient
async dischargePatient(id: string, dischargeDto: DischargePatientDto, tenantId: string) {
  // Find admission
  // Update status to DISCHARGED
  // Add discharge summary and follow-up
  // Update bed status to AVAILABLE
  // Return discharged admission
}

// 6. Cancel Admission
async cancelAdmission(id: string, tenantId: string) {
  // Find admission
  // Update bed status to AVAILABLE
  // Delete or mark admission as cancelled
  // Return success
}
```

---

## Database Schema Needed:

Since we're using the existing `Appointment` model for admissions, the mapping will be:

```prisma
model Appointment {
  id                String   @id @default(uuid())
  patientId         String   // Patient being admitted
  doctorId          String   // Primary doctor
  departmentId      String?  // Ward ID (using department field)
  startTime         DateTime // Admission date
  endTime           DateTime // Expected discharge date
  status            String   // Admission status
  reason            String   // Diagnosis
  notes             String?  // Additional notes
  tenantId          String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  patient           Patient  @relation(...)
  doctor            Staff    @relation(...)
  department        Department? @relation(...)
}
```

**Note:** We're reusing the Appointment model for IPD admissions. The `departmentId` field will store the `wardId`.

---

## Frontend Integration Ready:

The frontend is already prepared with:
- Admission form modal ✅
- Edit patient modal ✅
- Discharge modal ✅
- All handlers ready ✅
- Validation ready ✅

Once service methods are implemented, frontend will work immediately!

---

## Status:

**Controller:** ✅ 100% Complete (6 endpoints)  
**DTOs:** ✅ 100% Complete (4 DTOs + 2 enums)  
**Service:** ⏳ Pending (6 methods to implement)  
**Database:** ✅ Ready (using existing Appointment model)

**Next:** Implement service methods in `ipd.service.ts`
