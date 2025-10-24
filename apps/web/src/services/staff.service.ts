import { enhancedApiClient } from '../lib/api-client';

/**
 * Staff Management API Service
 * Handles all staff operations including doctors, nurses, technicians, and administrative staff
 */

// Types
export interface CreateStaffDto {
  userId?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'NURSE' | 'LAB_TECHNICIAN' | 'PHARMACIST' | 'RECEPTIONIST' | 'ADMIN';
  designation?: string;
  specialization?: string;
  departmentId?: string;
  licenseNumber?: string;
  qualification?: string;
  experience?: string;
  joiningDate?: string;
  employeeId?: string;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  designation?: string;
  specialization?: string;
  departmentId?: string;
  licenseNumber?: string;
  qualification?: string;
  experience?: string;
  joiningDate?: string;
  employeeId?: string;
  isActive?: boolean;
}

export interface StaffFilters {
  role?: string;
  departmentId?: string;
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface StaffResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    userId: string;
    employeeId: string;
    designation?: string;
    departmentId?: string;
    joiningDate?: string;
    qualification?: string;
    experience?: string;
    isActive: boolean;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      specialization?: string;
      licenseNumber?: string;
      experience?: string;
      isActive: boolean;
      lastLoginAt?: string;
    };
    department?: {
      id: string;
      name: string;
      code?: string;
    };
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StaffListResponse {
  success: boolean;
  data: {
    staff: StaffResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface StaffStatsResponse {
  success: boolean;
  data: {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    byRole: {
      doctors: number;
      nurses: number;
      labTechnicians: number;
      pharmacists: number;
    };
  };
}

export interface StaffSearchResponse {
  success: boolean;
  data: StaffResponse['data'][];
}

const staffService = {
  // ==================== STAFF CRUD ====================

  /**
   * Create new staff member
   */
  createStaff: async (data: CreateStaffDto): Promise<StaffResponse> => {
    return enhancedApiClient.post('/staff', data);
  },

  /**
   * Get all staff members with filters
   */
  getStaff: async (filters?: StaffFilters): Promise<StaffListResponse> => {
    return enhancedApiClient.get('/staff', filters);
  },

  /**
   * Get staff by ID
   */
  getStaffById: async (id: string): Promise<StaffResponse> => {
    return enhancedApiClient.get(`/staff/${id}`);
  },

  /**
   * Update staff member
   */
  updateStaff: async (id: string, data: UpdateStaffDto): Promise<StaffResponse> => {
    return enhancedApiClient.patch(`/staff/${id}`, data);
  },

  /**
   * Delete staff member (soft delete)
   */
  deleteStaff: async (id: string): Promise<StaffResponse> => {
    return enhancedApiClient.delete(`/staff/${id}`);
  },

  // ==================== SEARCH & STATS ====================

  /**
   * Search staff members
   */
  searchStaff: async (query: string): Promise<StaffSearchResponse> => {
    return enhancedApiClient.get('/staff/search', { q: query });
  },

  /**
   * Get staff statistics
   */
  getStaffStats: async (): Promise<StaffStatsResponse> => {
    return enhancedApiClient.get('/staff/stats');
  },
};

export default staffService;
