import { enhancedApiClient } from '../lib/api-client';

/**
 * Patients Management API Service
 */

// Import the proper type from types/patient
import { CreatePatientDto as CreatePatientDtoType } from '../types/patient';

export type CreatePatientDto = CreatePatientDtoType;

export interface PatientFilters {
  search?: string;
  gender?: string;
  bloodType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PatientResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface PatientsListResponse {
  success: boolean;
  data: {
    patients: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PatientStatsResponse {
  success: boolean;
  data: {
    totalPatients: number;
    activePatients: number;
    todaysPatients: number;
    weekPatients: number;
  };
}

const patientsService = {
  /**
   * Create new patient
   */
  createPatient: async (data: CreatePatientDto): Promise<PatientResponse> => {
    try {
      // Format the date if it's a Date object
      const formattedData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
      };
      
      const response = await enhancedApiClient.post('/patients', formattedData);
      
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  /**
   * Get all patients with filters
   */
  getPatients: async (filters?: PatientFilters): Promise<PatientsListResponse> => {
    const response = await enhancedApiClient.get('/patients', filters);
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Get patient by ID
   */
  getPatientById: async (id: string): Promise<PatientResponse> => {
    const response = await enhancedApiClient.get(`/patients/${id}`);
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Update patient
   */
  updatePatient: async (id: string, data: Partial<CreatePatientDto>): Promise<PatientResponse> => {
    const response = await enhancedApiClient.patch(`/patients/${id}`, data);
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Delete patient
   */
  deletePatient: async (id: string): Promise<PatientResponse> => {
    const response = await enhancedApiClient.delete(`/patients/${id}`);
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Search patients
   */
  searchPatients: async (query: string): Promise<PatientResponse> => {
    const response = await enhancedApiClient.get('/patients/search', { q: query });
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Get patient statistics
   */
  getPatientStats: async (): Promise<PatientStatsResponse> => {
    const response = await enhancedApiClient.get('/patients/stats');
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Upload documents for a patient
   */
  uploadDocuments: async (patientId: string, files: File[]): Promise<PatientResponse> => {
    try {
      const formData = new FormData();
      
      // Append each file to FormData
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      // Use fetch directly for multipart/form-data
      const token = localStorage.getItem('accessToken');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload documents');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      throw new Error(error.message || 'Failed to upload documents');
    }
  },

  /**
   * Get documents for a patient
   */
  getPatientDocuments: async (patientId: string): Promise<PatientResponse> => {
    const response = await enhancedApiClient.get(`/patients/${patientId}/documents`);
    return {
      success: true,
      data: response.data || response,
    };
  },

  /**
   * Delete a patient document
   */
  deletePatientDocument: async (patientId: string, documentId: string): Promise<PatientResponse> => {
    const response = await enhancedApiClient.delete(`/patients/${patientId}/documents/${documentId}`);
    return {
      success: true,
      data: response.data || response,
    };
  },
};

export default patientsService;
