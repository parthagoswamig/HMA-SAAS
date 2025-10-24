import { BaseEntity } from './common';
import { Staff } from './staff';

// Inventory Item Management
export interface InventoryItem extends BaseEntity {
  itemId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  category: ItemCategory;
  subcategory?: string;

  // Classification
  itemType: ItemType;
  classification: ItemClassification;
  criticality: ItemCriticality;

  // Basic Information
  brand?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;

  // Unit Information
  baseUnit: string;
  alternativeUnits?: AlternativeUnit[];

  // Stock Information
  currentStock: number;
  availableStock: number;
  allocatedStock: number;
  reservedStock: number;

  // Stock Levels
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  safetyStock: number;

  // Cost Information
  unitCost: number;
  averageCost: number;
  lastPurchaseCost: number;
  standardCost?: number;

  // Location Information
  location: StorageLocation;
  alternativeLocations?: StorageLocation[];

  // Supplier Information
  preferredSupplierId?: string;
  preferredSupplier?: Supplier;
  alternativeSuppliers?: Supplier[];

  // Expiry and Batch Management
  hasExpiryDate: boolean;
  hasBatchTracking: boolean;
  shelfLife?: number; // in days

  // Status
  isActive: boolean;
  isConsumable: boolean;
  isReturnable: boolean;

  // Regulatory
  isControlled: boolean;
  controlledCategory?: string;
  requiresPrescription: boolean;

  // Notes
  notes?: string;
  handlingInstructions?: string;
  storageInstructions?: string;
}

export interface AlternativeUnit {
  unit: string;
  conversionFactor: number;
  isPurchaseUnit: boolean;
  isIssueUnit: boolean;
}

export interface StorageLocation {
  locationId: string;
  locationName: string;
  zone?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  floor?: string;
  building?: string;
  temperature?: TemperatureRange;
  humidity?: HumidityRange;
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'C' | 'F';
}

export interface HumidityRange {
  min: number;
  max: number;
}

export type ItemType =
  | 'medical_supplies'
  | 'pharmaceuticals'
  | 'equipment'
  | 'consumables'
  | 'surgical_instruments'
  | 'laboratory_supplies'
  | 'office_supplies'
  | 'maintenance_supplies'
  | 'food_nutrition'
  | 'linen_clothing';

export type ItemCategory =
  | 'medicines'
  | 'surgical_supplies'
  | 'diagnostic_supplies'
  | 'patient_care_supplies'
  | 'medical_devices'
  | 'laboratory_reagents'
  | 'office_stationery'
  | 'cleaning_supplies'
  | 'kitchen_supplies'
  | 'linen'
  | 'furniture'
  | 'equipment_parts';

export type ItemClassification =
  | 'A' // High value, low volume
  | 'B' // Medium value, medium volume
  | 'C' // Low value, high volume
  | 'X' // Critical items
  | 'Y' // Essential items
  | 'Z'; // Non-essential items;

export type ItemCriticality = 'critical' | 'essential' | 'important' | 'normal' | 'non_essential';

// Stock Transactions
export interface StockTransaction extends BaseEntity {
  transactionId: string;
  transactionNumber: string;
  itemId: string;
  item: InventoryItem;

  // Transaction Details
  transactionType: TransactionType;
  transactionDate: Date;
  quantity: number;
  unit: string;

  // Cost Information
  unitCost?: number;
  totalCost?: number;

  // Reference Information
  referenceType?: ReferenceType;
  referenceId?: string;
  referenceNumber?: string;

  // Location
  fromLocation?: StorageLocation;
  toLocation?: StorageLocation;

  // Batch/Lot Information
  batchNumber?: string;
  lotNumber?: string;
  expiryDate?: Date;
  manufacturingDate?: Date;

  // Personnel
  performedBy: string;
  authorizedBy?: string;

  // Status
  status: TransactionStatus;

  // Notes
  remarks?: string;
  reason?: string;
}

