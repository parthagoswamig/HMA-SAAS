import { enhancedApiClient } from '../lib/api-client';

/**
 * Pharmacy Management API Service
 * Handles all pharmacy operations including medication inventory and order management
 */

// Types
export interface CreateMedicationDto {
  name: string;
  genericName?: string;
  description?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  category?: string;
  unitPrice?: number;
  quantityInStock?: number;
  minimumStockLevel?: number;
  reorderLevel?: number;
  expiryDate?: string;
  batchNumber?: string;
  barcode?: string;
  isActive?: boolean;
}

export interface UpdateMedicationDto {
  name?: string;
  genericName?: string;
  description?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  category?: string;
  unitPrice?: number;
  quantityInStock?: number;
  minimumStockLevel?: number;
  reorderLevel?: number;
  expiryDate?: string;
  batchNumber?: string;
  barcode?: string;
  isActive?: boolean;
}

export interface CreatePharmacyOrderDto {
  patientId: string;
  doctorId?: string;
  items: {
    medicationId: string;
    quantity: number;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }[];
  notes?: string;
}

export interface UpdatePharmacyOrderDto {
  status?: string;
  notes?: string;
}

export interface UpdateOrderItemDto {
  dispensedQuantity?: number;
  status?: string;
  notes?: string;
}

export interface MedicationFilters {
  category?: string;
  dosageForm?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PharmacyOrderFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MedicationResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    genericName?: string;
    description?: string;
    dosageForm?: string;
    strength?: string;
    manufacturer?: string;
    category?: string;
    unitPrice?: number;
    quantityInStock?: number;
    minimumStockLevel?: number;
    reorderLevel?: number;
    expiryDate?: string;
    batchNumber?: string;
    barcode?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MedicationsListResponse {
  success: boolean;
  data: {
    items: MedicationResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PharmacyOrderResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    orderNumber: string;
    patientId: string;
    doctorId?: string;
    status: 'PENDING' | 'PROCESSING' | 'DISPENSED' | 'COMPLETED' | 'CANCELLED';
    orderDate: string;
    notes?: string;
    totalAmount?: number;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      medicalRecordNumber?: string;
    };
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
      specialization?: string;
    };
    items: Array<{
      id: string;
      medicationId: string;
      quantity: number;
      dispensedQuantity?: number;
      dosage?: string;
      frequency?: string;
      duration?: string;
      instructions?: string;
      status: string;
      medication?: {
        id: string;
        name: string;
        genericName?: string;
        strength?: string;
        dosageForm?: string;
        unitPrice?: number;
      };
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PharmacyOrdersListResponse {
  success: boolean;
  data: {
    items: PharmacyOrderResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PharmacyStatsResponse {
  success: boolean;
  data: {
    totalMedications: number;
    lowStockMedications: number;
    totalOrders: number;
    pendingOrders: number;
    dispensedOrders: number;
    completedOrders: number;
    totalRevenue?: number;
  };
}

const pharmacyService = {
  // ==================== MEDICATIONS ====================

  /**
   * Create new medication
   */
  createMedication: async (data: CreateMedicationDto): Promise<MedicationResponse> => {
    return enhancedApiClient.post('/pharmacy/medications', data);
  },

  /**
   * Get all medications with filters
   */
  getMedications: async (filters?: MedicationFilters): Promise<MedicationsListResponse> => {
    return enhancedApiClient.get('/pharmacy/medications', filters);
  },

  /**
   * Get medication by ID
   */
  getMedicationById: async (id: string): Promise<MedicationResponse> => {
    return enhancedApiClient.get(`/pharmacy/medications/${id}`);
  },

  /**
   * Update medication
   */
  updateMedication: async (id: string, data: UpdateMedicationDto): Promise<MedicationResponse> => {
    return enhancedApiClient.patch(`/pharmacy/medications/${id}`, data);
  },

  /**
   * Delete medication (soft delete)
   */
  deleteMedication: async (id: string): Promise<MedicationResponse> => {
    return enhancedApiClient.delete(`/pharmacy/medications/${id}`);
  },

  // ==================== PHARMACY ORDERS ====================

  /**
   * Create new pharmacy order
   */
  createPharmacyOrder: async (data: CreatePharmacyOrderDto): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.post('/pharmacy/orders', data);
  },

  /**
   * Get all pharmacy orders with filters
   */
  getPharmacyOrders: async (
    filters?: PharmacyOrderFilters
  ): Promise<PharmacyOrdersListResponse> => {
    return enhancedApiClient.get('/pharmacy/orders', filters);
  },

  /**
   * Get pharmacy order by ID
   */
  getPharmacyOrderById: async (id: string): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.get(`/pharmacy/orders/${id}`);
  },

  /**
   * Update pharmacy order
   */
  updatePharmacyOrder: async (
    id: string,
    data: UpdatePharmacyOrderDto
  ): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.patch(`/pharmacy/orders/${id}`, data);
  },

  /**
   * Update order item status (dispensing)
   */
  updateOrderItem: async (
    orderId: string,
    itemId: string,
    data: UpdateOrderItemDto
  ): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.patch(`/pharmacy/orders/${orderId}/items/${itemId}`, data);
  },

  /**
   * Cancel pharmacy order
   */
  cancelPharmacyOrder: async (id: string): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.delete(`/pharmacy/orders/${id}`);
  },

  // ==================== STATISTICS ====================

  /**
   * Get pharmacy statistics
   */
  getPharmacyStats: async (): Promise<PharmacyStatsResponse> => {
    return enhancedApiClient.get('/pharmacy/orders/stats');
  },
};

export default pharmacyService;
