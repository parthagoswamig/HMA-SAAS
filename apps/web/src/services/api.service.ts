import apiClient, { handleApiError } from '../lib/api-client';

// Re-export apiClient for other services
export { apiClient };

// ============================================
// PATIENTS SERVICE
// ============================================
export const patientsApi = {
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/patients', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  create: async (data: any) => {
    try {
      const response = await apiClient.post('/patients', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/patients/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  search: async (query: string) => {
    try {
      const response = await apiClient.get('/patients/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/patients/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// APPOINTMENTS SERVICE
// ============================================
export const appointmentsApi = {
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/appointments', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  create: async (data: any) => {
    try {
      const response = await apiClient.post('/appointments', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateStatus: async (id: string, status: string) => {
    try {
      const response = await apiClient.patch(`/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getCalendar: async (params?: any) => {
    try {
      const response = await apiClient.get('/appointments/calendar', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/appointments/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// STAFF SERVICE
// ============================================
export const staffApi = {
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/staff', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/staff/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  create: async (data: any) => {
    try {
      const response = await apiClient.post('/staff', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/staff/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/staff/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/staff/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// OPD SERVICE
// ============================================
export const opdApi = {
  createVisit: async (data: any) => {
    try {
      const response = await apiClient.post('/opd/visits', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getVisits: async (params?: any) => {
    try {
      const response = await apiClient.get('/opd/visits', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getVisitById: async (id: string) => {
    try {
      const response = await apiClient.get(`/opd/visits/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateVisit: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/opd/visits/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getQueue: async () => {
    try {
      const response = await apiClient.get('/opd/queue');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/opd/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// LABORATORY SERVICE
// ============================================
export const laboratoryApi = {
  getTests: async (params?: any) => {
    try {
      const response = await apiClient.get('/laboratory/tests', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createTest: async (data: any) => {
    try {
      const response = await apiClient.post('/laboratory/tests', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getOrders: async (params?: any) => {
    try {
      const response = await apiClient.get('/laboratory/orders', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createOrder: async (data: any) => {
    try {
      const response = await apiClient.post('/laboratory/orders', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTestResult: async (orderId: string, testId: string, data: any) => {
    try {
      const response = await apiClient.patch(
        `/laboratory/orders/${orderId}/tests/${testId}/result`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/laboratory/orders/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// PHARMACY SERVICE
// ============================================
export const pharmacyApi = {
  getMedications: async (params?: any) => {
    try {
      const response = await apiClient.get('/pharmacy/medications', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createMedication: async (data: any) => {
    try {
      const response = await apiClient.post('/pharmacy/medications', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getOrders: async (params?: any) => {
    try {
      const response = await apiClient.get('/pharmacy/orders', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createOrder: async (data: any) => {
    try {
      const response = await apiClient.post('/pharmacy/orders', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateOrder: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/pharmacy/orders/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/pharmacy/orders/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// BILLING SERVICE
// ============================================
export const billingApi = {
  getInvoices: async (params?: any) => {
    try {
      const response = await apiClient.get('/billing/invoices', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createInvoice: async (data: any) => {
    try {
      const response = await apiClient.post('/billing/invoices', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPayments: async (params?: any) => {
    try {
      const response = await apiClient.get('/billing/payments', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createPayment: async (data: any) => {
    try {
      const response = await apiClient.post('/billing/payments', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/billing/invoices/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getRevenueReport: async (params?: any) => {
    try {
      const response = await apiClient.get('/billing/invoices/reports/revenue', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// IPD SERVICE
// ============================================
export const ipdApi = {
  getWards: async () => {
    try {
      const response = await apiClient.get('/ipd/wards');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createWard: async (data: any) => {
    try {
      const response = await apiClient.post('/ipd/wards', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getBeds: async (params?: any) => {
    try {
      const response = await apiClient.get('/ipd/beds', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAvailableBeds: async () => {
    try {
      const response = await apiClient.get('/ipd/beds/available');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateBedStatus: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/ipd/beds/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/ipd/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// EMERGENCY SERVICE
// ============================================
export const emergencyApi = {
  getCases: async (params?: any) => {
    try {
      const response = await apiClient.get('/emergency/cases', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createCase: async (data: any) => {
    try {
      const response = await apiClient.post('/emergency/cases', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateCase: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/emergency/cases/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTriage: async (id: string, data: any) => {
    try {
      const response = await apiClient.patch(`/emergency/cases/${id}/triage`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getQueue: async () => {
    try {
      const response = await apiClient.get('/emergency/queue');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/emergency/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// ============================================
// REPORTS SERVICE
// ============================================
export const reportsApi = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/reports/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPatientReport: async (params?: any) => {
    try {
      const response = await apiClient.get('/reports/patients', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAppointmentReport: async (params?: any) => {
    try {
      const response = await apiClient.get('/reports/appointments', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getRevenueReport: async (params?: any) => {
    try {
      const response = await apiClient.get('/reports/revenue', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Export all services
export const apiService = {
  patients: patientsApi,
  appointments: appointmentsApi,
  staff: staffApi,
  opd: opdApi,
  laboratory: laboratoryApi,
  pharmacy: pharmacyApi,
  billing: billingApi,
  ipd: ipdApi,
  emergency: emergencyApi,
  reports: reportsApi,
};

export default apiService;