export type TransactionType =
  | 'receipt'
  | 'issue'
  | 'transfer'
  | 'adjustment'
  | 'return'
  | 'waste'
  | 'damage'
  | 'theft'
  | 'expiry'
  | 'opening_balance';

export type ReferenceType =
  | 'purchase_order'
  | 'requisition'
  | 'patient_usage'
  | 'department_issue'
  | 'return_note'
  | 'adjustment_note'
  | 'transfer_note'
  | 'waste_note';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'reversed';

// Purchase Management
export interface PurchaseOrder extends BaseEntity {
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;

  // Order Details
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;

  // Items
  items: PurchaseOrderItem[];

  // Financial Information
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;

  // Status
  status: PurchaseOrderStatus;
  priority: OrderPriority;

  // Terms and Conditions
  paymentTerms: string;
  deliveryTerms: string;
  warrantyTerms?: string;

  // Approval Workflow
  requestedBy: string;
  approvedBy?: string;
  approvalDate?: Date;

  // Delivery Information
  deliveryAddress: DeliveryAddress;
  contactPerson: string;
  contactPhone: string;

  // Invoice Information
  invoiceReceived: boolean;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceAmount?: number;

  // Notes
  notes?: string;
  internalNotes?: string;
  specialInstructions?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  item: InventoryItem;
  description: string;

  // Quantity and Units
  orderedQuantity: number;
  receivedQuantity: number;
  cancelledQuantity: number;
  unit: string;

  // Pricing
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;

  // Delivery
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;

  // Status
  status: POItemStatus;

  // Quality
  qualityChecked: boolean;
  qualityStatus?: QualityStatus;
  qualityRemarks?: string;

  notes?: string;
}

export interface DeliveryAddress {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressLine2?: string;
  landmark?: string;
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent_to_supplier'
  | 'acknowledged'
  | 'partial_delivery'
  | 'fully_delivered'
  | 'invoiced'
  | 'completed'
  | 'cancelled';

export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export type POItemStatus =
  | 'ordered'
  | 'partial_received'
  | 'fully_received'
  | 'cancelled'
  | 'returned';

export type QualityStatus = 'passed' | 'failed' | 'conditional' | 'pending_inspection';

// Supplier Management
export interface Supplier extends BaseEntity {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  supplierType: SupplierType;

  // Contact Information
  contactInfo: {
    primaryContact: ContactPerson;
    alternateContacts?: ContactPerson[];
    address: DeliveryAddress;
    phone: string;
    fax?: string;
    email: string;
    website?: string;
  };

  // Business Information
  businessType: BusinessType;
  taxId: string;
  registrationNumber?: string;
  licensNumbers?: License[];

  // Financial Information
  paymentTerms: string;
  creditLimit?: number;
  currentBalance: number;

  // Performance Metrics
  rating: number; // 1-5
  deliveryRating: number;
  qualityRating: number;
  priceRating: number;
  serviceRating: number;

  // Contract Information
  contractNumber?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;

  // Categories
  suppliedCategories: ItemCategory[];
  certifications: Certification[];

  // Status
  isActive: boolean;
  isPreferred: boolean;
  status: SupplierStatus;

  // Banking Information
  bankDetails?: BankDetails[];

  // Notes
  notes?: string;
  internalNotes?: string;
}

export interface ContactPerson {
  name: string;
  designation: string;
  phone: string;
  email: string;
  department?: string;
  isPrimary: boolean;
}

export interface License {
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean;
}

export interface Certification {
  certificationType: string;
  certificateNumber: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
  isPrimary: boolean;
}

export type SupplierType =
  | 'manufacturer'
  | 'distributor'
  | 'wholesaler'
  | 'retailer'
  | 'service_provider'
  | 'contractor';

export type BusinessType =
  | 'sole_proprietorship'
  | 'partnership'
  | 'corporation'
  | 'llc'
  | 'cooperative'
  | 'government'
  | 'non_profit';

export type SupplierStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'blacklisted'
  | 'pending_approval';

// Requisitions
export interface Requisition extends BaseEntity {
  requisitionId: string;
  requisitionNumber: string;

