import { enhancedApiClient } from '../lib/api-client';

/**
 * Billing and Invoice API Service
 * Handles all billing-related API calls
 */

// Types
export interface InvoiceItem {
  itemType: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export interface CreateInvoiceDto {
  patientId: string;
  date?: string;
  dueDate: string;
  items: InvoiceItem[];
  discountAmount?: number;
  notes?: string;
  createdBy?: string;
}

export interface UpdateInvoiceDto {
  status?: string;
  dueDate?: string;
  discountAmount?: number;
  notes?: string;
  updatedBy?: string;
}

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdatePaymentDto {
  status?: string;
  notes?: string;
}

export interface InvoiceFilters {
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  invoiceId?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface InvoicesListResponse {
  success: boolean;
  message?: string;
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface PaymentsListResponse {
  success: boolean;
  message?: string;
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BillingStatsResponse {
  success: boolean;
  message?: string;
  data: {
    totalInvoices: number;
    pendingInvoices: number;
    paidInvoices: number;
    partiallyPaidInvoices: number;
    todayRevenue: number;
    monthlyRevenue: number;
    todayInvoices: number;
    monthlyInvoices: number;
    paymentsByMethod: Array<{
      method: string;
      amount: number;
    }>;
  };
}

export interface RevenueReportResponse {
  success: boolean;
  message?: string;
  data: {
    startDate: string;
    endDate: string;
    totalInvoices: number;
    totalRevenue: number;
    totalTax: number;
    totalDiscount: number;
    invoices: any[];
  };
}

const billingService = {
  // ==================== INVOICE OPERATIONS ====================

  /**
   * Create a new invoice
   */
  createInvoice: async (data: CreateInvoiceDto): Promise<InvoiceResponse> => {
    return enhancedApiClient.post('/billing/invoices', data);
  },

  /**
   * Get all invoices with filters
   */
  getInvoices: async (filters?: InvoiceFilters): Promise<InvoicesListResponse> => {
    return enhancedApiClient.get('/billing/invoices', filters);
  },

  /**
   * Get invoice by ID
   */
  getInvoiceById: async (id: string): Promise<InvoiceResponse> => {
    return enhancedApiClient.get(`/billing/invoices/${id}`);
  },

  /**
   * Update invoice
   */
  updateInvoice: async (id: string, data: UpdateInvoiceDto): Promise<InvoiceResponse> => {
    return enhancedApiClient.patch(`/billing/invoices/${id}`, data);
  },

  /**
   * Cancel invoice
   */
  cancelInvoice: async (id: string): Promise<InvoiceResponse> => {
    return enhancedApiClient.delete(`/billing/invoices/${id}`);
  },

  /**
   * Get billing statistics
   */
  getBillingStats: async (): Promise<BillingStatsResponse> => {
    return enhancedApiClient.get('/billing/invoices/stats');
  },

  /**
   * Get revenue report
   */
  getRevenueReport: async (startDate: string, endDate: string): Promise<RevenueReportResponse> => {
    return enhancedApiClient.get('/billing/invoices/reports/revenue', {
      startDate,
      endDate,
    });
  },

  // ==================== PAYMENT OPERATIONS ====================

  /**
   * Create a payment
   */
  createPayment: async (data: CreatePaymentDto): Promise<PaymentResponse> => {
    return enhancedApiClient.post('/billing/payments', data);
  },

  /**
   * Get all payments with filters
   */
  getPayments: async (filters?: PaymentFilters): Promise<PaymentsListResponse> => {
    return enhancedApiClient.get('/billing/payments', filters);
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    return enhancedApiClient.get(`/billing/payments/${id}`);
  },

  /**
   * Update payment
   */
  updatePayment: async (id: string, data: UpdatePaymentDto): Promise<PaymentResponse> => {
    return enhancedApiClient.patch(`/billing/payments/${id}`, data);
  },
};

export default billingService;
