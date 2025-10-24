import { BaseEntity } from './common';
import { Patient } from './patient';
import { Appointment } from './appointment';

// Billing and Invoice Management
export interface Invoice extends BaseEntity {
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patient: Patient;
  appointmentId?: string;
  appointment?: Appointment;

  // Invoice Details
  invoiceDate: Date;
  dueDate: Date;
  issueDate: Date;

  // Billing Information
  billToAddress: BillingAddress;
  billingAddress?: BillingAddress;
  items: InvoiceItem[];

  // Financial Details
  subtotal: number;
  taxAmount: number;
  taxRate?: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;

  // Status and Workflow
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  priority: InvoicePriority;

  // Payment Information
  payments: Payment[];
  paymentTerms: string;
  lateFeeApplied: boolean;
  lateFeeAmount?: number;

  // Insurance Information
  insuranceClaim?: InsuranceClaim;
  isInsuranceBilled: boolean;
  insuranceAmount: number;
  patientResponsibility: number;

  // Notes and References
  notes?: string;
  internalNotes?: string;
  referenceNumber?: string;

  // Generated Information
  generatedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  sentDate?: Date;
}

export interface InvoiceItem {
  id: string;
  itemCode: string;
  description: string;
  itemType: InvoiceItemType;
  category: string;

  // Quantity and Pricing
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  totalAmount?: number;

  // Tax and Discounts
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;

  // Service Details
  serviceDate: Date;
  providerId?: string;
  providerName?: string;
  departmentId?: string;
  departmentName?: string;

  // Medical Coding
  cptCode?: string;
  icdCode?: string;

  // Insurance
  isInsuranceCovered: boolean;
  insuranceCoverage: number;
  patientShare: number;

  notes?: string;
}

export type InvoiceItemType =
  | 'consultation'
  | 'procedure'
  | 'laboratory'
  | 'radiology'
  | 'medication'
  | 'room_charge'
  | 'nursing_service'
  | 'equipment_usage'
  | 'supplies'
  | 'therapy'
  | 'surgery'
  | 'emergency_service'
  | 'other';

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid' | 'refunded' | 'cancelled';

export type InvoicePriority = 'low' | 'normal' | 'high' | 'urgent';

// Payment Management
export interface Payment extends BaseEntity {
  paymentId: string;
  paymentNumber: string;
  invoiceId: string;
  invoice: Invoice;
  invoiceNumber?: string;
  patientId: string;
  patient: Patient;

  // Payment Details
  paymentDate: Date;
  amount: number;
  currency: string;

  // Payment Method
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;

  // Transaction Details
  transactionId?: string;
  referenceNumber?: string;
  bankDetails?: BankDetails;
  cardDetails?: CardDetails;
  checkDetails?: CheckDetails;

  // Status and Processing
  status: PaymentTransactionStatus;
  processingStatus: ProcessingStatus;

  // Reconciliation
  isReconciled: boolean;
  reconciledDate?: Date;
  reconciledBy?: string;
  bankStatementReference?: string;

  // Refund Information
  refundable: boolean;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;

  // Notes
  notes?: string;
  processingNotes?: string;

  // Receipt
  receiptGenerated: boolean;
  receiptNumber?: string;
  receiptPath?: string;

  // Processing Information
  processedBy: string;
  processedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'CHEQUE'
  | 'BANK_TRANSFER'
  | 'WALLET'
  | 'OTHER';

export type PaymentType =
  | 'full_payment'
  | 'partial_payment'
  | 'advance_payment'
  | 'refund'
  | 'adjustment';

export type PaymentTransactionStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type ProcessingStatus =
  | 'submitted'
  | 'authorized'
  | 'captured'
  | 'settled'
  | 'failed'
  | 'voided';

// Insurance Management
export interface InsuranceClaim extends BaseEntity {
  claimId: string;
  claimNumber: string;
  patientId: string;
  patient: Patient;
  insuranceId: string;
  insurance: InsuranceProvider;
  insuranceProvider?: InsuranceProvider;
  policyNumber?: string;

