# 📚 Appointment Module - API Reference

## 🔗 **API Endpoints**

### **Base URL**: `http://localhost:3001/api`

---

## **1. Get All Appointments**

### **GET** `/appointments`

**Description**: Retrieve paginated list of appointments with filters

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by patient/doctor name |
| status | string | No | Filter by status (SCHEDULED, CONFIRMED, etc.) |
| doctorId | string | No | Filter by doctor ID |
| patientId | string | No | Filter by patient ID |
| startDate | string | No | Filter by start date (ISO 8601) |
| endDate | string | No | Filter by end date (ISO 8601) |

**Example Request**:
```bash
GET /appointments?page=1&limit=10&status=SCHEDULED&doctorId=abc123
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "apt_123",
      "patientId": "pat_456",
      "doctorId": "doc_789",
      "departmentId": "dept_012",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T10:30:00Z",
      "status": "SCHEDULED",
      "reason": "Regular checkup",
      "notes": "Patient requested morning slot",
      "patient": {
        "id": "pat_456",
        "firstName": "John",
        "lastName": "Doe",
        "medicalRecordNumber": "MRN001",
        "phone": "+1234567890",
        "email": "john@example.com"
      },
      "doctor": {
        "id": "doc_789",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "department": {
        "id": "dept_012",
        "name": "Cardiology"
      },
      "tenantId": "tenant_345",
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-01-10T08:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## **2. Get Single Appointment**

### **GET** `/appointments/:id`

**Description**: Retrieve single appointment by ID

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Appointment ID |

**Example Request**:
```bash
GET /appointments/apt_123
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "apt_123",
    "patientId": "pat_456",
    "doctorId": "doc_789",
    "departmentId": "dept_012",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T10:30:00Z",
    "status": "SCHEDULED",
    "reason": "Regular checkup",
    "notes": "Patient requested morning slot",
    "patient": { /* ... */ },
    "doctor": { /* ... */ },
    "department": { /* ... */ },
    "tenantId": "tenant_345",
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-10T08:00:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Appointment with ID apt_123 not found",
  "error": "Not Found"
}
```

---

## **3. Create Appointment**

### **POST** `/appointments`

**Description**: Create new appointment with availability checking

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "patientId": "pat_456",
  "doctorId": "doc_789",
  "departmentId": "dept_012",
  "appointmentDateTime": "2024-01-15T10:00:00Z",
  "reason": "Regular checkup",
  "notes": "Patient requested morning slot",
  "status": "SCHEDULED"
}
```

