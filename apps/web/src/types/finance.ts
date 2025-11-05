// Finance Management Types

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
export type AccountType = 'checking' | 'savings' | 'revenue' | 'expense' | 'asset' | 'liability';
export type BudgetStatus = 'active' | 'expired' | 'draft';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'online';
export type ExpenseCategory =
  | 'medical_supplies'
  | 'equipment'
  | 'salaries'
  | 'utilities'
  | 'maintenance'
  | 'marketing'
  | 'insurance'
  | 'other';
export type ReportType =
  | 'income_statement'
  | 'balance_sheet'
  | 'cash_flow'
  | 'budget_variance'
  | 'expense_analysis';

export interface Account {
  id: string;
  name: string;
  code: string;
  type: AccountType;
  balance: number;
  accountNumber: string;
  bankName?: string;
  isActive: boolean;
  description?: string;
  createdDate: Date | string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  date: Date | string;
  description: string;
  type: TransactionType;
  category: ExpenseCategory;
  amount: number;
  account: {
    name: string;
    type: AccountType;
  };
  status: TransactionStatus;
  reference?: string;
  paymentMethod?: PaymentMethod;
  attachments?: string[];
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
}

export interface Budget {
  id: string;
  name: string;
  department: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  startDate: Date | string;
  endDate: Date | string;
  status: BudgetStatus;
  description?: string;
  approvedBy?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date | string;
  dueDate: Date | string;
  amount: number;
  status: InvoiceStatus;
  patientId?: string;
  patientName?: string;
  description: string;
  items?: InvoiceItem[];
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  balanceAmount?: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface FinancialReport {
  id: string;
  reportType: ReportType;
  title: string;
  generatedDate: Date | string;
  period: string;
  startDate?: Date | string;
  endDate?: Date | string;
  data?: any;
  generatedBy?: string;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  profitMargin: number;
  accountsReceivable: number;
  accountsPayable: number;
  totalAssets: number;
  monthlyRevenue: MonthlyData[];
  expenseByCategory: CategoryData[];
  cashFlowData?: CashFlowData[];
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CategoryData {
  category: string;
  value: number;
  name: string;
  color?: string;
}

export interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
}

export interface FinancialFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  category?: ExpenseCategory;
  account?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}
