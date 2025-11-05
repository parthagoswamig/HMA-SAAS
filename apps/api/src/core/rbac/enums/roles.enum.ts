/**
 * User Roles in the HMS System
 * Hierarchical role structure with escalating privileges
 */
export enum UserRole {
  // Platform Administration
  SUPER_ADMIN = 'SUPER_ADMIN',

  // Tenant Administration
  TENANT_ADMIN = 'TENANT_ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',

  // Medical Staff
  DOCTOR = 'DOCTOR',
  SPECIALIST = 'SPECIALIST',
  RESIDENT = 'RESIDENT',
  NURSE = 'NURSE',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  RADIOLOGIST = 'RADIOLOGIST',
  PHARMACIST = 'PHARMACIST',

  // Administrative Staff
  RECEPTIONIST = 'RECEPTIONIST',
  ACCOUNTANT = 'ACCOUNTANT',
  HR_MANAGER = 'HR_MANAGER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',

  // External Users
  VENDOR = 'VENDOR',
  INSURANCE_PROVIDER = 'INSURANCE_PROVIDER',

  // Patients
  PATIENT = 'PATIENT',

  // Generic
  USER = 'USER',
}

/**
 * Role hierarchy for permission inheritance
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.SPECIALIST,
    UserRole.RESIDENT,
    UserRole.NURSE,
    UserRole.LAB_TECHNICIAN,
    UserRole.RADIOLOGIST,
    UserRole.PHARMACIST,
    UserRole.RECEPTIONIST,
    UserRole.ACCOUNTANT,
    UserRole.HR_MANAGER,
    UserRole.INVENTORY_MANAGER,
    UserRole.PATIENT,
    UserRole.USER,
  ],
  [UserRole.TENANT_ADMIN]: [
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.SPECIALIST,
    UserRole.RESIDENT,
    UserRole.NURSE,
    UserRole.LAB_TECHNICIAN,
    UserRole.RADIOLOGIST,
    UserRole.PHARMACIST,
    UserRole.RECEPTIONIST,
    UserRole.ACCOUNTANT,
    UserRole.HR_MANAGER,
    UserRole.INVENTORY_MANAGER,
    UserRole.USER,
  ],
  [UserRole.HOSPITAL_ADMIN]: [
    UserRole.DOCTOR,
    UserRole.SPECIALIST,
    UserRole.RESIDENT,
    UserRole.NURSE,
    UserRole.LAB_TECHNICIAN,
    UserRole.RADIOLOGIST,
    UserRole.PHARMACIST,
    UserRole.RECEPTIONIST,
    UserRole.ACCOUNTANT,
    UserRole.HR_MANAGER,
    UserRole.INVENTORY_MANAGER,
    UserRole.USER,
  ],
  [UserRole.DOCTOR]: [UserRole.USER],
  [UserRole.SPECIALIST]: [UserRole.DOCTOR, UserRole.USER],
  [UserRole.RESIDENT]: [UserRole.USER],
  [UserRole.NURSE]: [UserRole.USER],
  [UserRole.LAB_TECHNICIAN]: [UserRole.USER],
  [UserRole.RADIOLOGIST]: [UserRole.USER],
  [UserRole.PHARMACIST]: [UserRole.USER],
  [UserRole.RECEPTIONIST]: [UserRole.USER],
  [UserRole.ACCOUNTANT]: [UserRole.USER],
  [UserRole.HR_MANAGER]: [UserRole.USER],
  [UserRole.INVENTORY_MANAGER]: [UserRole.USER],
  [UserRole.VENDOR]: [],
  [UserRole.INSURANCE_PROVIDER]: [],
  [UserRole.PATIENT]: [UserRole.USER],
  [UserRole.USER]: [],
};
