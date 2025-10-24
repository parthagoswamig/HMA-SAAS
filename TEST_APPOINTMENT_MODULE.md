# 🧪 Appointment Module - Complete Testing Guide

## ✅ **All Tasks Completed**

### **Backend Fixes** ✅
1. Department include in appointment queries
2. Soft delete (CANCELLED status instead of hard delete)
3. Availability checking on create
4. Availability checking on update (excluding current appointment)

### **Frontend Fixes** ✅
1. Service imports (patients, staff, hr)
2. Dropdown state management
3. Form state management
4. Dropdown data loading from APIs
5. Create appointment handler with validation
6. Update appointment handler with validation
7. Status update handler
8. Cancel appointment handler
9. Edit click handler
10. Form reset handler
11. Complete form modal with all dropdowns
12. Action buttons wired to handlers
13. TypeScript errors fixed
14. DateTimePicker properly configured

---

## 🚀 **Step-by-Step Testing**

### **Prerequisites**
```bash
# Ensure backend is running on port 3001
cd apps/api
npm run start:dev

# Ensure frontend is running on port 3002
cd apps/web
npm run dev
```

---

## **Test 1: Dropdown Data Loading** 🔍

### **Steps**:
1. Navigate to `http://localhost:3002/dashboard/appointments`
2. Click "Book Appointment" button
3. Check Patient dropdown
4. Check Doctor dropdown
5. Check Department dropdown

### **Expected Results**:
- ✅ Patient dropdown shows list of patients with names and IDs
- ✅ Doctor dropdown shows list of doctors with "Dr." prefix
- ✅ Department dropdown shows list of departments
- ✅ All dropdowns are searchable
- ✅ "No data found" message appears if empty

### **Console Check**:
```javascript
// Should see in browser console:
"Dropdown data loaded: { patients: X, doctors: Y, departments: Z }"
```

---

## **Test 2: Create Appointment** ➕

### **Steps**:
1. Click "Book Appointment"
2. Leave all fields empty
3. Click "Book Appointment" button
4. **Expected**: Validation error "Please fill in Patient, Doctor, and Date/Time fields"

5. Fill in:
   - Patient: Select any patient
   - Doctor: Select any doctor
   - Department: (Optional) Select any department
   - Date & Time: Select future date and time
   - Reason: "Regular checkup"
   - Notes: "Patient requested morning slot"
   - Status: "SCHEDULED"

6. Click "Book Appointment"

### **Expected Results**:
- ✅ Success notification: "Appointment created successfully"
- ✅ Modal closes
- ✅ Appointment appears in the list
- ✅ Stats update (Total count increases)
- ✅ Form resets for next use

### **Backend Check**:
```bash
# Check backend logs:
"Appointment created: [ID] for tenant: [TENANT_ID]"
```

---

## **Test 3: Edit Appointment** ✏️

### **Steps**:
1. Find an appointment in the list
2. Click the green edit icon (pencil)
3. Verify form opens with title "Edit Appointment"
4. Verify all fields are pre-filled:
   - Patient dropdown shows selected patient
   - Doctor dropdown shows selected doctor
   - Department dropdown shows selected department
   - Date & Time shows existing datetime
   - Reason shows existing reason
   - Notes show existing notes
   - Status shows current status

5. Change the datetime to a different time
6. Change the reason to "Follow-up visit"
7. Click "Update Appointment"

### **Expected Results**:
- ✅ Success notification: "Appointment updated successfully"
- ✅ Modal closes
- ✅ Changes reflected in the list
- ✅ Stats update if status changed

### **Backend Check**:
```bash
# Check backend logs:
"Appointment updated: [ID] for tenant: [TENANT_ID]"
```

---

## **Test 4: Status Update** 🔄

### **Steps**:
1. Find an appointment with status "SCHEDULED"
2. Click the three-dot menu (⋮)
3. Click "Confirm"
4. Verify status changes to "CONFIRMED"
5. Verify success notification

6. Click menu again
7. Click "Check In"
8. Verify status changes to "ARRIVED"

9. Click menu again
10. Click "Complete"
11. Verify status changes to "COMPLETED"

