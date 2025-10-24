# Appointment Module - Complete Flow Trace

## Module Structure

### Frontend:
- `apps/web/src/app/dashboard/appointments/page.tsx` - Main page
- `apps/web/src/services/appointments.service.ts` - API calls

### Backend:
- `apps/api/src/appointments/appointments.controller.ts` - REST endpoints
- `apps/api/src/appointments/appointments.service.ts` - Business logic

### Database:
- `appointments` table in PostgreSQL (Supabase)

---

## 1. CREATE APPOINTMENT

### Frontend:
```
User clicks "New Appointment" → Form opens →
User fills: patientId, doctorId, appointmentDateTime, reason, notes →
appointmentsService.createAppointment(data)
```

### API Call:
```
POST /api/appointments
Body: { patientId, doctorId, appointmentDateTime, reason, notes, status }
```

### Backend:
```
AppointmentsController.create() →
AppointmentsService.create() →
1. Parse datetime (startTime, endTime = startTime + 30 mins)
2. Check if slot available (query existing appointments)
3. prisma.appointment.create()
```

### Database:
```sql
INSERT INTO appointments (id, patientId, doctorId, startTime, endTime, status, reason, notes, tenantId)
VALUES (uuid, 'patient-id', 'doctor-id', '2025-10-25 10:00', '2025-10-25 10:30', 'SCHEDULED', 'Checkup', 'Notes', 'T001');
```

---

## 2. READ APPOINTMENTS

### Frontend:
```
Page loads → fetchAppointments() →
appointmentsService.getAppointments({ page, limit, status, doctorId })
```

### API Call:
```
GET /api/appointments?page=1&limit=10&status=SCHEDULED
```

### Backend:
```
AppointmentsController.findAll() →
AppointmentsService.findAll() →
Build WHERE clause → prisma.appointment.findMany() with includes
```

### Database:
```sql
SELECT a.*, p.firstName, d.firstName FROM appointments a
LEFT JOIN patients p ON a.patientId = p.id
LEFT JOIN users d ON a.doctorId = d.id
WHERE a.tenantId = 'T001' AND a.status = 'SCHEDULED'
ORDER BY a.startTime ASC LIMIT 10 OFFSET 0;
```

---

## 3. UPDATE APPOINTMENT

### Frontend:
```
User clicks Edit → Modal with data → User modifies →
appointmentsService.updateAppointment(id, data)
```

### API Call:
```
PATCH /api/appointments/:id
Body: { appointmentDateTime, reason, notes, status }
```

### Backend:
```
AppointmentsController.update() →
AppointmentsService.update() →
Check new slot availability → prisma.appointment.update()
```

### Database:
```sql
UPDATE appointments SET startTime = '...', endTime = '...', reason = '...', updatedAt = NOW()
WHERE id = 'uuid' AND tenantId = 'T001';
```

---

## 4. UPDATE STATUS

### Frontend:
```
User changes status dropdown →
appointmentsService.updateAppointmentStatus(id, status)
```

### API Call:
```
PATCH /api/appointments/:id/status
Body: { status: "COMPLETED" }
```

### Backend:
```
AppointmentsController.updateStatus() →
AppointmentsService.updateStatus() →
prisma.appointment.update({ status })
```

### Database:
```sql
UPDATE appointments SET status = 'COMPLETED', updatedAt = NOW()
WHERE id = 'uuid' AND tenantId = 'T001';
```

---

## 5. DELETE/CANCEL

### Frontend:
```
User clicks Cancel → Confirm →
appointmentsService.deleteAppointment(id)
```

### API Call:
```
DELETE /api/appointments/:id
```

### Backend:
```
AppointmentsController.remove() →
AppointmentsService.remove() →
prisma.appointment.update({ status: 'CANCELLED' }) // Soft delete
```

### Database:
```sql
UPDATE appointments SET status = 'CANCELLED', updatedAt = NOW()
WHERE id = 'uuid' AND tenantId = 'T001';
```

---

## 6. CHECK AVAILABILITY

### Frontend:
```
User selects doctor & date →
appointmentsService.checkAvailability(doctorId, date)
```

### API Call:
```
GET /api/appointments/availability?doctorId=xxx&date=2025-10-25
```

### Backend:
```
AppointmentsController.checkAvailability() →
AppointmentsService.checkAvailability() →
1. Get existing appointments for doctor on date
2. Generate all 30-min slots (9 AM - 5 PM)
3. Filter out booked slots
4. Return available slots
```

### Database:
```sql
SELECT startTime, endTime FROM appointments
WHERE doctorId = 'xxx' AND tenantId = 'T001'
AND startTime >= '2025-10-25 00:00' AND startTime < '2025-10-25 23:59'
AND status NOT IN ('CANCELLED', 'NO_SHOW');
```

---

## 7. GET STATISTICS

### Frontend:
```
Page loads → fetchStats() →
appointmentsService.getAppointmentStats()
```

### API Call:
```
GET /api/appointments/stats
```

### Backend:
```
AppointmentsController.getStats() →
AppointmentsService.getStats() →
Multiple COUNT queries (total, today, pending, completed, cancelled)
```

### Database:
```sql
SELECT COUNT(*) FROM appointments WHERE tenantId = 'T001';
SELECT COUNT(*) FROM appointments WHERE tenantId = 'T001' AND DATE(startTime) = CURRENT_DATE;
SELECT COUNT(*) FROM appointments WHERE tenantId = 'T001' AND status = 'SCHEDULED';
```

---

## Database Schema

```
appointments table:
- id (PK, CUID)
- patientId (FK → patients.id)
- doctorId (FK → users.id)
- departmentId (FK → departments.id, nullable)
- startTime (DateTime)
- endTime (DateTime)
- status (Enum: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- reason (Text, nullable)
- notes (Text, nullable)
- tenantId (FK → tenants.id)
- createdAt (DateTime)
- updatedAt (DateTime)

Indexes: patientId, doctorId, departmentId, status, startTime, endTime
```

---

## Security & Validation

1. **JWT Authentication**: All requests require valid token
2. **Tenant Isolation**: TenantId from JWT, auto-added to queries
3. **DTO Validation**: Backend validates all fields
4. **Availability Check**: Prevents double-booking
5. **Soft Delete**: Records marked as CANCELLED, not deleted

---

## Summary

All CRUD operations follow the same pattern:
Frontend → API Service → HTTP Request → Controller → Service → Prisma → Database

Key features:
- Availability checking prevents conflicts
- Soft deletes preserve data
- Tenant isolation ensures security
- Includes patient/doctor data in responses
