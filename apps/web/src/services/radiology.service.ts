import { enhancedApiClient } from '../lib/api-client';

/**
 * Radiology & Imaging API Service
 * Handles all radiology operations including studies, reports, and orders
 */

// Types
export interface CreateStudyDto {
  patientId: string;
  modalityId: string;
  studyType: string;
  bodyPart: string;
  clinicalHistory?: string;
  priority?: 'ROUTINE' | 'URGENT' | 'STAT';
  scheduledDate?: string;
  technician?: string;
}

export interface UpdateStudyDto {
  studyType?: string;
  bodyPart?: string;
  clinicalHistory?: string;
  priority?: 'ROUTINE' | 'URGENT' | 'STAT';
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate?: string;
  completedDate?: string;
  technician?: string;
  findings?: string;
  images?: string[];
}

export interface CreateReportDto {
  studyId: string;
  radiologistId?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  status?: 'DRAFT' | 'PRELIMINARY' | 'FINAL';
}

export interface UpdateReportDto {
  findings?: string;
  impression?: string;
  recommendations?: string;
  status?: 'DRAFT' | 'PRELIMINARY' | 'FINAL';
  signedDate?: string;
}

export interface CreateRadiologyOrderDto {
  patientId: string;
  doctorId?: string;
  modalityId: string;
  studyType: string;
  bodyPart: string;
  clinicalIndication?: string;
  priority?: 'ROUTINE' | 'URGENT' | 'STAT';
  scheduledDate?: string;
}

export interface UpdateRadiologyOrderDto {
  status?: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'ROUTINE' | 'URGENT' | 'STAT';
  scheduledDate?: string;
  completedDate?: string;
}

export interface RadiologyFilters {
  patientId?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StudyResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    studyId: string;
    patientId: string;
    modalityId: string;
    studyType: string;
    bodyPart: string;
    clinicalHistory?: string;
    priority: 'ROUTINE' | 'URGENT' | 'STAT';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledDate?: string;
    completedDate?: string;
    technician?: string;
    findings?: string;
    images?: string[];
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      medicalRecordNumber?: string;
      email?: string;
      phone?: string;
    };
    modality?: {
      id: string;
      name: string;
      type: string;
      description?: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StudiesListResponse {
  success: boolean;
  data: {
    items: StudyResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ReportResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    studyId: string;
    radiologistId?: string;
    findings: string;
    impression: string;
    recommendations?: string;
    status: 'DRAFT' | 'PRELIMINARY' | 'FINAL';
    signedDate?: string;
    study?: {
      id: string;
      studyId: string;
      studyType: string;
      bodyPart: string;
      patient?: {
        id: string;
        firstName: string;
        lastName: string;
        medicalRecordNumber?: string;
      };
      modality?: {
        id: string;
        name: string;
        type: string;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface ReportsListResponse {
  success: boolean;
  data: {
    items: ReportResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface RadiologyOrderResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    orderNumber: string;
    patientId: string;
    doctorId?: string;
    modalityId: string;
    studyType: string;
    bodyPart: string;
    clinicalIndication?: string;
    priority: 'ROUTINE' | 'URGENT' | 'STAT';
    status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledDate?: string;
    completedDate?: string;
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
    modality?: {
      id: string;
      name: string;
      type: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface RadiologyOrdersListResponse {
  success: boolean;
  data: {
    items: RadiologyOrderResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface RadiologyStatsResponse {
  success: boolean;
  data: {
    totalStudies: number;
    completedStudies: number;
    pendingStudies: number;
    totalReports: number;
    finalizedReports: number;
    totalOrders: number;
    pendingOrders: number;
  };
}

const radiologyService = {
  // ==================== STUDIES ====================

  /**
   * Create new radiology study
   */
  createStudy: async (data: CreateStudyDto): Promise<StudyResponse> => {
    return enhancedApiClient.post('/radiology/studies', data);
  },

  /**
   * Get all radiology studies with filters
   */
  getStudies: async (filters?: RadiologyFilters): Promise<StudiesListResponse> => {
    return enhancedApiClient.get('/radiology/studies', filters);
  },

  /**
   * Get radiology study by ID
   */
  getStudyById: async (id: string): Promise<StudyResponse> => {
    return enhancedApiClient.get(`/radiology/studies/${id}`);
  },

  /**
   * Update radiology study
   */
  updateStudy: async (id: string, data: UpdateStudyDto): Promise<StudyResponse> => {
    return enhancedApiClient.patch(`/radiology/studies/${id}`, data);
  },

  /**
   * Delete radiology study (soft delete)
   */
  deleteStudy: async (id: string): Promise<StudyResponse> => {
    return enhancedApiClient.delete(`/radiology/studies/${id}`);
  },

  // ==================== REPORTS ====================

  /**
   * Create radiology report
   */
  createReport: async (data: CreateReportDto): Promise<ReportResponse> => {
    return enhancedApiClient.post('/radiology/reports', data);
  },

  /**
   * Get all radiology reports with filters
   */
  getReports: async (filters?: RadiologyFilters): Promise<ReportsListResponse> => {
    return enhancedApiClient.get('/radiology/reports', filters);
  },

  /**
   * Get radiology report by ID
   */
  getReportById: async (id: string): Promise<ReportResponse> => {
    return enhancedApiClient.get(`/radiology/reports/${id}`);
  },

  /**
   * Update radiology report
   */
  updateReport: async (id: string, data: UpdateReportDto): Promise<ReportResponse> => {
    return enhancedApiClient.patch(`/radiology/reports/${id}`, data);
  },

  // ==================== ORDERS ====================

  /**
   * Create radiology order
   */
  createOrder: async (data: CreateRadiologyOrderDto): Promise<RadiologyOrderResponse> => {
    return enhancedApiClient.post('/radiology/orders', data);
  },

  /**
   * Get all radiology orders with filters
   */
  getOrders: async (filters?: RadiologyFilters): Promise<RadiologyOrdersListResponse> => {
    return enhancedApiClient.get('/radiology/orders', filters);
  },

  /**
   * Get radiology order by ID
   */
  getOrderById: async (id: string): Promise<RadiologyOrderResponse> => {
    return enhancedApiClient.get(`/radiology/orders/${id}`);
  },

  /**
   * Update radiology order
   */
  updateOrder: async (
    id: string,
    data: UpdateRadiologyOrderDto
  ): Promise<RadiologyOrderResponse> => {
    return enhancedApiClient.patch(`/radiology/orders/${id}`, data);
  },

  // ==================== STATISTICS ====================

  /**
   * Get radiology statistics
   */
  getStats: async (): Promise<RadiologyStatsResponse> => {
    return enhancedApiClient.get('/radiology/stats');
  },
};

export default radiologyService;
