import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

// Radiology Types
export interface RadiologyOrder extends BaseEntity {
  orderId: string;
  orderNumber: string;
  patientId: string;
  patient: Patient;
  orderingDoctor: Staff;
  studyType: StudyType;
  modality: Modality;
  priority: Priority;
  status: OrderStatus;
  scheduledDate?: Date;
  completedDate?: Date;
  report?: RadiologyReport;
}

export interface RadiologyReport extends BaseEntity {
  reportId: string;
  orderId: string;
  findings: string;
  impression: string;
  recommendations: string;
  reportedBy: Staff;
  reportDate: Date;
  status: ReportStatus;
}

export interface RadiologyEquipment extends BaseEntity {
  equipmentId: string;
  name: string;
  modality: Modality;
  manufacturer: string;
  model: string;
  status: EquipmentStatus;
  location: string;
}

export interface RadiologyStats {
  totalStudies: number;
  completedStudies: number;
  pendingStudies: number;
  studiesByModality: Record<Modality, number>;
  averageTurnaroundTime: number;
}

export type StudyType =
  | 'x_ray'
  | 'ct_scan'
  | 'mri'
  | 'ultrasound'
  | 'mammography'
  | 'fluoroscopy'
  | 'pet_scan';
export type Modality = 'XR' | 'CT' | 'MR' | 'US' | 'MG' | 'FL' | 'PT';
export type Priority = 'routine' | 'urgent' | 'stat' | 'emergency';
export type OrderStatus = 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ReportStatus = 'draft' | 'preliminary' | 'final' | 'amended';
export type EquipmentStatus = 'operational' | 'maintenance' | 'out_of_service';
