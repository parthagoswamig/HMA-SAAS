import apiClient, { handleApiError } from '../lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  tenantId?: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roleId?: string;
    permissions?: string[];
    tenant?: {
      id: string;
      name: string;
      type?: string;
    };
    tenantId?: string;
  };
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Add default tenantId if not provided
      const registerData = {
        ...data,
        tenantId: data.tenantId || 'demo-hospital', // Use demo tenant by default
      };
      
      const response = await apiClient.post('/auth/register', registerData);

      // Handle the response based on what backend actually returns
      const responseData = response.data;
      
      // If registration successful but no tokens (need to login separately)
      if (responseData.success && responseData.data) {
        // Auto-login after successful registration
        return this.login({
          email: data.email,
          password: data.password,
        });
      }
      
      // If tokens are returned directly
      if (responseData.accessToken) {
        const { user, accessToken } = responseData;
        
        // Store tokens and user info
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          user,
          accessToken,
          refreshToken: '', // No refresh token in current implementation
        };
      }
      
      throw new Error('Unexpected response format from registration');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      // Backend returns { accessToken, user: {...} }
      const { user, accessToken } = response.data;

      // Store tokens and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store tenant info separately for easy access
        if (user.tenant) {
          localStorage.setItem('tenant', JSON.stringify(user.tenant));
        }
        
        // Store permissions for RBAC
        if (user.permissions) {
          localStorage.setItem('permissions', JSON.stringify(user.permissions));
        }
      }

      return {
        user,
        accessToken,
        refreshToken: '', // No refresh token in current implementation
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      localStorage.removeItem('permissions');
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (!refreshToken) {
        // No refresh token, try to get profile with current access token
        const profile = await this.getProfile();
        if (profile) {
          return localStorage.getItem('accessToken') || '';
        }
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', { refreshToken });

      // Store new access token
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      return response.data.accessToken;
    } catch (error) {
      this.logout();
      throw new Error(handleApiError(error));
    }
  }
  
  /**
   * Get user permissions
   */
  getUserPermissions(): string[] {
    if (typeof window !== 'undefined') {
      const permissionsStr = localStorage.getItem('permissions');
      return permissionsStr ? JSON.parse(permissionsStr) : [];
    }
    return [];
  }
  
  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'HOSPITAL_ADMIN') {
      return true; // Admins have all permissions
    }
    
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }
  
  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'HOSPITAL_ADMIN') {
      return true;
    }
    
    const userPermissions = this.getUserPermissions();
    return permissions.some(p => userPermissions.includes(p));
  }
  
  /**
   * Get tenant info
   */
  getTenant(): any | null {
    if (typeof window !== 'undefined') {
      const tenantStr = localStorage.getItem('tenant');
      return tenantStr ? JSON.parse(tenantStr) : null;
    }
    return null;
  }
}

const authService = new AuthService();
export default authService;
