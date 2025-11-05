import axios, { InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // multi-tenant header
  const tenant = (typeof window !== 'undefined' && localStorage.getItem('tenant')) || 'default';
  config.headers.set('X-Tenant', tenant);
  config.headers.set('X-Tenant-Id', tenant);

  // JWT bearer
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

export const http = {
  get: async (url: string, params?: any) => (await client.get(url, { params })).data,
  post: async (url: string, data?: any) => (await client.post(url, data)).data,
  put: async (url: string, data?: any) => (await client.put(url, data)).data,
  patch: async (url: string, data?: any) => (await client.patch(url, data)).data,
  delete: async (url: string) => (await client.delete(url)).data,
};
