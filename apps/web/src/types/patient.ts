import {
  BaseEntity,
  Address,
  ContactInfo,
  Gender,
  BloodGroup,
  MaritalStatus,
  Status,
} from './common';

// Enhanced Patient related interfaces
export interface Patient extends BaseEntity {
  // Basic Information
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender: Gender;
  bloodGroup?: BloodGroup;
  maritalStatus?: MaritalStatus;

  // Contact Information
  contactInfo: ContactInfo;
  address: Address;

  // Identity Documents (Optional - Aadhaar optional policy)
  aadhaarNumber?: string;
  otherIdNumber?: string;
  otherIdType?: 'pan' | 'passport' | 'driving_license' | 'voter_id';

  // Medical Information
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Insurance Information
  insuranceInfo?: InsuranceInfo;

  // System fields
  status: Status;
  registrationDate: Date;
  lastVisitDate?: Date;
  totalVisits: number;

  // Additional metadata
  occupation?: string;
  religion?: string;
  language?: string;
  notes?: string;
}

export interface InsuranceInfo {
  insuranceType: 'government' | 'private' | 'corporate' | 'self_pay';
  insuranceProvider: string;
  policyNumber: string;
  policyHolderName: string;
  relationshipToPatient: string;
  validFrom: Date;
  validTo: Date;
  coverageAmount: number;
  isActive: boolean;
  copayAmount?: number;
  deductibleAmount?: number;
  claimHistory?: InsuranceClaim[];
  notes?: string;
}

export interface InsuranceClaim {
  claimId: string;
  claimDate: Date;
  claimAmount: number;
  approvedAmount: number;
  status: 'pending' | 'approved' | 'denied' | 'processing';
  claimReason: string;
  notes?: string;
}

// Patient Visit/Encounter
export interface PatientVisit extends BaseEntity {
  visitId: string;
  patientId: string;
  visitType: 'opd' | 'ipd' | 'emergency' | 'teleconsultation';
  visitDate: Date;
  chiefComplaint: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

  // Doctor/Department Information
  doctorId?: string;
  doctorName?: string;
  departmentId: string;
  departmentName: string;

  // Clinical Information
  vitals?: VitalSigns;
  diagnosis: string[];
  treatmentPlan: string;
  prescriptions: Prescription[];
  orders: MedicalOrder[];

  // Follow-up
  followUpDate?: Date;
  followUpInstructions?: string;

  // Billing
  totalAmount?: number;
  paidAmount?: number;
  pendingAmount?: number;

  // Additional notes
  notes?: string;
}

export interface VitalSigns {
  temperature?: number; // in Celsius
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number; // BPM
  respiratoryRate?: number;
  oxygenSaturation?: number; // %
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number;
  painScale?: number; // 1-10
  recordedAt: Date;
  recordedBy: string;
  bloodGlucose?: number;
  cholesterol?: number;
  notes?: string;
}

export interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  isGeneric?: boolean;
  isDispensed?: boolean;
  dispensedDate?: Date;
  dispensedBy?: string;
  refillsAllowed?: number;
  refillsUsed?: number;
  sideEffects?: string[];
  interactions?: string[];
  cost?: number;
}

export interface MedicalOrder {
  orderType: 'lab' | 'radiology' | 'procedure' | 'consultation' | 'therapy';
  orderName: string;
  orderCode?: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  orderedDate: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  results?: string;
  resultDocuments?: string[];
  orderedBy?: string;
  performedBy?: string;
  cost?: number;
  notes?: string;
}

// Medical History
export interface MedicalHistory extends BaseEntity {
  patientId: string;
  historyType:
    | 'medical'
    | 'surgical'
    | 'family'
    | 'social'
    | 'allergy'
    | 'medication'
    | 'immunization';
  title: string;
  description: string;
  date?: Date;
  isActive: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  outcome?: string;
  complications?: string;
  treatmentReceived?: string;
  doctorName?: string;
  hospitalName?: string;
  notes?: string;
}

