import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

export interface Surgery extends BaseEntity {
  surgeryId: string;
  surgeryNumber: string;
  patientId: string;
  patient: Patient;
  surgeonId: string;
  surgeon: Staff;
  assistants: Staff[];
  anesthesiologist: Staff;
  operationTheater: OperationTheater;
  scheduledDate: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  surgeryType: string;
  procedure: string;
  urgency: SurgeryUrgency;
  status: SurgeryStatus;
  preOpAssessment: PreOpAssessment;
  postOpNotes: PostOpNotes;
  complications?: string[];
  equipmentUsed: SurgicalEquipment[];
  materials: SurgicalMaterial[];
  anesthesiaRecord: AnesthesiaRecord;
  estimatedDuration: number;
  actualDuration?: number;
  bloodLoss?: number;
  transfusionRequired: boolean;
}

export interface OperationTheater extends BaseEntity {
  theaterId: string;
  theaterNumber: string;
  theaterName: string;
  location: string;
  theaterType: TheaterType;
  capacity: number;
  equipment: TheaterEquipment[];
  isAvailable: boolean;
  currentSurgeryId?: string;
  maintenanceSchedule: MaintenanceSchedule[];
  lastCleaningDate: Date;
  airPressure: number;
  temperature: number;
  humidity: number;
}

export interface PreOpAssessment {
  assessmentDate: Date;
  assessedBy: string;
  vitalSigns: VitalSigns;
  allergies: string[];
  medications: string[];
  medicalHistory: string;
  physicalExam: string;
  labResults: string[];
  imagingResults: string[];
  anesthesiaRisk: AnesthesiaRisk;
  surgicalRisk: SurgicalRisk;
  consentObtained: boolean;
  fastingHours: number;
  notes: string;
}

export interface PostOpNotes {
  noteDate: Date;
  surgeon: string;
  procedurePerformed: string;
  findings: string;
  complications?: string;
  specimens?: string[];
  estimatedBloodLoss: number;
  fluidsGiven: FluidRecord[];
  postOpOrders: string[];
  disposition: string;
  followUpInstructions: string;
  expectedLOS: number;
}

export interface SurgicalEquipment {
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  usageTime: number;
  sterilizationDate: Date;
  sterilizationMethod: string;
  condition: string;
}

export interface SurgicalMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  lotNumber: string;
  expiryDate: Date;
  cost: number;
}

export interface AnesthesiaRecord {
  recordId: string;
  anesthesiologist: string;
  anesthesiaType: AnesthesiaType;
  medications: AnesthesiaMedication[];
  vitals: AnesthesiaVitals[];
  complications?: string[];
  recoveryNotes: string;
}

export type SurgeryUrgency = 'elective' | 'urgent' | 'emergency' | 'emergent';
export type SurgeryStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
export type TheaterType = 'general' | 'cardiac' | 'neuro' | 'orthopedic' | 'ophthalmic' | 'ent';
export type AnesthesiaRisk = 'low' | 'moderate' | 'high' | 'very_high';
export type SurgicalRisk = 'low' | 'moderate' | 'high' | 'very_high';
export type AnesthesiaType = 'general' | 'regional' | 'local' | 'sedation';

export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
}

export interface TheaterEquipment {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  isOperational: boolean;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
}

export interface MaintenanceSchedule {
  maintenanceId: string;
  scheduledDate: Date;
  maintenanceType: string;
  duration: number;
  notes: string;
}

export interface FluidRecord {
  fluidType: string;
  volume: number;
  route: string;
  time: Date;
}

export interface AnesthesiaMedication {
  medicationName: string;
  dosage: string;
  route: string;
  time: Date;
  administeredBy: string;
}

export interface AnesthesiaVitals {
  time: Date;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  endTidalCO2?: number;
  anesthesiaDepth?: string;
}
