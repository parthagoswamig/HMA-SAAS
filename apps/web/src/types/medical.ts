import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

// Medical Record base interface
export interface MedicalRecord extends BaseEntity {
  recordId: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Staff;
  recordType: MedicalRecordType;
  recordDate: Date;
  visitId?: string;
  appointmentId?: string;

  // Clinical Information
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  familyHistory?: string;
  socialHistory?: string;
  allergies: Allergy[];
  medications: Medication[];

  // Physical Examination
  vitalSigns: VitalSigns;
  physicalExamination: PhysicalExamination;

  // Assessment and Plan
  assessment: string;
  diagnosis: Diagnosis[];
  treatmentPlan: string;
  prescriptions: Prescription[];

  // Follow-up and Instructions
  followUpInstructions: string;
  followUpDate?: Date;
  referrals?: Referral[];

  // Documentation
  clinicalNotes: string;
  additionalNotes?: string;
  attachments: MedicalDocument[];

  // Status and Workflow
  status: MedicalRecordStatus;
  isConfidential: boolean;
  accessLevel: AccessLevel;

  // Signatures and Approval
  doctorSignature?: DigitalSignature;
  isApproved: boolean;
  approvedBy?: string;
  approvedDate?: Date;
}

export type MedicalRecordType =
  | 'consultation'
  | 'follow_up'
  | 'emergency'
  | 'admission'
  | 'discharge'
  | 'surgery'
  | 'procedure'
  | 'lab_result'
  | 'radiology'
  | 'pathology'
  | 'vaccination'
  | 'physical_exam';

export type MedicalRecordStatus =
  | 'draft'
  | 'pending_review'
  | 'reviewed'
  | 'approved'
  | 'amended'
  | 'archived';

export type AccessLevel = 'public' | 'restricted' | 'confidential' | 'highly_confidential';

// Vital Signs
export interface VitalSigns {
  id: string;
  recordedAt: Date;
  recordedBy: string;
  temperature: number; // Celsius
  temperatureUnit: 'C' | 'F';
  bloodPressure: {
    systolic: number;
    diastolic: number;
    unit: 'mmHg';
  };
  heartRate: number; // BPM
  respiratoryRate: number; // per minute
  oxygenSaturation: number; // percentage
  height: number; // cm
  weight: number; // kg
  bmi: number;
  painScore?: number; // 1-10 scale
  notes?: string;
}

// Physical Examination
export interface PhysicalExamination {
  id: string;
  generalAppearance: string;
  heent: string; // Head, Eyes, Ears, Nose, Throat
  cardiovascular: string;
  respiratory: string;
  gastrointestinal: string;
  genitourinary: string;
  musculoskeletal: string;
  neurological: string;
  skin: string;
  psychiatric: string;
  additionalFindings?: string;
}

// Allergy Information
export interface Allergy {
  id: string;
  allergen: string;
  allergenType: AllergenType;
  reaction: string;
  severity: AllergySeverity;
  onsetDate?: Date;
  notes?: string;
  isActive: boolean;
}

export type AllergenType = 'medication' | 'food' | 'environmental' | 'latex' | 'contrast' | 'other';

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

// Medication Information
export interface Medication {
  id: string;
  medicationName: string;
  genericName?: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  indication: string;
  instructions: string;
  isActive: boolean;
  sideEffects?: string[];
  interactions?: string[];
}

export type MedicationRoute =
  | 'oral'
  | 'intravenous'
  | 'intramuscular'
  | 'subcutaneous'
  | 'topical'
  | 'inhalation'
  | 'rectal'
  | 'sublingual'
  | 'transdermal'
  | 'ophthalmic'
  | 'otic'
  | 'nasal';

// Diagnosis Information
export interface Diagnosis {
  id: string;
  diagnosisCode: string; // ICD-10 code
  diagnosisName: string;
  diagnosisType: DiagnosisType;
  certainty: DiagnosisCertainty;
  onsetDate?: Date;
  resolvedDate?: Date;
  status: DiagnosisStatus;
  notes?: string;
}

export type DiagnosisType =
  | 'primary'
  | 'secondary'
  | 'differential'
  | 'rule_out'
  | 'chronic'
  | 'acute';

export type DiagnosisCertainty = 'confirmed' | 'probable' | 'possible' | 'suspected';

export type DiagnosisStatus = 'active' | 'resolved' | 'chronic' | 'recurrent';

// Prescription Information
export interface Prescription {
  id: string;
  prescriptionNumber: string;
  prescriptionDate: Date;
  prescribedBy: string;
  patientId: string;
  medications: PrescribedMedication[];
  instructions: string;
  refills: number;
  refillsRemaining: number;
  expiryDate: Date;
  status: PrescriptionStatus;
  pharmacyInstructions?: string;
  substitutionAllowed: boolean;
  priority: PrescriptionPriority;
}

export interface PrescribedMedication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  unit: string;
  frequency: string;
  duration: string;
  instructions: string;
  cost?: number;
}