### **Expected Results**:
- ✅ Each status change shows notification: "Appointment marked as [STATUS]"
- ✅ Status badge color changes
- ✅ Stats update (Completed count increases)
- ✅ No page reload needed

### **Backend Check**:
```bash
# Check backend logs for each status change:
"Appointment status updated: [ID] to [STATUS] for tenant: [TENANT_ID]"
```

---

## **Test 5: Cancel Appointment** ❌

### **Steps**:
1. Find an appointment
2. Click the three-dot menu (⋮)
3. Click "Cancel"
4. Verify confirmation dialog appears: "Are you sure you want to cancel this appointment?"
5. Click "Cancel" in dialog (should not cancel)
6. Repeat steps 2-3
7. Click "OK" in dialog

### **Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Success notification: "Appointment cancelled successfully"
- ✅ Appointment status changes to "CANCELLED"
- ✅ Appointment still visible in list (soft delete)
- ✅ Stats update (Cancelled count increases)

### **Backend Check**:
```bash
# Check backend logs:
"Appointment cancelled (soft delete): [ID] for tenant: [TENANT_ID]"
```

---

## **Test 6: Availability Checking** 🚫

### **Steps**:
1. Create appointment:
   - Doctor: Dr. Smith
   - Date: Tomorrow at 10:00 AM
   - Click "Book Appointment"
   - **Expected**: Success

2. Try to create another appointment:
   - Doctor: Dr. Smith (same doctor)
   - Date: Tomorrow at 10:00 AM (same time)
   - Click "Book Appointment"
   - **Expected**: Error notification "This time slot is not available for the selected doctor"

3. Create appointment with different time:
   - Doctor: Dr. Smith (same doctor)
   - Date: Tomorrow at 11:00 AM (different time)
   - Click "Book Appointment"
   - **Expected**: Success

### **Expected Results**:
- ✅ Cannot create overlapping appointments for same doctor
- ✅ Error message is clear
- ✅ Can create appointments at different times

---

## **Test 7: Update Availability Checking** 🔄

### **Steps**:
1. Create two appointments:
   - Appointment A: Dr. Smith at 10:00 AM
   - Appointment B: Dr. Smith at 11:00 AM

2. Edit Appointment B:
   - Try to change time to 10:00 AM (conflicts with A)
   - Click "Update Appointment"
   - **Expected**: Error "This time slot is not available"

3. Edit Appointment B:
   - Keep time as 11:00 AM (no conflict)
   - Change reason
   - Click "Update Appointment"
   - **Expected**: Success

