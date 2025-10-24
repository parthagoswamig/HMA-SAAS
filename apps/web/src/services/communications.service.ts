import { enhancedApiClient } from '../lib/api-client';

/**
 * Communications API Service
 * Handles all messaging and notification operations
 */

// Types
export interface CreateMessageDto {
  recipientId: string;
  subject: string;
  content: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  relatedType?: string;
  relatedId?: string;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'APPOINTMENT' | 'BILLING' | 'SYSTEM';
  actionUrl?: string;
  relatedType?: string;
  relatedId?: string;
}

export interface MessageFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  priority?: string;
  search?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface MessagesListResponse {
  success: boolean;
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface NotificationsListResponse {
  success: boolean;
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CommunicationStatsResponse {
  success: boolean;
  data: {
    unreadMessages: number;
    totalMessages: number;
    unreadNotifications: number;
    totalNotifications: number;
    sentMessages: number;
    receivedMessages: number;
  };
}

const communicationsService = {
  // ==================== MESSAGE OPERATIONS ====================

  /**
   * Send a message
   */
  sendMessage: async (data: CreateMessageDto): Promise<MessageResponse> => {
    return enhancedApiClient.post('/communications/messages', data);
  },

  /**
   * Get all messages
   */
  getMessages: async (filters?: MessageFilters): Promise<MessagesListResponse> => {
    return enhancedApiClient.get('/communications/messages', filters);
  },

  /**
   * Mark message as read
   */
  markMessageAsRead: async (id: string): Promise<MessageResponse> => {
    return enhancedApiClient.patch(`/communications/messages/${id}/read`);
  },

  /**
   * Delete message
   */
  deleteMessage: async (id: string): Promise<MessageResponse> => {
    return enhancedApiClient.delete(`/communications/messages/${id}`);
  },

  // ==================== NOTIFICATION OPERATIONS ====================

  /**
   * Create a notification
   */
  createNotification: async (data: CreateNotificationDto): Promise<NotificationResponse> => {
    return enhancedApiClient.post('/communications/notifications', data);
  },

  /**
   * Get all notifications
   */
  getNotifications: async (filters?: NotificationFilters): Promise<NotificationsListResponse> => {
    return enhancedApiClient.get('/communications/notifications', filters);
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (id: string): Promise<NotificationResponse> => {
    return enhancedApiClient.patch(`/communications/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: async (): Promise<NotificationResponse> => {
    return enhancedApiClient.patch('/communications/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<NotificationResponse> => {
    return enhancedApiClient.delete(`/communications/notifications/${id}`);
  },

  /**
   * Get communication statistics
   */
  getStats: async (): Promise<CommunicationStatsResponse> => {
    return enhancedApiClient.get('/communications/stats');
  },
};

export default communicationsService;
