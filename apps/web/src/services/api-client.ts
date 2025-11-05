/**
 * Central API client with auth + helpers
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
});

const getTenantHint = (): string | null => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_DEFAULT_TENANT || null;
  const h = window.location.hostname || '';
  const parts = h.split('.');
  const sub = parts.length > 2 ? parts[0] : null; // foo.example.com
  const stored = localStorage.getItem('tenant') || localStorage.getItem('tenantId');
  return stored || sub || process.env.NEXT_PUBLIC_DEFAULT_TENANT || null;
};

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
      const t = getTenantHint();
      if (t) config.headers.set('X-Tenant', t);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  params?: Record<string, any>
): Promise<T> {
  try {
    const res = await api.request<T>({ method, url, data: body, params });
    return res.data as T;
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const message = err?.response?.data?.message || err?.message || 'Request failed';
    throw new ApiError(status, message, err?.response?.data);
  }
}

export const http = {
  get: <T = any>(url: string, params?: Record<string, any>) => request<T>('GET', url, undefined, params),
  post: <T = any>(url: string, body?: any) => request<T>('POST', url, body),
  put: <T = any>(url: string, body?: any) => request<T>('PUT', url, body),
  delete: <T = any>(url: string) => request<T>('DELETE', url),
};

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export default api;
