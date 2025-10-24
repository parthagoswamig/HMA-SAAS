import { enhancedApiClient } from '../lib/api-client';

/**
 * Pathology & Laboratory API Service
 * Handles all pathology operations including test catalog and order management
 */

// Types
export interface CreateLabTestDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  price?: number;
  normalRange?: string;
  unit?: string;
  sampleType?: string;
  preparationInstructions?: string;
  turnaroundTime?: string;
}

export interface UpdateLabTestDto {
  name?: string;
  code?: string;
  category?: string;
  description?: string;
  price?: number;
  normalRange?: string;
  unit?: string;
  sampleType?: string;
  preparationInstructions?: string;
  turnaroundTime?: string;
  isActive?: boolean;
}

export interface CreateLabOrderDto {
  patientId: string;
  doctorId?: string;
  tests: string[];
  notes?: string;
  priority?: 'NORMAL' | 'URGENT' | 'STAT';
  sampleCollectionDate?: string;
}

export interface UpdateLabOrderDto {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  priority?: 'NORMAL' | 'URGENT' | 'STAT';
}

export interface UpdateTestResultDto {
  result: string;
  notes?: string;
  isAbnormal?: boolean;
}

export interface PathologyFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  patientId?: string;
  search?: string;
}

export interface LabTestResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    code: string;
    category: string;
    description?: string;
    price?: number;
    normalRange?: string;
    unit?: string;
    sampleType?: string;
    preparationInstructions?: string;
    turnaroundTime?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface LabTestsListResponse {
  success: boolean;
  data: {
    items: LabTestResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface LabOrderResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    orderNumber: string;
    patientId: string;
    doctorId?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority?: string;
    notes?: string;
    sampleCollectionDate?: string;
    completedDate?: string;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      medicalRecordNumber?: string;
    };
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
      specialization?: string;
    };
    tests: Array<{
      id: string;
      testId: string;
      result?: string;
      notes?: string;
      status: string;
      resultDate?: string;
      test?: {
        id: string;
        name: string;
        code: string;
        category: string;
        normalRange?: string;
        unit?: string;
      };
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface LabOrdersListResponse {
  success: boolean;
  data: {
    items: LabOrderResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PathologyStatsResponse {
  success: boolean;
  data: {
    tests: {
      total: number;
      active: number;
    };
    orders: {
      total: number;
      pending: number;
      completed: number;
    };
  };
}

const pathologyService = {
  // ==================== LAB TESTS ====================

  /**
   * Create new lab test
   */
  createTest: async (data: CreateLabTestDto): Promise<LabTestResponse> => {
    return enhancedApiClient.post('/pathology/tests', data);
  },

  /**
   * Get all lab tests with filters
   */
  getTests: async (filters?: PathologyFilters): Promise<LabTestsListResponse> => {
    return enhancedApiClient.get('/pathology/tests', filters);
  },

  /**
   * Get lab test by ID
   */
  getTestById: async (id: string): Promise<LabTestResponse> => {
    return enhancedApiClient.get(`/pathology/tests/${id}`);
  },

  /**
   * Update lab test
   */
  updateTest: async (id: string, data: UpdateLabTestDto): Promise<LabTestResponse> => {
    return enhancedApiClient.patch(`/pathology/tests/${id}`, data);
  },

  /**
   * Delete lab test (soft delete)
   */
  deleteTest: async (id: string): Promise<LabTestResponse> => {
    return enhancedApiClient.delete(`/pathology/tests/${id}`);
  },

  // ==================== LAB ORDERS ====================

  /**
   * Create new lab order
   */
  createOrder: async (data: CreateLabOrderDto): Promise<LabOrderResponse> => {
    return enhancedApiClient.post('/pathology/orders', data);
  },

  /**
   * Get all lab orders with filters
   */
  getOrders: async (filters?: PathologyFilters): Promise<LabOrdersListResponse> => {
    return enhancedApiClient.get('/pathology/orders', filters);
  },

  /**
   * Get lab order by ID
   */
  getOrderById: async (id: string): Promise<LabOrderResponse> => {
    return enhancedApiClient.get(`/pathology/orders/${id}`);
  },

  /**
   * Update lab order
   */
  updateOrder: async (id: string, data: UpdateLabOrderDto): Promise<LabOrderResponse> => {
    return enhancedApiClient.patch(`/pathology/orders/${id}`, data);
  },

  /**
   * Cancel lab order
   */
  cancelOrder: async (id: string): Promise<LabOrderResponse> => {
    return enhancedApiClient.delete(`/pathology/orders/${id}`);
  },

  /**
   * Update test result in an order
   */
  updateTestResult: async (
    orderId: string,
    testId: string,
    data: UpdateTestResultDto
  ): Promise<LabOrderResponse> => {
    return enhancedApiClient.patch(`/pathology/orders/${orderId}/tests/${testId}/result`, data);
  },

  // ==================== STATISTICS ====================

  /**
   * Get pathology statistics
   */
  getStats: async (): Promise<PathologyStatsResponse> => {
    return enhancedApiClient.get('/pathology/stats');
  },
};

export default pathologyService;
