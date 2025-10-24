import { apiClient } from './api-client';

/**
 * Laboratory Management API Service
 */

export interface CreateLabTestDto {
  name: string;
  code: string;
  description?: string;
  category: string;
  price?: number;
  isActive?: boolean;
}

export interface CreateLabOrderDto {
  patientId: string;
  doctorId?: string;
  tests: string[]; // Array of test IDs
  notes?: string;
  priority?: string;
}

export interface UpdateLabOrderDto {
  status?: string;
  completedDate?: string;
  notes?: string;
}

export interface UpdateTestResultDto {
  result: string;
  referenceRange?: string;
  notes?: string;
}

export interface LabTestFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LabOrderFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const laboratoryService = {
  // ==================== LAB TESTS ====================

  /**
   * Create new lab test
   */
  createLabTest: async (data: CreateLabTestDto) => {
    return apiClient.post('/laboratory/tests', data);
  },

  /**
   * Get all lab tests with filters
   */
  getLabTests: async (filters?: LabTestFilters) => {
    return apiClient.get('/laboratory/tests', filters);
  },

  /**
   * Get lab test by ID
   */
  getLabTestById: async (id: string) => {
    return apiClient.get(`/laboratory/tests/${id}`);
  },

  /**
   * Update lab test
   */
  updateLabTest: async (id: string, data: Partial<CreateLabTestDto>) => {
    return apiClient.patch(`/laboratory/tests/${id}`, data);
  },

  /**
   * Delete lab test (deactivate)
   */
  deleteLabTest: async (id: string) => {
    return apiClient.delete(`/laboratory/tests/${id}`);
  },

  // ==================== LAB ORDERS ====================

  /**
   * Create new lab order
   */
  createLabOrder: async (data: CreateLabOrderDto) => {
    return apiClient.post('/laboratory/orders', data);
  },

  /**
   * Get all lab orders with filters
   */
  getLabOrders: async (filters?: LabOrderFilters) => {
    return apiClient.get('/laboratory/orders', filters);
  },

  /**
   * Get lab order by ID
   */
  getLabOrderById: async (id: string) => {
    return apiClient.get(`/laboratory/orders/${id}`);
  },

  /**
   * Update lab order
   */
  updateLabOrder: async (id: string, data: UpdateLabOrderDto) => {
    return apiClient.patch(`/laboratory/orders/${id}`, data);
  },

  /**
   * Update test result in an order
   */
  updateTestResult: async (orderId: string, testId: string, data: UpdateTestResultDto) => {
    return apiClient.patch(`/laboratory/orders/${orderId}/tests/${testId}/result`, data);
  },

  /**
   * Cancel lab order
   */
  cancelLabOrder: async (id: string) => {
    return apiClient.delete(`/laboratory/orders/${id}`);
  },

  /**
   * Get laboratory statistics
   */
  getLabStats: async () => {
    return apiClient.get('/laboratory/orders/stats');
  },
};

export default laboratoryService;
