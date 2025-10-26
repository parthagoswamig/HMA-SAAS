import { enhancedApiClient } from '../lib/api-client';

/**
 * Settings API Service
 * Handles all system and hospital settings operations
 */

export interface HospitalSettings {
  hospitalName: string;
  hospitalCode?: string;
  registrationNumber?: string;
  hospitalType?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  website?: string;
  logo?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  currency?: string;
  language?: string;
}

export interface SystemSettings {
  appointmentDuration?: number;
  appointmentBuffer?: number;
  maxAdvanceBooking?: number;
  allowOnlineBooking?: boolean;
  requireApproval?: boolean;
  allowCancellation?: boolean;
  cancellationHours?: number;
  taxEnabled?: boolean;
  taxPercentage?: number;
  serviceTax?: number;
  roundOffBills?: boolean;
  billPrefix?: string;
  paymentTerms?: number;
  passwordMinLength?: number;
  passwordExpiryDays?: number;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  twoFactorEnabled?: boolean;
}

export interface NotificationSettings {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  appointmentReminder?: boolean;
  appointmentConfirmation?: boolean;
  billGeneration?: boolean;
  paymentReminder?: boolean;
  labResults?: boolean;
  emergencyAlerts?: boolean;
}

export interface EmailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  emailFrom?: string;
  emailSignature?: string;
}

const settingsService = {
  /**
   * Get hospital settings
   */
  getHospitalSettings: async (): Promise<any> => {
    return enhancedApiClient.get('/settings/hospital');
  },

  /**
   * Update hospital settings
   */
  updateHospitalSettings: async (data: Partial<HospitalSettings>): Promise<any> => {
    return enhancedApiClient.patch('/settings/hospital', data);
  },

  /**
   * Get system settings
   */
  getSystemSettings: async (): Promise<any> => {
    return enhancedApiClient.get('/settings/system');
  },

  /**
   * Update system settings
   */
  updateSystemSettings: async (data: Partial<SystemSettings>): Promise<any> => {
    return enhancedApiClient.patch('/settings/system', data);
  },

  /**
   * Get notification settings
   */
  getNotificationSettings: async (): Promise<any> => {
    return enhancedApiClient.get('/settings/notifications');
  },

  /**
   * Update notification settings
   */
  updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<any> => {
    return enhancedApiClient.patch('/settings/notifications', data);
  },

  /**
   * Get email settings
   */
  getEmailSettings: async (): Promise<any> => {
    return enhancedApiClient.get('/settings/email');
  },

  /**
   * Update email settings
   */
  updateEmailSettings: async (data: Partial<EmailSettings>): Promise<any> => {
    return enhancedApiClient.patch('/settings/email', data);
  },

  /**
   * Upload logo
   */
  uploadLogo: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('logo', file);
    // Note: Content-Type will be set automatically for FormData
    return enhancedApiClient.post('/settings/logo', formData);
  },

  /**
   * Get departments
   */
  getDepartments: async (): Promise<any> => {
    return enhancedApiClient.get('/settings/departments');
  },

  /**
   * Create department
   */
  createDepartment: async (data: any): Promise<any> => {
    return enhancedApiClient.post('/settings/departments', data);
  },

  /**
   * Update department
   */
  updateDepartment: async (id: string, data: any): Promise<any> => {
    return enhancedApiClient.patch(`/settings/departments/${id}`, data);
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id: string): Promise<any> => {
    return enhancedApiClient.delete(`/settings/departments/${id}`);
  },
};

export default settingsService;
