import { enhancedApiClient } from '../lib/api-client';

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  ON_CALL = 'ON_CALL',
}

export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface CreateShiftDto {
  staffId: string;
  departmentId?: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  date: string;
  notes?: string;
  status?: ShiftStatus;
}

export interface UpdateShiftDto {
  staffId?: string;
  departmentId?: string;
  shiftType?: ShiftType;
  startTime?: string;
  endTime?: string;
  date?: string;
  notes?: string;
  status?: ShiftStatus;
  isActive?: boolean;
}

export interface ShiftFilters {
  page?: number;
  limit?: number;
  staffId?: string;
  departmentId?: string;
  shiftType?: ShiftType;
  status?: ShiftStatus;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  departmentId?: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  date: string;
  notes?: string;
  status: ShiftStatus;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  staff: {
    id: string;
    employeeId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  };
  department?: {
    id: string;
    name: string;
    code?: string;
  };
}

export interface ShiftResponse {
  success: boolean;
  message?: string;
  data: Shift;
}

export interface ShiftListResponse {
  success: boolean;
  data: {
    items: Shift[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ShiftStatsResponse {
  success: boolean;
  data: {
    totalShifts: number;
    todayShifts: number;
    scheduledShifts: number;
    inProgressShifts: number;
    completedShifts: number;
    shiftsByType: Array<{
      type: ShiftType;
      count: number;
    }>;
  };
}

const shiftsService = {
  /**
   * Create new shift
   */
  createShift: async (data: CreateShiftDto): Promise<ShiftResponse> => {
    return enhancedApiClient.post('/shifts', data);
  },

  /**
   * Get all shifts with filters
   */
  getShifts: async (filters?: ShiftFilters): Promise<ShiftListResponse> => {
    return enhancedApiClient.get('/shifts', filters);
  },

  /**
   * Get shift by ID
   */
  getShiftById: async (id: string): Promise<ShiftResponse> => {
    return enhancedApiClient.get(`/shifts/${id}`);
  },

  /**
   * Update shift
   */
  updateShift: async (id: string, data: UpdateShiftDto): Promise<ShiftResponse> => {
    return enhancedApiClient.patch(`/shifts/${id}`, data);
  },

  /**
   * Delete/deactivate shift
   */
  deleteShift: async (id: string): Promise<{ success: boolean; message: string }> => {
    return enhancedApiClient.delete(`/shifts/${id}`);
  },

  /**
   * Get shift statistics
   */
  getShiftStats: async (): Promise<ShiftStatsResponse> => {
    return enhancedApiClient.get('/shifts/stats');
  },
};

export default shiftsService;