  // Claim Details
  claimDate: Date;
  serviceDate: Date;
  submissionDate: Date;

  // Service Information
  services: ClaimedService[];
  diagnosis: ClaimDiagnosis[];

  // Financial Information
  totalAmount: number;
  claimedAmount: number;
  claimAmount?: number;
  approvedAmount: number;
  deniedAmount: number;
  patientResponsibility: number;

  // Status and Processing
  status: ClaimStatus;
  priority: ClaimPriority;

  // Workflow
  submittedBy: string;
  reviewedBy?: string;
  reviewedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;

  // Communication
  correspondences: ClaimCorrespondence[];
  denialReason?: string;
  appealable: boolean;
  appealed: boolean;
  appealDate?: Date;
  appealOutcome?: AppealOutcome;

  // Processing Information
  batchNumber?: string;
  clearinghouseId?: string;
  acknowledgmentNumber?: string;

  // Payment Information
  paymentReceived: boolean;
  paymentAmount?: number;
  paymentDate?: Date;
  eobReceived: boolean;
  eobDate?: Date;
  eobPath?: string;

  // Notes
  notes?: string;
  internalNotes?: string;

  // Resubmission
  originalClaimId?: string;
  resubmissionCount: number;
  lastResubmissionDate?: Date;
}

export interface ClaimedService {
  id: string;
  serviceCode: string;
  description: string;
  serviceDate: Date;
  providerId: string;
  providerName: string;

  // Medical Coding
  cptCode: string;
  modifiers?: string[];
  units: number;

  // Financial
  chargedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  deductible: number;
  copay: number;
  coinsurance: number;

  // Status
  status: ServiceClaimStatus;
  denialCode?: string;
  denialReason?: string;
}

export interface ClaimDiagnosis {
  id: string;
  icdCode: string;
  description: string;
  isPrimary: boolean;
  onsetDate?: Date;
}

export interface ClaimCorrespondence {
  id: string;
  date: Date;
  type: CorrespondenceType;
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  attachments?: string[];
  sentBy?: string;
  receivedFrom?: string;
}

export type ClaimStatus =
  | 'draft'
  | 'submitted'
  | 'acknowledged'
  | 'under_review'
  | 'approved'
  | 'partially_approved'
  | 'denied'
  | 'appealed'
  | 'paid'
  | 'closed';

export type ClaimPriority = 'routine' | 'urgent' | 'emergency' | 'stat';

export type ServiceClaimStatus =
  | 'submitted'
  | 'approved'
  | 'denied'
  | 'partially_approved'
  | 'paid';

export type CorrespondenceType =
  | 'claim_submission'
  | 'acknowledgment'
  | 'request_for_information'
  | 'denial_notice'
  | 'payment_advice'
  | 'appeal'
  | 'other';

export type AppealOutcome = 'approved' | 'partially_approved' | 'denied' | 'pending';

// Insurance Provider Management
export interface InsuranceProvider extends BaseEntity {
  insuranceId: string;
  providerName: string;
  providerType: InsuranceType;

  // Contact Information
  contactInfo: {
    address: BillingAddress;
    phone: string;
    fax?: string;
    email?: string;
    website?: string;
    claimsPhone?: string;
    claimsEmail?: string;
  };

  // Business Details
  taxId: string;
  npiNumber?: string;
  licensNumber?: string;

  // Contract Information
  contractNumber?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;

  // Payment Information
  paymentTerms: string;
  paymentMethods: PaymentMethod[];

  // Processing Information
  clearinghouseRequired: boolean;
  clearinghouseId?: string;
  electronicSubmission: boolean;
  submissionFormat: SubmissionFormat;

  // Coverage Information
  coverageTypes: CoverageType[];
  specialRequirements?: string[];

  // Status
  isActive: boolean;
  status: ProviderStatus;

  // Statistics
  averageProcessingTime: number;
  averageApprovalRate: number;
  lastClaimDate?: Date;

