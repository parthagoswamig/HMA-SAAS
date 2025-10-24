// Laboratory Types

// Lab Test Management
export interface LabTest {
  id: string;
  testCode: string;
  testName: string;
  category: TestCategory;
  testType: TestType;
  description: string;
  price: number;
  turnaroundTime: string;
  sampleType: SampleType;
  sampleVolume: string;
  status: TestStatus;
  parameters?: TestParameter[];
  methodology?: string;
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestParameter {
  id: string;
  parameterName: string;
  unit: string;
  normalRange: string;
  criticalLow?: number;
  criticalHigh?: number;
  methodology?: string;
}

// Lab Orders
export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email?: string;
  };
  orderingDoctor: {
    firstName: string;
    lastName: string;
    employeeId: string;
    department?: {
      name: string;
      code: string;
    };
  };
  tests: OrderedTest[];
  orderDate: Date;
  priority: TestType;
  status: OrderStatus;
  totalCost: number;
  sampleCollection?: SampleCollection;
  instructions?: string;
  clinicalHistory?: string;
  diagnosis?: string;
}

export interface OrderedTest {
  id: string;
  testId: string;
  testName: string;
  status: TestStatus;
  result?: LabResult;
  reportDate?: Date;
  verifiedBy?: string;
  comments?: string;
}

export interface SampleCollection {
  collectionDate: Date;
  collectedBy: string;
  collectionSite: string;
  sampleCondition: string;
  collectionNotes?: string;
}

// Lab Results
export interface LabResult {
  id: string;
  testId: string;
  orderId: string;
  patientId: string;
  parameters: ParameterResult[];
  overallInterpretation: string;
  reportedBy: string;
  reportDate: Date;
  verifiedBy?: string;
  verificationDate?: Date;
  status: TestStatus;
}

export interface ParameterResult {
  id: string;
  parameterName: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  flag?: ResultFlag;
  comments?: string;
}

// Sample Management
export interface Sample {
  id: string;
  sampleId: string;
  patientName: string;
  patientId: string;
  sampleType: SampleType;
  collectionDate: Date;
  collectedBy: string;
  volume: number;
  unit: string;
  containerType: string;
  status: SampleStatus;
  storageConditions?: string;
  notes?: string;
  tests: string[];
}

// Equipment Management
export interface LabEquipment {
  id: string;
  equipmentName: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: EquipmentStatus;
  installationDate: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  warrantyExpiry: Date;
  purchasePrice: number;
  specifications?: string;
  calibrationDue?: Date;
}

// Quality Control
export interface QualityControl {
  id: string;
  testName: string;
  controlType: string;
  controlLotNumber: string;
  testDate: Date;
  expectedValue: string;
  actualValue: string;
  acceptableRange: string;
  status: QCStatus;
  performedBy: string;
  comments?: string;
  equipment?: string;
}

// Statistics and Analytics
export interface LabStats {
  totalTests: number;
  pendingTests: number;
  completedTests: number;
  testsByCategory: Record<TestCategory, number>;
  equipmentOperational: number;
  totalEquipment: number;
  dailyTestVolume: Array<{
    date: string;
    tests: number;
  }>;
  averageTurnaroundTime: Array<{
    category: string;
    hours: number;
  }>;
  accuracy: number;
  averageTAT: number;
  rejectionRate: number;
  equipmentUptime: number;
}

// Filters

// Type definitions
export type TestCategory =
  | 'hematology'
  | 'biochemistry'
  | 'microbiology'
  | 'immunology'
  | 'pathology'
  | 'molecular'
  | 'genetics';

export type TestType = 'routine' | 'urgent' | 'stat' | 'research';

export type TestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type SampleStatus =
  | 'collected'
  | 'received'
  | 'processed'
  | 'expired'
  | 'contaminated'
  | 'rejected';

export type SampleType =
  | 'blood'
  | 'urine'
  | 'stool'
  | 'sputum'
  | 'csf'
  | 'tissue'
  | 'swab'
  | 'saliva'
  | 'plasma'
  | 'serum';

export type EquipmentStatus =
  | 'operational'
  | 'maintenance'
  | 'calibration'
  | 'out_of_service'
  | 'repair';

export type QCStatus = 'passed' | 'failed' | 'in_review' | 'pending';

export type ResultFlag = 'normal' | 'high' | 'low' | 'critical_high' | 'critical_low' | 'abnormal';

// Additional types for laboratory management
export interface LabFilters {
  status?: TestStatus;
  category?: TestCategory;
  priority?: TestType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