// Patient Documents
export interface PatientDocument extends BaseEntity {
  patientId: string;
  documentType:
    | 'id_proof'
    | 'medical_report'
    | 'lab_result'
    | 'radiology'
    | 'prescription'
    | 'insurance'
    | 'consent'
    | 'discharge_summary'
    | 'vaccination_record'
    | 'other';
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  isActive: boolean;
  tags?: string[];
  accessLevel: 'public' | 'restricted' | 'confidential';
  expirationDate?: Date;
  version?: string;
  parentDocumentId?: string;
}

// Patient Appointment
export interface PatientAppointment extends BaseEntity {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  appointmentType: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  status:
    | 'scheduled'
    | 'arrived'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'rescheduled';
  chiefComplaint?: string;
  notes?: string;

  // Reminder settings
  reminderSent?: boolean;
  reminderSentAt?: Date;

  // Cancellation/Rescheduling
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  rescheduledFrom?: Date;
  rescheduledReason?: string;
}

// Search and Filter types
export interface PatientSearchParams {
  searchTerm?: string;
  patientId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  bloodGroup?: BloodGroup;
  gender?: Gender;
  status?: Status;
  insuranceType?: string;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  lastVisitDateFrom?: Date;
  lastVisitDateTo?: Date;
  ageFrom?: number;
  ageTo?: number;
  hasAllergies?: boolean;
  hasChronicDiseases?: boolean;
  hasInsurance?: boolean;
  doctorId?: string;
  departmentId?: string;
}

export interface PatientListItem {
  id: string;
  patientId: string;
  fullName: string;
  age: number;
  gender: Gender;
  phoneNumber: string;
  lastVisitDate?: Date;
  totalVisits: number;
  status: Status;
  hasInsurance: boolean;
  emergencyFlag?: boolean;
}

// Patient statistics
export interface PatientStats {
  totalPatients: number;
  newPatientsToday: number;
  newPatientsThisMonth: number;
  activePatients: number;
  averageAge: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  bloodGroupDistribution: Record<BloodGroup, number>;
  insuranceDistribution: {
    insured: number;
    uninsured: number;
  };
  visitTrends: {
    date: string;
    count: number;
  }[];
  departmentDistribution?: {
    departmentName: string;
    patientCount: number;
  }[];
  ageGroupDistribution?: {
    pediatric: number; // 0-18
    adult: number; // 19-64
    senior: number; // 65+
  };
  chronicDiseaseStats?: {
    condition: string;
    count: number;
    percentage: number;
  }[];
}

// Additional interfaces for enhanced functionality
export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: Gender;
  bloodGroup?: BloodGroup;
  maritalStatus?: MaritalStatus;
  contactInfo: ContactInfo;
  address: Address;
  aadhaarNumber?: string;
  otherIdNumber?: string;
  otherIdType?: 'pan' | 'passport' | 'driving_license' | 'voter_id';
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  insuranceInfo?: Partial<InsuranceInfo>;
  occupation?: string;
  religion?: string;
  language?: string;
  notes?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  id: string;
}

// Patient Portal Access
export interface PatientPortalAccess extends BaseEntity {
  patientId: string;
  portalUserId: string;
  isEnabled: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  accountLocked: boolean;
  lockedUntil?: Date;
  passwordResetRequired: boolean;
  twoFactorEnabled: boolean;
  preferences: PatientPortalPreferences;
}

export interface PatientPortalPreferences {
  receiveEmailNotifications: boolean;
  receiveSmsNotifications: boolean;
  appointmentReminders: boolean;
  labResultNotifications: boolean;
  prescriptionRefillReminders: boolean;
  languagePreference: string;
  timeZone: string;
}

// Export and Reporting
export interface PatientExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeFields: string[];
  searchCriteria?: PatientSearchParams;
  includeVisitHistory?: boolean;
  includeMedicalHistory?: boolean;
  includeDocuments?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface PatientReport {
  reportType: 'demographics' | 'visit_summary' | 'medical_summary' | 'insurance_summary';
  patientId: string;
  generatedAt: Date;
  generatedBy: string;
  data: Record<string, any>;
  format: 'pdf' | 'html' | 'json';
}

// Patient Communication
export interface PatientCommunication extends BaseEntity {
  patientId: string;
  communicationType: 'sms' | 'email' | 'phone' | 'in_app';
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  templateId?: string;
  recipientInfo: {
    name: string;
    contact: string;
  };
  metadata?: Record<string, any>;
}
