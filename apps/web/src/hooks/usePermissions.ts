import { useMemo } from 'react';
import authService from '../services/auth.service';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const user = authService.getCurrentUser();
  const permissions = authService.getUserPermissions();

  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      return authService.hasPermission(permission);
    };
  }, []);

  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      return authService.hasAnyPermission(permissions);
    };
  }, []);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: string[]): boolean => {
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'HOSPITAL_ADMIN') {
        return true;
      }
      return requiredPermissions.every(p => permissions.includes(p));
    };
  }, [user, permissions]);

  const isAdmin = useMemo(() => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'HOSPITAL_ADMIN';
  }, [user]);

  const isDoctor = useMemo(() => {
    return user?.role === 'DOCTOR';
  }, [user]);

  const isNurse = useMemo(() => {
    return user?.role === 'NURSE';
  }, [user]);

  const isReceptionist = useMemo(() => {
    return user?.role === 'RECEPTIONIST';
  }, [user]);

  const isPharmacist = useMemo(() => {
    return user?.role === 'PHARMACIST';
  }, [user]);

  const isLabTech = useMemo(() => {
    return user?.role === 'LAB_TECHNICIAN';
  }, [user]);

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    isPharmacist,
    isLabTech,
  };
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
  PATIENT_EXPORT: 'patient.export',

  // Appointment Management
  APPOINTMENT_VIEW: 'appointment.view',
  APPOINTMENT_CREATE: 'appointment.create',
  APPOINTMENT_UPDATE: 'appointment.update',
  APPOINTMENT_DELETE: 'appointment.delete',
  APPOINTMENT_APPROVE: 'appointment.approve',

  // Billing Management
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_UPDATE: 'billing.update',
  BILLING_DELETE: 'billing.delete',
  BILLING_PAYMENT: 'billing.payment',

  // Pharmacy Management
  PHARMACY_VIEW: 'pharmacy.view',
  PHARMACY_CREATE: 'pharmacy.create',
  PHARMACY_UPDATE: 'pharmacy.update',
  PHARMACY_DELETE: 'pharmacy.delete',
  PHARMACY_DISPENSE: 'pharmacy.dispense',

  // Laboratory Management
  LAB_VIEW: 'lab.view',
  LAB_CREATE: 'lab.create',
  LAB_UPDATE: 'lab.update',
  LAB_DELETE: 'lab.delete',
  LAB_APPROVE: 'lab.approve',

  // Inventory Management
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',

  // Role Management
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_ASSIGN: 'role.assign',

  // User Management
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Settings Management
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  REPORTS_EXPORT: 'reports.export',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ANALYTICS: 'dashboard.analytics',
};
