import { enhancedApiClient } from '../lib/api-client';

/**
 * EMR (Electronic Medical Records) API Service
 * Handles all medical record operations
 */

// Types
export interface CreateMedicalRecordDto {
  patientId: string;
  recordType:
    | 'CONSULTATION'
    | 'DIAGNOSIS'
    | 'PRESCRIPTION'
    | 'LAB_RESULT'
    | 'IMAGING'
    | 'PROCEDURE'
    | 'VACCINATION'
    | 'ALLERGY'
    | 'OTHER';
  title: string;
  description: string;
  date?: string;
  doctorId?: string;
}

export interface UpdateMedicalRecordDto {
  recordType?: string;
  title?: string;
  description?: string;
  date?: string;
  doctorId?: string;
}

export interface EmrFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  recordType?: string;
}

export interface MedicalRecordResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface MedicalRecordsListResponse {
  success: boolean;
  data: {
    records: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface EmrStatsResponse {
  success: boolean;
  data: {
    total: number;
    recentRecords: number;
    byType: Array<{
      recordType: string;
      count: number;
    }>;
  };
}

const emrService = {
  /**
   * Create medical record
   */
  createRecord: async (data: CreateMedicalRecordDto): Promise<MedicalRecordResponse> => {
    return enhancedApiClient.post('/emr/records', data);
  },

  /**
   * Get all medical records with filters
   */
  getRecords: async (filters?: EmrFilters): Promise<MedicalRecordsListResponse> => {
    return enhancedApiClient.get('/emr/records', filters);
  },

  /**
   * Get medical records by patient
   */
  getRecordsByPatient: async (patientId: string): Promise<{ success: boolean; data: any[] }> => {
    return enhancedApiClient.get(`/emr/records/patient/${patientId}`);
  },

  /**
   * Get medical record by ID
   */
  getRecordById: async (id: string): Promise<MedicalRecordResponse> => {
    return enhancedApiClient.get(`/emr/records/${id}`);
  },

  /**
   * Update medical record
   */
  updateRecord: async (
    id: string,
    data: UpdateMedicalRecordDto
  ): Promise<MedicalRecordResponse> => {
    return enhancedApiClient.patch(`/emr/records/${id}`, data);
  },

  /**
   * Delete medical record
   */
  deleteRecord: async (id: string): Promise<MedicalRecordResponse> => {
    return enhancedApiClient.delete(`/emr/records/${id}`);
  },

  /**
   * Get EMR statistics
   */
  getStats: async (): Promise<EmrStatsResponse> => {
    return enhancedApiClient.get('/emr/stats');
  },
};

export default emrService;
