'use client';
import { create } from 'zustand';
import { http } from '@/lib/api-client';

type User = { id: string; email: string; firstName: string; lastName?: string; role: string; tenantId: string };

type AuthState = {
  user?: User | null;
  token?: string | null;
  tenant: string;
  setTenant: (t: string) => void;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  register: (p: {email:string;password:string;firstName:string;lastName?:string;tenantId:string;role?:string}) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: (typeof window !== 'undefined' && localStorage.getItem('token')) || null,
  tenant: (typeof window !== 'undefined' && localStorage.getItem('tenant')) || 'default',

  setTenant: (t) => {
    if (typeof window !== 'undefined') localStorage.setItem('tenant', t);
    set({ tenant: t });
  },

  async login(email, password, tenantId) {
    const res = await http.post('/auth/login', { email, password, tenantId });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.token);
      localStorage.setItem('tenant', tenantId);
    }
    set({ token: res.token });
    await get().loadMe();
  },

  async register(payload) {
    const res = await http.post('/auth/register', payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.token);
      localStorage.setItem('tenant', payload.tenantId);
    }
    set({ token: res.token });
    await get().loadMe();
  },

  async loadMe() {
    try {
      const res = await http.get('/auth/me');
      set({ user: res });
    } catch {
      set({ user: null, token: null });
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null });
  },
}));
