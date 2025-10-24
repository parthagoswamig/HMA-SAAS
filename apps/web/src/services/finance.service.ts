import { enhancedApiClient } from '../lib/api-client';

/**
 * Finance API Service
 * Handles all financial operations including invoices, payments, and reports
 */

// Types
export interface CreateTransactionDto {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  relatedType?: string;
  relatedId?: string;
}

export interface UpdateTransactionDto {
  type?: string;
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  paymentMethod?: string;
  referenceNumber?: string;
}

export interface FinanceFilters {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

export interface TransactionResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface TransactionsListResponse {
  success: boolean;
  data: {
    items: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface FinanceStatsResponse {
  success: boolean;
  data: {
    invoices: {
      total: number;
      paid: number;
      pending: number;
    };
    revenue: {
      total: number;
      outstanding: number;
    };
    transactions: {
      totalIncome: number;
      totalExpenses: number;
      netProfit: number;
    };
  };
}

export interface RevenueReportResponse {
  success: boolean;
  data: Record<
    string,
    {
      total: number;
      count: number;
      methods: Record<string, number>;
    }
  >;
}

export interface OutstandingReportResponse {
  success: boolean;
  data: {
    invoices: Array<{
      invoiceId: string;
      invoiceNumber: string;
      patient: { id: string; name: string };
      totalAmount: number;
      paidAmount: number;
      outstanding: number;
      dueDate: string;
      overdue: boolean;
    }>;
    summary: {
      totalInvoices: number;
      totalOutstanding: number;
    };
  };
}

const financeService = {
  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Create financial transaction
   */
  createTransaction: async (data: CreateTransactionDto): Promise<TransactionResponse> => {
    return enhancedApiClient.post('/finance/transactions', data);
  },

  /**
   * Get all transactions with filters
   */
  getTransactions: async (filters?: FinanceFilters): Promise<TransactionsListResponse> => {
    return enhancedApiClient.get('/finance/transactions', filters);
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: string): Promise<TransactionResponse> => {
    return enhancedApiClient.get(`/finance/transactions/${id}`);
  },

  /**
   * Update transaction
   */
  updateTransaction: async (
    id: string,
    data: UpdateTransactionDto
  ): Promise<TransactionResponse> => {
    return enhancedApiClient.patch(`/finance/transactions/${id}`, data);
  },

  /**
   * Delete transaction
   */
  deleteTransaction: async (id: string): Promise<TransactionResponse> => {
    return enhancedApiClient.delete(`/finance/transactions/${id}`);
  },

  // ==================== INVOICE OPERATIONS ====================

  /**
   * Get all invoices
   */
  getInvoices: async (filters?: any): Promise<any> => {
    return enhancedApiClient.get('/finance/invoices', filters);
  },

  /**
   * Get invoice by ID
   */
  getInvoiceById: async (id: string): Promise<any> => {
    return enhancedApiClient.get(`/finance/invoices/${id}`);
  },

  // ==================== PAYMENT OPERATIONS ====================

  /**
   * Create payment
   */
  createPayment: async (data: any): Promise<any> => {
    return enhancedApiClient.post('/finance/payments', data);
  },

  /**
   * Get all payments
   */
  getPayments: async (filters?: any): Promise<any> => {
    return enhancedApiClient.get('/finance/payments', filters);
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (id: string): Promise<any> => {
    return enhancedApiClient.get(`/finance/payments/${id}`);
  },

  // ==================== REPORTS ====================

  /**
   * Get revenue report
   */
  getRevenueReport: async (filters?: any): Promise<RevenueReportResponse> => {
    return enhancedApiClient.get('/finance/reports/revenue', filters);
  },

  /**
   * Get outstanding report
   */
  getOutstandingReport: async (): Promise<OutstandingReportResponse> => {
    return enhancedApiClient.get('/finance/reports/outstanding');
  },

  /**
   * Get finance statistics
   */
  getStats: async (filters?: any): Promise<FinanceStatsResponse> => {
    return enhancedApiClient.get('/finance/stats', filters);
  },
};

export default financeService;
