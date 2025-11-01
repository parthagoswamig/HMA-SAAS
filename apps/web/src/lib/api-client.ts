import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token attached to request');
    } else {
      console.warn('⚠️ No token found in localStorage - request will be unauthorized');
    }

    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      hasAuth: !!token,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 403 Forbidden - Permission Error (DON'T redirect to login!)
    if (error.response?.status === 403) {
      console.error('❌ Permission Denied:', error.response?.data);
      // Let the error bubble up so the form can show the error message
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Attempting token refresh...');
        // Try to refresh token
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;

          console.log('✅ Token refreshed successfully');
          // Save new token
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          console.warn('⚠️ No refresh token available');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          // Add a message before redirecting
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// API Error Handler
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || error.response.data?.error;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    return message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred';
  }
};

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Generic API call wrapper
export const apiCall = async <T = any>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient[method](url, data, config);
    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    return {
      error: handleApiError(error),
      success: false,
    };
  }
};

// Enhanced API client with proper method signatures
const enhancedApiClient = {
  get: async (url: string, params?: any) => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },
  post: async (url: string, data?: any) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },
  patch: async (url: string, data?: any) => {
    const response = await apiClient.patch(url, data);
    return response.data;
  },
  put: async (url: string, data?: any) => {
    const response = await apiClient.put(url, data);
    return response.data;
  },
  delete: async (url: string) => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};

export { enhancedApiClient };
export default apiClient;
