import { BaseEntity } from './common';
import { Patient } from './patient';
import { Staff } from './staff';

export interface Medication extends BaseEntity {
  medicationId: string;
  drugCode: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  strength: string;
  dosageForm: DosageForm;
  route: AdministrationRoute;
  category: DrugCategory;
  isControlled: boolean;
  requiresPrescription: boolean;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  expiryDate: Date;
  batchNumber: string;
  barcode?: string;
  interactions: DrugInteraction[];
  contraindications: string[];
  sideEffects: string[];
  warnings: string[];
  storageConditions: string;
  isActive: boolean;
}

export interface DrugInteraction {
  interactingDrug: string;
  severity: InteractionSeverity;
  description: string;
  clinicalImplication: string;
}

export interface Prescription extends BaseEntity {
  prescriptionId: string;
  prescriptionNumber: string;
  patientId: string;
  patient: Patient;
  prescribedBy: Staff;
  prescriptionDate: Date;
  medications: PrescribedMedication[];
  status: PrescriptionStatus;
  totalAmount: number;
  dispensedBy?: string;
  dispensedDate?: Date;
  paymentStatus: PaymentStatus;
  notes?: string;
  instructions: string;
  refillsAllowed: number;
  refillsRemaining: number;
}

export interface PrescribedMedication {
  medicationId: string;
  medication: Medication;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  substitutionAllowed: boolean;
  dispensedQuantity?: number;
  remainingQuantity?: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DispensedMedication extends BaseEntity {
  dispenseId: string;
  prescriptionId: string;
  medicationId: string;
  medication: Medication;
  quantityDispensed: number;
  batchNumber: string;
  expiryDate: Date;
  dispensedBy: string;
  dispensedDate: Date;
  patientCounseling: boolean;
  counselingNotes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface DrugInventory extends BaseEntity {
  inventoryId: string;
  medicationId: string;
  medication: Medication;
  batchNumber: string;
  expiryDate: Date;
  manufactureDate: Date;
  supplierId: string;
  supplierName: string;
  receivedDate: Date;
  receivedQuantity: number;
  currentQuantity: number;
  unitCost: number;
  totalCost: number;
  location: string;
  status: InventoryStatus;
}

export interface Dispensation extends BaseEntity {
  dispensationId: string;
  prescriptionId: string;
  patientId: string;
  dispensedBy: string;
  dispensedDate: Date;
  medications: DispensedMedication[];
  totalAmount: number;
}

export interface PharmacyStats {
  totalMedications: number;
  lowStockItems: number;
  expiringSoon: number;
  totalPrescriptions: number;
  dispensedToday: number;
}

export type DosageForm =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'cream'
  | 'ointment'
  | 'drops'
  | 'inhaler';
export type AdministrationRoute =
  | 'oral'
  | 'injection'
  | 'topical'
  | 'inhalation'
  | 'nasal'
  | 'ophthalmic'
  | 'otic';
export type DrugCategory =
  | 'antibiotic'
  | 'analgesic'
  | 'antihypertensive'
  | 'antidiabetic'
  | 'cardiac'
  | 'respiratory';
export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'contraindicated';
export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type InventoryStatus = 'active' | 'expired' | 'recalled' | 'damaged';
export type MedicationCategory = DrugCategory;
export type MedicationStatus = 'available' | 'low_stock' | 'out_of_stock' | 'discontinued';
