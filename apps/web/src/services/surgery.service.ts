import { enhancedApiClient } from '../lib/api-client';

/**
 * Surgery Management API Service
 * Handles all surgery operations including scheduling, operation theater management, and surgical procedures
 */

// Types
export interface CreateSurgeryDto {
  patientId: string;
  surgeonId?: string;
  operationTheaterId?: string;
  surgeryType: string;
  surgeryName: string;
  description?: string;
  scheduledDate: string;
  estimatedDuration?: number;
  priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  preOpNotes?: string;
  anesthesiaType?: string;
  assistantSurgeons?: string[];
  nurses?: string[];
  anesthesiologist?: string;
}

export interface UpdateSurgeryDto {
  surgeonId?: string;
  operationTheaterId?: string;
  surgeryType?: string;
  surgeryName?: string;
  description?: string;
  scheduledDate?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  preOpNotes?: string;
  postOpNotes?: string;
  complications?: string;
  anesthesiaType?: string;
  bloodLoss?: number;
  assistantSurgeons?: string[];
  nurses?: string[];
  anesthesiologist?: string;
}

export interface SurgeryFilters {
  status?: string;
  patientId?: string;
  surgeonId?: string;
  operationTheaterId?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SurgeryResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    patientId: string;
    surgeonId?: string;
    operationTheaterId?: string;
    surgeryType: string;
    surgeryName: string;
    description?: string;
    scheduledDate: string;
    actualStartTime?: string;
    actualEndTime?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
    preOpNotes?: string;
    postOpNotes?: string;
    complications?: string;
    anesthesiaType?: string;
    bloodLoss?: number;
    assistantSurgeons?: string[];
    nurses?: string[];
    anesthesiologist?: string;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      medicalRecordNumber?: string;
      dateOfBirth?: string;
      gender?: string;
    };
    operationTheater?: {
      id: string;
      name: string;
      theaterId: string;
      status?: string;
      location?: string;
    };
    isActive: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SurgeriesListResponse {
  success: boolean;
  data: {
    items: SurgeryResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface SurgeryStatsResponse {
  success: boolean;
  data: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
}

export interface OperationTheaterResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    theaterId: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
    location?: string;
    capacity?: number;
    equipment?: string[];
    isActive: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

const surgeryService = {
  // ==================== SURGERY CRUD ====================

  /**
   * Create new surgery
   */
  createSurgery: async (data: CreateSurgeryDto): Promise<SurgeryResponse> => {
    return enhancedApiClient.post('/surgery', data);
  },

  /**
   * Get all surgeries with filters
   */
  getSurgeries: async (filters?: SurgeryFilters): Promise<SurgeriesListResponse> => {
    return enhancedApiClient.get('/surgery', filters);
  },

  /**
   * Get surgery by ID
   */
  getSurgeryById: async (id: string): Promise<SurgeryResponse> => {
    return enhancedApiClient.get(`/surgery/${id}`);
  },

  /**
   * Update surgery
   */
  updateSurgery: async (id: string, data: UpdateSurgeryDto): Promise<SurgeryResponse> => {
    return enhancedApiClient.patch(`/surgery/${id}`, data);
  },

  /**
   * Delete surgery (soft delete)
   */
  deleteSurgery: async (id: string): Promise<SurgeryResponse> => {
    return enhancedApiClient.delete(`/surgery/${id}`);
  },

  // ==================== SCHEDULING ====================

  /**
   * Get upcoming surgeries
   */
  getUpcomingSurgeries: async (): Promise<{
    success: boolean;
    data: SurgeryResponse['data'][];
  }> => {
    return enhancedApiClient.get('/surgery/schedule/upcoming');
  },

  /**
   * Get available operation theaters
   */
  getAvailableTheaters: async (): Promise<OperationTheaterResponse> => {
    return enhancedApiClient.get('/surgery/theaters/available');
  },

  // ==================== STATISTICS ====================

  /**
   * Get surgery statistics
   */
  getStats: async (): Promise<SurgeryStatsResponse> => {
    return enhancedApiClient.get('/surgery/stats');
  },
};

export default surgeryService;