### **Expected Results**:
- ✅ Cannot update to conflicting time slot
- ✅ Can update to same time (doesn't conflict with itself)
- ✅ Can update other fields without time conflict

---

## **Test 8: Form Validation** ✅

### **Test Missing Patient**:
1. Click "Book Appointment"
2. Select Doctor only
3. Select Date & Time
4. Click "Book Appointment"
5. **Expected**: Error "Please fill in Patient, Doctor, and Date/Time fields"

### **Test Missing Doctor**:
1. Click "Book Appointment"
2. Select Patient only
3. Select Date & Time
4. Click "Book Appointment"
5. **Expected**: Error "Please fill in Patient, Doctor, and Date/Time fields"

### **Test Missing DateTime**:
1. Click "Book Appointment"
2. Select Patient
3. Select Doctor
4. Leave Date & Time empty
5. Click "Book Appointment"
6. **Expected**: Error "Please fill in Patient, Doctor, and Date/Time fields"

---

## **Test 9: Tenant Isolation** 🔒

### **Steps**:
1. Login as User A (Tenant 1)
2. Create appointment
3. Note the appointment ID
4. Logout

5. Login as User B (Tenant 2)
6. Go to appointments page
7. Verify User A's appointment is NOT visible

8. Create appointment as User B
9. Verify only User B's appointments are visible

### **Expected Results**:
- ✅ Each tenant sees only their own appointments
- ✅ No cross-tenant data leakage
- ✅ All API calls include tenantId

---

## **Test 10: UI/UX** 🎨

### **Verify**:
- ✅ Loading states show while fetching dropdown data
- ✅ Dropdowns are disabled during loading
- ✅ Success notifications are green
- ✅ Error notifications are red
- ✅ Confirmation dialogs for destructive actions
- ✅ Form resets after successful create
- ✅ Modal closes after successful operations
- ✅ List refreshes automatically
- ✅ Stats update in real-time
- ✅ No console errors
- ✅ No TypeScript errors

---

## **Test 11: Edge Cases** 🔍

### **Test Past Date**:
1. Try to select past date in DateTimePicker
2. **Expected**: Past dates are disabled (minDate={new Date()})

### **Test Empty Dropdowns**:
1. If no patients exist, dropdown shows "No patients found"
2. If no doctors exist, dropdown shows "No doctors found"
3. If no departments exist, dropdown shows "No departments found"

### **Test Long Names**:
1. Create appointment with patient having very long name
2. Verify name displays properly in dropdown
3. Verify name displays properly in list

### **Test Special Characters**:
1. Enter reason with special characters: "Follow-up for patient's condition"
2. Verify saves correctly
3. Verify displays correctly

---

## **Test 12: Performance** ⚡

### **Verify**:
- ✅ Dropdown data loads in < 2 seconds
- ✅ Create appointment completes in < 1 second
- ✅ Update appointment completes in < 1 second
- ✅ Status update completes in < 500ms
- ✅ List refresh completes in < 1 second
- ✅ No memory leaks
- ✅ No unnecessary re-renders

---

## **Test 13: Error Handling** ⚠️

### **Test Network Error**:
1. Stop backend server
2. Try to create appointment
3. **Expected**: Error notification "Failed to create appointment"

### **Test Invalid Data**:
1. Manually call API with invalid data
2. **Expected**: Backend validation error
3. **Expected**: Frontend shows error message

### **Test Timeout**:
1. Simulate slow network
2. Verify loading states show
3. Verify timeout error handled gracefully

---

## **Test 14: Accessibility** ♿

### **Verify**:
- ✅ All form fields have labels
- ✅ Required fields marked with asterisk
- ✅ Error messages are clear
- ✅ Keyboard navigation works
- ✅ Tab order is logical
- ✅ Focus indicators visible
- ✅ Screen reader compatible

---

## 📊 **Test Results Summary**

| Test | Status | Notes |
|------|--------|-------|
| Dropdown Data Loading | ⬜ | |
| Create Appointment | ⬜ | |
| Edit Appointment | ⬜ | |
| Status Update | ⬜ | |
| Cancel Appointment | ⬜ | |
| Availability Checking | ⬜ | |
| Update Availability | ⬜ | |
| Form Validation | ⬜ | |
| Tenant Isolation | ⬜ | |
| UI/UX | ⬜ | |
| Edge Cases | ⬜ | |
| Performance | ⬜ | |
| Error Handling | ⬜ | |
| Accessibility | ⬜ | |

**Legend**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🐛 **Known Issues to Watch For**

1. **Timezone Issues**: Ensure datetime is handled correctly across timezones
2. **Concurrent Updates**: Test what happens if two users edit same appointment
3. **Large Datasets**: Test with 1000+ appointments
4. **Mobile Responsiveness**: Test on mobile devices

---

## 🎯 **Success Criteria**

All tests must pass before considering the module production-ready:

- ✅ All CRUD operations work
- ✅ Dropdowns load data
- ✅ Validation works
- ✅ Availability checking works
- ✅ Soft delete works
- ✅ UI feedback works
- ✅ Tenant isolation works
- ✅ No errors in console
- ✅ No TypeScript errors
- ✅ Performance acceptable

---

## 🚀 **Ready for Production**

Once all tests pass, the Appointment Module is ready for production deployment!

**Test Date**: _____________
**Tested By**: _____________
**Status**: ⬜ All Tests Passed | ⬜ Issues Found

---

## 📝 **Notes**

Use this space to document any issues found during testing:

```
Issue 1:
Description:
Steps to Reproduce:
Expected:
Actual:
Severity: High/Medium/Low

Issue 2:
...
```
