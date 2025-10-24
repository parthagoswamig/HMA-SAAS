# Patient Update Fix - Validation Error Resolution

## 🐛 Problem

**Error**: `{ message: ["property id should not exist"], error: "Bad Request", statusCode: 400 }`

**Cause**: Frontend sends `id` in the request body during patient updates:
```json
PATCH /api/patients/uuid-123
Body: {
  "id": "uuid-123",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

The `UpdatePatientDto` didn't allow `id` field, causing validation to fail.

---

## ✅ Solution Applied

### **1. Updated `UpdatePatientDto`**
**File**: `apps/api/src/patients/dto/update-patient.dto.ts`

**Change**:
```typescript
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  @IsString()
  id?: string; // Allow id in body (will be ignored, URL param is used)
}
```

**Why**: Allows the DTO to accept `id` field without validation error.

---

### **2. Updated Service to Strip `id` from Body**
**File**: `apps/api/src/patients/patients.service.ts` (lines 362-370)

**Change**:
```typescript
async update(id: string, updatePatientDto: UpdatePatientDto, tenantId: string) {
  try {
    // Remove id from body if present (URL param is authoritative)
    const { id: _bodyId, ...updateData } = updatePatientDto;
    
    const data = {
      ...updateData,
      dateOfBirth: updateData.dateOfBirth
        ? new Date(updateData.dateOfBirth)
        : undefined,
    };
    
    // ... rest of update logic
  }
}
```

**Why**: Ensures the `id` from URL parameter is always used, not the body. This prevents any potential security issues where someone could try to update a different patient by changing the body `id`.

---

## 🔒 Security

- **URL param is authoritative**: The `id` from the route (`/patients/:id`) is always used
- **Body `id` is ignored**: Even if sent, it's stripped before the database update
- **Tenant isolation maintained**: Still checks `tenantId` in WHERE clause

---

## 🎯 Result

**Before**:
```
PATCH /patients/uuid-123
Body: { id: "uuid-123", firstName: "John" }
Response: 400 Bad Request - "property id should not exist"
```

**After**:
```
PATCH /patients/uuid-123
Body: { id: "uuid-123", firstName: "John" }
Response: 200 OK - Patient updated successfully
```

---

## 📝 Files Modified

1. `apps/api/src/patients/dto/update-patient.dto.ts` - Added optional `id` field
2. `apps/api/src/patients/patients.service.ts` - Strip `id` from body before update

---

## ✅ Testing

Test the update flow:

```bash
# Should now work without validation error
curl -X PATCH http://localhost:3001/api/patients/uuid-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-123",
    "firstName": "John Updated",
    "lastName": "Doe"
  }'
```

Expected: `200 OK` with updated patient data

---

## 🎉 Summary

- ✅ Validation error fixed
- ✅ Frontend can send `id` in body without issues
- ✅ Security maintained (URL param is authoritative)
- ✅ No breaking changes to other parts of the system
- ✅ Minimal code changes (only 2 files)