  notes?: string;
}

export type InsuranceType =
  | 'health_insurance'
  | 'dental_insurance'
  | 'vision_insurance'
  | 'life_insurance'
  | 'disability_insurance'
  | 'workers_compensation'
  | 'auto_insurance'
  | 'medicare'
  | 'medicaid'
  | 'government';

export type SubmissionFormat = 'edi_837' | 'cms_1500' | 'ub_04' | 'custom' | 'paper';

export type CoverageType =
  | 'inpatient'
  | 'outpatient'
  | 'emergency'
  | 'preventive'
  | 'specialist'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'mental_health'
  | 'dental'
  | 'vision';

export type ProviderStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'terminated'
  | 'pending_approval';

// Patient Insurance Information
export interface PatientInsurance extends BaseEntity {
  patientInsuranceId: string;
  patientId: string;
  patient: Patient;
  insuranceId: string;
  insurance: InsuranceProvider;

  // Policy Information
  policyNumber: string;
  groupNumber?: string;
  memberNumber?: string;

  // Coverage Details
  effectiveDate: Date;
  terminationDate?: Date;
  coverageLevel: CoverageLevel;

  // Subscriber Information
  subscriberId: string;
  subscriberName: string;
  relationshipToPatient: Relationship;
  subscriberDateOfBirth: Date;
  subscriberGender: string;
  subscriberAddress?: BillingAddress;

  // Benefits Information
  deductible: number;
  deductibleMet: number;
  outOfPocketMax: number;
  outOfPocketMet: number;
  copay: number;
  coinsurance: number;

  // Authorization
  requiresAuthorization: boolean;
  authorizationNumber?: string;
  authorizationDate?: Date;
  authorizationExpiry?: Date;

  // Priority
  isPrimary: boolean;
  priority: number;

  // Status
  isActive: boolean;
  verificationStatus: VerificationStatus;
  lastVerificationDate?: Date;
  nextVerificationDate?: Date;

  // Notes
  notes?: string;
  specialInstructions?: string;
}

export type CoverageLevel =
  | 'individual'
  | 'family'
  | 'spouse'
  | 'children'
  | 'employee_plus_one'
  | 'employee_plus_children';

export type Relationship =
  | 'self'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'other_relative'
  | 'other';

export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'expired'
  | 'invalid'
  | 'pending_verification';

// Billing Addresses
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressLine2?: string;
}

// Payment Details
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
}

export interface CardDetails {
  cardType: 'credit' | 'debit';
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
}

export interface CheckDetails {
  checkNumber: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
}

// Financial Reporting and Analytics
export interface BillingStats {
  totalRevenue: number;
  totalOutstanding: number;
  totalCollected: number;
  totalWriteOffs: number;

  // Period Comparisons
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  revenueGrowth: number;

  // Collection Metrics
  collectionRate: number;
  averageCollectionTime: number;
  accountsReceivableAging: ARaging[];

  // Invoice Metrics
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  averageInvoiceAmount: number;
  daysOutstanding: number;

  // Payment Metrics
  totalPayments: number;
  averagePaymentAmount: number;
  paymentMethodDistribution: Record<PaymentMethod, number>;

  // Insurance Metrics
  totalClaims: number;
  approvedClaims: number;
  deniedClaims: number;
  pendingClaims: number;
  averageClaimAmount: number;
  insuranceCoverageRate: number;

  claimStatusDistribution: Record<ClaimStatus, number>;
  // Top Performers
  topPayingPatients: Array<{
    patientId: string;
    patientName: string;
    totalPaid: number;
  }>;

  topRevenueServices: Array<{
    serviceCode: string;
    serviceName: string;
    revenue: number;
  }>;

  topInsuranceProviders: Array<{
    insuranceId: string;
    providerName: string;
    totalClaims: number;
    approvalRate: number;
  }>;

  // Trends
  monthlyRevenueTrends: Array<{
    month: string;
    revenue: number;
    collections: number;
    outstanding: number;
  }>;

  dailyCollections: Array<{
    date: string;
    amount: number;
    transactions: number;
  }>;
}

export interface ARaging {
  category: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  amount: number;
  percentage: number;
  invoiceCount: number;
}

// Search and Filtering