export type PrescriptionStatus =
  | 'pending'
  | 'sent_to_pharmacy'
  | 'dispensed'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type PrescriptionPriority = 'routine' | 'urgent' | 'stat' | 'emergency';

// Referral Information
export interface Referral {
  id: string;
  referralNumber: string;
  referralDate: Date;
  referringDoctor: Staff;
  referredToDoctor?: Staff;
  referredToDepartment: string;
  referredToFacility?: string;
  reason: string;
  urgency: ReferralUrgency;
  clinicalSummary: string;
  requestedServices: string[];
  attachments?: MedicalDocument[];
  status: ReferralStatus;
  appointmentBooked?: boolean;
  appointmentDate?: Date;
  feedback?: string;
}

export type ReferralUrgency = 'routine' | 'urgent' | 'emergency' | 'stat';

export type ReferralStatus =
  | 'pending'
  | 'approved'
  | 'scheduled'
  | 'completed'
  | 'declined'
  | 'cancelled';

// Medical Documents
export interface MedicalDocument extends BaseEntity {
  documentId: string;
  documentNumber: string;
  patientId: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;

  // Document metadata
  documentDate: Date;
  uploadedBy: string;
  uploadedDate: Date;

  // Medical context
  relatedRecordId?: string;
  relatedAppointmentId?: string;
  relatedTestId?: string;

  // Security and Access
  isConfidential: boolean;
  accessLevel: AccessLevel;
  encryptionStatus: EncryptionStatus;

  // Version control
  version: number;
  parentDocumentId?: string;
  isLatestVersion: boolean;

  // Approval and signatures
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: Date;
  digitalSignature?: DigitalSignature;

  // Tags and categorization
  tags: string[];
  category: string;
  keywords: string[];
}

export type DocumentType =
  | 'medical_report'
  | 'lab_result'
  | 'radiology_report'
  | 'pathology_report'
  | 'prescription'
  | 'referral_letter'
  | 'discharge_summary'
  | 'operative_note'
  | 'progress_note'
  | 'consent_form'
  | 'insurance_document'
  | 'identification'
  | 'image'
  | 'other';

export type EncryptionStatus = 'not_encrypted' | 'encrypted' | 'highly_encrypted';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_required';

// Digital Signature
export interface DigitalSignature {
  id: string;
  signedBy: string;
  signedDate: Date;
  signatureData: string; // Base64 encoded signature
  certificateInfo: {
    issuer: string;
    validFrom: Date;
    validTo: Date;
    fingerprint: string;
  };
  isValid: boolean;
}

// Laboratory Results
export interface LabResult extends BaseEntity {
  resultId: string;
  testOrderId: string;
  patientId: string;
  patient: Patient;
  orderedBy: Staff;
  testType: LabTestType;
  testName: string;
  testCode: string;

  // Sample Information
  sampleType: SampleType;
  sampleId: string;
  collectionDate: Date;
  collectionTime: string;
  collectedBy: string;
  receivedDate: Date;

  // Test Results
  results: TestResult[];
  overallResult: string;
  interpretation: string;
  abnormalFlags: AbnormalFlag[];

  // Reference ranges and values
  referenceRange?: string;
  units: string;
  methodology?: string;

  // Status and workflow
  status: LabResultStatus;
  reportDate: Date;
  reportedBy: string;
  verifiedBy?: string;
  verifiedDate?: Date;

  // Quality control
  qualityFlags: QualityFlag[];
  remarks?: string;
  technicalNotes?: string;

  // Integration
  instrumentId?: string;
  batchNumber?: string;
  externalLabId?: string;
}

export interface TestResult {
  id: string;
  parameterName: string;
  parameterCode: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  abnormalFlag?: AbnormalFlag;
  status: TestResultStatus;
}

export type LabTestType =
  | 'blood_chemistry'
  | 'hematology'
  | 'immunology'
  | 'microbiology'
  | 'pathology'
  | 'genetics'
  | 'toxicology'
  | 'endocrine'
  | 'cardiac_markers'
  | 'tumor_markers'
  | 'coagulation'
  | 'urinalysis'
  | 'other';

export type SampleType =
  | 'blood'
  | 'serum'
  | 'plasma'
  | 'urine'
  | 'stool'
  | 'saliva'
  | 'csf'
  | 'tissue'
  | 'swab'
  | 'sputum'
  | 'other';

export type AbnormalFlag =
  | 'high'
  | 'low'
  | 'critical_high'
  | 'critical_low'
  | 'abnormal'
  | 'positive'
  | 'negative';

export type LabResultStatus =
  | 'ordered'
  | 'collected'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'amended'
  | 'cancelled';

export type TestResultStatus = 'pending' | 'completed' | 'cancelled' | 'repeat_required';

export type QualityFlag =
  | 'hemolyzed'
  | 'lipemic'
  | 'icteric'
  | 'clotted'
  | 'insufficient_sample'
  | 'contaminated';

// Medical History
export interface MedicalHistory extends BaseEntity {
  historyId: string;
  patientId: string;
  patient: Patient;

