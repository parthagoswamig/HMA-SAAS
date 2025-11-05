import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

// Pathology Types
export interface PathologyOrder extends BaseEntity {
  orderId: string;
  orderNumber: string;
  patientId: string;
  patient: Patient;
  orderingDoctor: Staff;
  specimenType: SpecimenType;
  testType: TestType;
  priority: Priority;
  status: OrderStatus;
  collectionDate?: Date;
  reportDate?: Date;
}

export interface PathologyReport extends BaseEntity {
  reportId: string;
  orderId: string;
  macroscopicFindings: string;
  microscopicFindings: string;
  diagnosis: string;
  reportedBy: Staff;
  reportDate: Date;
  status: ReportStatus;
}

export interface PathologyStats {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  testsByType: Record<string, number>;
}

export interface PathologySpecimen extends BaseEntity {
  specimenId: string;
  patientId: string;
  specimenType: SpecimenType;
  collectionDate: Date;
  status: SpecimenStatus;
}

export interface Pathologist extends BaseEntity {
  pathologistId: string;
  name: string;
  specialization: string;
}

export interface CytologySlide extends BaseEntity {
  slideId: string;
  specimenId: string;
  staining: StainingType;
  findings: string;
}

export interface HistologySlide extends BaseEntity {
  slideId: string;
  specimenId: string;
  staining: StainingType;
  findings: string;
}

export interface MolecularTest extends BaseEntity {
  testId: string;
  testName: string;
  result: string;
  status: TestStatus;
}

export interface PathologyFilters {
  status?: OrderStatus;
  testType?: TestType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export type SpecimenType = 'tissue' | 'fluid' | 'cytology' | 'biopsy';
export type TestType = 'histopathology' | 'cytopathology' | 'immunohistochemistry' | 'molecular';
export type Priority = 'routine' | 'urgent' | 'stat';
export type OrderStatus = 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
export type ReportStatus = 'draft' | 'preliminary' | 'final' | 'amended';
export type SpecimenStatus = 'collected' | 'processing' | 'analyzed' | 'archived';
export type TestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type BiopsyType = 'excisional' | 'incisional' | 'needle' | 'punch';
export type StainingType = 'H&E' | 'IHC' | 'special' | 'molecular';
export type DiagnosisCategory = 'benign' | 'malignant' | 'indeterminate' | 'normal';
