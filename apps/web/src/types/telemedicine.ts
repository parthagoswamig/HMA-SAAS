import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

// Telemedicine Types
export interface TeleconsultationSession extends BaseEntity {
  sessionId: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Staff;
  scheduledTime: Date;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  platform: Platform;
  meetingLink: string;
  status: SessionStatus;
  notes?: string;
}

export interface RemoteMonitoringData extends BaseEntity {
  dataId: string;
  patientId: string;
  deviceType: DeviceType;
  measurements: Measurement[];
  recordedAt: Date;
  status: DataStatus;
}

export interface Measurement {
  parameter: string;
  value: number;
  unit: string;
  timestamp: Date;
  isAbnormal?: boolean;
}

export interface TelehealthStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageDuration: number;
  patientSatisfaction: number;
}

export type Platform = 'zoom' | 'teams' | 'google_meet' | 'custom';
export type SessionStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'active'
  | 'waiting';
export type DeviceType =
  | 'blood_pressure'
  | 'glucose_meter'
  | 'pulse_oximeter'
  | 'weight_scale'
  | 'ecg';
export type DataStatus = 'normal' | 'abnormal' | 'critical';

// Additional types required by telemedicine page
export interface TelemedicineSession extends BaseEntity {
  sessionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledTime: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  type: SessionType;
  status: SessionStatus;
  notes?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
}

export interface DigitalPrescription extends BaseEntity {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  issuedDate: string;
  validUntil: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface TelemedicineStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  averageDuration: number;
  patientSatisfaction: number;
}

export interface PatientMonitoring extends BaseEntity {
  patientId: string;
  patientName: string;
  deviceType: DeviceType;
  lastReading: Date;
  vitalSigns: VitalSigns;
  status: DataStatus;
  alerts?: string[];
}

export interface VirtualConsultation extends BaseEntity {
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledTime: string;
  status: ConsultationStatus;
  type: SessionType;
  duration?: number;
  specialty: string;
  reason: string;
}

export type SessionType = 'consultation' | 'follow_up' | 'emergency' | 'therapy' | 'monitoring';
export type ConsultationStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'waiting';
