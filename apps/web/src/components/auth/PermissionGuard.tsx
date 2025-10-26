import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Component to conditionally render children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  allowedRoles = [],
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.role || '');
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permissions) {
    let hasAccess = false;

    if (typeof permissions === 'string') {
      hasAccess = hasPermission(permissions);
    } else if (Array.isArray(permissions)) {
      hasAccess = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * HOC to protect components with permissions
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  permissions?: string | string[],
  requireAll = false,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <PermissionGuard permissions={permissions} requireAll={requireAll} fallback={fallback}>
      <Component {...props} />
    </PermissionGuard>
  );
  
  WrappedComponent.displayName = `withPermissions(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

/**
 * Hook to check if a UI element should be visible
 */
export function usePermissionVisibility(
  permissions?: string | string[],
  requireAll = false
): boolean {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (!permissions) return true;

  if (typeof permissions === 'string') {
    return hasPermission(permissions);
  }

  if (Array.isArray(permissions)) {
    return requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return false;
}
