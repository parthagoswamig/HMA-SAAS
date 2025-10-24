import { enhancedApiClient } from '../lib/api-client';

/**
 * OPD (Out-Patient Department) API Service
 * Handles all OPD operations including visit management and queue tracking
 */

// Types
export interface CreateOpdVisitDto {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  visitDate: string;
  reason: string;
  chiefComplaint?: string;
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
  };
  notes?: string;
}

export interface UpdateOpdVisitDto {
  status?: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  notes?: string;
}

export interface OpdVisitFilters {
  page?: number;
  limit?: number;
  status?: string;
  doctorId?: string;
  departmentId?: string;
  patientId?: string;
  date?: string;
  search?: string;
}

export interface OpdQueueFilters {
  doctorId?: string;
  departmentId?: string;
  status?: string;
}

export interface OpdVisitResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    patientId: string;
    doctorId: string;
    departmentId?: string;
    visitDate: string;
    reason: string;
    chiefComplaint?: string;
    status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
    diagnosis?: string;
    prescription?: string;
    vitalSigns?: any;
    followUpDate?: string;
    notes?: string;
    queueNumber?: number;
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
    department?: {
      id: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface OpdVisitsListResponse {
  success: boolean;
  data: {
    items: OpdVisitResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface OpdQueueResponse {
  success: boolean;
  data: OpdVisitResponse['data'][];
}

export interface OpdStatsResponse {
  success: boolean;
  data: {
    totalVisitsToday: number;
    waiting: number;
    inConsultation: number;
    completed: number;
    cancelled: number;
  };
}

const opdService = {
  // ==================== OPD VISIT OPERATIONS ====================

  /**
   * Create new OPD visit
   */
  createVisit: async (data: CreateOpdVisitDto): Promise<OpdVisitResponse> => {
    return enhancedApiClient.post('/opd/visits', data);
  },

  /**
   * Get all OPD visits with filters
   */
  getVisits: async (filters?: OpdVisitFilters): Promise<OpdVisitsListResponse> => {
    return enhancedApiClient.get('/opd/visits', filters);
  },

  /**
   * Get OPD visit by ID
   */
  getVisitById: async (id: string): Promise<OpdVisitResponse> => {
    return enhancedApiClient.get(`/opd/visits/${id}`);
  },

  /**
   * Update OPD visit
   */
  updateVisit: async (id: string, data: UpdateOpdVisitDto): Promise<OpdVisitResponse> => {
    return enhancedApiClient.patch(`/opd/visits/${id}`, data);
  },

  /**
   * Cancel OPD visit
   */
  cancelVisit: async (id: string): Promise<OpdVisitResponse> => {
    return enhancedApiClient.delete(`/opd/visits/${id}`);
  },

  // ==================== OPD QUEUE ====================

  /**
   * Get OPD queue
   */
  getQueue: async (filters?: OpdQueueFilters): Promise<OpdQueueResponse> => {
    return enhancedApiClient.get('/opd/queue', filters);
  },

  // ==================== STATISTICS ====================

  /**
   * Get OPD statistics
   */
  getStats: async (): Promise<OpdStatsResponse> => {
    return enhancedApiClient.get('/opd/stats');
  },
};

export default opdService;
