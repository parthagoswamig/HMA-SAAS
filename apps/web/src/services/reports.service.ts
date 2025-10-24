import { enhancedApiClient } from '../lib/api-client';

/**
 * Reports & Analytics API Service
 * Handles all reporting and analytics operations across the HMS system
 */

// Types
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
  departmentId?: string;
  doctorId?: string;
  patientId?: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    patients: number;
    todayAppointments: number;
    pendingInvoices: number;
    todayRevenue: number;
    labOrdersPending: number;
    pharmacyOrdersPending: number;
  };
}

export interface PatientReportResponse {
  success: boolean;
  data: {
    total: number;
    byGender: Array<{
      gender: string;
      _count: number;
    }>;
    byAge: {
      '0-18': number;
      '19-35': number;
      '36-50': number;
      '51-65': number;
      '65+': number;
    };
  };
}

export interface AppointmentReportResponse {
  success: boolean;
  data: {
    total: number;
    byStatus: Array<{
      status: string;
      _count: number;
    }>;
    byDoctor: number;
  };
}

export interface RevenueReportResponse {
  success: boolean;
  data: {
    totalRevenue: number;
    byMethod: {
      [key: string]: number;
    };
    count: number;
  };
}

export interface LabReportResponse {
  success: boolean;
  data: {
    total: number;
    byStatus: Array<{
      status: string;
      _count: number;
    }>;
    topTests: number;
  };
}

export interface PharmacyReportResponse {
  success: boolean;
  data: {
    total: number;
    byStatus: Array<{
      status: string;
      _count: number;
    }>;
    topMedications: number;
  };
}

const reportsService = {
  // ==================== DASHBOARD ====================

  /**
   * Get dashboard overview statistics
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    return enhancedApiClient.get('/reports/dashboard');
  },

  // ==================== PATIENT REPORTS ====================

  /**
   * Get patient analytics report
   */
  getPatientReport: async (filters?: ReportFilters): Promise<PatientReportResponse> => {
    return enhancedApiClient.get('/reports/patients', filters);
  },

  // ==================== APPOINTMENT REPORTS ====================

  /**
   * Get appointment analytics report
   */
  getAppointmentReport: async (filters?: ReportFilters): Promise<AppointmentReportResponse> => {
    return enhancedApiClient.get('/reports/appointments', filters);
  },

  // ==================== REVENUE REPORTS ====================

  /**
   * Get revenue analytics report
   */
  getRevenueReport: async (filters?: ReportFilters): Promise<RevenueReportResponse> => {
    return enhancedApiClient.get('/reports/revenue', filters);
  },

  // ==================== LAB REPORTS ====================

  /**
   * Get laboratory analytics report
   */
  getLabReport: async (filters?: ReportFilters): Promise<LabReportResponse> => {
    return enhancedApiClient.get('/reports/lab', filters);
  },

  // ==================== PHARMACY REPORTS ====================

  /**
   * Get pharmacy analytics report
   */
  getPharmacyReport: async (filters?: ReportFilters): Promise<PharmacyReportResponse> => {
    return enhancedApiClient.get('/reports/pharmacy', filters);
  },
};

export default reportsService;