  // Request Information
  requestDate: Date;
  requiredDate: Date;
  departmentId: string;
  departmentName: string;
  requestedBy: string;
  requester: Staff;

  // Items
  items: RequisitionItem[];

  // Status and Workflow
  status: RequisitionStatus;
  priority: RequisitionPriority;

  // Approval Workflow
  approvals: RequisitionApproval[];
  currentApprovalLevel: number;
  totalApprovalLevels: number;

  // Fulfillment
  fulfilledBy?: string;
  fulfilledDate?: Date;
  partialFulfillment: boolean;

  // Budget Information
  budgetCode?: string;
  totalEstimatedCost: number;
  actualCost?: number;
  budgetApproval?: boolean;

  // Notes
  justification?: string;
  notes?: string;
  internalNotes?: string;
}

export interface RequisitionItem {
  id: string;
  itemId?: string;
  item?: InventoryItem;
  itemDescription: string;

  // Quantity
  requestedQuantity: number;
  approvedQuantity: number;
  issuedQuantity: number;
  unit: string;

  // Cost
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  actualCost?: number;

  // Purpose
  purpose: string;
  urgency: ItemUrgency;

  // Status
  status: RequisitionItemStatus;

  // Alternatives
  alternativeItems?: string[];
  acceptSubstitute: boolean;

  notes?: string;
}

export interface RequisitionApproval {
  id: string;
  approvalLevel: number;
  approverId: string;
  approver: Staff;
  approvalDate?: Date;
  status: ApprovalStatus;
  comments?: string;
  conditions?: string[];
}

export type RequisitionStatus =
  | 'draft'
  | 'submitted'
  | 'under_approval'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'fulfilled'
  | 'partially_fulfilled'
  | 'cancelled'
  | 'closed';

export type RequisitionPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export type ItemUrgency = 'routine' | 'needed_soon' | 'urgent' | 'emergency';

export type RequisitionItemStatus = 'pending' | 'approved' | 'rejected' | 'issued' | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'conditional';

// Equipment Management
export interface Equipment extends BaseEntity {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  description?: string;

  // Classification
  category: EquipmentCategory;
  type: EquipmentType;
  criticality: EquipmentCriticality;

  // Technical Specifications
  manufacturer: string;
  model: string;
  serialNumber: string;
  partNumber?: string;
  specifications: EquipmentSpecification[];

  // Purchase Information
  purchaseDate: Date;
  purchaseCost: number;
  supplierId: string;
  supplier: Supplier;
  warrantyPeriod: number; // in months
  warrantyExpiry: Date;

  // Location and Assignment
  currentLocation: StorageLocation;
  assignedDepartment?: string;
  assignedTo?: string;
  isPortable: boolean;

  // Status and Condition
  status: EquipmentStatus;
  condition: EquipmentCondition;
  operationalStatus: OperationalStatus;

  // Maintenance Information
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceInterval: number; // in days
  maintenanceType: MaintenanceType;

  // Calibration Information
  requiresCalibration: boolean;
  lastCalibrationDate?: Date;
  nextCalibrationDate?: Date;
  calibrationInterval?: number; // in days

  // Usage Information
  totalOperatingHours?: number;
  averageDailyUsage?: number;
  utilizationRate?: number;

  // Depreciation
  depreciationMethod: DepreciationMethod;
  depreciationRate: number;
  currentValue: number;
  salvageValue: number;

  // Insurance and Compliance
  insurancePolicy?: string;
  insuranceValue?: number;
  complianceCertificates: ComplianceCertificate[];

