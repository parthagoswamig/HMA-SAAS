import { enhancedApiClient } from '../lib/api-client';

/**
 * Audit Log API Service
 * Handles all audit log operations
 */

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  metadata?: Record<string, any>;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

export interface AuditLogResponse {
  success: boolean;
  message?: string;
  data: AuditLog;
}

export interface AuditLogsListResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

const auditService = {
  /**
   * Get all audit logs with filters
   */
  getLogs: async (filters?: AuditLogFilters): Promise<AuditLogsListResponse> => {
    return enhancedApiClient.get('/audit/logs', filters);
  },

  /**
   * Get audit log by ID
   */
  getLogById: async (id: string): Promise<AuditLogResponse> => {
    return enhancedApiClient.get(`/audit/logs/${id}`);
  },

  /**
   * Export audit logs
   */
  exportLogs: async (filters?: AuditLogFilters): Promise<any> => {
    return enhancedApiClient.get('/audit/export', {
      ...filters,
      responseType: 'blob',
    });
  },

  /**
   * Get audit statistics
   */
  getStats: async (filters?: AuditLogFilters): Promise<any> => {
    return enhancedApiClient.get('/audit/stats', filters);
  },

  /**
   * Get user activity
   */
  getUserActivity: async (userId: string, filters?: AuditLogFilters): Promise<any> => {
    return enhancedApiClient.get(`/audit/users/${userId}/activity`, filters);
  },
};

export default auditService;
