'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Text,
  Group,
  Badge,
  SimpleGrid,
  Stack,
  Button,
  Title,
  Card,
  TextInput,
  Select,
  LoadingOverlay,
  Alert,
  Tabs,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import {
  IconPlus,
  IconSearch,
  IconCurrencyRupee,
  IconReceipt,
  IconCash,
  IconEdit,
  IconTrash,
  IconEye,
  IconDotsVertical,
  IconCalendar,
  IconTrendingUp,
  IconAlertCircle,
  IconCheck,
  IconClock,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import InvoiceForm from '../../components/billing/InvoiceForm';
import PaymentForm from '../../components/billing/PaymentForm';
import InvoiceDetails from '../../components/billing/InvoiceDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import billingService from '../../services/billing.service';
import patientsService from '../../services/patients.service';
import type {
  CreateInvoiceDto,
  CreatePaymentDto,
  InvoiceFilters,
} from '../../services/billing.service';

const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@hospital.com',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.ADMIN,
  permissions: [],
  isActive: true,
  tenantInfo: {
    tenantId: 'T001',
    tenantName: 'Main Hospital',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function BillingPage() {
  const { user, setUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const [invoiceFormOpened, { open: openInvoiceForm, close: closeInvoiceForm }] =
    useDisclosure(false);
  const [paymentFormOpened, { open: openPaymentForm, close: closePaymentForm }] =
    useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchInvoices();
    fetchPayments();
    fetchStats();
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const filters: InvoiceFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter) filters.status = statusFilter;
      if (dateFilter) {
        filters.startDate = dateFilter.toISOString();
        filters.endDate = dateFilter.toISOString();
      }

      const response = await billingService.getInvoices(filters);
      if (response.success && response.data) {
        setInvoices(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to fetch invoices',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await billingService.getPayments();
      if (response.success && response.data) {
        setPayments(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await billingService.getBillingStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients();
      if (response.success && response.data) {
        setPatients(response.data.patients || []);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreateInvoice = async (data: CreateInvoiceDto) => {
    try {
      const response = await billingService.createInvoice(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Invoice created successfully',
          color: 'green',
        });
        fetchInvoices();
        fetchStats();
        closeInvoiceForm();
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to create invoice',
        color: 'red',
      });
      throw error;
    }
  };

  const handleUpdateInvoice = async (data: any) => {
    if (!selectedInvoice) return;

    try {
      const response = await billingService.updateInvoice(selectedInvoice.id, data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Invoice updated successfully',
          color: 'green',
        });
        fetchInvoices();
        fetchStats();
        closeInvoiceForm();
        setSelectedInvoice(null);
      }
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to update invoice',
        color: 'red',
      });
      throw error;
    }
  };

  const handleCancelInvoice = async (invoice: any) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) {
      return;
    }

    try {
      const response = await billingService.cancelInvoice(invoice.id);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Invoice cancelled successfully',
          color: 'green',
        });
        fetchInvoices();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to cancel invoice',
        color: 'red',
      });
    }
  };

  const handleCreatePayment = async (data: CreatePaymentDto) => {
    try {
      const response = await billingService.createPayment(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Payment recorded successfully',
          color: 'green',
        });
        fetchInvoices();
        fetchPayments();
        fetchStats();
        closePaymentForm();
      }
    } catch (error: any) {
      console.error('Error recording payment:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to record payment',
        color: 'red',
      });
      throw error;
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    openDetails();
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    openInvoiceForm();
  };

  const handleRecordPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    openPaymentForm();
  };

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    openInvoiceForm();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'yellow',
      PARTIALLY_PAID: 'orange',
      PAID: 'green',
      OVERDUE: 'red',
      CANCELLED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const invoiceColumns: TableColumn[] = [
    {
      key: 'invoiceNumber',
      title: 'Invoice #',
      sortable: true,
      render: (invoice: any) => <Text fw={600}>{invoice.invoiceNumber}</Text>,
    },
    {
      key: 'patient',
      title: 'Patient',
      sortable: true,
      render: (invoice: any) => (
        <div>
          <Text fw={500}>
            {invoice.patient?.firstName} {invoice.patient?.lastName}
          </Text>
          <Text size="xs" c="dimmed">
            {invoice.patient?.medicalRecordNumber || invoice.patient?.id}
          </Text>
        </div>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (invoice: any) => <Text>{formatDate(invoice.date)}</Text>,
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      sortable: true,
      render: (invoice: any) => <Text>{formatDate(invoice.dueDate)}</Text>,
    },
    {
      key: 'totalAmount',
      title: 'Amount',
      sortable: true,
      render: (invoice: any) => <Text fw={600}>{formatCurrency(invoice.totalAmount)}</Text>,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (invoice: any) => (
        <Badge color={getStatusColor(invoice.status)}>{invoice.status}</Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (invoice: any) => (
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleViewInvoice(invoice)}>
            <IconEye size={16} />
          </ActionIcon>
          {invoice.status === 'PENDING' && (
            <ActionIcon variant="subtle" onClick={() => handleEditInvoice(invoice)}>
              <IconEdit size={16} />
            </ActionIcon>
          )}
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <ActionIcon variant="subtle" color="green" onClick={() => handleRecordPayment(invoice)}>
              <IconCash size={16} />
            </ActionIcon>
          )}
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={14} />}
                onClick={() => handleViewInvoice(invoice)}
              >
                View Details
              </Menu.Item>
              {invoice.status === 'PENDING' && (
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleEditInvoice(invoice)}
                >
                  Edit
                </Menu.Item>
              )}
              {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <>
                  <Menu.Item
                    leftSection={<IconCash size={14} />}
                    onClick={() => handleRecordPayment(invoice)}
                  >
                    Record Payment
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={() => handleCancelInvoice(invoice)}
                  >
                    Cancel Invoice
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  const paymentColumns: TableColumn[] = [
    {
      key: 'paymentNumber',
      title: 'Payment #',
      sortable: true,
      render: (payment: any) => <Text fw={600}>{payment.paymentNumber}</Text>,
    },
    {
      key: 'invoice',
      title: 'Invoice',
      render: (payment: any) => <Text>{payment.invoice?.invoiceNumber}</Text>,
    },
    {
      key: 'patient',
      title: 'Patient',
      render: (payment: any) => (
        <Text>
          {payment.invoice?.patient?.firstName} {payment.invoice?.patient?.lastName}
        </Text>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (payment: any) => <Text fw={600}>{formatCurrency(payment.amount)}</Text>,
    },
    {
      key: 'paymentMethod',
      title: 'Method',
      render: (payment: any) => <Badge variant="light">{payment.paymentMethod}</Badge>,
    },
    {
      key: 'paymentDate',
      title: 'Date',
      sortable: true,
      render: (payment: any) => <Text>{formatDate(payment.paymentDate)}</Text>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (payment: any) => (
        <Badge color={payment.status === 'COMPLETED' ? 'green' : 'gray'}>{payment.status}</Badge>
      ),
    },
  ];

  const currentUser = user || mockUser;
  const userForLayout = {
    ...currentUser,
    name: `${currentUser.firstName} ${currentUser.lastName}`,
  };

  return (
    <Layout user={userForLayout} notifications={0} onLogout={() => {}}>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Billing & Invoicing</Title>
              <Text c="dimmed" size="sm">
                Manage invoices, payments, and billing operations
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewInvoice}>
              Create Invoice
            </Button>
          </Group>

          {/* Statistics Cards */}
          {stats && (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Total Revenue
                    </Text>
                    <Text fw={700} size="xl">
                      ₹{stats.monthlyRevenue.toFixed(2)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      This month
                    </Text>
                  </div>
                  <IconTrendingUp size={32} color="#40c057" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Pending
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.pendingInvoices}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Invoices
                    </Text>
                  </div>
                  <IconClock size={32} color="#fab005" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Paid
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.paidInvoices}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Invoices
                    </Text>
                  </div>
                  <IconCheck size={32} color="#40c057" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Today
                    </Text>
                    <Text fw={700} size="xl">
                      ₹{stats.todayRevenue.toFixed(2)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Revenue
                    </Text>
                  </div>
                  <IconCurrencyRupee size={32} color="#228be6" />
                </Group>
              </Card>
            </SimpleGrid>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'invoices')}>
            <Tabs.List>
              <Tabs.Tab value="invoices" leftSection={<IconReceipt size={16} />}>
                Invoices
              </Tabs.Tab>
              <Tabs.Tab value="payments" leftSection={<IconCash size={16} />}>
                Payments
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="invoices" pt="md">
              {/* Filters */}
              <Paper withBorder p="md" mb="md">
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <TextInput
                      placeholder="Search invoices..."
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Select
                      placeholder="Filter by status"
                      data={[
                        { value: '', label: 'All Statuses' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
                        { value: 'PAID', label: 'Paid' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                      ]}
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value || '')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <DatePickerInput
                      placeholder="Filter by date"
                      leftSection={<IconCalendar size={16} />}
                      value={dateFilter}
                      onChange={(value) => setDateFilter(value as unknown as Date | null)}
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Button fullWidth onClick={fetchInvoices}>
                      Apply Filters
                    </Button>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Invoices Table */}
              <Paper withBorder>
                <LoadingOverlay visible={loading} />
                {invoices.length === 0 && !loading ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="No invoices found"
                    color="blue"
                  >
                    No invoices match your current filters. Try adjusting your search criteria or
                    create a new invoice.
                  </Alert>
                ) : (
                  <DataTable columns={invoiceColumns} data={invoices} loading={loading} />
                )}
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="payments" pt="md">
              {/* Payments Table */}
              <Paper withBorder>
                <LoadingOverlay visible={loading} />
                {payments.length === 0 && !loading ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="No payments found"
                    color="blue"
                  >
                    No payment records available.
                  </Alert>
                ) : (
                  <DataTable columns={paymentColumns} data={payments} loading={loading} />
                )}
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>

      {/* Invoice Form Modal */}
      <InvoiceForm
        opened={invoiceFormOpened}
        onClose={closeInvoiceForm}
        invoice={selectedInvoice}
        onSubmit={selectedInvoice ? handleUpdateInvoice : handleCreateInvoice}
        patients={patients}
      />

      {/* Payment Form Modal */}
      {selectedInvoice && (
        <PaymentForm
          opened={paymentFormOpened}
          onClose={closePaymentForm}
          invoice={selectedInvoice}
          onSubmit={handleCreatePayment}
        />
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetails
          opened={detailsOpened}
          onClose={closeDetails}
          invoice={selectedInvoice}
          onEdit={handleEditInvoice}
          onDelete={handleCancelInvoice}
          onRecordPayment={handleRecordPayment}
        />
      )}
    </Layout>
  );
}

export default BillingPage;
