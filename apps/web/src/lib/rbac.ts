/**
 * Frontend RBAC Utilities
 * Role-Based Access Control for UI elements
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'SPECIALIST'
  | 'RESIDENT'
  | 'NURSE'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST'
  | 'PHARMACIST'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'HR_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'PATIENT'
  | 'VENDOR'
  | 'INSURANCE_PROVIDER'
  | 'USER';

export interface DashboardModule {
  title: string;
  description: string;
  icon: string;
  href: string;
  stats?: string;
  color: string;
  active: boolean;
  requiredRoles: UserRole[];
}

/**
 * Define which roles can access which dashboard modules
 */
export const DASHBOARD_MODULES: DashboardModule[] = [
  {
    title: 'Patient Management',
    description: 'Patient records and demographics',
    icon: '👥',
    href: '/dashboard/patients',
    color: '#3b82f6',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'RESIDENT',
      'NURSE',
      'RECEPTIONIST',
    ],
  },
  {
    title: 'Appointments',
    description: 'Book and manage patient appointments',
    icon: '📅',
    href: '/dashboard/appointments',
    color: '#4ecdc4',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'RESIDENT',
      'NURSE',
      'RECEPTIONIST',
      'PATIENT',
    ],
  },
  {
    title: 'OPD Management',
    description: 'Outpatient consultations and records',
    icon: '🩺',
    href: '/dashboard/opd',
    color: '#45b7d1',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'RESIDENT',
      'NURSE',
      'RECEPTIONIST',
    ],
  },
  {
    title: 'IPD Management',
    description: 'Inpatient care and bed management',
    icon: '🏥',
    href: '/dashboard/ipd',
    color: '#96ceb4',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'NURSE',
    ],
  },
  {
    title: 'Emergency',
    description: 'Emergency cases and triage management',
    icon: '🚑',
    href: '/dashboard/emergency',
    color: '#ff8a80',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'NURSE',
    ],
  },
  {
    title: 'Laboratory',
    description: 'Lab tests and reports management',
    icon: '🧪',
    href: '/dashboard/laboratory',
    color: '#81d4fa',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'RESIDENT',
      'LAB_TECHNICIAN',
      'NURSE',
    ],
  },
  {
    title: 'Radiology',
    description: 'X-Ray, CT, MRI and imaging services',
    icon: '🔬',
    href: '/dashboard/radiology',
    color: '#64b5f6',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'RADIOLOGIST',
    ],
  },
  {
    title: 'Pathology',
    description: 'Pathology tests and reports',
    icon: '🦠',
    href: '/dashboard/pathology',
    color: '#4db6ac',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'LAB_TECHNICIAN',
    ],
  },
  {
    title: 'Pharmacy',
    description: 'Medicine inventory and dispensing',
    icon: '💊',
    href: '/dashboard/pharmacy',
    color: '#81c784',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'PHARMACIST',
      'DOCTOR',
      'SPECIALIST',
    ],
  },
  {
    title: 'Surgery',
    description: 'Operation theater and surgery scheduling',
    icon: '⚕️',
    href: '/dashboard/surgery',
    color: '#f48fb1',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'DOCTOR',
      'SPECIALIST',
      'NURSE',
    ],
  },
  {
    title: 'Billing & Invoices',
    description: 'Generate bills and track payments',
    icon: '💰',
    href: '/dashboard/billing',
    color: '#ffb74d',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'],
  },
  {
    title: 'Finance',
    description: 'Financial reports and revenue tracking',
    icon: '💵',
    href: '/dashboard/finance',
    color: '#ff9800',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'ACCOUNTANT'],
  },
  {
    title: 'Insurance',
    description: 'Insurance claims and coverage',
    icon: '🛡️',
    href: '/dashboard/insurance',
    color: '#42a5f5',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'ACCOUNTANT',
      'INSURANCE_PROVIDER',
    ],
  },
  {
    title: 'Staff Management',
    description: 'Manage doctors, nurses, and staff',
    icon: '👨‍⚕️',
    href: '/dashboard/staff',
    color: '#ab47bc',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'HR_MANAGER'],
  },
  {
    title: 'HR Management',
    description: 'Human resources and attendance',
    icon: '📋',
    href: '/dashboard/hr',
    color: '#9c27b0',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'HR_MANAGER'],
  },
  {
    title: 'Inventory',
    description: 'Inventory and supplies management',
    icon: '📦',
    href: '/dashboard/inventory',
    color: '#607d8b',
    active: true,
    requiredRoles: [
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'HOSPITAL_ADMIN',
      'INVENTORY_MANAGER',
      'PHARMACIST',
    ],
  },
  {
    title: 'Reports & Analytics',
    description: 'Comprehensive reports and dashboards',
    icon: '📊',
    href: '/dashboard/reports',
    color: '#00bcd4',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'ACCOUNTANT', 'DOCTOR'],
  },
  {
    title: 'System Settings',
    description: 'System configuration and settings',
    icon: '⚙️',
    href: '/dashboard/settings',
    color: '#9e9e9e',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'],
  },
  {
    title: 'Audit Logs',
    description: 'System audit trail and activity logs',
    icon: '📝',
    href: '/dashboard/audit',
    color: '#795548',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'],
  },
  {
    title: 'User Management',
    description: 'Manage system users and roles',
    icon: '👤',
    href: '/dashboard/users',
    color: '#673ab7',
    active: true,
    requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'],
  },
  // Tenant Management (Super Admin only)
  {
    title: 'Tenant Management',
    description: 'Manage hospitals and organizations',
    icon: '🏢',
    href: '/dashboard/admin/tenants',
    color: '#e91e63',
    active: true,
    requiredRoles: ['SUPER_ADMIN'],
  },
  // Hospital Settings (Hospital Admin only)
  {
    title: 'Hospital Settings',
    description: 'Configure your hospital settings',
    icon: '🏥',
    href: '/dashboard/settings/hospital',
    color: '#009688',
    active: true,
    requiredRoles: ['HOSPITAL_ADMIN'],
  },
  // Subscription Management
  {
    title: 'Subscription & Billing',
    description: 'Manage your subscription plan',
    icon: '💳',
    href: '/dashboard/settings/subscription',
    color: '#ff5722',
    active: true,
    requiredRoles: ['HOSPITAL_ADMIN'],
  },
  // Patient-only modules
  {
    title: 'My Health Records',
    description: 'View your medical history and records',
    icon: '📋',
    href: '/dashboard/my-records',
    color: '#4caf50',
    active: true,
    requiredRoles: ['PATIENT'],
  },
  {
    title: 'My Appointments',
    description: 'View and book your appointments',
    icon: '📅',
    href: '/dashboard/my-appointments',
    color: '#2196f3',
    active: true,
    requiredRoles: ['PATIENT'],
  },
  {
    title: 'My Bills',
    description: 'View and pay your medical bills',
    icon: '💳',
    href: '/dashboard/my-bills',
    color: '#ff9800',
    active: true,
    requiredRoles: ['PATIENT'],
  },
];

