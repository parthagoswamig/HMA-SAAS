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
import {
  IconPlus,
  IconSearch,
  IconCurrency,
  IconTrendingUp,
  IconTrendingDown,
  IconEdit,
  IconEye,
  IconTrash,
  IconDotsVertical,
  IconAlertCircle,
  IconReceipt,
  IconCash,
  IconReport,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import FinanceTransactionForm from '../../components/finance/FinanceTransactionForm';
import FinanceTransactionDetails from '../../components/finance/FinanceTransactionDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import financeService from '../../services/finance.service';
import type { CreateTransactionDto, UpdateTransactionDto } from '../../services/finance.service';

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

function FinancePage() {
  const { user, setUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [transactionFormOpened, { open: openTransactionForm, close: closeTransactionForm }] =
    useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchTransactions();
    fetchInvoices();
    fetchPayments();
    fetchStats();
  }, [user, setUser]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Since backend doesn't have transaction endpoints yet, we'll use payments data
      // to simulate transactions and show real data from the API
      const response = await financeService.getPayments();

      if (response.success && response.data) {
        // Transform payments into transaction-like format
        const transformedTransactions = response.data.items.map((payment: any) => ({
          id: payment.id,
          type: 'INCOME', // Payments are income
          category: 'PAYMENT_RECEIVED',
          amount: payment.amount,
          description: `Payment for Invoice ${payment.invoice?.invoiceNumber || 'N/A'}`,
          date: payment.paymentDate || payment.createdAt,
          paymentMethod: payment.paymentMethod,
          referenceNumber: payment.paymentNumber,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          relatedType: 'INVOICE',
          relatedId: payment.invoiceId,
        }));

        setTransactions(transformedTransactions);
      } else {
        // Fallback to mock data if no real payments exist
        const mockTransactions = [
          {
            id: '1',
            type: 'INCOME',
            category: 'CONSULTATION_FEES',
            amount: 1500,
            description: 'Consultation fee for patient John Doe',
            date: new Date().toISOString(),
            paymentMethod: 'CASH',
            referenceNumber: 'REF001',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'EXPENSE',
            category: 'MEDICAL_SUPPLIES',
            amount: 5000,
            description: 'Purchase of medical supplies',
            date: new Date(Date.now() - 86400000).toISOString(),
            paymentMethod: 'BANK_TRANSFER',
            referenceNumber: 'REF002',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setTransactions(mockTransactions);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);

      // Show user-friendly error message
      notifications.show({
        title: 'Error Loading Transactions',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch financial transactions. Please try again.',
        color: 'red',
        autoClose: 5000,
      });

      // Fallback to mock data on error
      const mockTransactions = [
        {
          id: '1',
          type: 'INCOME',
          category: 'CONSULTATION_FEES',
          amount: 1500,
          description: 'Consultation fee for patient John Doe',
          date: new Date().toISOString(),
          paymentMethod: 'CASH',
          referenceNumber: 'REF001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await financeService.getInvoices();
      if (response.success && response.data) {
        console.log('Invoices fetched:', response.data.items);
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await financeService.getPayments();
      if (response.success && response.data) {
        console.log('Payments fetched:', response.data.items);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await financeService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      notifications.show({
        title: 'Error Loading Statistics',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch financial statistics. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleCreateTransaction = async (data: CreateTransactionDto) => {
    try {
      // Mock creation since backend doesn't have transaction endpoints yet
      const newTransaction = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      notifications.show({
        title: 'Success',
        message: 'Transaction created successfully',
        color: 'green',
      });

      closeTransactionForm();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to create transaction',
        color: 'red',
      });
      throw error;
    }
  };

  const handleUpdateTransaction = async (data: UpdateTransactionDto) => {
    if (!selectedTransaction) return;

    try {
      const updatedTransaction = {
        ...selectedTransaction,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      setTransactions((prev) =>
        prev.map((t) => (t.id === selectedTransaction.id ? updatedTransaction : t))
      );

      notifications.show({
        title: 'Success',
        message: 'Transaction updated successfully',
        color: 'green',
      });

      closeTransactionForm();
      setSelectedTransaction(null);
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to update transaction',
        color: 'red',
      });
      throw error;
    }
  };

  const handleDeleteTransaction = async (transaction: any) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));

      notifications.show({
        title: 'Success',
        message: 'Transaction deleted successfully',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to delete transaction',
        color: 'red',
      });
    }
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    openDetails();
  };

  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    openTransactionForm();
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    openTransactionForm();
  };

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'green' : 'red';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const transactionColumns: TableColumn[] = [
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return <Badge color={getTypeColor(transaction.type)}>{transaction.type}</Badge>;
      },
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return <Text fw={500}>{formatCategory(transaction.category)}</Text>;
      },
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return (
          <Text fw={600} c={getTypeColor(transaction.type)}>
            {transaction.type === 'EXPENSE' ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </Text>
        );
      },
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return <Text lineClamp={2}>{transaction.description}</Text>;
      },
    },
    {
      key: 'paymentMethod',
      title: 'Method',
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return <Badge variant="light">{transaction.paymentMethod?.replace(/_/g, ' ')}</Badge>;
      },
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return <Text size="sm">{formatDate(transaction.date)}</Text>;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, record: Record<string, unknown>) => {
        const transaction = record as any;
        return (
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => handleViewTransaction(transaction)}>
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => handleEditTransaction(transaction)}>
              <IconEdit size={16} />
            </ActionIcon>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={() => handleViewTransaction(transaction)}
                >
                  View Details
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleEditTransaction(transaction)}
                >
                  Edit Transaction
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => handleDeleteTransaction(transaction)}
                >
                  Delete Transaction
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        );
      },
    },
  ];

  // Calculate mock stats from transactions
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <Layout
      user={
        user
          ? {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
            }
          : {
              id: mockUser.id,
              name: `${mockUser.firstName} ${mockUser.lastName}`,
              email: mockUser.email,
              role: mockUser.role,
            }
      }
      notifications={0}
      onLogout={() => {}}
    >
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Finance Management</Title>
              <Text c="dimmed" size="sm">
                Manage financial transactions, invoices, and reports
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewTransaction}>
              Add Transaction
            </Button>
          </Group>

          {/* Statistics Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Income
                  </Text>
                  <Text fw={700} size="xl" c="green">
                    {formatCurrency(totalIncome)}
                  </Text>
                </div>
                <IconTrendingUp size={32} color="#40c057" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Expenses
                  </Text>
                  <Text fw={700} size="xl" c="red">
                    {formatCurrency(totalExpenses)}
                  </Text>
                </div>
                <IconTrendingDown size={32} color="#fa5252" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Net Profit
                  </Text>
                  <Text fw={700} size="xl" c={netProfit >= 0 ? 'green' : 'red'}>
                    {formatCurrency(netProfit)}
                  </Text>
                </div>
                <IconReport size={32} color={netProfit >= 0 ? '#40c057' : '#fa5252'} />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Outstanding
                  </Text>
                  <Text fw={700} size="xl">
                    {formatCurrency(stats?.revenue?.outstanding || 0)}
                  </Text>
                </div>
                <IconCash size={32} color="#fab005" />
              </Group>
            </Card>
          </SimpleGrid>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'transactions')}>
            <Tabs.List>
              <Tabs.Tab value="transactions" leftSection={<IconCurrency size={16} />}>
                Transactions
              </Tabs.Tab>
              <Tabs.Tab value="invoices" leftSection={<IconReceipt size={16} />}>
                Invoices
              </Tabs.Tab>
              <Tabs.Tab value="payments" leftSection={<IconCash size={16} />}>
                Payments
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="transactions" pt="md">
              {/* Filters */}
              <Paper withBorder p="md" mb="md">
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <TextInput
                      placeholder="Search transactions..."
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Select
                      placeholder="Filter by type"
                      data={[
                        { value: '', label: 'All Types' },
                        { value: 'INCOME', label: 'Income' },
                        { value: 'EXPENSE', label: 'Expense' },
                      ]}
                      value={typeFilter}
                      onChange={(value) => setTypeFilter(value || '')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Select
                      placeholder="Filter by category"
                      data={[
                        { value: '', label: 'All Categories' },
                        { value: 'CONSULTATION_FEES', label: 'Consultation Fees' },
                        { value: 'MEDICAL_SUPPLIES', label: 'Medical Supplies' },
                        { value: 'STAFF_SALARIES', label: 'Staff Salaries' },
                      ]}
                      value={categoryFilter}
                      onChange={(value) => setCategoryFilter(value || '')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Button fullWidth onClick={fetchTransactions}>
                      Apply Filters
                    </Button>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Transactions Table */}
              <Paper withBorder>
                <LoadingOverlay visible={loading} />
                {transactions.length === 0 && !loading ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="No transactions found"
                    color="blue"
                  >
                    No financial transactions match your current filters.
                  </Alert>
                ) : (
                  <DataTable columns={transactionColumns} data={transactions} loading={loading} />
                )}
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="invoices" pt="md">
              <Alert color="blue" title="Invoices">
                Invoice management is handled in the Billing module. This section shows financial
                overview of invoices.
              </Alert>
            </Tabs.Panel>

            <Tabs.Panel value="payments" pt="md">
              <Alert color="blue" title="Payments">
                Payment management is handled in the Billing module. This section shows financial
                overview of payments.
              </Alert>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>

      {/* Transaction Form Modal */}
      <FinanceTransactionForm
        opened={transactionFormOpened}
        onClose={closeTransactionForm}
        transaction={selectedTransaction}
        onSubmit={selectedTransaction ? handleUpdateTransaction : handleCreateTransaction}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <FinanceTransactionDetails
          opened={detailsOpened}
          onClose={closeDetails}
          transaction={selectedTransaction}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </Layout>
  );
}

export default FinancePage;
