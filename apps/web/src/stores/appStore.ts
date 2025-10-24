import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Notification, TenantInfo } from '../types/common';

interface AppState {
  // User and Authentication
  user: User | null;
  isAuthenticated: boolean;
  tenantInfo: TenantInfo | null;

  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: Notification[];
  unreadNotifications: number;

  // Loading states
  isLoading: boolean;
  loadingMessage: string;

  // Error states
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setTenantInfo: (tenantInfo: TenantInfo) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setLoading: (isLoading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  tenantInfo: null,
  sidebarCollapsed: false,
  theme: 'light' as const,
  notifications: [] as Notification[],
  unreadNotifications: 0,
  isLoading: false,
  loadingMessage: '',
  error: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user, isAuthenticated: user !== null }),

        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

        setTenantInfo: (tenantInfo) => set({ tenantInfo }),

        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        setTheme: (theme) => set({ theme }),

        addNotification: (notification) =>
          set((state) => {
            const notifications = [...state.notifications, notification];
            const unreadCount = notifications.filter((n) => !n.isRead).length;
            return {
              notifications,
              unreadNotifications: unreadCount,
            };
          }),

        markNotificationAsRead: (notificationId) =>
          set((state) => {
            const notifications = state.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            );
            const unreadCount = notifications.filter((n) => !n.isRead).length;
            return {
              notifications,
              unreadNotifications: unreadCount,
            };
          }),

        markAllNotificationsAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadNotifications: 0,
          })),

        removeNotification: (notificationId) =>
          set((state) => {
            const notifications = state.notifications.filter((n) => n.id !== notificationId);
            const unreadCount = notifications.filter((n) => !n.isRead).length;
            return {
              notifications,
              unreadNotifications: unreadCount,
            };
          }),

        setLoading: (isLoading, message = '') =>
          set({
            isLoading,
            loadingMessage: message,
          }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),

        reset: () => set({ ...initialState }),
      }),
      {
        name: 'hms-app-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          tenantInfo: state.tenantInfo,
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'hms-app-store',
    }
  )
);