**Field Validation**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| patientId | string | Yes | Must be valid UUID |
| doctorId | string | Yes | Must be valid UUID |
| departmentId | string | No | Must be valid UUID if provided |
| appointmentDateTime | string | Yes | Must be valid ISO 8601 date |
| reason | string | No | Max 500 characters |
| notes | string | No | Max 1000 characters |
| status | string | No | Must be valid AppointmentStatus enum |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "apt_123",
    "patientId": "pat_456",
    "doctorId": "doc_789",
    "departmentId": "dept_012",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T10:30:00Z",
    "status": "SCHEDULED",
    "reason": "Regular checkup",
    "notes": "Patient requested morning slot",
    "patient": { /* ... */ },
    "doctor": { /* ... */ },
    "department": { /* ... */ },
    "tenantId": "tenant_345",
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-10T08:00:00Z"
  }
}
```

**Error Response** (400 Bad Request - Slot Not Available):
```json
{
  "statusCode": 400,
  "message": "This time slot is not available for the selected doctor",
  "error": "Bad Request"
}
```

**Error Response** (400 Bad Request - Validation):
```json
{
  "statusCode": 400,
  "message": [
    "patientId must be a UUID",
    "appointmentDateTime must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

---

## **4. Update Appointment**

### **PATCH** `/appointments/:id`

**Description**: Update existing appointment with availability checking

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Appointment ID |

**Request Body** (all fields optional):
```json
{
  "patientId": "pat_456",
  "doctorId": "doc_789",
  "departmentId": "dept_012",
  "appointmentDateTime": "2024-01-15T11:00:00Z",
  "reason": "Follow-up visit",
  "notes": "Updated notes",
  "status": "CONFIRMED"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "id": "apt_123",
    /* ... updated appointment data ... */
  }
}
```

**Error Response** (400 Bad Request - Slot Not Available):
```json
{
  "statusCode": 400,
  "message": "This time slot is not available for the selected doctor",
  "error": "Bad Request"
}
```

---

## **5. Update Appointment Status**

### **PATCH** `/appointments/:id/status`

**Description**: Quick status update without full appointment update

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Appointment ID |

**Request Body**:
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Values**:
- `SCHEDULED`
- `CONFIRMED`
- `ARRIVED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`
- `RESCHEDULED`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "id": "apt_123",
    "status": "CONFIRMED",
    /* ... rest of appointment data ... */
  }
}
```

---

## **6. Cancel Appointment (Soft Delete)**

### **DELETE** `/appointments/:id`

**Description**: Cancel appointment (marks as CANCELLED, doesn't delete)

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Appointment ID |

**Example Request**:
```bash
DELETE /appointments/apt_123
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "apt_123",
    "status": "CANCELLED",
    /* ... rest of appointment data ... */
  }
}
```

---

## **7. Get Appointment Stats**

### **GET** `/appointments/stats`

**Description**: Get appointment statistics for current tenant

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response** (200 OK):
```json
{
  "total": 150,
  "today": 12,
  "pending": 45,
  "completed": 80
}
```

---

## **8. Check Doctor Availability**

### **GET** `/appointments/availability`

**Description**: Get available time slots for a doctor on specific date

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| doctorId | string | Yes | Doctor ID (UUID) |
| date | string | Yes | Date in YYYY-MM-DD format |

**Example Request**:
```bash
GET /appointments/availability?doctorId=doc_789&date=2024-01-15
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    { "time": "09:00", "available": true },
    { "time": "09:30", "available": true },
    { "time": "10:00", "available": false },
    { "time": "10:30", "available": true },
    { "time": "11:00", "available": true },
    /* ... more slots ... */
    { "time": "16:30", "available": true }
  ]
}
```

---

## **9. Get Calendar View**

### **GET** `/appointments/calendar`

**Description**: Get appointments for calendar view within date range

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (ISO 8601) |
| endDate | string | Yes | End date (ISO 8601) |

**Example Request**:
```bash
GET /appointments/calendar?startDate=2024-01-01&endDate=2024-01-31
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "apt_123",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T10:30:00Z",
      "patient": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "doctor": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
    /* ... more appointments ... */
  ]
}
```

---

## 🔐 **Authentication**

All endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The JWT token includes:
- `userId`: User ID
- `tenantId`: Tenant ID (for multi-tenancy)
- `role`: User role
- `permissions`: User permissions (if RBAC enabled)

---

## 🏢 **Tenant Isolation**

All queries automatically filter by `tenantId` from JWT token. Users can only:
- View appointments in their tenant
- Create appointments in their tenant
- Update appointments in their tenant
- Delete appointments in their tenant

Cross-tenant access is **not possible**.

---

## ⚠️ **Error Codes**

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., slot not available) |
| 500 | Internal Server Error |

---

## 📝 **Example Usage (JavaScript)**

### **Create Appointment**:
```javascript
const createAppointment = async (data) => {
  const response = await fetch('http://localhost:3001/api/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patientId: 'pat_456',
      doctorId: 'doc_789',
      departmentId: 'dept_012',
      appointmentDateTime: '2024-01-15T10:00:00Z',
      reason: 'Regular checkup',
      notes: 'Patient requested morning slot',
      status: 'SCHEDULED',
    }),
  });
  
  const result = await response.json();
  return result;
};
```

### **Update Status**:
```javascript
const updateStatus = async (appointmentId, newStatus) => {
  const response = await fetch(
    `http://localhost:3001/api/appointments/${appointmentId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    }
  );
  
  const result = await response.json();
  return result;
};
```

### **Check Availability**:
```javascript
const checkAvailability = async (doctorId, date) => {
  const response = await fetch(
    `http://localhost:3001/api/appointments/availability?doctorId=${doctorId}&date=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  const result = await response.json();
  return result;
};
```

---

## 🔧 **Rate Limiting**

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user

---

## 📚 **Additional Resources**

- **Swagger Documentation**: `http://localhost:3001/api/docs`
- **Postman Collection**: Available in `/docs/postman`
- **Frontend Service**: `apps/web/src/services/appointments.service.ts`

---

## ✅ **API Status**

All endpoints are **production-ready** and fully tested.

**Last Updated**: October 24, 2025
