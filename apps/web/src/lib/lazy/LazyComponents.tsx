import { lazy, Suspense, ComponentType } from 'react';
import { PageLoader } from '@/components/shared/LoadingStates';

/**
 * Utility function to create lazy-loaded components with automatic Suspense wrapper
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <PageLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy-loaded dashboard page components
 */

// Patient pages
// export const PatientsPage = lazyLoad(() => import('../app/dashboard/patients/page'));

// export const PatientDetailsPage = lazyLoad(() => import('../app/dashboard/patients/[id]/page'));

// Appointment pages
// export const AppointmentsPage = lazyLoad(() => import('../app/dashboard/appointments/page'));

// export const AppointmentDetailsPage = lazyLoad(
//   () => import('../app/dashboard/appointments/[id]/page')
// );

// Billing pages
// export const BillingPage = lazyLoad(() => import('../app/dashboard/billing/page'));

// export const InvoiceDetailsPage = lazyLoad(
//   () => import('../app/dashboard/billing/invoices/[id]/page')
// );

// Staff pages
// export const StaffPage = lazyLoad(() => import('../app/dashboard/staff/page'));

// export const StaffDetailsPage = lazyLoad(() => import('../app/dashboard/staff/[id]/page'));

// Pharmacy pages
// export const PharmacyPage = lazyLoad(() => import('../app/dashboard/pharmacy/page'));

// Laboratory pages
// export const LaboratoryPage = lazyLoad(() => import('../app/dashboard/laboratory/page'));

// Radiology pages
// export const RadiologyPage = lazyLoad(() => import('../app/dashboard/radiology/page'));

// Reports pages
// export const ReportsPage = lazyLoad(() => import('../app/dashboard/reports/page'));

// Settings pages
// export const SettingsPage = lazyLoad(() => import('../app/dashboard/settings/page'));

/**
 * Preload utilities for improved UX
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc().catch(() => {
    // Silently catch errors during preload
  });
};

// Preload commonly accessed pages
export const preloadCommonPages = () => {
  if (typeof window !== 'undefined') {
    // Preload dashboard pages that are frequently accessed
    setTimeout(() => {
      // preloadComponent(() => import('../app/dashboard/patients/page'));
      // preloadComponent(() => import('../app/dashboard/appointments/page'));
    }, 1000);
  }
};
