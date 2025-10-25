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
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create patient');
      }
      
      return response;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error(error.response?.data?.message || 'Failed to create patient');
    }
  },

  /**
   * Get all patients with filters
   */
  getPatients: async (filters?: PatientFilters): Promise<PatientsListResponse> => {
    return enhancedApiClient.get('/patients', filters);
  },

  /**
   * Get patient by ID
   */
  getPatientById: async (id: string): Promise<PatientResponse> => {
    return enhancedApiClient.get(`/patients/${id}`);
  },

  /**
   * Update patient
   */
  updatePatient: async (id: string, data: Partial<CreatePatientDto>): Promise<PatientResponse> => {
    return enhancedApiClient.patch(`/patients/${id}`, data);
  },

  /**
   * Delete patient
   */
  deletePatient: async (id: string): Promise<PatientResponse> => {
    return enhancedApiClient.delete(`/patients/${id}`);
  },

  /**
   * Search patients
   */
  searchPatients: async (query: string): Promise<PatientResponse> => {
    return enhancedApiClient.get('/patients/search', { q: query });
  },

  /**
   * Get patient statistics
   */
  getPatientStats: async (): Promise<PatientStatsResponse> => {
    return enhancedApiClient.get('/patients/stats');
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/patients/${patientId}/documents`, {
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
    return enhancedApiClient.get(`/patients/${patientId}/documents`);
  },

  /**
   * Delete a patient document
   */
  deletePatientDocument: async (patientId: string, documentId: string): Promise<PatientResponse> => {
    return enhancedApiClient.delete(`/patients/${patientId}/documents/${documentId}`);
  },
};

export default patientsService;
