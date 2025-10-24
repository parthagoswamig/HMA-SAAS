import { enhancedApiClient } from '../lib/api-client';

/**
 * Emergency API Service
 * Handles all emergency case operations
 */

// Types
export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface CreateEmergencyCaseDto {
  patientId: string;
  chiefComplaint: string;
  triageLevel: 'CRITICAL' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT';
  vitalSigns?: VitalSigns;
}

export interface UpdateEmergencyCaseDto {
  chiefComplaint?: string;
  triageLevel?: 'CRITICAL' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT';
  status?: 'WAITING' | 'IN_TREATMENT' | 'DISCHARGED' | 'ADMITTED' | 'TRANSFERRED';
  assignedDoctorId?: string;
  treatmentNotes?: string;
  vitalSigns?: VitalSigns;
}

export interface UpdateTriageDto {
  triageLevel: 'CRITICAL' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT';
}

export interface EmergencyFilters {
  page?: number;
  limit?: number;
  status?: string;
  triageLevel?: string;
  search?: string;
}

export interface EmergencyCaseResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface EmergencyCasesListResponse {
  success: boolean;
  data: {
    items: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface EmergencyStatsResponse {
  success: boolean;
  data: {
    total: number;
    waiting: number;
    inTreatment: number;
    discharged: number;
    admitted: number;
    criticalCases: number;
  };
}

export interface EmergencyQueueResponse {
  success: boolean;
  data: any[];
}

const emergencyService = {
  /**
   * Create emergency case
   */
  createCase: async (data: CreateEmergencyCaseDto): Promise<EmergencyCaseResponse> => {
    return enhancedApiClient.post('/emergency/cases', data);
  },

  /**
   * Get all emergency cases with filters
   */
  getCases: async (filters?: EmergencyFilters): Promise<EmergencyCasesListResponse> => {
    return enhancedApiClient.get('/emergency/cases', filters);
  },

  /**
   * Get emergency case by ID
   */
  getCaseById: async (id: string): Promise<EmergencyCaseResponse> => {
    return enhancedApiClient.get(`/emergency/cases/${id}`);
  },

  /**
   * Update emergency case
   */
  updateCase: async (id: string, data: UpdateEmergencyCaseDto): Promise<EmergencyCaseResponse> => {
    return enhancedApiClient.patch(`/emergency/cases/${id}`, data);
  },

  /**
   * Update triage level
   */
  updateTriage: async (id: string, data: UpdateTriageDto): Promise<EmergencyCaseResponse> => {
    return enhancedApiClient.patch(`/emergency/cases/${id}/triage`, data);
  },

  /**
   * Get emergency queue
   */
  getQueue: async (): Promise<EmergencyQueueResponse> => {
    return enhancedApiClient.get('/emergency/queue');
  },

  /**
   * Get emergency statistics
   */
  getStats: async (): Promise<EmergencyStatsResponse> => {
    return enhancedApiClient.get('/emergency/stats');
  },
};

export default emergencyService;