  // Notes
  notes?: string;
  operatingInstructions?: string;
  safetyInstructions?: string;
}

export interface EquipmentSpecification {
  specName: string;
  specValue: string;
  unit?: string;
  isRequired: boolean;
}

export interface ComplianceCertificate {
  certificateType: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: CertificateStatus;
}

export type EquipmentCategory =
  | 'medical_devices'
  | 'diagnostic_equipment'
  | 'surgical_equipment'
  | 'laboratory_equipment'
  | 'imaging_equipment'
  | 'life_support_equipment'
  | 'monitoring_equipment'
  | 'therapy_equipment'
  | 'sterilization_equipment'
  | 'furniture'
  | 'it_equipment'
  | 'facility_equipment';

export type EquipmentType =
  | 'fixed_equipment'
  | 'portable_equipment'
  | 'consumable_equipment'
  | 'reusable_equipment';

export type EquipmentCriticality =
  | 'life_critical'
  | 'mission_critical'
  | 'important'
  | 'standard'
  | 'non_critical';

export type EquipmentStatus =
  | 'active'
  | 'inactive'
  | 'under_maintenance'
  | 'under_repair'
  | 'calibration_due'
  | 'retired'
  | 'disposed';

export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'non_functional';

export type OperationalStatus =
  | 'operational'
  | 'non_operational'
  | 'limited_operation'
  | 'under_testing';

export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency';

export type DepreciationMethod =
  | 'straight_line'
  | 'declining_balance'
  | 'sum_of_years_digits'
  | 'units_of_production';

export type CertificateStatus = 'valid' | 'expired' | 'suspended' | 'revoked';

// Maintenance Management
export interface MaintenanceRecord extends BaseEntity {
  maintenanceId: string;
  maintenanceNumber: string;
  equipmentId: string;
  equipment: Equipment;

  // Schedule Information
  scheduledDate: Date;
  actualDate?: Date;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;

  // Work Details
  workDescription: string;
  workPerformed?: string;
  partsUsed: MaintenancePart[];
  laborHours: number;

  // Personnel
  assignedTo: string;
  technician?: Staff;
  supervisedBy?: string;

  // Status
  status: MaintenanceStatus;

  // Cost Information
  laborCost: number;
  partsCost: number;
  totalCost: number;

  // Results
  preMaintenanceCondition: string;
  postMaintenanceCondition: string;
  issuesFound?: string[];
  recommendedActions?: string[];

  // Next Maintenance
  nextMaintenanceDate?: Date;
  maintenanceInterval?: number;

  // Documentation
  workOrderNumber?: string;
  completionCertificate?: string;
  photos?: string[];

  // Notes
  notes?: string;
  technicianNotes?: string;
}

export interface MaintenancePart {
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export type MaintenancePriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

// Inventory Analytics and Reporting
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalStockValue: number;

  // Stock Levels
  lowStockItems: number;
  outOfStockItems: number;
  overstockedItems: number;

  // Categories
  itemsByCategory: Record<ItemCategory, number>;
  valueByCategory: Record<ItemCategory, number>;

  // Movements
  totalTransactions: number;
  receipts: number;
  issues: number;
  adjustments: number;

  // Purchase Orders
  totalPurchaseOrders: number;
  pendingPurchaseOrders: number;
  deliveredPurchaseOrders: number;
  totalPurchaseValue: number;

  // Suppliers
  totalSuppliers: number;
  activeSuppliers: number;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    totalOrders: number;
    totalValue: number;
  }>;

  // Equipment
  totalEquipment: number;
  activeEquipment: number;
  maintenanceDueEquipment: number;

  // Trends
  monthlyConsumption: Array<{
    month: string;
    consumption: number;
    value: number;
  }>;

  topConsumedItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    value: number;
  }>;

  stockTurnoverRate: number;
  averageStockAge: number;
}

// Additional types for inventory management
export interface InventoryAlert {
  id: string;
  type: AlertType;
  itemId: string;
  itemName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export type AlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired'
  | 'reorder_point';
export type OrderStatus = PurchaseOrderStatus;
