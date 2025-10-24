import { enhancedApiClient } from '../lib/api-client';

/**
 * Quality Management API Service
 * Handles quality metrics, incident reporting, and quality assurance operations
 */

// Types
export interface CreateQualityMetricDto {
  metricName: string;
  category: string;
  value: number;
  unit?: string;
  target?: number;
  description?: string;
  measurementDate?: string;
  departmentId?: string;
}

export interface UpdateQualityMetricDto {
  metricName?: string;
  category?: string;
  value?: number;
  unit?: string;
  target?: number;
  description?: string;
  measurementDate?: string;
  departmentId?: string;
}

export interface CreateIncidentDto {
  title: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: string;
  departmentId?: string;
  reportedBy?: string;
  incidentDate?: string;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  category?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  location?: string;
  departmentId?: string;
  resolution?: string;
  resolvedDate?: string;
}

export interface QualityMetricFilters {
  category?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IncidentFilters {
  category?: string;
  severity?: string;
  status?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface QualityMetricResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    metricName: string;
    category: string;
    value: number;
    unit?: string;
    target?: number;
    description?: string;
    measurementDate?: string;
    departmentId?: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface QualityMetricsListResponse {
  success: boolean;
  data: QualityMetricResponse['data'][];
}

export interface IncidentResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
    location?: string;
    departmentId?: string;
    reportedBy?: string;
    incidentDate?: string;
    resolution?: string;
    resolvedDate?: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface IncidentsListResponse {
  success: boolean;
  data: IncidentResponse['data'][];
}

export interface QualityStatsResponse {
  success: boolean;
  data: {
    totalMetrics: number;
    totalIncidents: number;
    openIncidents?: number;
    criticalIncidents?: number;
    resolvedIncidents?: number;
    averageResolutionTime?: number;
  };
}

const qualityService = {
  // ==================== QUALITY METRICS ====================

  /**
   * Create new quality metric
   */
  createMetric: async (data: CreateQualityMetricDto): Promise<QualityMetricResponse> => {
    return enhancedApiClient.post('/quality/metrics', data);
  },

  /**
   * Get all quality metrics
   */
  getMetrics: async (filters?: QualityMetricFilters): Promise<QualityMetricsListResponse> => {
    return enhancedApiClient.get('/quality/metrics', filters);
  },

  /**
   * Get quality metric by ID
   */
  getMetricById: async (id: string): Promise<QualityMetricResponse> => {
    return enhancedApiClient.get(`/quality/metrics/${id}`);
  },

  /**
   * Update quality metric
   */
  updateMetric: async (
    id: string,
    data: UpdateQualityMetricDto
  ): Promise<QualityMetricResponse> => {
    return enhancedApiClient.patch(`/quality/metrics/${id}`, data);
  },

  /**
   * Delete quality metric
   */
  deleteMetric: async (id: string): Promise<QualityMetricResponse> => {
    return enhancedApiClient.delete(`/quality/metrics/${id}`);
  },

  // ==================== INCIDENT REPORTING ====================

  /**
   * Report new incident
   */
  reportIncident: async (data: CreateIncidentDto): Promise<IncidentResponse> => {
    return enhancedApiClient.post('/quality/incidents', data);
  },

  /**
   * Get all incidents
   */
  getIncidents: async (filters?: IncidentFilters): Promise<IncidentsListResponse> => {
    return enhancedApiClient.get('/quality/incidents', filters);
  },

  /**
   * Get incident by ID
   */
  getIncidentById: async (id: string): Promise<IncidentResponse> => {
    return enhancedApiClient.get(`/quality/incidents/${id}`);
  },

  /**
   * Update incident
   */
  updateIncident: async (id: string, data: UpdateIncidentDto): Promise<IncidentResponse> => {
    return enhancedApiClient.patch(`/quality/incidents/${id}`, data);
  },

  /**
   * Delete incident
   */
  deleteIncident: async (id: string): Promise<IncidentResponse> => {
    return enhancedApiClient.delete(`/quality/incidents/${id}`);
  },

  // ==================== STATISTICS ====================

  /**
   * Get quality statistics
   */
  getStats: async (): Promise<QualityStatsResponse> => {
    return enhancedApiClient.get('/quality/stats');
  },
};

export default qualityService;
