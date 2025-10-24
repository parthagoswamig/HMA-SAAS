import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, queryKeys } from './queryClient';
import { notifications } from '@mantine/notifications';

// Patient hooks
export function usePatients(filters?: any) {
  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: () => apiClient.get('/api/patients', { body: JSON.stringify(filters) }),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => apiClient.get(`/api/patients/${id}`),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/api/patients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      notifications.show({
        title: 'Success',
        message: 'Patient created successfully',
        color: 'green',
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/api/patients/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(variables.id) });
      notifications.show({
        title: 'Success',
        message: 'Patient updated successfully',
        color: 'green',
      });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      notifications.show({
        title: 'Success',
        message: 'Patient deleted successfully',
        color: 'green',
      });
    },
  });
}

// Appointment hooks
export function useAppointments(filters?: any) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: () => apiClient.get('/api/appointments', { body: JSON.stringify(filters) }),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => apiClient.get(`/api/appointments/${id}`),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/api/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      notifications.show({
        title: 'Success',
        message: 'Appointment created successfully',
        color: 'green',
      });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/api/appointments/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(variables.id) });
      notifications.show({
        title: 'Success',
        message: 'Appointment updated successfully',
        color: 'green',
      });
    },
  });
}

// Staff hooks
export function useStaff(filters?: any) {
  return useQuery({
    queryKey: queryKeys.staff.list(filters),
    queryFn: () => apiClient.get('/api/staff', { body: JSON.stringify(filters) }),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: queryKeys.staff.detail(id),
    queryFn: () => apiClient.get(`/api/staff/${id}`),
    enabled: !!id,
  });
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/api/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      notifications.show({
        title: 'Success',
        message: 'Staff member created successfully',
        color: 'green',
      });
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/api/staff/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(variables.id) });
      notifications.show({
        title: 'Success',
        message: 'Staff member updated successfully',
        color: 'green',
      });
    },
  });
}

// Billing hooks
export function useInvoices(filters?: any) {
  return useQuery({
    queryKey: queryKeys.billing.invoices(filters),
    queryFn: () => apiClient.get('/api/billing/invoices', { body: JSON.stringify(filters) }),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.billing.invoice(id),
    queryFn: () => apiClient.get(`/api/billing/invoices/${id}`),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/api/billing/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      notifications.show({
        title: 'Success',
        message: 'Invoice created successfully',
        color: 'green',
      });
    },
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/api/billing/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      notifications.show({
        title: 'Success',
        message: 'Payment processed successfully',
        color: 'green',
      });
    },
  });
}

// Pharmacy hooks
export function useMedications(filters?: any) {
  return useQuery({
    queryKey: queryKeys.pharmacy.medications(filters),
    queryFn: () => apiClient.get('/api/pharmacy/medications', { body: JSON.stringify(filters) }),
  });
}

export function useMedication(id: string) {
  return useQuery({
    queryKey: queryKeys.pharmacy.medication(id),
    queryFn: () => apiClient.get(`/api/pharmacy/medications/${id}`),
    enabled: !!id,
  });
}

// Laboratory hooks
export function useLabTests(filters?: any) {
  return useQuery({
    queryKey: queryKeys.laboratory.tests(filters),
    queryFn: () => apiClient.get('/api/laboratory/tests', { body: JSON.stringify(filters) }),
  });
}

export function useLabTest(id: string) {
  return useQuery({
    queryKey: queryKeys.laboratory.test(id),
    queryFn: () => apiClient.get(`/api/laboratory/tests/${id}`),
    enabled: !!id,
  });
}

// Reports hooks
export function useDashboardReport() {
  return useQuery({
    queryKey: queryKeys.reports.dashboard,
    queryFn: () => apiClient.get('/api/reports/dashboard'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFinancialReport(filters?: any) {
  return useQuery({
    queryKey: queryKeys.reports.financial(filters),
    queryFn: () => apiClient.get('/api/reports/financial', { body: JSON.stringify(filters) }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
