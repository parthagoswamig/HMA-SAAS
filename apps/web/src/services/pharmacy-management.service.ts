import { enhancedApiClient } from '../lib/api-client';

/**
 * Pharmacy Management API Service
 * Handles pharmacy management operations including medication catalog and order dispensing
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

export interface MedicationFilters {
  category?: string;
  dosageForm?: string;
  search?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface PharmacyOrderFilters {
  patientId?: string;
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
    status: 'PENDING' | 'PROCESSING' | 'DISPENSED' | 'COMPLETED' | 'CANCELLED';
    orderDate: string;
    dispensedDate?: string;
    notes?: string;
    totalAmount?: number;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      medicalRecordNumber?: string;
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

export interface PharmacyManagementStatsResponse {
  success: boolean;
  data: {
    totalMedications: number;
    totalOrders: number;
    pendingOrders: number;
    lowStockMedications?: number;
    dispensedOrders?: number;
    totalRevenue?: number;
  };
}

const pharmacyManagementService = {
  // ==================== MEDICATIONS ====================

  /**
   * Create new medication
   */
  createMedication: async (data: CreateMedicationDto): Promise<MedicationResponse> => {
    return enhancedApiClient.post('/pharmacy-management/medications', data);
  },

  /**
   * Get all medications with filters
   */
  getMedications: async (filters?: MedicationFilters): Promise<MedicationsListResponse> => {
    return enhancedApiClient.get('/pharmacy-management/medications', filters);
  },

  /**
   * Get medication by ID
   */
  getMedicationById: async (id: string): Promise<MedicationResponse> => {
    return enhancedApiClient.get(`/pharmacy-management/medications/${id}`);
  },

  /**
   * Update medication
   */
  updateMedication: async (id: string, data: UpdateMedicationDto): Promise<MedicationResponse> => {
    return enhancedApiClient.patch(`/pharmacy-management/medications/${id}`, data);
  },

  /**
   * Delete medication (soft delete)
   */
  deleteMedication: async (id: string): Promise<MedicationResponse> => {
    return enhancedApiClient.delete(`/pharmacy-management/medications/${id}`);
  },

  // ==================== PHARMACY ORDERS ====================

  /**
   * Get all pharmacy orders with filters
   */
  getPharmacyOrders: async (
    filters?: PharmacyOrderFilters
  ): Promise<PharmacyOrdersListResponse> => {
    return enhancedApiClient.get('/pharmacy-management/orders', filters);
  },

  /**
   * Get pharmacy order by ID
   */
  getPharmacyOrderById: async (id: string): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.get(`/pharmacy-management/orders/${id}`);
  },

  /**
   * Dispense pharmacy order
   */
  dispenseOrder: async (id: string): Promise<PharmacyOrderResponse> => {
    return enhancedApiClient.patch(`/pharmacy-management/orders/${id}/dispense`, {});
  },

  // ==================== STATISTICS ====================

  /**
   * Get pharmacy management statistics
   */
  getStats: async (): Promise<PharmacyManagementStatsResponse> => {
    return enhancedApiClient.get('/pharmacy-management/stats');
  },
};

export default pharmacyManagementService;
