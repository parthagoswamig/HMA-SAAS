'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED' | 'REFUNDED';
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  itemType: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  totalAmount: number;
}

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod:
    | 'CASH'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'UPI'
    | 'NET_BANKING'
    | 'CHEQUE'
    | 'BANK_TRANSFER';
  referenceNumber?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  notes?: string;
}

const BillingPage = () => {
  const [currentTab, setCurrentTab] = useState<'invoices' | 'payments' | 'reports'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      patientId: 'p1',
      patientName: 'John Doe',
      date: '2024-12-01',
      dueDate: '2024-12-15',
      status: 'PAID',
      subTotal: 5000,
      taxAmount: 900,
      discountAmount: 500,
      totalAmount: 5400,
      amountPaid: 5400,
      notes: 'Cardiology consultation and tests',
      items: [
        {
          id: '1',
          itemType: 'consultation',
          itemId: 'c1',
          description: 'Cardiology Consultation',
          quantity: 1,
          unitPrice: 2000,
          discount: 0,
          taxRate: 18,
          totalAmount: 2360,
        },
        {
          id: '2',
          itemType: 'test',
          itemId: 't1',
          description: 'ECG Test',
          quantity: 1,
          unitPrice: 1500,
          discount: 300,
          taxRate: 18,
          totalAmount: 1416,
        },
      ],
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      patientId: 'p2',
      patientName: 'Sarah Johnson',
      date: '2024-12-03',
      dueDate: '2024-12-17',
      status: 'PENDING',
      subTotal: 3500,
      taxAmount: 630,
      discountAmount: 200,
      totalAmount: 3930,
      amountPaid: 0,
      notes: 'Emergency treatment',
      items: [
        {
          id: '3',
          itemType: 'treatment',
          itemId: 'tr1',
          description: 'Emergency Room Treatment',
          quantity: 1,
          unitPrice: 3500,
          discount: 200,
          taxRate: 18,
          totalAmount: 3930,
        },
      ],
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      patientId: 'p3',
      patientName: 'Michael Chen',
      date: '2024-12-04',
      dueDate: '2024-12-18',
      status: 'PARTIALLY_PAID',
      subTotal: 8000,
      taxAmount: 1440,
      discountAmount: 800,
      totalAmount: 8640,
      amountPaid: 4000,
      notes: 'Surgery and post-op care',
      items: [
        {
          id: '4',
          itemType: 'surgery',
          itemId: 's1',
          description: 'Appendix Surgery',
          quantity: 1,
          unitPrice: 6000,
          discount: 600,
          taxRate: 18,
          totalAmount: 6372,
        },
        {
          id: '5',
          itemType: 'medication',
          itemId: 'm1',
          description: 'Post-op Medications',
          quantity: 1,
          unitPrice: 2000,
          discount: 200,
          taxRate: 18,
          totalAmount: 2268,
        },
      ],
    },
  ]);

  const [payments] = useState<Payment[]>([
    {
      id: '1',
      paymentNumber: 'PAY-2024-001',
      invoiceId: '1',
      invoiceNumber: 'INV-2024-001',
      patientName: 'John Doe',
      amount: 5400,
      paymentDate: '2024-12-01',
      paymentMethod: 'UPI',
      referenceNumber: 'UPI123456789',
      status: 'COMPLETED',
      notes: 'Full payment received',
    },
    {
      id: '2',
      paymentNumber: 'PAY-2024-002',
      invoiceId: '3',
      invoiceNumber: 'INV-2024-003',
      patientName: 'Michael Chen',
      amount: 4000,
      paymentDate: '2024-12-04',
      paymentMethod: 'CREDIT_CARD',
      referenceNumber: 'CC987654321',
      status: 'COMPLETED',
      notes: 'Partial payment - surgery advance',
    },
    {
      id: '3',
      paymentNumber: 'PAY-2024-003',
      invoiceId: '2',
      invoiceNumber: 'INV-2024-002',
      patientName: 'Sarah Johnson',
      amount: 3930,
      paymentDate: '2024-12-05',
      paymentMethod: 'CASH',
      status: 'PENDING',
    },
  ]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

    const matchesDate =
      dateRange === 'all' ||
      (dateRange === 'today' &&
        new Date(invoice.date).toDateString() === new Date().toDateString()) ||
      (dateRange === 'week' &&
        new Date(invoice.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateRange === 'month' &&
        new Date(invoice.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'PARTIALLY_PAID':
        return '#3b82f6';
      case 'DRAFT':
        return '#6b7280';
      case 'CANCELLED':
      case 'FAILED':
        return '#ef4444';
      case 'REFUNDED':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return '💵';
      case 'CREDIT_CARD':
        return '💳';
      case 'DEBIT_CARD':
        return '💳';
      case 'UPI':
        return '📱';
      case 'NET_BANKING':
        return '🏦';
      case 'CHEQUE':
        return '📄';
      case 'BANK_TRANSFER':
        return '🏛️';
      default:
        return '💰';
    }
  };

  // Financial calculations
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === 'PENDING' || i.status === 'PARTIALLY_PAID')
    .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.amountPaid), 0);
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === 'PAID').length;

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <Card variant="elevated" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {invoice.invoiceNumber}
              </h3>
              <p style={{ margin: '0', fontSize: '1rem', color: '#6b7280' }}>
                {invoice.patientName}
              </p>
            </div>
            <span
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(invoice.status)}15`,
                color: getStatusColor(invoice.status),
              }}
            >
              {invoice.status.replace('_', ' ')}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Items:</strong> {invoice.items.length}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Subtotal:</strong> ₹{invoice.subTotal.toLocaleString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Tax:</strong> ₹{invoice.taxAmount.toLocaleString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Discount:</strong> ₹{invoice.discountAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1rem',
                  color: '#1f2937',
                  fontWeight: '600',
                }}
              >
                <strong>Total:</strong> ₹{invoice.totalAmount.toLocaleString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#10b981' }}>
                <strong>Paid:</strong> ₹{invoice.amountPaid.toLocaleString()}
              </p>
              {invoice.totalAmount > invoice.amountPaid && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#ef4444' }}>
                  <strong>Pending:</strong> ₹
                  {(invoice.totalAmount - invoice.amountPaid).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {invoice.notes && (
            <div
              style={{
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '6px',
                marginBottom: '0.5rem',
              }}
            >
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Notes:</strong> {invoice.notes}
              </p>
            </div>
          )}
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = `/billing/invoices/${invoice.id}`)}
          >
            View Invoice
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => (window.location.href = `/billing/invoices/${invoice.id}/edit`)}
          >
            Edit
          </Button>
          {invoice.status !== 'PAID' && (
            <Button
              size="sm"
              variant="success"
              onClick={() =>
                (window.location.href = `/billing/payments/new?invoiceId=${invoice.id}`)
              }
            >
              Add Payment
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <Card variant="elevated" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
              {getPaymentMethodIcon(payment.paymentMethod)}
            </span>
            <div>
              <h3
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {payment.paymentNumber}
              </h3>
              <p style={{ margin: '0', fontSize: '1rem', color: '#6b7280' }}>
                {payment.patientName}
              </p>
            </div>
            <span
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(payment.status)}15`,
                color: getStatusColor(payment.status),
              }}
            >
              {payment.status}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Invoice:</strong> {payment.invoiceNumber}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Method:</strong> {payment.paymentMethod.replace('_', ' ')}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  color: '#10b981',
                  fontWeight: 'bold',
                }}
              >
                ₹{payment.amount.toLocaleString()}
              </p>
              {payment.referenceNumber && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Ref:</strong> {payment.referenceNumber}
                </p>
              )}
              {payment.notes && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Notes:</strong> {payment.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = `/billing/payments/${payment.id}`)}
          >
            View Receipt
          </Button>
          {payment.status === 'PENDING' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => (window.location.href = `/billing/payments/${payment.id}/edit`)}
            >
              Update Status
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Billing & Finance
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage invoices, payments, and financial reporting
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" onClick={() => (window.location.href = '/billing/reports')}>
              📊 Financial Reports
            </Button>
            <Button onClick={() => (window.location.href = '/billing/invoices/new')}>
              + New Invoice
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Revenue</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                This Month
              </div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ₹{pendingAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Pending Amount</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                Outstanding Dues
              </div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {totalInvoices}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Total Invoices</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                This Month
              </div>
            </div>
          </Card>

          <Card
            variant="elevated"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {Math.round((paidInvoices / totalInvoices) * 100)}%
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Collection Rate</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                {paidInvoices}/{totalInvoices} Paid
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'invoices', label: '📄 Invoices', count: invoices.length },
              { key: 'payments', label: '💳 Payments', count: payments.length },
              { key: 'reports', label: '📊 Reports', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as any)}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: currentTab === tab.key ? '#667eea' : '#6b7280',
                  borderBottom:
                    currentTab === tab.key ? '2px solid #667eea' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
                {tab.count && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: currentTab === tab.key ? '#667eea' : '#e5e7eb',
                      color: currentTab === tab.key ? 'white' : '#6b7280',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'end',
            }}
          >
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="🔍"
              label="Search"
            />

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Status Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                }}
              >
                <option value="all">All Status</option>
                {currentTab === 'invoices' ? (
                  <>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Content */}
        {currentTab === 'invoices' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                Invoices ({filteredInvoices.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" size="sm">
                  Export
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => (window.location.href = '/billing/invoices/new')}
                >
                  + New Invoice
                </Button>
              </div>
            </div>

            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    No invoices found
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    No invoices match your current search criteria.
                  </p>
                  <Button onClick={() => (window.location.href = '/billing/invoices/new')}>
                    Create New Invoice
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentTab === 'payments' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                Payments ({filteredPayments.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" size="sm">
                  Export
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => (window.location.href = '/billing/payments/new')}
                >
                  + Record Payment
                </Button>
              </div>
            </div>

            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    No payments found
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    No payments match your current search criteria.
                  </p>
                  <Button onClick={() => (window.location.href = '/billing/payments/new')}>
                    Record New Payment
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentTab === 'reports' && (
          <div>
            <Card title="Financial Reports" style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                }}
              >
                <div
                  style={{
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Revenue Report
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Monthly and yearly revenue analysis with trends and comparisons
                  </p>
                  <Button size="sm" variant="outline">
                    Generate Report
                  </Button>
                </div>

                <div
                  style={{
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Outstanding Report
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Track pending payments and overdue invoices with aging analysis
                  </p>
                  <Button size="sm" variant="outline">
                    View Outstanding
                  </Button>
                </div>

                <div
                  style={{
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Payment Analytics
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Payment method analysis and collection efficiency metrics
                  </p>
                  <Button size="sm" variant="outline">
                    View Analytics
                  </Button>
                </div>

                <div
                  style={{
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏥</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Department Revenue
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Revenue breakdown by department and service type analysis
                  </p>
                  <Button size="sm" variant="outline">
                    Department Report
                  </Button>
                </div>

                <div
                  style={{
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Tax Report
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    GST and tax collection summary for compliance and filing
                  </p>
                  <Button size="sm" variant="outline">
                    Tax Summary
                  </Button>
                </div>

                <div
                  style={{
                    padding: '2rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Custom Report
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Create custom financial reports with flexible date ranges and filters
                  </p>
                  <Button size="sm" variant="outline">
                    Build Report
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillingPage;