/**
 * Check if a user has access to a module
 */
export function hasAccess(userRole: UserRole, module: DashboardModule): boolean {
  return module.requiredRoles.includes(userRole) || userRole === 'SUPER_ADMIN';
}

/**
 * Filter modules based on user role
 */
export function getModulesForRole(userRole: UserRole): DashboardModule[] {
  return DASHBOARD_MODULES.filter((module) => hasAccess(userRole, module));
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Administrator',
    TENANT_ADMIN: 'Tenant Administrator',
    HOSPITAL_ADMIN: 'Hospital Administrator',
    DOCTOR: 'Doctor',
    SPECIALIST: 'Specialist Doctor',
    RESIDENT: 'Resident Doctor',
    NURSE: 'Nurse',
    LAB_TECHNICIAN: 'Lab Technician',
    RADIOLOGIST: 'Radiologist',
    PHARMACIST: 'Pharmacist',
    RECEPTIONIST: 'Receptionist',
    ACCOUNTANT: 'Accountant',
    HR_MANAGER: 'HR Manager',
    INVENTORY_MANAGER: 'Inventory Manager',
    PATIENT: 'Patient',
    VENDOR: 'Vendor',
    INSURANCE_PROVIDER: 'Insurance Provider',
    USER: 'User',
  };
  return roleNames[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    SUPER_ADMIN: '#dc2626',
    TENANT_ADMIN: '#ea580c',
    HOSPITAL_ADMIN: '#d97706',
    DOCTOR: '#0891b2',
    SPECIALIST: '#0284c7',
    RESIDENT: '#0ea5e9',
    NURSE: '#22c55e',
    LAB_TECHNICIAN: '#14b8a6',
    RADIOLOGIST: '#3b82f6',
    PHARMACIST: '#8b5cf6',
    RECEPTIONIST: '#ec4899',
    ACCOUNTANT: '#f59e0b',
    HR_MANAGER: '#a855f7',
    INVENTORY_MANAGER: '#78716c',
    PATIENT: '#10b981',
    VENDOR: '#6366f1',
    INSURANCE_PROVIDER: '#06b6d4',
    USER: '#6b7280',
  };
  return colors[role] || '#6b7280';
}
