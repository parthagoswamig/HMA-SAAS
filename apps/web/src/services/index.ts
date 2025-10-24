/**
 * Centralized export for all API services
 */

// API Client and utilities
export { default as apiClient, handleApiError } from '../lib/api-client';
export type { ApiResponse } from '../lib/api-client';

// Auth Service
export { default as authService } from './auth.service';
export type { LoginCredentials, RegisterData, AuthResponse } from './auth.service';

// Individual module services
export { default as patientsService } from './patients.service';
export { default as staffService } from './staff.service';
export { default as laboratoryService } from './laboratory.service';
export { default as pharmacyService } from './pharmacy.service';
export { default as billingService } from './billing.service';
export { default as appointmentsService } from './appointments.service';
export { default as inventoryService } from './inventory.service';

// Comprehensive API service
export { default as apiService } from './api.service';
export * from './api.service';

// Re-export types
export type { CreatePatientDto, PatientFilters } from './patients.service';
export type { CreateStaffDto, StaffFilters } from './staff.service';
export type {
  CreateLabTestDto,
  CreateLabOrderDto,
  UpdateLabOrderDto,
  UpdateTestResultDto,
  LabTestFilters,
  LabOrderFilters,
} from './laboratory.service';
export type {
  CreateMedicationDto,
  CreatePharmacyOrderDto,
  UpdatePharmacyOrderDto,
  UpdateOrderItemDto,
  MedicationFilters,
  PharmacyOrderFilters,
} from './pharmacy.service';
export type {
  CreateInvoiceDto,
  CreatePaymentDto,
  InvoiceFilters,
  PaymentFilters,
} from './billing.service';
export type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilters,
} from './appointments.service';
export type {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryFilters,
} from './inventory.service';