  // Past Medical History
  chronicConditions: ChronicCondition[];
  pastIllnesses: PastIllness[];
  surgicalHistory: SurgicalHistory[];
  hospitalizations: Hospitalization[];

  // Family History
  familyHistory: FamilyHistoryItem[];

  // Social History
  socialHistory: SocialHistory;

  // Immunization History
  immunizations: Immunization[];

  // Obstetric/Gynecologic History (if applicable)
  obGynHistory?: ObGynHistory;

  // Last updated
  lastUpdated: Date;
  updatedBy: string;
}

export interface ChronicCondition {
  id: string;
  condition: string;
  icdCode?: string;
  diagnosisDate: Date;
  status: 'active' | 'controlled' | 'resolved';
  medications: string[];
  notes?: string;
}

export interface PastIllness {
  id: string;
  illness: string;
  diagnosisDate: Date;
  resolvedDate?: Date;
  treatment?: string;
  complications?: string;
  notes?: string;
}

export interface SurgicalHistory {
  id: string;
  procedure: string;
  procedureDate: Date;
  surgeon?: string;
  hospital?: string;
  complications?: string;
  notes?: string;
}

export interface Hospitalization {
  id: string;
  admissionDate: Date;
  dischargeDate: Date;
  hospital: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  complications?: string;
  notes?: string;
}

export interface FamilyHistoryItem {
  id: string;
  relationship: FamilyRelationship;
  condition: string;
  ageAtDiagnosis?: number;
  ageAtDeath?: number;
  causeOfDeath?: string;
  isAlive: boolean;
  notes?: string;
}

export type FamilyRelationship =
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'grandfather_paternal'
  | 'grandmother_paternal'
  | 'grandfather_maternal'
  | 'grandmother_maternal'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'other';

export interface SocialHistory {
  smokingStatus: SmokingStatus;
  smokingHistory?: {
    packsPerDay: number;
    yearsSmoked: number;
    quitDate?: Date;
  };
  alcoholConsumption: AlcoholConsumption;
  alcoholHistory?: {
    drinksPerWeek: number;
    typeOfAlcohol: string[];
    quitDate?: Date;
  };
  drugUse: DrugUse;
  occupation: string;
  occupationalHazards?: string[];
  exerciseHabits: string;
  dietaryHabits: string;
  maritalStatus: MaritalStatus;
  livingArrangement: string;
  education: string;
  stressLevel: number; // 1-10 scale
  supportSystem: string;
}

export type SmokingStatus =
  | 'never_smoked'
  | 'former_smoker'
  | 'current_smoker'
  | 'occasional_smoker';

export type AlcoholConsumption = 'never' | 'occasional' | 'moderate' | 'heavy' | 'former_drinker';

export type DrugUse = 'never' | 'former_user' | 'current_user' | 'occasional_user';

export type MaritalStatus =
  | 'single'
  | 'married'
  | 'divorced'
  | 'widowed'
  | 'separated'
  | 'domestic_partner';

export interface Immunization {
  id: string;
  vaccine: string;
  vaccineCode?: string;
  administeredDate: Date;
  administeredBy: string;
  dosage: string;
  site: InjectionSite;
  lotNumber?: string;
  manufacturer?: string;
  expiryDate?: Date;
  reactions?: string[];
  nextDueDate?: Date;
  notes?: string;
}

export type InjectionSite =
  | 'left_arm'
  | 'right_arm'
  | 'left_thigh'
  | 'right_thigh'
  | 'buttock'
  | 'other';

export interface ObGynHistory {
  menarche: number; // age at first menstruation
  menopause?: number; // age at menopause
  lmp?: Date; // last menstrual period
  pregnancies: number;
  livebirths: number;
  abortions: number;
  miscarriages: number;
  contraceptiveHistory: ContraceptiveMethod[];
  pap_smear_history: PapSmearHistory[];
  mammography_history: MammographyHistory[];
  gynecologic_surgeries: string[];
}

export interface ContraceptiveMethod {
  method: string;
  startDate: Date;
  endDate?: Date;
  complications?: string[];
}

export interface PapSmearHistory {
  date: Date;
  result: string;
  followUpRequired: boolean;
  nextDueDate?: Date;
}

export interface MammographyHistory {
  date: Date;
  result: string;
  biradsScore?: string;
  followUpRequired: boolean;
  nextDueDate?: Date;
}

// EMR Statistics
export interface MedicalRecordStats {
  totalRecords: number;
  recordsByType: Record<MedicalRecordType, number>;
  recordsByStatus: Record<MedicalRecordStatus, number>;
  recordsByDoctor: Array<{
    doctorId: string;
    doctorName: string;
    recordCount: number;
  }>;
  recentActivity: Array<{
    date: string;
    recordsCreated: number;
    recordsUpdated: number;
  }>;
  commonDiagnoses: Array<{
    diagnosis: string;
    icdCode: string;
    count: number;
  }>;
  prescriptionTrends: Array<{
    medication: string;
    prescriptionCount: number;
    trend: number;
  }>;
}
