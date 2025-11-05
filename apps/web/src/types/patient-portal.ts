import { BaseEntity } from './common';
import { Patient } from './patient';

// Patient Portal Types
export interface PortalUser extends BaseEntity {
  userId: string;
  patientId: string;
  patient: Patient;
  email: string;
  username: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: PortalPreferences;
}

export interface PortalPreferences {
  language: string;
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  labResults: boolean;
  prescriptions: boolean;
}

export interface PortalMessage extends BaseEntity {
  messageId: string;
  patientId: string;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  sentDate: Date;
  readDate?: Date;
  status: MessageStatus;
}

export interface PortalAppointmentRequest extends BaseEntity {
  requestId: string;
  patientId: string;
  departmentId: string;
  preferredDate: Date;
  reason: string;
  status: RequestStatus;
  notes?: string;
}

export interface PortalStats {
  totalUsers: number;
  activeUsers: number;
  appointmentRequests: number;
  messages: number;
}

export interface Appointment extends BaseEntity {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  status: AppointmentStatus;
  type: AppointmentType;
}

export interface Doctor extends BaseEntity {
  doctorId: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

export interface Prescription extends BaseEntity {
  prescriptionId: string;
  patientId: string;
  medications: any[];
  date: Date;
}

export interface TestResult extends BaseEntity {
  testId: string;
  testName: string;
  result: string;
  date: Date;
}

export interface MedicalRecord extends BaseEntity {
  recordId: string;
  patientId: string;
  diagnosis: string;
  treatment: string;
  date: Date;
}

export interface PatientCommunication extends BaseEntity {
  communicationId: string;
  patientId: string;
  message: string;
  date: Date;
  type: 'email' | 'sms' | 'notification';
}

export interface PatientPortalStats {
  totalUsers: number;
  activeUsers: number;
  appointmentRequests: number;
  messages: number;
}

export interface Notification extends BaseEntity {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: Date;
}

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'archived';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentType = 'consultation' | 'follow_up' | 'emergency' | 'routine';
