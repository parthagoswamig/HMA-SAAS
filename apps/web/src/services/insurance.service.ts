import { enhancedApiClient } from '../lib/api-client';

/**
 * Insurance API Service
 * Handles all insurance operations including claims management and statistics
 */

// Types
export interface CreateInsuranceClaimDto {
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  claimNumber?: string;
  amount: number;
  diagnosis: string;
  treatmentDetails: string;
  submittedAt?: string;
  documents?: string[];
  notes?: string;
}

export interface UpdateInsuranceClaimDto {
  insuranceProvider?: string;
  policyNumber?: string;
  claimNumber?: string;
  amount?: number;
  diagnosis?: string;
  treatmentDetails?: string;
  documents?: string[];
  notes?: string;
}

export interface InsuranceFilters {
  page?: number;
  limit?: number;
  status?: string;
  patientId?: string;
  insuranceProvider?: string;
}

export interface InsuranceClaimResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    patientId: string;
    insuranceProvider: string;
    policyNumber: string;
    claimNumber?: string;
    amount: number;
    diagnosis: string;
    treatmentDetails: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
    submittedAt: string;
    approvedAt?: string;
    paidAt?: string;
    documents?: string[];
    notes?: string;
    isActive: boolean;
    patient?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface InsuranceClaimsListResponse {
  success: boolean;
  data: {
    items: InsuranceClaimResponse['data'][];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface InsuranceStatsResponse {
  success: boolean;
  data: {
    total: number;
    submitted: number;
    approved: number;
    paid: number;
    totalAmount: number;
  };
}

export interface UpdateStatusDto {
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
}

const insuranceService = {
  // ==================== CLAIM OPERATIONS ====================

  /**
   * Create new insurance claim
   */
  createClaim: async (data: CreateInsuranceClaimDto): Promise<InsuranceClaimResponse> => {
    return enhancedApiClient.post('/insurance/claims', data);
  },

  /**
   * Get all insurance claims with filters
   */
  getClaims: async (filters?: InsuranceFilters): Promise<InsuranceClaimsListResponse> => {
    return enhancedApiClient.get('/insurance/claims', filters);
  },

  /**
   * Get insurance claim by ID
   */
  getClaimById: async (id: string): Promise<InsuranceClaimResponse> => {
    return enhancedApiClient.get(`/insurance/claims/${id}`);
  },

  /**
   * Update insurance claim
   */
  updateClaim: async (
    id: string,
    data: UpdateInsuranceClaimDto
  ): Promise<InsuranceClaimResponse> => {
    return enhancedApiClient.patch(`/insurance/claims/${id}`, data);
  },

  /**
   * Update claim status
   */
  updateClaimStatus: async (
    id: string,
    status: UpdateStatusDto['status']
  ): Promise<InsuranceClaimResponse> => {
    return enhancedApiClient.patch(`/insurance/claims/${id}/status`, { status });
  },

  // ==================== STATISTICS ====================

  /**
   * Get insurance statistics
   */
  getStats: async (): Promise<InsuranceStatsResponse> => {
    return enhancedApiClient.get('/insurance/stats');
  },
};

export default insuranceService;
