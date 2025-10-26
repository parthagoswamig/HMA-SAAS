import { enhancedApiClient } from '../lib/api-client';

export interface DashboardStats {
  totalPatients?: number;
  todaysAppointments?: number;
  pendingBills?: number;
  activeDoctors?: number;
  myAppointments?: number;
  medicalRecords?: number;
  prescriptions?: number;
  totalAppointments?: number;
  totalRevenue?: number;
  activeStaff?: number;
  availableBeds?: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: string;
  userRole: string;
  timestamp: Date;
}

export interface TodayAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  department: string;
  startTime: Date;
  endTime: Date;
  status: string;
  reason: string;
}

export interface RevenueOverview {
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  pendingPayments: number;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    try {
      const response = await enhancedApiClient.get('/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        data: {
          totalPatients: 0,
          todaysAppointments: 0,
          pendingBills: 0,
          activeDoctors: 0,
        },
      };
    }
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (): Promise<{ success: boolean; data: RecentActivity[] }> => {
    try {
      const response = await enhancedApiClient.get('/dashboard/recent-activities');
      return response;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  /**
   * Get today's appointments
   */
  getTodaysAppointments: async (): Promise<{ success: boolean; data: TodayAppointment[] }> => {
    try {
      const response = await enhancedApiClient.get('/dashboard/appointments-today');
      return response;
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  /**
   * Get revenue overview
   */
  getRevenueOverview: async (): Promise<{ success: boolean; data: RevenueOverview | null }> => {
    try {
      const response = await enhancedApiClient.get('/dashboard/revenue-overview');
      return response;
    } catch (error) {
      console.error('Error fetching revenue overview:', error);
      return {
        success: false,
        data: null,
      };
    }
  },
};

export default dashboardService;
