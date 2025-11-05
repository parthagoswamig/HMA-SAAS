'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { notifications } from '@mantine/notifications';

// Role definitions
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  RADIOLOGIST = 'RADIOLOGIST',
  ACCOUNTANT = 'ACCOUNTANT',
  PATIENT = 'PATIENT',
}

// Permission definitions
export enum Permission {
  // Patient permissions
  VIEW_PATIENTS = 'VIEW_PATIENTS',
  CREATE_PATIENTS = 'CREATE_PATIENTS',
  EDIT_PATIENTS = 'EDIT_PATIENTS',
  DELETE_PATIENTS = 'DELETE_PATIENTS',

  // Appointment permissions
  VIEW_APPOINTMENTS = 'VIEW_APPOINTMENTS',
  CREATE_APPOINTMENTS = 'CREATE_APPOINTMENTS',
  EDIT_APPOINTMENTS = 'EDIT_APPOINTMENTS',
  CANCEL_APPOINTMENTS = 'CANCEL_APPOINTMENTS',

  // Medical records
  VIEW_MEDICAL_RECORDS = 'VIEW_MEDICAL_RECORDS',
  EDIT_MEDICAL_RECORDS = 'EDIT_MEDICAL_RECORDS',

  // Billing
  VIEW_BILLING = 'VIEW_BILLING',
  CREATE_INVOICES = 'CREATE_INVOICES',
  PROCESS_PAYMENTS = 'PROCESS_PAYMENTS',

  // Staff management
  VIEW_STAFF = 'VIEW_STAFF',
  MANAGE_STAFF = 'MANAGE_STAFF',

  // System admin
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',
  VIEW_REPORTS = 'VIEW_REPORTS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

// Role-Permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),

  [UserRole.ADMIN]: [
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICES,
    Permission.VIEW_STAFF,
    Permission.MANAGE_STAFF,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_SETTINGS,
  ],

  [UserRole.DOCTOR]: [
    Permission.VIEW_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.VIEW_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.EDIT_MEDICAL_RECORDS,
    Permission.VIEW_BILLING,
  ],

  [UserRole.NURSE]: [
    Permission.VIEW_PATIENTS,
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.EDIT_MEDICAL_RECORDS,
  ],

  [UserRole.RECEPTIONIST]: [
    Permission.VIEW_PATIENTS,
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.VIEW_APPOINTMENTS,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.VIEW_BILLING,
  ],

  [UserRole.PHARMACIST]: [
    Permission.VIEW_PATIENTS,
    Permission.VIEW_MEDICAL_RECORDS,
    Permission.VIEW_BILLING,
  ],

  [UserRole.LAB_TECHNICIAN]: [Permission.VIEW_PATIENTS, Permission.VIEW_MEDICAL_RECORDS],

  [UserRole.RADIOLOGIST]: [Permission.VIEW_PATIENTS, Permission.VIEW_MEDICAL_RECORDS],

  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_BILLING,
    Permission.CREATE_INVOICES,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.PATIENT]: [Permission.VIEW_APPOINTMENTS, Permission.CREATE_APPOINTMENTS],
};

// Route access control
const protectedRoutes: Record<string, Permission[]> = {
  '/dashboard/patients': [Permission.VIEW_PATIENTS],
  '/dashboard/appointments': [Permission.VIEW_APPOINTMENTS],
  '/dashboard/billing': [Permission.VIEW_BILLING],
  '/dashboard/staff': [Permission.VIEW_STAFF],
  '/dashboard/reports': [Permission.VIEW_REPORTS],
  '/dashboard/settings': [Permission.MANAGE_SETTINGS],
  '/dashboard/pharmacy': [Permission.VIEW_MEDICAL_RECORDS],
  '/dashboard/laboratory': [Permission.VIEW_MEDICAL_RECORDS],
  '/dashboard/radiology': [Permission.VIEW_MEDICAL_RECORDS],
};

interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  permissions?: Permission[];
}

interface RBACContextType {
  user: User | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('hms_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Check route access on pathname change
  useEffect(() => {
    if (!loading && user) {
      const canAccess = canAccessRoute(pathname);
      if (!canAccess && pathname !== '/dashboard') {
        try {
          notifications.show({
            title: 'Access Denied',
            message: 'You do not have permission to access this page',
            color: 'red',
          });
        } catch (error) {
          console.warn('Notifications not ready:', error);
        }
        router.push('/dashboard');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, loading, user]);

  const getUserPermissions = (userRole: UserRole): Permission[] => {
    return rolePermissions[userRole] || [];
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = user.permissions || getUserPermissions(user.role);
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    // Allow dashboard home for all authenticated users
    if (route === '/dashboard') return true;

    // Check if route requires specific permissions
    const requiredPermissions = protectedRoutes[route];
    if (!requiredPermissions) return true; // No specific permissions required

    return hasAnyPermission(requiredPermissions);
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('hms_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_user');
    router.push('/auth/login');
  };

  const value: RBACContextType = {
    user,
    loading,
    hasPermission,
    hasAnyPermission,
    hasRole,
    canAccessRoute,
    login,
    logout,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

// Hook to use RBAC context
export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
};

// HOC to protect components
export function withRBAC<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[]
) {
  return function ProtectedComponent(props: P) {
    const { hasAnyPermission, loading } = useRBAC();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!hasAnyPermission(requiredPermissions)) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Component to conditionally render based on permissions
export const ProtectedElement: React.FC<{
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permissions, children, fallback = null }) => {
  const { hasAnyPermission } = useRBAC();

  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
