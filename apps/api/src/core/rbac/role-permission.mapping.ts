import { UserRole } from './enums/roles.enum';
import { Permission } from './enums/permissions.enum';

// Permission groups for easier management
export const PermissionGroups = {
  ADMINISTRATION: [
    Permission.TENANT_READ,
    Permission.TENANT_UPDATE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
  ],
};

/**
 * Role-Permission Mapping
 * Defines which permissions each role has access to
 */
export const RolePermissionMapping: Record<UserRole, Permission[]> = {
  // ============================================
  // SUPER ADMIN - Full platform access
  // ============================================
  [UserRole.SUPER_ADMIN]: Object.values(Permission),

  // ============================================
  // TENANT ADMIN - Hospital/Clinic administrator
  // ============================================
  [UserRole.TENANT_ADMIN]: [
    // Tenant Management
    ...PermissionGroups.ADMINISTRATION,
    
    // Patient Management
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.EXPORT_PATIENTS,
    
    // Medical Records
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.VIEW_SENSITIVE_RECORDS,
    
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENTS,
    Permission.CANCEL_APPOINTMENTS,
    Permission.MANAGE_SCHEDULE,
    
    // Staff Management
    Permission.VIEW_STAFF,
    Permission.MANAGE_STAFF,
    Permission.VIEW_ATTENDANCE,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_SHIFTS,
    
    // Financial
    Permission.VIEW_BILLING,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_FINANCIAL_DASHBOARDS,
    
    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_CLINICAL_DASHBOARDS,
    Permission.VIEW_OPERATIONAL_DASHBOARDS,
    Permission.VIEW_AUDIT_LOGS,
    
    // System
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.BACKUP_DATA,
  ],

  // ============================================
  // DOCTOR - Primary clinical staff
  // ============================================
  [UserRole.DOCTOR]: [
    // Patients
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    Permission.VIEW_PATIENT_HISTORY,
    
    // Medical Records
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORDS,
    Permission.UPDATE_MEDICAL_RECORDS,
    Permission.SIGN_MEDICAL_RECORDS,
    Permission.VIEW_SENSITIVE_RECORDS,
    
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENTS,
    Permission.VIEW_SCHEDULE,
    
    // Consultations
    Permission.VIEW_ENCOUNTERS,
    Permission.CREATE_ENCOUNTERS,
    Permission.UPDATE_ENCOUNTERS,
    Permission.CLOSE_ENCOUNTERS,
    Permission.VIEW_CONSULTATION_NOTES,
    Permission.CREATE_CONSULTATION_NOTES,
    
    // Prescriptions
    Permission.VIEW_PRESCRIPTIONS,
    Permission.CREATE_PRESCRIPTIONS,
    Permission.UPDATE_PRESCRIPTIONS,
    Permission.CANCEL_PRESCRIPTIONS,
    
    // Orders
    Permission.VIEW_LAB_ORDERS,
    Permission.CREATE_LAB_ORDERS,
    Permission.UPDATE_LAB_ORDERS,
    Permission.VIEW_LAB_RESULTS,
    Permission.VIEW_RADIOLOGY_ORDERS,
    Permission.CREATE_RADIOLOGY_ORDERS,
    Permission.VIEW_RADIOLOGY_IMAGES,
    
    // IPD
    Permission.VIEW_IPD_RECORDS,
    Permission.CREATE_IPD_ADMISSION,
    Permission.UPDATE_IPD_RECORDS,
    Permission.DISCHARGE_PATIENT,
    Permission.VIEW_BEDS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DOWNLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
    
    // Reports
    Permission.VIEW_CLINICAL_DASHBOARDS,
  ],

  // ============================================
  // HOSPITAL_ADMIN - Same as TENANT_ADMIN (alias for specific context)
  // ============================================
  [UserRole.HOSPITAL_ADMIN]: [
    // Same permissions as TENANT_ADMIN
    ...PermissionGroups.ADMINISTRATION,
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.EXPORT_PATIENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.VIEW_SENSITIVE_RECORDS,
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENTS,
    Permission.CANCEL_APPOINTMENTS,
    Permission.MANAGE_SCHEDULE,
    Permission.VIEW_STAFF,
    Permission.MANAGE_STAFF,
    Permission.VIEW_ATTENDANCE,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_SHIFTS,
    Permission.VIEW_BILLING,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_FINANCIAL_DASHBOARDS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_CLINICAL_DASHBOARDS,
    Permission.VIEW_OPERATIONAL_DASHBOARDS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.BACKUP_DATA,
  ],

  // ============================================
  // SPECIALIST - Senior doctor with additional privileges
  // ============================================
  [UserRole.SPECIALIST]: [
    // Same as doctor
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    Permission.VIEW_PATIENT_HISTORY,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORDS,
    Permission.UPDATE_MEDICAL_RECORDS,
    Permission.SIGN_MEDICAL_RECORDS,
    Permission.VIEW_SENSITIVE_RECORDS,
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENTS,
    Permission.VIEW_SCHEDULE,
    Permission.VIEW_ENCOUNTERS,
    Permission.CREATE_ENCOUNTERS,
    Permission.UPDATE_ENCOUNTERS,
    Permission.CLOSE_ENCOUNTERS,
    Permission.VIEW_CONSULTATION_NOTES,
    Permission.CREATE_CONSULTATION_NOTES,
    Permission.VIEW_PRESCRIPTIONS,
    Permission.CREATE_PRESCRIPTIONS,
    Permission.UPDATE_PRESCRIPTIONS,
    Permission.CANCEL_PRESCRIPTIONS,
    Permission.VIEW_LAB_ORDERS,
    Permission.CREATE_LAB_ORDERS,
    Permission.UPDATE_LAB_ORDERS,
    Permission.VIEW_LAB_RESULTS,
    Permission.VIEW_RADIOLOGY_ORDERS,
    Permission.CREATE_RADIOLOGY_ORDERS,
    Permission.VIEW_RADIOLOGY_IMAGES,
    Permission.VIEW_IPD_RECORDS,
    Permission.CREATE_IPD_ADMISSION,
    Permission.UPDATE_IPD_RECORDS,
    Permission.DISCHARGE_PATIENT,
    Permission.VIEW_BEDS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
    Permission.VIEW_CLINICAL_DASHBOARDS,
    // Additional specialist permissions
    Permission.APPROVE_LAB_RESULTS,
    Permission.APPROVE_RADIOLOGY_REPORT,
    Permission.DELETE_MEDICAL_RECORDS,
  ],

  // ============================================
  // RESIDENT - Junior doctor with supervised access
  // ============================================
  [UserRole.RESIDENT]: [
    // Patients (limited)
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    Permission.VIEW_PATIENT_HISTORY,
    
    // Medical Records (read mostly)
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.CREATE_MEDICAL_RECORDS,
    Permission.VIEW_CONSULTATION_NOTES,
    Permission.CREATE_CONSULTATION_NOTES,
    
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_SCHEDULE,
    
    // Encounters
    Permission.VIEW_ENCOUNTERS,
    Permission.CREATE_ENCOUNTERS,
    
    // Orders (can create, needs approval)
    Permission.VIEW_LAB_ORDERS,
    Permission.CREATE_LAB_ORDERS,
    Permission.VIEW_LAB_RESULTS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.DOWNLOAD_DOCUMENTS,
  ],

  // ============================================
  // NURSE - Clinical support staff
  // ============================================
  [UserRole.NURSE]: [
    // Patients
    Permission.VIEW_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    Permission.VIEW_PATIENT_HISTORY,
    
    // Medical Records (limited)
    Permission.VIEW_MEDICAL_RECORDS,
    
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_SCHEDULE,
    
    // Nursing
    Permission.VIEW_NURSING_NOTES,
    Permission.CREATE_NURSING_NOTES,
    Permission.UPDATE_NURSING_NOTES,
    Permission.VIEW_VITALS,
    Permission.RECORD_VITALS,
    Permission.ADMINISTER_MEDICATION,
    
    // IPD
    Permission.VIEW_IPD_RECORDS,
    Permission.UPDATE_IPD_RECORDS,
    Permission.VIEW_BEDS,
    
    // Prescriptions (view only)
    Permission.VIEW_PRESCRIPTIONS,
    
    // Lab (sample collection)
    Permission.VIEW_LAB_ORDERS,
    Permission.COLLECT_SAMPLES,
    Permission.TRACK_SAMPLES,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
  ],

  // ============================================
  // LAB TECHNICIAN - Laboratory operations
  // ============================================
  [UserRole.LAB_TECHNICIAN]: [
    // Patients (limited view)
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    
    // Lab Operations
    Permission.VIEW_LAB_ORDERS,
    Permission.UPDATE_LAB_ORDERS,
    Permission.COLLECT_SAMPLES,
    Permission.TRACK_SAMPLES,
    Permission.ENTER_LAB_RESULTS,
    Permission.VERIFY_LAB_RESULTS,
    Permission.VIEW_LAB_RESULTS,
    Permission.PRINT_LAB_REPORTS,
    Permission.MANAGE_LAB_TESTS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
  ],

  // ============================================
  // PHARMACIST - Pharmacy operations
  // ============================================
  [UserRole.PHARMACIST]: [
    // Patients (view for prescriptions)
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    
    // Prescriptions
    Permission.VIEW_PRESCRIPTIONS,
    Permission.DISPENSE_PRESCRIPTIONS,
    Permission.DISPENSE_MEDICATION,
    
    // Pharmacy Inventory
    Permission.VIEW_PHARMACY_INVENTORY,
    Permission.MANAGE_PHARMACY_INVENTORY,
    Permission.VIEW_MEDICATION_CATALOG,
    Permission.MANAGE_MEDICATION_CATALOG,
    Permission.CREATE_PURCHASE_ORDERS,
    Permission.MANAGE_DRUG_SUPPLIERS,
    Permission.VIEW_DRUG_EXPIRY,
    Permission.MANAGE_DRUG_PRICING,
    
    // Inventory
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.CREATE_STOCK_REQUESTS,
    Permission.TRACK_INVENTORY_MOVEMENT,
    Permission.VIEW_INVENTORY_ALERTS,
    
    // Billing (pharmacy sales)
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICES,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
  ],

  // ============================================
  // RADIOLOGIST - Radiology operations
  // ============================================
  [UserRole.RADIOLOGIST]: [
    // Patients (limited)
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    
    // Radiology
    Permission.VIEW_RADIOLOGY_ORDERS,
    Permission.PERFORM_RADIOLOGY_EXAM,
    Permission.UPLOAD_RADIOLOGY_IMAGES,
    Permission.VIEW_RADIOLOGY_IMAGES,
    Permission.REPORT_RADIOLOGY,
    Permission.APPROVE_RADIOLOGY_REPORT,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
  ],

  // ============================================
  // RECEPTIONIST - Front desk operations
  // ============================================
  [UserRole.RECEPTIONIST]: [
    // Patients
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.UPDATE_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    Permission.UPDATE_PATIENT_DEMOGRAPHICS,
    
    // Appointments
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.UPDATE_APPOINTMENTS,
    Permission.CANCEL_APPOINTMENTS,
    Permission.VIEW_SCHEDULE,
    
    // OPD
    Permission.VIEW_OPD_QUEUE,
    Permission.MANAGE_OPD_QUEUE,
    
    // Billing (basic)
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICES,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_RECEIPTS,
    Permission.PRINT_RECEIPTS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
    Permission.SEND_SMS,
    Permission.SEND_EMAIL,
  ],

  // ============================================
  // ACCOUNTANT - Financial operations
  // ============================================
  [UserRole.ACCOUNTANT]: [
    // Billing & Finance
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICES,
    Permission.UPDATE_INVOICES,
    Permission.VOID_INVOICES,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_PAYMENTS,
    Permission.REFUND_PAYMENTS,
    Permission.MANAGE_PAYMENT_METHODS,
    Permission.VIEW_RECEIPTS,
    Permission.PRINT_RECEIPTS,
    Permission.MANAGE_PRICING,
    Permission.APPLY_DISCOUNTS,
    
    // Insurance
    Permission.VIEW_INSURANCE,
    Permission.CREATE_INSURANCE_CLAIMS,
    Permission.SUBMIT_INSURANCE_CLAIMS,
    Permission.TRACK_INSURANCE_CLAIMS,
    Permission.VERIFY_INSURANCE_ELIGIBILITY,
    
    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_FINANCIAL_DASHBOARDS,
    Permission.EXPORT_DATA,
    
    // Patients (view for billing)
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
  ],

  // ============================================
  // HR MANAGER - Human resources
  // ============================================
  [UserRole.HR_MANAGER]: [
    // Staff Management
    Permission.VIEW_STAFF,
    Permission.MANAGE_STAFF,
    Permission.VIEW_ATTENDANCE,
    Permission.MANAGE_ATTENDANCE,
    Permission.VIEW_PAYROLL,
    Permission.MANAGE_PAYROLL,
    Permission.VIEW_LEAVE_REQUESTS,
    Permission.APPROVE_LEAVE_REQUESTS,
    Permission.MANAGE_SHIFTS,
    
    // Users (HR context)
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    
    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DOWNLOAD_DOCUMENTS,
  ],

  // ============================================
  // INVENTORY MANAGER - Inventory & supplies
  // ============================================
  [UserRole.INVENTORY_MANAGER]: [
    // Inventory Management
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.CREATE_STOCK_REQUESTS,
    Permission.APPROVE_STOCK_REQUESTS,
    Permission.TRACK_INVENTORY_MOVEMENT,
    Permission.MANAGE_SUPPLIERS,
    Permission.VIEW_INVENTORY_ALERTS,
    
    // Purchase Orders
    Permission.CREATE_PURCHASE_ORDERS,
    Permission.APPROVE_PURCHASE_ORDERS,
    
    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
  ],

  // ============================================
  // PATIENT - Limited self-service access
  // ============================================
  [UserRole.PATIENT]: [
    // Own records only
    Permission.VIEW_PATIENTS, // Limited to own record
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    Permission.VIEW_PATIENT_HISTORY,
    
    // Appointments
    Permission.VIEW_APPOINTMENTS, // Own appointments
    Permission.CREATE_APPOINTMENTS,
    Permission.BOOK_ONLINE,
    
    // Medical Records (own)
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.VIEW_CONSULTATION_NOTES,
    
    // Lab Results (own)
    Permission.VIEW_LAB_RESULTS,
    Permission.VIEW_RADIOLOGY_IMAGES,
    
    // Prescriptions (own)
    Permission.VIEW_PRESCRIPTIONS,
    
    // Billing (own)
    Permission.VIEW_BILLING,
    Permission.VIEW_RECEIPTS,
    
    // Documents (own)
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DOWNLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
  ],

  // ============================================
  // VENDOR - External supplier
  // ============================================
  [UserRole.VENDOR]: [
    // View own orders and invoices
    Permission.VIEW_INVENTORY,
    Permission.CREATE_PURCHASE_ORDERS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
  ],

  // ============================================
  // INSURANCE PROVIDER - External insurance company
  // ============================================
  [UserRole.INSURANCE_PROVIDER]: [
    // Insurance operations
    Permission.VIEW_INSURANCE,
    Permission.TRACK_INSURANCE_CLAIMS,
    Permission.APPROVE_INSURANCE_CLAIMS,
    Permission.VERIFY_INSURANCE_ELIGIBILITY,
    
    // Limited patient view
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_DEMOGRAPHICS,
    
    // Documents
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    
    // Communication
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
  ],

  // ============================================
  // USER - Basic authenticated user (minimal permissions)
  // ============================================
  [UserRole.USER]: [
    // Minimal access
    Permission.VIEW_MESSAGES,
    Permission.MESSAGE_READ,
  ],
};

/**
 * Helper function to check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = RolePermissionMapping[role];
  return rolePermissions.includes(permission);
}

/**
 * Helper function to get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissionMapping[role] || [];
}

/**
 * Helper function to check if a role has any of the specified permissions
 */
export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = RolePermissionMapping[role];
  return permissions.some(permission => rolePermissions.includes(permission));
}

/**
 * Helper function to check if a role has all of the specified permissions
 */
export function roleHasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = RolePermissionMapping[role];
  return permissions.every(permission => rolePermissions.includes(permission));
}
