import { enhancedApiClient } from '../lib/api-client';

/**
 * Subscription API Service
 * Handles all subscription and billing operations
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  features: string[];
  maxUsers: number;
  maxPatients: number;
  maxStorage: number;
  maxBranches: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  hospitalId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  autoRenew: boolean;
  paymentMethod: string;
  billingCycle: string;
  basePrice: number;
  discount: number;
  tax: number;
  totalAmount: number;
  addons: string[];
  addonsCost: number;
  billingEmail: string;
  billingPhone?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}

export interface CreateSubscriptionDto {
  planId: string;
  billingCycle: string;
  paymentMethod: string;
  autoRenew?: boolean;
  addons?: string[];
  billingEmail: string;
  billingPhone?: string;
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
  };
}

export interface UpdateSubscriptionDto {
  planId?: string;
  billingCycle?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  addons?: string[];
  billingEmail?: string;
  billingPhone?: string;
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'success' | 'failed' | 'pending';
  invoiceNumber: string;
  transactionId?: string;
}

const subscriptionService = {
  /**
   * Get available subscription plans
   */
  getPlans: async (): Promise<any> => {
    return enhancedApiClient.get('/subscription/plans');
  },

  /**
   * Get plan by ID
   */
  getPlanById: async (id: string): Promise<any> => {
    return enhancedApiClient.get(`/subscription/plans/${id}`);
  },

  /**
   * Get current subscription
   */
  getCurrentSubscription: async (): Promise<any> => {
    return enhancedApiClient.get('/subscription/current');
  },

  /**
   * Create new subscription
   */
  createSubscription: async (data: CreateSubscriptionDto): Promise<any> => {
    return enhancedApiClient.post('/subscription', data);
  },

  /**
   * Update subscription
   */
  updateSubscription: async (id: string, data: UpdateSubscriptionDto): Promise<any> => {
    return enhancedApiClient.patch(`/subscription/${id}`, data);
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (id: string, reason?: string): Promise<any> => {
    return enhancedApiClient.post(`/subscription/${id}/cancel`, { reason });
  },

  /**
   * Renew subscription
   */
  renewSubscription: async (id: string): Promise<any> => {
    return enhancedApiClient.post(`/subscription/${id}/renew`);
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (subscriptionId?: string): Promise<any> => {
    return enhancedApiClient.get('/subscription/payments', { subscriptionId });
  },

  /**
   * Download invoice
   */
  downloadInvoice: async (paymentId: string): Promise<any> => {
    return enhancedApiClient.get(`/subscription/payments/${paymentId}/invoice`, {
      responseType: 'blob',
    });
  },

  /**
   * Get subscription usage
   */
  getUsage: async (): Promise<any> => {
    return enhancedApiClient.get('/subscription/usage');
  },

  /**
   * Get available addons
   */
  getAddons: async (): Promise<any> => {
    return enhancedApiClient.get('/subscription/addons');
  },

  /**
   * Update payment method
   */
  updatePaymentMethod: async (data: any): Promise<any> => {
    return enhancedApiClient.patch('/subscription/payment-method', data);
  },

  /**
   * Get subscription statistics
   */
  getStats: async (): Promise<any> => {
    return enhancedApiClient.get('/subscription/stats');
  },
};

export default subscriptionService;
