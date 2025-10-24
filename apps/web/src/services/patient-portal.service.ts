import { enhancedApiClient } from '../lib/api-client';

/**
 * Patient Portal API Service
 * Handles all patient portal operations including profile, appointments, records, and billing
 */

// Types
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
}

export interface BookAppointmentDto {
  doctorId: string;
  departmentId?: string;
  startTime: string;
  endTime: string;
  reason: string;
  type?: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY';
}

export interface PatientProfileResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    email?: string;
    medicalRecordNumber?: string;
    bloodGroup?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface AppointmentResponse {
  success: boolean;
  message?: string;
  data: Array<{
    id: string;
    patientId: string;
    doctorId: string;
    departmentId?: string;
    startTime: string;
    endTime: string;
    status: string;
    reason: string;
    type?: string;
    notes?: string;
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
      specialization?: string;
    };
    department?: {
      id: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface MedicalRecordsResponse {
  success: boolean;
  data: Array<{
    id: string;
    patientId: string;
    doctorId?: string;
    recordType: string;
    diagnosis?: string;
    symptoms?: string;
    treatment?: string;
    notes?: string;
    attachments?: any[];
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
      specialization?: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface LabResultsResponse {
  success: boolean;
  data: Array<{
    id: string;
    orderNumber: string;
    patientId: string;
    status: string;
    completedDate?: string;
    tests: Array<{
      id: string;
      testId: string;
      result?: string;
      notes?: string;
      status: string;
      resultDate?: string;
      test?: {
        id: string;
        name: string;
        code: string;
        category: string;
        normalRange?: string;
        unit?: string;
      };
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface PrescriptionsResponse {
  success: boolean;
  data: Array<{
    id: string;
    patientId: string;
    doctorId?: string;
    diagnosis?: string;
    notes?: string;
    doctor?: {
      id: string;
      firstName: string;
      lastName: string;
      specialization?: string;
    };
    prescriptionItems: Array<{
      id: string;
      medicationId: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
      medication?: {
        id: string;
        name: string;
        genericName?: string;
        strength?: string;
      };
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface InvoicesResponse {
  success: boolean;
  data: Array<{
    id: string;
    invoiceNumber: string;
    patientId: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    dueDate?: string;
    payments: Array<{
      id: string;
      amount: number;
      paymentMethod: string;
      paymentDate: string;
      status: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

const patientPortalService = {
  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get patient profile
   */
  getProfile: async (): Promise<PatientProfileResponse> => {
    return enhancedApiClient.get('/patient-portal/my-profile');
  },

  /**
   * Update patient profile
   */
  updateProfile: async (data: UpdateProfileDto): Promise<PatientProfileResponse> => {
    return enhancedApiClient.patch('/patient-portal/my-profile', data);
  },

  // ==================== APPOINTMENTS ====================

  /**
   * Get my appointments
   */
  getMyAppointments: async (filters?: any): Promise<AppointmentResponse> => {
    return enhancedApiClient.get('/patient-portal/my-appointments', filters);
  },

  /**
   * Book new appointment
   */
  bookAppointment: async (data: BookAppointmentDto): Promise<AppointmentResponse> => {
    return enhancedApiClient.post('/patient-portal/book-appointment', data);
  },

  // ==================== MEDICAL RECORDS ====================

  /**
   * Get my medical records
   */
  getMyRecords: async (filters?: any): Promise<MedicalRecordsResponse> => {
    return enhancedApiClient.get('/patient-portal/my-medical-records', filters);
  },

  // ==================== LAB RESULTS ====================

  /**
   * Get my lab results
   */
  getMyLabResults: async (): Promise<LabResultsResponse> => {
    return enhancedApiClient.get('/patient-portal/my-lab-results');
  },

  // ==================== PRESCRIPTIONS ====================

  /**
   * Get my prescriptions
   */
  getMyPrescriptions: async (): Promise<PrescriptionsResponse> => {
    return enhancedApiClient.get('/patient-portal/my-prescriptions');
  },

  // ==================== INVOICES ====================

  /**
   * Get my invoices
   */
  getMyInvoices: async (): Promise<InvoicesResponse> => {
    return enhancedApiClient.get('/patient-portal/my-invoices');
  },
};

export default patientPortalService;
