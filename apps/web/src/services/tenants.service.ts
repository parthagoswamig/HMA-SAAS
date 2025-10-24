import { apiClient } from './api.service';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  status?: string;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  subscriptionPlan?: string;
}

export interface UpdateTenantDto {
  name?: string;
  type?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  subscriptionPlan?: string;
}

export interface TenantStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  totalUsers: number;
  totalPatients: number;
}

class TenantsService {
  private baseUrl = '/tenants';

  async getAllTenants(page = 1, limit = 10, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getTenantById(id: string) {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getTenantBySlug(slug: string) {
    const response = await apiClient.get(`${this.baseUrl}/slug/${slug}`);
    return response.data;
  }

  async createTenant(data: CreateTenantDto) {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateTenant(id: string, data: UpdateTenantDto) {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async activateTenant(id: string) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/activate`);
    return response.data;
  }

  async suspendTenant(id: string, reason?: string) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/suspend`, { reason });
    return response.data;
  }

  async deactivateTenant(id: string) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/deactivate`);
    return response.data;
  }

  async deleteTenant(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getTenantsStats(): Promise<TenantStats> {
    // This would need to be implemented on the backend
    // For now, calculate from getAllTenants
    const response = await this.getAllTenants(1, 1000);
    const tenants = response.data?.items || [];

    return {
      total: tenants.length,
      active: tenants.filter((t: any) => t.status === 'ACTIVE').length,
      trial: tenants.filter((t: any) => t.status === 'TRIAL').length,
      suspended: tenants.filter((t: any) => t.status === 'SUSPENDED').length,
      totalUsers: 0, // Would need backend support
      totalPatients: 0, // Would need backend support
    };
  }
}

export const tenantsService = new TenantsService();
