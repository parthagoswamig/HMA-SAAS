import { enhancedApiClient } from '../lib/api-client';

/**
 * User Management API Service
 * Handles all user management operations
 */

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  department?: string;
  designation?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  role?: string;
  department?: string;
  designation?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: string[];
  twoFactorEnabled?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  department?: string;
  designation?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

const usersService = {
  /**
   * Create a new user
   */
  createUser: async (data: CreateUserDto): Promise<UserResponse> => {
    return enhancedApiClient.post('/users', data);
  },

  /**
   * Get all users with filters
   */
  getUsers: async (filters?: UserFilters): Promise<UsersListResponse> => {
    return enhancedApiClient.get('/users', filters);
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserResponse> => {
    return enhancedApiClient.get(`/users/${id}`);
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: UpdateUserDto): Promise<UserResponse> => {
    return enhancedApiClient.patch(`/users/${id}`, data);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<UserResponse> => {
    return enhancedApiClient.delete(`/users/${id}`);
  },

  /**
   * Reset user password
   */
  resetPassword: async (id: string, newPassword: string): Promise<UserResponse> => {
    return enhancedApiClient.post(`/users/${id}/reset-password`, { newPassword });
  },

  /**
   * Toggle user status
   */
  toggleUserStatus: async (id: string): Promise<UserResponse> => {
    return enhancedApiClient.patch(`/users/${id}/toggle-status`);
  },

  /**
   * Update user permissions
   */
  updatePermissions: async (id: string, permissions: string[]): Promise<UserResponse> => {
    return enhancedApiClient.patch(`/users/${id}/permissions`, { permissions });
  },

  /**
   * Get user roles
   */
  getRoles: async (): Promise<any> => {
    return enhancedApiClient.get('/users/roles');
  },

  /**
   * Get user permissions
   */
  getPermissions: async (): Promise<any> => {
    return enhancedApiClient.get('/users/permissions');
  },
};

export default usersService;
