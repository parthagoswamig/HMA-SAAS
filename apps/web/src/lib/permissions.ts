/**
 * Permission utility functions for frontend
 */

export interface UserPermissions {
  permissions: string[];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserPermissions | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions (OR logic)
 */
export function hasAnyPermission(user: UserPermissions | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.some((permission) => user.permissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions (AND logic)
 */
export function hasAllPermissions(user: UserPermissions | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false;
  return permissions.every((permission) => user.permissions.includes(permission));
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions<T extends { permission?: string }>(
  items: T[],
  user: UserPermissions | null
): T[] {
  return items.filter((item) => {
    if (!item.permission) return true; // No permission required
    return hasPermission(user, item.permission);
  });
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  // Patient Management
  PATIENT_VIEW: 'patient.view',
  PATIENT_CREATE: 'patient.create',
  PATIENT_UPDATE: 'patient.update',
  PATIENT_DELETE: 'patient.delete',

  // Appointment Management
  APPOINTMENT_VIEW: 'appointment.view',
  APPOINTMENT_CREATE: 'appointment.create',
  APPOINTMENT_UPDATE: 'appointment.update',
  APPOINTMENT_DELETE: 'appointment.delete',
  APPOINTMENT_MANAGE: 'appointment.manage',

  // Billing & Finance
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_UPDATE: 'billing.update',
  BILLING_DELETE: 'billing.delete',
  PAYMENT_PROCESS: 'payment.process',
  FINANCE_VIEW: 'finance.view',
  FINANCE_MANAGE: 'finance.manage',

  // Pharmacy
  PHARMACY_VIEW: 'pharmacy.view',
  PHARMACY_MANAGE: 'pharmacy.manage',
  PHARMACY_DISPENSE: 'pharmacy.dispense',
  PRESCRIPTION_VIEW: 'prescription.view',
  PRESCRIPTION_CREATE: 'prescription.create',

  // Laboratory
  LAB_VIEW: 'lab.view',
  LAB_CREATE: 'lab.create',
  LAB_RESULTS_VIEW: 'lab.results.view',
  LAB_RESULTS_UPDATE: 'lab.results.update',
  LAB_MANAGE: 'lab.manage',

  // Radiology
  RADIOLOGY_VIEW: 'radiology.view',
  RADIOLOGY_CREATE: 'radiology.create',
  RADIOLOGY_REPORT: 'radiology.report',
  RADIOLOGY_MANAGE: 'radiology.manage',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_MANAGE: 'inventory.manage',

  // Staff Management
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  STAFF_MANAGE: 'staff.manage',

  // Role & Permission Management
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_ASSIGN: 'permissions.assign',

  // EMR
  EMR_VIEW: 'emr.view',
  EMR_CREATE: 'emr.create',
  EMR_UPDATE: 'emr.update',
  EMR_DELETE: 'emr.delete',

  // IPD
  IPD_VIEW: 'ipd.view',
  IPD_MANAGE: 'ipd.manage',
  WARD_MANAGE: 'ward.manage',

  // OPD
  OPD_VIEW: 'opd.view',
  OPD_MANAGE: 'opd.manage',

  // Emergency
  EMERGENCY_VIEW: 'emergency.view',
  EMERGENCY_MANAGE: 'emergency.manage',

  // Surgery
  SURGERY_VIEW: 'surgery.view',
  SURGERY_MANAGE: 'surgery.manage',

  // Telemedicine
  TELEMEDICINE_VIEW: 'telemedicine.view',
  TELEMEDICINE_CONDUCT: 'telemedicine.conduct',

  // Insurance
  INSURANCE_VIEW: 'insurance.view',
  INSURANCE_MANAGE: 'insurance.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_GENERATE: 'reports.generate',
  REPORTS_EXPORT: 'reports.export',

  // Quality
  QUALITY_VIEW: 'quality.view',
  QUALITY_MANAGE: 'quality.manage',

  // Research
  RESEARCH_VIEW: 'research.view',
  RESEARCH_MANAGE: 'research.manage',

  // Communications
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_SEND: 'communications.send',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  TENANT_MANAGE: 'tenant.manage',

  // Audit
  AUDIT_VIEW: 'audit.view',
} as const;
