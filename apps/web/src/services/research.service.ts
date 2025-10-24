import { enhancedApiClient } from '../lib/api-client';

/**
 * Research Management API Service
 * Handles all research project operations including clinical trials, studies, and publications
 */

// Types
export interface CreateResearchProjectDto {
  title: string;
  description: string;
  principalInvestigator: string;
  department?: string;
  category: string;
  studyType?: 'CLINICAL_TRIAL' | 'OBSERVATIONAL' | 'RETROSPECTIVE' | 'PROSPECTIVE' | 'CASE_STUDY';
  status?: 'PLANNING' | 'ACTIVE' | 'RECRUITING' | 'COMPLETED' | 'SUSPENDED' | 'TERMINATED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  fundingSource?: string;
  ethicsApprovalNumber?: string;
  ethicsApprovalDate?: string;
  targetEnrollment?: number;
  currentEnrollment?: number;
}

export interface UpdateResearchProjectDto {
  title?: string;
  description?: string;
  principalInvestigator?: string;
  department?: string;
  category?: string;
  studyType?: 'CLINICAL_TRIAL' | 'OBSERVATIONAL' | 'RETROSPECTIVE' | 'PROSPECTIVE' | 'CASE_STUDY';
  status?: 'PLANNING' | 'ACTIVE' | 'RECRUITING' | 'COMPLETED' | 'SUSPENDED' | 'TERMINATED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  fundingSource?: string;
  ethicsApprovalNumber?: string;
  ethicsApprovalDate?: string;
  targetEnrollment?: number;
  currentEnrollment?: number;
  findings?: string;
  conclusions?: string;
}

export interface ResearchProjectFilters {
  status?: string;
  category?: string;
  studyType?: string;
  principalInvestigator?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ResearchProjectResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    title: string;
    description: string;
    principalInvestigator: string;
    department?: string;
    category: string;
    studyType?: 'CLINICAL_TRIAL' | 'OBSERVATIONAL' | 'RETROSPECTIVE' | 'PROSPECTIVE' | 'CASE_STUDY';
    status: 'PLANNING' | 'ACTIVE' | 'RECRUITING' | 'COMPLETED' | 'SUSPENDED' | 'TERMINATED';
    startDate?: string;
    endDate?: string;
    budget?: number;
    fundingSource?: string;
    ethicsApprovalNumber?: string;
    ethicsApprovalDate?: string;
    targetEnrollment?: number;
    currentEnrollment?: number;
    findings?: string;
    conclusions?: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ResearchProjectsListResponse {
  success: boolean;
  data: ResearchProjectResponse['data'][];
}

export interface ResearchStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    completed?: number;
    recruiting?: number;
    totalBudget?: number;
    totalEnrollment?: number;
  };
}

const researchService = {
  // ==================== RESEARCH PROJECTS ====================

  /**
   * Create new research project
   */
  createProject: async (data: CreateResearchProjectDto): Promise<ResearchProjectResponse> => {
    return enhancedApiClient.post('/research/projects', data);
  },

  /**
   * Get all research projects
   */
  getProjects: async (filters?: ResearchProjectFilters): Promise<ResearchProjectsListResponse> => {
    return enhancedApiClient.get('/research/projects', filters);
  },

  /**
   * Get research project by ID
   */
  getProjectById: async (id: string): Promise<ResearchProjectResponse> => {
    return enhancedApiClient.get(`/research/projects/${id}`);
  },

  /**
   * Update research project
   */
  updateProject: async (
    id: string,
    data: UpdateResearchProjectDto
  ): Promise<ResearchProjectResponse> => {
    return enhancedApiClient.patch(`/research/projects/${id}`, data);
  },

  /**
   * Delete research project
   */
  deleteProject: async (id: string): Promise<ResearchProjectResponse> => {
    return enhancedApiClient.delete(`/research/projects/${id}`);
  },

  // ==================== STATISTICS ====================

  /**
   * Get research statistics
   */
  getStats: async (): Promise<ResearchStatsResponse> => {
    return enhancedApiClient.get('/research/stats');
  },
};

export default researchService;
