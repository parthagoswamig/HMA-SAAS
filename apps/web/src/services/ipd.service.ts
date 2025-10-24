import { enhancedApiClient } from '../lib/api-client';

/**
 * IPD (In-Patient Department) API Service
 * Handles all IPD operations including ward and bed management
 */

// Types
export interface CreateWardDto {
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  floor?: string;
}

export interface UpdateWardDto {
  name?: string;
  description?: string;
  capacity?: number;
  location?: string;
  floor?: string;
}

export interface CreateBedDto {
  wardId: string;
  bedNumber: string;
  description?: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
}

export interface UpdateBedStatusDto {
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  notes?: string;
}

export interface WardFilters {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  isActive?: boolean;
}

export interface BedFilters {
  page?: number;
  limit?: number;
  wardId?: string;
  status?: string;
  search?: string;
  isActive?: boolean;
}

export interface WardResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    location?: string;
    floor?: string;
    isActive: boolean;
    tenantId: string;
    beds?: BedResponse['data'][];
    _count?: {
      beds: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface WardsListResponse {
  success: boolean;
  data: {
    items: WardResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface BedResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    wardId: string;
    bedNumber: string;
    description?: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
    isActive: boolean;
    tenantId: string;
    ward?: {
      id: string;
      name: string;
      type?: string;
      location?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface BedsListResponse {
  success: boolean;
  data: {
    items: BedResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface AvailableBedsResponse {
  success: boolean;
  data: BedResponse['data'][];
}

export interface IpdStatsResponse {
  success: boolean;
  data: {
    wards: {
      total: number;
    };
    beds: {
      total: number;
      available: number;
      occupied: number;
      maintenance: number;
      reserved: number;
    };
    occupancyRate: number;
  };
}

const ipdService = {
  // ==================== WARD OPERATIONS ====================

  /**
   * Create new ward
   */
  createWard: async (data: CreateWardDto): Promise<WardResponse> => {
    return enhancedApiClient.post('/ipd/wards', data);
  },

  /**
   * Get all wards with filters
   */
  getWards: async (filters?: WardFilters): Promise<WardsListResponse> => {
    return enhancedApiClient.get('/ipd/wards', filters);
  },

  /**
   * Get ward by ID
   */
  getWardById: async (id: string): Promise<WardResponse> => {
    return enhancedApiClient.get(`/ipd/wards/${id}`);
  },

  /**
   * Update ward
   */
  updateWard: async (id: string, data: UpdateWardDto): Promise<WardResponse> => {
    return enhancedApiClient.patch(`/ipd/wards/${id}`, data);
  },

  // ==================== BED OPERATIONS ====================

  /**
   * Create new bed
   */
  createBed: async (data: CreateBedDto): Promise<BedResponse> => {
    return enhancedApiClient.post('/ipd/beds', data);
  },

  /**
   * Get all beds with filters
   */
  getBeds: async (filters?: BedFilters): Promise<BedsListResponse> => {
    return enhancedApiClient.get('/ipd/beds', filters);
  },

  /**
   * Get available beds
   */
  getAvailableBeds: async (): Promise<AvailableBedsResponse> => {
    return enhancedApiClient.get('/ipd/beds/available');
  },

  /**
   * Update bed status
   */
  updateBedStatus: async (id: string, data: UpdateBedStatusDto): Promise<BedResponse> => {
    return enhancedApiClient.patch(`/ipd/beds/${id}/status`, data);
  },

  // ==================== STATISTICS ====================

  /**
   * Get IPD statistics
   */
  getStats: async (): Promise<IpdStatsResponse> => {
    return enhancedApiClient.get('/ipd/stats');
  },
};

export default ipdService;
