import { enhancedApiClient } from '../lib/api-client';

/**
 * HR API Service
 * Handles all HR operations including staff management, departments, and attendance
 */

// Types
export interface CreateStaffDto {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: string;
  employeeId?: string;
  dateOfJoining: string;
  salary?: number;
  address?: string;
  emergencyContact?: string;
  qualifications?: string;
  specialization?: string;
  isActive?: boolean;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  designation?: string;
  salary?: number;
  address?: string;
  emergencyContact?: string;
  qualifications?: string;
  specialization?: string;
  isActive?: boolean;
}

export interface HrFilters {
  page?: number;
  limit?: number;
  departmentId?: string;
  designation?: string;
  isActive?: boolean | string;
  search?: string;
}

export interface StaffResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    departmentId: string;
    designation: string;
    employeeId?: string;
    dateOfJoining: string;
    salary?: number;
    address?: string;
    emergencyContact?: string;
    qualifications?: string;
    specialization?: string;
    isActive: boolean;
    department?: {
      id: string;
      name: string;
      description?: string;
    };
    user?: any;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StaffListResponse {
  success: boolean;
  data: {
    items: StaffResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface DepartmentResponse {
  success: boolean;
  data: {
    items: Array<{
      id: string;
      name: string;
      description?: string;
      isActive: boolean;
      _count?: {
        staff: number;
      };
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface HrStatsResponse {
  success: boolean;
  data: {
    staff: {
      total: number;
      active: number;
      inactive: number;
    };
    departments: {
      total: number;
      distribution: Array<{
        departmentId: string;
        _count: number;
      }>;
    };
  };
}

export interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  staffId?: string;
}

export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data: {
    startDate?: string;
    endDate?: string;
    staffId?: string;
    records: any[];
  };
}

const hrService = {
  // ==================== STAFF OPERATIONS ====================

  /**
   * Create new staff member
   */
  createStaff: async (data: CreateStaffDto): Promise<StaffResponse> => {
    return enhancedApiClient.post('/hr/staff', data);
  },

  /**
   * Get all staff with filters
   */
  getStaff: async (filters?: HrFilters): Promise<StaffListResponse> => {
    return enhancedApiClient.get('/hr/staff', filters);
  },

  /**
   * Get staff by ID
   */
  getStaffById: async (id: string): Promise<StaffResponse> => {
    return enhancedApiClient.get(`/hr/staff/${id}`);
  },

  /**
   * Update staff
   */
  updateStaff: async (id: string, data: UpdateStaffDto): Promise<StaffResponse> => {
    return enhancedApiClient.patch(`/hr/staff/${id}`, data);
  },

  /**
   * Delete/deactivate staff
   */
  deleteStaff: async (id: string): Promise<{ success: boolean; message: string }> => {
    return enhancedApiClient.delete(`/hr/staff/${id}`);
  },

  // ==================== DEPARTMENT OPERATIONS ====================

  /**
   * Create new department
   */
  createDepartment: async (data: {
    name: string;
    code?: string;
    description?: string;
  }): Promise<{ success: boolean; message: string; data: any }> => {
    return enhancedApiClient.post('/hr/departments', data);
  },

  /**
   * Get all departments
   */
  getDepartments: async (filters?: {
    page?: number;
    limit?: number;
  }): Promise<DepartmentResponse> => {
    return enhancedApiClient.get('/hr/departments', filters);
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id: string): Promise<{ success: boolean; data: any }> => {
    return enhancedApiClient.get(`/hr/departments/${id}`);
  },

  /**
   * Update department
   */
  updateDepartment: async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<{ success: boolean; message: string; data: any }> => {
    return enhancedApiClient.patch(`/hr/departments/${id}`, data);
  },

  /**
   * Delete/deactivate department
   */
  deleteDepartment: async (id: string): Promise<{ success: boolean; message: string }> => {
    return enhancedApiClient.delete(`/hr/departments/${id}`);
  },

  // ==================== STATISTICS ====================

  /**
   * Get HR statistics
   */
  getStats: async (): Promise<HrStatsResponse> => {
    return enhancedApiClient.get('/hr/stats');
  },

  // ==================== ATTENDANCE ====================

  /**
   * Get attendance records
   */
  getAttendance: async (filters?: AttendanceFilters): Promise<AttendanceResponse> => {
    return enhancedApiClient.get('/hr/attendance', filters);
  },
};

export default hrService;
