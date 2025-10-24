import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

export interface EmergencyCase extends BaseEntity {
  caseId: string;
  caseNumber: string;
  patientId: string;
  patient: Patient;
  arrivalTime: Date;
  triageLevel: TriageLevel;
  chiefComplaint: string;
  vitalSigns: EmergencyVitalSigns;
  assignedDoctor?: Staff;
  assignedNurse?: Staff;
  status: EmergencyStatus;
  disposition: Disposition;
  dischargTime?: Date;
  totalStayDuration?: number;
  treatmentNotes: string;
  medications: EmergencyMedication[];
  procedures: EmergencyProcedure[];
  consultations: EmergencyConsultation[];
}

export interface EmergencyVitalSigns {
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painLevel: number;
  consciousness: ConsciousnessLevel;
  recordedAt: Date;
  recordedBy: string;
}

export type TriageLevel = 'immediate' | 'urgent' | 'less_urgent' | 'non_urgent';
export type EmergencyStatus =
  | 'waiting'
  | 'in_treatment'
  | 'observation'
  | 'discharged'
  | 'admitted'
  | 'transferred';
export type Disposition =
  | 'discharge_home'
  | 'admit_ward'
  | 'admit_icu'
  | 'transfer'
  | 'deceased'
  | 'left_ama';
export type ConsciousnessLevel = 'alert' | 'drowsy' | 'stuporous' | 'unconscious';

export interface EmergencyMedication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  route: string;
  administeredAt: Date;
  administeredBy: string;
}

export interface EmergencyProcedure {
  procedureId: string;
  procedureName: string;
  performedAt: Date;
  performedBy: string;
  notes: string;
}

export interface EmergencyConsultation {
  consultationId: string;
  department: string;
  consultant: Staff;
  requestedAt: Date;
  consultedAt?: Date;
  recommendations: string;
}

// Additional types for emergency management
export interface Triage {
  id: string;
  patientName: string;
  triageLevel: TriageLevel;
  chiefComplaint: string;
  arrivalTime: Date;
  waitTime: number;
}

export interface ICUBed {
  id: string;
  bedNumber: string;
  status: BedStatus;
  patientName?: string;
  admissionTime?: Date;
}

export interface CriticalCareEquipment {
  id: string;
  name: string;
  status: EquipmentStatus;
  location: string;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  category: string;
  steps: string[];
}

export interface EmergencyFilters {
  status?: EmergencyStatus;
  triageLevel?: TriageLevel;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface VitalSigns {
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painLevel?: number;
  consciousness?: string;
  recordedAt: Date;
  recordedBy: string;
}

export type CaseStatus = EmergencyStatus;
export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';

export interface EmergencyStats {
  totalCases: number;
  criticalCases: number;
  urgentCases: number;
  lessUrgentCases: number;
  nonUrgentCases: number;
  averageWaitTime: number;
  bedOccupancyRate: number;
  averageStayDuration: number;
  dischargeRate: number;
  mortalityRate: number;
  // Additional properties needed by emergency page
  activeCases: number;
  occupiedICUBeds: number;
  totalICUBeds: number;
  codeBlueToday: number;
  triageDistribution: { [key: number]: number };
  hourlyAdmissions: Array<{ hour: string; admissions: number }>;
  bedOccupancyTrend: Array<{ date: string; occupied: number; available: number }>;
  casesByCategory: Array<{ category: string; count: number; percentage: number }>;
  dailyVolume: Array<{ date: string; cases: number }>;
  responseTimeMetrics: {
    averageTriageTime: number;
    averagePhysicianTime: number;
    averageDischargeTime: number;
  };
}
