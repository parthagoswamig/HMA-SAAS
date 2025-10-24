import { enhancedApiClient } from '../lib/api-client';

/**
 * Integration Management API Service
 * Handles all third-party integrations including HL7, FHIR, payment gateways, and external systems
 */

// Types
export interface CreateIntegrationDto {
  name: string;
  type:
    | 'HL7'
    | 'FHIR'
    | 'PAYMENT_GATEWAY'
    | 'LAB_SYSTEM'
    | 'IMAGING_SYSTEM'
    | 'PHARMACY_SYSTEM'
    | 'EHR_SYSTEM'
    | 'INSURANCE'
    | 'API'
    | 'WEBHOOK';
  provider?: string;
  description?: string;
  endpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  authType?: 'API_KEY' | 'OAUTH' | 'BASIC_AUTH' | 'TOKEN' | 'NONE';
  status?: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING';
  config?: Record<string, any>;
  webhookUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
}

export interface UpdateIntegrationDto {
  name?: string;
  provider?: string;
  description?: string;
  endpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  authType?: 'API_KEY' | 'OAUTH' | 'BASIC_AUTH' | 'TOKEN' | 'NONE';
  status?: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING';
  config?: Record<string, any>;
  webhookUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
}

export interface IntegrationFilters {
  type?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}

export interface IntegrationResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    type:
      | 'HL7'
      | 'FHIR'
      | 'PAYMENT_GATEWAY'
      | 'LAB_SYSTEM'
      | 'IMAGING_SYSTEM'
      | 'PHARMACY_SYSTEM'
      | 'EHR_SYSTEM'
      | 'INSURANCE'
      | 'API'
      | 'WEBHOOK';
    provider?: string;
    description?: string;
    endpoint?: string;
    authType?: 'API_KEY' | 'OAUTH' | 'BASIC_AUTH' | 'TOKEN' | 'NONE';
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING';
    config?: Record<string, any>;
    webhookUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
    retryAttempts?: number;
    lastSyncedAt?: string;
    lastError?: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface IntegrationsListResponse {
  success: boolean;
  data: IntegrationResponse['data'][];
}

export interface IntegrationStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive?: number;
    error?: number;
  };
}

export interface ConnectionTestResponse {
  success: boolean;
  message?: string;
  data: {
    status: 'CONNECTED' | 'FAILED' | 'TIMEOUT';
    latency?: number;
    error?: string;
    timestamp?: string;
  };
}

const integrationService = {
  // ==================== INTEGRATION CONFIGS ====================

  /**
   * Create new integration configuration
   */
  createIntegration: async (data: CreateIntegrationDto): Promise<IntegrationResponse> => {
    return enhancedApiClient.post('/integration/configs', data);
  },

  /**
   * Get all integration configurations
   */
  getIntegrations: async (filters?: IntegrationFilters): Promise<IntegrationsListResponse> => {
    return enhancedApiClient.get('/integration/configs', filters);
  },

  /**
   * Get integration configuration by ID
   */
  getIntegrationById: async (id: string): Promise<IntegrationResponse> => {
    return enhancedApiClient.get(`/integration/configs/${id}`);
  },

  /**
   * Update integration configuration
   */
  updateIntegration: async (
    id: string,
    data: UpdateIntegrationDto
  ): Promise<IntegrationResponse> => {
    return enhancedApiClient.patch(`/integration/configs/${id}`, data);
  },

  /**
   * Delete integration configuration
   */
  deleteIntegration: async (id: string): Promise<IntegrationResponse> => {
    return enhancedApiClient.delete(`/integration/configs/${id}`);
  },

  // ==================== CONNECTION TESTING ====================

  /**
   * Test integration connection
   */
  testConnection: async (id: string): Promise<ConnectionTestResponse> => {
    return enhancedApiClient.post(`/integration/configs/${id}/test`, {});
  },

  // ==================== STATISTICS ====================

  /**
   * Get integration statistics
   */
  getStats: async (): Promise<IntegrationStatsResponse> => {
    return enhancedApiClient.get('/integration/stats');
  },
};

export default integrationService;
