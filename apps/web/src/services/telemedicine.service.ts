import { enhancedApiClient } from '../lib/api-client';

/**
 * Telemedicine API Service
 * Handles all telemedicine operations including virtual consultations, video calls, and remote patient care
 */

// Types
export interface CreateConsultationDto {
  patientId: string;
  doctorId: string;
  scheduledDate: string;
  consultationType?: 'VIDEO' | 'AUDIO' | 'CHAT';
  reason?: string;
  symptoms?: string;
  duration?: number;
  priority?: 'ROUTINE' | 'URGENT';
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
}

export interface UpdateConsultationDto {
  scheduledDate?: string;
  consultationType?: 'VIDEO' | 'AUDIO' | 'CHAT';
  reason?: string;
  symptoms?: string;
  duration?: number;
  priority?: 'ROUTINE' | 'URGENT';
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  actualDuration?: number;
  recordingUrl?: string;
  chatTranscript?: string;
}

export interface ConsultationFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  consultationType?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ConsultationResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    patientId: string;
    doctorId: string;
    scheduledDate: string;
    consultationType: 'VIDEO' | 'AUDIO' | 'CHAT';
    reason?: string;
    symptoms?: string;
    duration?: number;
    priority: 'ROUTINE' | 'URGENT';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    notes?: string;
    diagnosis?: string;
    prescription?: string;
    followUpDate?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    actualDuration?: number;
    recordingUrl?: string;
    chatTranscript?: string;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: string;
      medicalRecordNumber?: string;
    };
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      specialization?: string;
      licenseNumber?: string;
    };
    videoRoom?: {
      id: string;
      roomId: string;
      roomUrl?: string;
      status?: string;
    };
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ConsultationsListResponse {
  success: boolean;
  data: {
    items: ConsultationResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface TelemedicineStatsResponse {
  success: boolean;
  data: {
    total: number;
    scheduled: number;
    completed: number;
    inProgress?: number;
    cancelled?: number;
  };
}

const telemedicineService = {
  // ==================== CONSULTATIONS ====================

  /**
   * Create new telemedicine consultation
   */
  createConsultation: async (data: CreateConsultationDto): Promise<ConsultationResponse> => {
    return enhancedApiClient.post('/telemedicine/consultations', data);
  },

  /**
   * Get all consultations with filters
   */
  getConsultations: async (filters?: ConsultationFilters): Promise<ConsultationsListResponse> => {
    return enhancedApiClient.get('/telemedicine/consultations', filters);
  },

  /**
   * Get consultation by ID
   */
  getConsultationById: async (id: string): Promise<ConsultationResponse> => {
    return enhancedApiClient.get(`/telemedicine/consultations/${id}`);
  },

  /**
   * Update consultation
   */
  updateConsultation: async (
    id: string,
    data: UpdateConsultationDto
  ): Promise<ConsultationResponse> => {
    return enhancedApiClient.patch(`/telemedicine/consultations/${id}`, data);
  },

  /**
   * Delete consultation (soft delete)
   */
  deleteConsultation: async (id: string): Promise<ConsultationResponse> => {
    return enhancedApiClient.delete(`/telemedicine/consultations/${id}`);
  },

  // ==================== STATISTICS ====================

  /**
   * Get telemedicine statistics
   */
  getStats: async (): Promise<TelemedicineStatsResponse> => {
    return enhancedApiClient.get('/telemedicine/stats');
  },
};

export default telemedicineService;
