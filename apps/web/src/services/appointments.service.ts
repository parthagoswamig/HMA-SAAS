/**
 * Appointments API Service
 * Handles all appointment-related API operations
 */

import { enhancedApiClient } from '../lib/api-client';

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  appointmentDateTime: string; // ISO string
  reason?: string;
  notes?: string;
  status?: string;
}

export interface UpdateAppointmentDto {
  patientId?: string;
  doctorId?: string;
  departmentId?: string;
  appointmentDateTime?: string;
  reason?: string;
  notes?: string;
  status?: string;
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface AppointmentsListResponse {
  success: boolean;
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AppointmentStatsResponse {
  success: boolean;
  data: {
    total: number;
    today: number;
    pending: number;
    completed: number;
  };
}

const appointmentsService = {
  /**
   * Get all appointments with optional filters
   */
  getAppointments: async (filters?: AppointmentFilters): Promise<AppointmentsListResponse> => {
    return enhancedApiClient.get('/appointments', filters);
  },

  /**
   * Get a single appointment by ID
   */
  getAppointmentById: async (id: string): Promise<AppointmentResponse> => {
    return enhancedApiClient.get(`/appointments/${id}`);
  },

  /**
   * Create a new appointment
   */
  createAppointment: async (data: CreateAppointmentDto): Promise<AppointmentResponse> => {
    return enhancedApiClient.post('/appointments', data);
  },

  /**
   * Update an existing appointment
   */
  updateAppointment: async (
    id: string,
    data: UpdateAppointmentDto
  ): Promise<AppointmentResponse> => {
    return enhancedApiClient.patch(`/appointments/${id}`, data);
  },

  /**
   * Update appointment status
   */
  updateAppointmentStatus: async (id: string, status: string): Promise<AppointmentResponse> => {
    return enhancedApiClient.patch(`/appointments/${id}/status`, { status });
  },

  /**
   * Delete an appointment
   */
  deleteAppointment: async (id: string): Promise<AppointmentResponse> => {
    return enhancedApiClient.delete(`/appointments/${id}`);
  },

  /**
   * Get appointment statistics
   */
  getAppointmentStats: async (): Promise<AppointmentStatsResponse> => {
    return enhancedApiClient.get('/appointments/stats');
  },

  /**
   * Get calendar view of appointments
   */
  getCalendar: async (startDate: string, endDate: string): Promise<AppointmentResponse> => {
    return enhancedApiClient.get('/appointments/calendar', { startDate, endDate });
  },

  /**
   * Check doctor availability
   */
  checkAvailability: async (doctorId: string, date: string): Promise<AppointmentResponse> => {
    return enhancedApiClient.get('/appointments/availability', { doctorId, date });
  },
};

export default appointmentsService;
