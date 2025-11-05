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
  ActionIcon,
  Menu,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconFileText,
  IconCheck,
  IconClock,
  IconCurrency,
  IconEdit,
  IconEye,
  IconDotsVertical,
  IconAlertCircle,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import InsuranceClaimForm from '../../components/insurance/InsuranceClaimForm';
import InsuranceClaimDetails from '../../components/insurance/InsuranceClaimDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import insuranceService from '../../services/insurance.service';
import type {
  CreateInsuranceClaimDto,
  UpdateInsuranceClaimDto,
  InsuranceFilters,
} from '../../services/insurance.service';

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

function InsurancePage() {
  const { user, setUser } = useAppStore();
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [claimFormOpened, { open: openClaimForm, close: closeClaimForm }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchClaims();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const filters: InsuranceFilters = {
        page: 1,
        limit: 100,
      };
      if (statusFilter) filters.status = statusFilter;

      const response = await insuranceService.getClaims(filters);
      if (response.success && response.data) {
        let filteredClaims = response.data.items;

        // Apply search filter
        if (searchQuery) {
          filteredClaims = filteredClaims.filter(
            (c) =>
              `${c.patient?.firstName} ${c.patient?.lastName}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              c.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (c.claimNumber && c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
              c.insuranceProvider.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setClaims(filteredClaims);
      }
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      notifications.show({
        title: 'Error Loading Claims',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch insurance claims. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await insuranceService.getStats();
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
          'Failed to fetch insurance statistics. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleCreateClaim = async (data: CreateInsuranceClaimDto) => {
    try {
      const response = await insuranceService.createClaim(data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Insurance claim created successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeClaimForm();
        fetchClaims();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating claim:', error);
      notifications.show({
        title: 'Error Creating Claim',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create insurance claim. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleUpdateClaim = async (data: UpdateInsuranceClaimDto) => {
    if (!selectedClaim) return;

    try {
      const response = await insuranceService.updateClaim(selectedClaim.id, data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Insurance claim updated successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeClaimForm();
        setSelectedClaim(null);
        fetchClaims();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating claim:', error);
      notifications.show({
        title: 'Error Updating Claim',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update insurance claim. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleStatusChange = async (claim: any, status: string) => {
    try {
      const response = await insuranceService.updateClaimStatus(claim.id, status as any);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Claim status updated successfully',
          color: 'green',
          autoClose: 3000,
        });

        fetchClaims();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      notifications.show({
        title: 'Error Updating Status',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update claim status. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim);
    openDetails();
  };

  const handleEditClaim = (claim: any) => {
    setSelectedClaim(claim);
    openClaimForm();
  };

  const handleNewClaim = () => {
    setSelectedClaim(null);
    openClaimForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'blue';
      case 'UNDER_REVIEW':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PAID':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatProvider = (provider: string) => {
    return provider.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const claimColumns: TableColumn[] = [
    {
      key: 'claimNumber',
      title: 'Claim #',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return <Text fw={500}>{claim.claimNumber || 'N/A'}</Text>;
      },
    },
    {
      key: 'patient',
      title: 'Patient',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return (
          <div>
            <Text fw={600}>
              {claim.patient?.firstName} {claim.patient?.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {claim.policyNumber}
            </Text>
          </div>
        );
      },
    },
    {
      key: 'insuranceProvider',
      title: 'Provider',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return <Text>{formatProvider(claim.insuranceProvider)}</Text>;
      },
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return (
          <Text fw={600} c="blue">
            {formatCurrency(claim.amount)}
          </Text>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return (
          <Badge color={getStatusColor(claim.status)}>{claim.status.replace(/_/g, ' ')}</Badge>
        );
      },
    },
    {
      key: 'submittedAt',
      title: 'Submitted',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return <Text size="sm">{formatDate(claim.submittedAt)}</Text>;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, record: Record<string, unknown>) => {
        const claim = record as any;
        return (
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => handleViewClaim(claim)}>
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => handleEditClaim(claim)}>
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
                  onClick={() => handleViewClaim(claim)}
                >
                  View Details
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleEditClaim(claim)}
                >
                  Edit Claim
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        );
      },
    },
  ];

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
              <Title order={2}>Insurance Management</Title>
              <Text c="dimmed" size="sm">
                Manage insurance claims and track reimbursements
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewClaim}>
              New Claim
            </Button>
          </Group>

          {/* Statistics Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Claims
                  </Text>
                  <Text fw={700} size="xl">
                    {stats?.total || 0}
                  </Text>
                </div>
                <IconFileText size={32} color="#228be6" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Submitted
                  </Text>
                  <Text fw={700} size="xl" c="blue">
                    {stats?.submitted || 0}
                  </Text>
                </div>
                <IconClock size={32} color="#228be6" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Approved
                  </Text>
                  <Text fw={700} size="xl" c="green">
                    {stats?.approved || 0}
                  </Text>
                </div>
                <IconCheck size={32} color="#40c057" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Paid
                  </Text>
                  <Text fw={700} size="xl" c="teal">
                    {stats?.paid || 0}
                  </Text>
                </div>
                <IconCheck size={32} color="#20c997" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Paid
                  </Text>
                  <Text fw={700} size="xl" c="teal">
                    {formatCurrency(stats?.totalAmount || 0)}
                  </Text>
                </div>
                <IconCurrency size={32} color="#20c997" />
              </Group>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Paper withBorder p="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  placeholder="Search claims..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                  placeholder="Filter by status"
                  data={[
                    { value: '', label: 'All Status' },
                    { value: 'SUBMITTED', label: 'Submitted' },
                    { value: 'UNDER_REVIEW', label: 'Under Review' },
                    { value: 'APPROVED', label: 'Approved' },
                    { value: 'REJECTED', label: 'Rejected' },
                    { value: 'PAID', label: 'Paid' },
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || '')}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Button fullWidth onClick={fetchClaims}>
                  Apply Filters
                </Button>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Claims Table */}
          <Paper withBorder>
            <LoadingOverlay visible={loading} />
            {claims.length === 0 && !loading ? (
              <Alert icon={<IconAlertCircle size={16} />} title="No claims found" color="blue">
                No insurance claims match your current filters. Try adjusting your search criteria.
              </Alert>
            ) : (
              <DataTable columns={claimColumns} data={claims} loading={loading} />
            )}
          </Paper>
        </Stack>
      </Container>

      {/* Claim Form Modal */}
      <InsuranceClaimForm
        opened={claimFormOpened}
        onClose={closeClaimForm}
        claim={selectedClaim}
        onSubmit={selectedClaim ? handleUpdateClaim : handleCreateClaim}
      />

      {/* Claim Details Modal */}
      {selectedClaim && (
        <InsuranceClaimDetails
          opened={detailsOpened}
          onClose={closeDetails}
          claim={selectedClaim}
          onEdit={handleEditClaim}
          onStatusChange={handleStatusChange}
        />
      )}
    </Layout>
  );
}

export default InsurancePage;
