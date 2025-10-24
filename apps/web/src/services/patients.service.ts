import { enhancedApiClient } from '../lib/api-client';

/**
 * Patients Management API Service
 */

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  maritalStatus?: string;
}

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
    return enhancedApiClient.post('/patients', data);
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
};

export default patientsService;
