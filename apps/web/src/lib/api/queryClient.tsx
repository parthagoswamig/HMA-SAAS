'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

// Default options for React Query
const defaultQueryOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.message || 'Something went wrong',
        color: 'red',
      });
    },
  },
};

// Create a client
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// API utility functions with automatic error handling
export const apiClient = {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async patch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

// Query keys factory for consistent cache management
export const queryKeys = {
  patients: {
    all: ['patients'] as const,
    list: (filters?: any) => [...queryKeys.patients.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.patients.all, 'detail', id] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    list: (filters?: any) => [...queryKeys.appointments.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.appointments.all, 'detail', id] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (filters?: any) => [...queryKeys.staff.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.staff.all, 'detail', id] as const,
  },
  billing: {
    all: ['billing'] as const,
    invoices: (filters?: any) => [...queryKeys.billing.all, 'invoices', filters] as const,
    invoice: (id: string) => [...queryKeys.billing.all, 'invoice', id] as const,
    payments: (filters?: any) => [...queryKeys.billing.all, 'payments', filters] as const,
  },
  pharmacy: {
    all: ['pharmacy'] as const,
    medications: (filters?: any) => [...queryKeys.pharmacy.all, 'medications', filters] as const,
    medication: (id: string) => [...queryKeys.pharmacy.all, 'medication', id] as const,
  },
  laboratory: {
    all: ['laboratory'] as const,
    tests: (filters?: any) => [...queryKeys.laboratory.all, 'tests', filters] as const,
    test: (id: string) => [...queryKeys.laboratory.all, 'test', id] as const,
  },
  reports: {
    all: ['reports'] as const,
    dashboard: ['reports', 'dashboard'] as const,
    financial: (filters?: any) => [...queryKeys.reports.all, 'financial', filters] as const,
  },
};
