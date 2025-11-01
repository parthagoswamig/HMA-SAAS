# 🧪 HMS SaaS - Comprehensive Frontend End-to-End Test Plan

**Purpose:** Manual testing of ALL frontend modules, pages, and features  
**Environment:** Production (https://hma-saas-web.vercel.app)  
**Test Credentials:** admin@test.com / Admin@123  
**Date:** November 1, 2025

---

## 📋 Testing Methodology

### For Each Module, Test:
1. ✅ **Page Load** - Does the page render correctly?
2. ✅ **Data Display** - Is data fetched and shown properly?
3. ✅ **Forms** - Can you fill and submit forms?
4. ✅ **CRUD Operations** - Create, Read, Update, Delete
5. ✅ **Navigation** - Links and routing work?
6. ✅ **Search & Filter** - Search and filter functionality
7. ✅ **Validation** - Form validation and error messages
8. ✅ **Responsive** - Mobile and tablet views
9. ✅ **Performance** - Load times acceptable?
10. ✅ **API Calls** - Check network tab for errors

---

## 🔐 Module 1: Authentication

### Test Cases

#### 1.1 Login Page (`/login`)
- [ ] Page loads without errors
- [ ] Email and password fields visible
- [ ] "Remember me" checkbox works
- [ ] "Forgot password" link present
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Empty form shows validation errors
- [ ] JWT token stored in localStorage
- [ ] Redirects to dashboard after login
- [ ] "Loading" state shows during login

**Expected Results:**
- ✅ Login successful with admin@test.com
- ✅ Token stored and user redirected
- ❌ Invalid credentials rejected

**API Calls to Check:**
- `POST /auth/login` - Should return 200 with token

---

#### 1.2 Signup Page (`/signup`)
- [ ] Page loads without errors
- [ ] All required fields present (name, email, password, etc.)
- [ ] Password strength indicator works
- [ ] Email validation works
- [ ] Password confirmation matches
- [ ] Terms & conditions checkbox
- [ ] Signup creates new user
- [ ] Redirects to login or dashboard

**Expected Results:**
- ✅ New user can register
- ✅ Validation prevents invalid data
- ❌ Duplicate email rejected

---

#### 1.3 Password Reset (`/forgot-password`)
- [ ] Page loads without errors
- [ ] Email field present
- [ ] Reset link sent to email
- [ ] Success message shown
- [ ] Reset token page works
- [ ] New password can be set

---

## 🏠 Module 2: Dashboard (`/dashboard`)

### Test Cases

#### 2.1 Dashboard Overview
- [ ] Page loads without errors
- [ ] All stat cards visible (patients, appointments, revenue, etc.)
- [ ] Numbers are accurate
- [ ] Charts render correctly
- [ ] Recent activities list shows
- [ ] Quick actions buttons work
- [ ] Notifications panel visible
- [ ] User profile dropdown works

**Expected Results:**
- ✅ Dashboard loads in < 2 seconds
- ✅ All widgets display data
- ✅ Charts are interactive

**API Calls to Check:**
- `GET /dashboard/stats` - Returns dashboard statistics
- `GET /dashboard/recent-activities` - Returns recent activities

---

#### 2.2 Dashboard Charts
- [ ] Patient admissions chart renders
- [ ] Revenue chart shows data
- [ ] Appointment trends visible
- [ ] Charts are interactive (hover, click)
- [ ] Date range filter works
- [ ] Export chart functionality

---

## 👥 Module 3: Patients (`/dashboard/patients`)

### Test Cases

#### 3.1 Patient List
- [ ] Page loads without errors
- [ ] Patient list table displays
- [ ] Pagination works
- [ ] Search by name works
- [ ] Filter by status works
- [ ] Filter by date works
- [ ] Sort by columns works
- [ ] "Add Patient" button visible
- [ ] View patient details works
- [ ] Edit patient works
- [ ] Delete patient works (with confirmation)

**Expected Results:**
- ✅ All patients listed
- ✅ Search returns correct results
- ✅ Filters work correctly

**API Calls to Check:**
- `GET /patients` - Returns patient list
- `GET /patients/stats` - Returns patient statistics
- `GET /patients/:id` - Returns patient details

---

#### 3.2 Add Patient Form
- [ ] Form modal/page opens
- [ ] All required fields present:
  - [ ] First Name, Last Name
  - [ ] Date of Birth
  - [ ] Gender
  - [ ] Blood Type
  - [ ] Contact (phone, email)
  - [ ] Address
  - [ ] Emergency Contact
  - [ ] Medical History
  - [ ] Allergies
  - [ ] Insurance Information
- [ ] Field validation works
- [ ] Date picker works
- [ ] Dropdown selections work
- [ ] Form submission succeeds
- [ ] Success message shown
- [ ] New patient appears in list

**Expected Results:**
- ✅ Patient created successfully
- ✅ MRN auto-generated
- ✅ Form validation prevents errors

**API Calls to Check:**
- `POST /patients` - Creates new patient

---

#### 3.3 Edit Patient
- [ ] Edit form pre-fills with patient data
- [ ] All fields editable
- [ ] Changes save successfully
- [ ] Updated data reflects in list
- [ ] Audit log updated

---

#### 3.4 View Patient Details
- [ ] Patient profile page loads
- [ ] All patient information displayed
- [ ] Medical history visible
- [ ] Appointments list shown
- [ ] Lab results accessible
- [ ] Prescriptions visible
- [ ] Billing history shown
- [ ] Documents/attachments viewable

---

## 📅 Module 4: Appointments (`/dashboard/appointments`)

### Test Cases

#### 4.1 Appointment List
- [ ] Page loads without errors
- [ ] Appointment list displays
- [ ] Calendar view available
- [ ] List view available
- [ ] Filter by date works
- [ ] Filter by doctor works
- [ ] Filter by status works
- [ ] Search by patient name works
- [ ] "Book Appointment" button works

**Expected Results:**
- ✅ All appointments listed
- ✅ Status colors correct (pending, confirmed, completed, cancelled)
- ✅ Time slots accurate

**API Calls to Check:**
- `GET /appointments` - Returns appointments
- `GET /appointments/stats` - Returns appointment statistics

---

#### 4.2 Book Appointment
- [ ] Booking form opens
- [ ] Patient selection works
- [ ] Doctor selection works
- [ ] Department selection works
- [ ] Date picker works
- [ ] Time slot selection works
- [ ] Available slots shown
- [ ] Appointment type selection
- [ ] Notes field works
- [ ] Booking succeeds
- [ ] Confirmation shown
- [ ] Email/SMS notification sent

**Expected Results:**
- ✅ Appointment booked successfully
- ✅ Conflicts prevented
- ✅ Confirmation email sent

**API Calls to Check:**
- `POST /appointments` - Creates appointment
- `GET /appointments/available-slots` - Returns available time slots

---

#### 4.3 Reschedule Appointment
- [ ] Reschedule option available
- [ ] New date/time can be selected
- [ ] Reschedule succeeds
- [ ] Notification sent

---

#### 4.4 Cancel Appointment
- [ ] Cancel button visible
- [ ] Confirmation dialog shown
- [ ] Cancellation reason required
- [ ] Cancellation succeeds
- [ ] Status updated
- [ ] Notification sent

---

## 💰 Module 5: Billing (`/dashboard/billing`)

### Test Cases

#### 5.1 Invoice List
- [ ] Page loads without errors
- [ ] Invoice list displays
- [ ] Filter by status works
- [ ] Filter by date works
- [ ] Search by patient works
- [ ] "Create Invoice" button works
- [ ] View invoice details works
- [ ] Download PDF works
- [ ] Send invoice email works

**Expected Results:**
- ✅ All invoices listed
- ✅ Amounts calculated correctly
- ✅ Status accurate (paid, pending, overdue)

**API Calls to Check:**
- `GET /billing/invoices` - Returns invoices
- `GET /billing/invoices/stats` - Returns billing statistics

---

#### 5.2 Create Invoice
- [ ] Invoice form opens
- [ ] Patient selection works
- [ ] Service/item selection works
- [ ] Quantity and price editable
- [ ] Discount field works
- [ ] Tax calculation automatic
- [ ] Total calculated correctly
- [ ] Payment terms selection
- [ ] Due date picker works
- [ ] Notes field works
- [ ] Invoice creation succeeds
- [ ] Invoice number auto-generated

**Expected Results:**
- ✅ Invoice created successfully
- ✅ Calculations accurate
- ✅ PDF generated

**API Calls to Check:**
- `POST /billing/invoices` - Creates invoice

---

#### 5.3 Record Payment
- [ ] Payment modal opens
- [ ] Amount field pre-filled
- [ ] Payment method selection works
- [ ] Payment date picker works
- [ ] Transaction reference field
- [ ] Payment recording succeeds
- [ ] Invoice status updated
- [ ] Receipt generated

---

## 👨‍⚕️ Module 6: Staff (`/dashboard/staff`)

### Test Cases

#### 6.1 Staff List
- [ ] Page loads without errors
- [ ] Staff list displays
- [ ] Filter by department works
- [ ] Filter by role works
- [ ] Search by name works
- [ ] "Add Staff" button works
- [ ] View staff details works
- [ ] Edit staff works
- [ ] Deactivate staff works

**Expected Results:**
- ✅ All staff members listed
- ✅ Roles and departments correct
- ✅ Contact information accurate

**API Calls to Check:**
- `GET /staff` - Returns staff list
- `GET /staff/stats` - Returns staff statistics

---

#### 6.2 Add Staff Member
- [ ] Form opens
- [ ] All required fields present:
  - [ ] Name, Email, Phone
  - [ ] Role selection
  - [ ] Department selection
  - [ ] Specialization (for doctors)
  - [ ] License number
  - [ ] Qualification
  - [ ] Experience
  - [ ] Shift assignment
  - [ ] Salary information
- [ ] Form validation works
- [ ] Staff creation succeeds
- [ ] User account created
- [ ] Welcome email sent

**Expected Results:**
- ✅ Staff member added
- ✅ Login credentials generated
- ✅ Role permissions assigned

**API Calls to Check:**
- `POST /staff` - Creates staff member

---

## 🧪 Module 7: Laboratory (`/dashboard/laboratory`)

### Test Cases

#### 7.1 Lab Tests List
- [ ] Page loads without errors
- [ ] Test catalog displays
- [ ] Search tests works
- [ ] Filter by category works
- [ ] Test details viewable
- [ ] "Add Test" button works

**Expected Results:**
- ✅ All lab tests listed
- ✅ Prices accurate
- ✅ Categories correct

**API Calls to Check:**
- `GET /laboratory/tests` - Returns lab tests

---

#### 7.2 Lab Orders
- [ ] Orders list displays
- [ ] Filter by status works
- [ ] Filter by date works
- [ ] Search by patient works
- [ ] "Create Order" button works
- [ ] View order details works
- [ ] Update order status works
- [ ] Enter results works
- [ ] Print report works

**Expected Results:**
- ✅ Orders listed correctly
- ✅ Status workflow correct
- ❌ Permission error if not authorized

**API Calls to Check:**
- `GET /laboratory/orders` - Returns lab orders
- `POST /laboratory/orders` - Creates lab order

---

## 💊 Module 8: Pharmacy (`/dashboard/pharmacy`)

### Test Cases

#### 8.1 Medications List
- [ ] Page loads without errors
- [ ] Medication catalog displays
- [ ] Search medications works
- [ ] Filter by category works
- [ ] Stock levels visible
- [ ] Low stock alerts shown
- [ ] "Add Medication" button works

**Expected Results:**
- ✅ All medications listed
- ✅ Stock levels accurate
- ✅ Prices correct

**API Calls to Check:**
- `GET /pharmacy/medications` - Returns medications

---

#### 8.2 Pharmacy Orders
- [ ] Orders list displays
- [ ] Filter by status works
- [ ] Search by patient works
- [ ] "Create Order" button works
- [ ] View prescription works
- [ ] Dispense medication works
- [ ] Update stock works
- [ ] Print label works

**Expected Results:**
- ✅ Orders listed correctly
- ✅ Prescription validation works
- ❌ Permission error if not authorized

**API Calls to Check:**
- `GET /pharmacy/orders` - Returns pharmacy orders
- `POST /pharmacy/orders` - Creates pharmacy order

---

## 🏥 Module 9: IPD (Inpatient) (`/dashboard/ipd`)

### Test Cases

#### 9.1 Admissions List
- [ ] Page loads without errors
- [ ] Admissions list displays
- [ ] Filter by status works
- [ ] Filter by ward works
- [ ] Search by patient works
- [ ] "Admit Patient" button works
- [ ] View admission details works
- [ ] Discharge patient works

**Expected Results:**
- ✅ All admissions listed
- ✅ Bed assignments correct
- ✅ Status accurate

**API Calls to Check:**
- `GET /ipd/admissions` - Returns admissions

---

#### 9.2 Ward Management
- [ ] Wards list displays
- [ ] Bed availability shown
- [ ] Bed status accurate (occupied, available, maintenance)
- [ ] Assign bed works
- [ ] Transfer patient works
- [ ] Ward statistics correct

**Expected Results:**
- ✅ Ward occupancy accurate
- ✅ Bed assignments work
- ✅ Transfers successful

**API Calls to Check:**
- `GET /ipd/wards` - Returns wards and beds

---

## 🏥 Module 10: OPD (Outpatient) (`/dashboard/opd`)

### Test Cases

#### 10.1 OPD Visits
- [ ] Page loads without errors
- [ ] Visits list displays
- [ ] Filter by date works
- [ ] Filter by doctor works
- [ ] Search by patient works
- [ ] "Register Visit" button works
- [ ] View visit details works
- [ ] Complete consultation works

**Expected Results:**
- ✅ All visits listed
- ✅ Status workflow correct
- ✅ Consultation notes saved

**API Calls to Check:**
- `GET /opd/visits` - Returns OPD visits

---

#### 10.2 OPD Queue
- [ ] Queue displays
- [ ] Waiting patients shown
- [ ] Queue order correct
- [ ] Call next patient works
- [ ] Mark as completed works
- [ ] Queue updates in real-time

**Expected Results:**
- ✅ Queue order maintained
- ✅ Real-time updates work
- ❌ Backend error if endpoint not implemented

**API Calls to Check:**
- `GET /opd/queue` - Returns OPD queue

---

## 🚨 Module 11: Emergency (`/dashboard/emergency`)

### Test Cases

#### 11.1 Emergency Cases
- [ ] Page loads without errors
- [ ] Cases list displays
- [ ] Filter by priority works
- [ ] Filter by status works
- [ ] "Register Case" button works
- [ ] View case details works
- [ ] Update triage works
- [ ] Assign doctor works

**Expected Results:**
- ✅ Cases listed by priority
- ✅ Triage colors correct
- ❌ Backend error if endpoint not implemented

**API Calls to Check:**
- `GET /emergency/cases` - Returns emergency cases

---

#### 11.2 Emergency Queue
- [ ] Queue displays
- [ ] Priority order correct
- [ ] Critical cases highlighted
- [ ] Queue updates real-time
- [ ] Call next patient works

**Expected Results:**
- ✅ Priority queue works
- ❌ Backend error if endpoint not implemented

**API Calls to Check:**
- `GET /emergency/queue` - Returns emergency queue

---

## 🔬 Module 12: Radiology (`/dashboard/radiology`)

### Test Cases

#### 12.1 Radiology Studies
- [ ] Page loads without errors
- [ ] Studies list displays
- [ ] Filter by modality works
- [ ] Search by patient works
- [ ] View study details works
- [ ] Upload images works
- [ ] View DICOM images works

**Expected Results:**
- ✅ All studies listed
- ✅ Images viewable
- ✅ Reports accessible

**API Calls to Check:**
- `GET /radiology/studies` - Returns radiology studies

---

#### 12.2 Radiology Orders
- [ ] Orders list displays
- [ ] "Create Order" button works
- [ ] View order details works
- [ ] Update status works
- [ ] Upload results works
- [ ] Print report works

**Expected Results:**
- ✅ Orders workflow correct
- ✅ Status updates work

**API Calls to Check:**
- `GET /radiology/orders` - Returns radiology orders

---

## 📦 Module 13: Inventory (`/dashboard/inventory`)

### Test Cases

#### 13.1 Inventory Items
- [ ] Page loads without errors
- [ ] Items list displays
- [ ] Search items works
- [ ] Filter by category works
- [ ] Stock levels visible
- [ ] Low stock alerts shown
- [ ] "Add Item" button works
- [ ] Edit item works
- [ ] View item history works

**Expected Results:**
- ✅ All items listed
- ✅ Stock levels accurate
- ✅ Alerts working

**API Calls to Check:**
- `GET /inventory` - Returns inventory items
- `GET /inventory/stats` - Returns inventory statistics

---

#### 13.2 Stock Management
- [ ] Add stock works
- [ ] Remove stock works
- [ ] Transfer stock works
- [ ] Stock adjustment works
- [ ] Audit trail visible

---

## 🏥 Module 14: Insurance (`/dashboard/insurance`)

### Test Cases

#### 14.1 Insurance Claims
- [ ] Page loads without errors
- [ ] Claims list displays
- [ ] Filter by status works
- [ ] Search by patient works
- [ ] "Create Claim" button works
- [ ] View claim details works
- [ ] Submit claim works
- [ ] Update claim status works

**Expected Results:**
- ✅ All claims listed
- ✅ Status workflow correct
- ✅ Amounts accurate

**API Calls to Check:**
- `GET /insurance/claims` - Returns insurance claims
- `GET /insurance/stats` - Returns insurance statistics

---

## 🏢 Module 15: Departments (`/dashboard/departments`)

### Test Cases

#### 15.1 Departments List
- [ ] Page loads without errors
- [ ] Departments list displays
- [ ] "Add Department" button works
- [ ] View department details works
- [ ] Edit department works
- [ ] View staff in department works

**Expected Results:**
- ✅ All departments listed
- ❌ Permission error if not authorized

**API Calls to Check:**
- `GET /hr/departments` - Returns departments

---

## 🔐 Module 16: Roles & Permissions (`/dashboard/roles`)

### Test Cases

#### 16.1 Roles List
- [ ] Page loads without errors
- [ ] Roles list displays
- [ ] "Add Role" button works
- [ ] View role details works
- [ ] Edit role works
- [ ] Assign permissions works

**Expected Results:**
- ✅ All roles listed
- ✅ Permissions displayed correctly

**API Calls to Check:**
- `GET /roles` - Returns roles
- `GET /permissions` - Returns permissions

---

## 📅 Module 17: Shifts (`/dashboard/shifts`)

### Test Cases

#### 17.1 Shift Schedule
- [ ] Page loads without errors
- [ ] Schedule calendar displays
- [ ] Filter by staff works
- [ ] Filter by department works
- [ ] "Create Shift" button works
- [ ] View shift details works
- [ ] Edit shift works
- [ ] Assign staff works

**Expected Results:**
- ✅ Schedule displays correctly
- ❌ Backend error if endpoint broken

**API Calls to Check:**
- `GET /shifts` - Returns shifts

---

## 💬 Module 18: Communications (`/dashboard/communications`)

### Test Cases

#### 18.1 Messages
- [ ] Page loads without errors
- [ ] Messages list displays
- [ ] Compose message works
- [ ] Send message works
- [ ] Reply works
- [ ] Mark as read works
- [ ] Delete message works

**Expected Results:**
- ✅ All messages listed
- ✅ Real-time updates work

**API Calls to Check:**
- `GET /communications/messages` - Returns messages

---

#### 18.2 Notifications
- [ ] Notifications list displays
- [ ] Mark as read works
- [ ] Clear all works
- [ ] Notification bell updates
- [ ] Real-time notifications work

**Expected Results:**
- ✅ Notifications displayed
- ✅ Badge count accurate

**API Calls to Check:**
- `GET /communications/notifications` - Returns notifications

---

## 📊 Module 19: Reports (`/dashboard/reports`)

### Test Cases

#### 19.1 Reports Dashboard
- [ ] Page loads without errors
- [ ] Report categories visible
- [ ] Generate report works
- [ ] Date range selection works
- [ ] Export to PDF works
- [ ] Export to Excel works
- [ ] Schedule report works

**Expected Results:**
- ✅ Reports generate correctly
- ✅ Data accurate
- ✅ Exports work

**API Calls to Check:**
- `GET /reports/dashboard` - Returns report data

---

## 📋 Module 20: EMR (Electronic Medical Records) (`/dashboard/emr`)

### Test Cases

#### 20.1 Medical Records
- [ ] Page loads without errors
- [ ] Records list displays
- [ ] Search by patient works
- [ ] Filter by date works
- [ ] View record details works
- [ ] Add new record works
- [ ] Edit record works
- [ ] View history works

**Expected Results:**
- ✅ Records displayed correctly
- ❌ Permission error if not authorized

**API Calls to Check:**
- `GET /emr/records` - Returns medical records

---

## 📊 Testing Summary Template

### Module: [Module Name]
**Date Tested:** [Date]  
**Tester:** [Name]  
**Browser:** [Chrome/Firefox/Safari]  
**Device:** [Desktop/Mobile/Tablet]

#### Results:
- **Total Tests:** [Number]
- **Passed:** [Number] ✅
- **Failed:** [Number] ❌
- **Blocked:** [Number] ⚠️

#### Issues Found:
1. [Issue description]
   - **Severity:** Critical/High/Medium/Low
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Screenshot:** [Link or attachment]

#### Recommendations:
- [Recommendation 1]
- [Recommendation 2]

---

## 🎯 Testing Checklist

### Pre-Testing
- [ ] Production URL accessible
- [ ] Test credentials working
- [ ] Browser DevTools open
- [ ] Network tab monitoring
- [ ] Console tab monitoring
- [ ] Screenshot tool ready

### During Testing
- [ ] Test each module systematically
- [ ] Document all issues
- [ ] Take screenshots of errors
- [ ] Note API call failures
- [ ] Check console for errors
- [ ] Test on multiple browsers
- [ ] Test responsive design

### Post-Testing
- [ ] Compile test results
- [ ] Categorize issues by severity
- [ ] Create issue tickets
- [ ] Share report with team
- [ ] Prioritize fixes
- [ ] Schedule regression testing

---

## 📈 Success Criteria

### Module is PASSING if:
- ✅ Page loads without errors
- ✅ All core functionality works
- ✅ API calls succeed
- ✅ No console errors
- ✅ Data displays correctly
- ✅ Forms submit successfully
- ✅ Navigation works
- ✅ Responsive on mobile

### Module is FAILING if:
- ❌ Page doesn't load
- ❌ Critical functionality broken
- ❌ API calls fail
- ❌ Console shows errors
- ❌ Data doesn't display
- ❌ Forms don't submit
- ❌ Navigation broken

---

## 🔧 Tools Needed

1. **Browser DevTools**
   - Network tab for API monitoring
   - Console tab for errors
   - Elements tab for UI inspection

2. **Screenshot Tool**
   - Windows Snipping Tool
   - Browser extensions
   - Lightshot

3. **Testing Checklist**
   - This document
   - Spreadsheet for tracking

4. **Issue Tracking**
   - GitHub Issues
   - Jira
   - Trello

---

## 📝 Next Steps

1. **Start Testing:** Begin with Module 1 (Authentication)
2. **Document Issues:** Record all findings
3. **Prioritize Fixes:** Critical → High → Medium → Low
4. **Fix Issues:** Apply fixes based on priority
5. **Regression Test:** Re-test fixed modules
6. **Final Validation:** Run complete test suite again

---

**Total Modules to Test:** 20  
**Estimated Time:** 10-15 hours for complete testing  
**Recommended:** Test 4-5 modules per day

**Good luck with testing!** 🚀
