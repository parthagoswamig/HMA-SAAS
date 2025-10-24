'use client';

import { useState, useEffect } from 'react';
import { tenantsService } from '@/services/tenants.service';
import {
  Card,
  Title,
  Text,
  Stack,
  Badge,
  Group,
  Button,
  Table,
  TextInput,
  Select,
  Modal,
  Tabs,
  Progress,
  ActionIcon,
} from '@mantine/core';
import {
  IconBuilding,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconSearch,
  IconUsers,
  IconCreditCard,
  IconSettings,
} from '@tabler/icons-react';

type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'INACTIVE';
type SubscriptionPlan = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionEndDate: string;
  users: number;
  patients: number;
  createdAt: string;
  contactEmail: string;
}

export default function TenantsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    totalUsers: 0,
  });

  // Fetch tenants from API
  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantsService.getAllTenants(1, 100, statusFilter || undefined);
      const tenantsData = response.data?.items || [];
      setTenants(tenantsData);

      // Calculate stats
      setStats({
        total: tenantsData.length,
        active: tenantsData.filter((t: any) => t.isActive).length,
        trial: tenantsData.filter((t: any) => t.status === 'TRIAL').length,
        totalUsers: tenantsData.reduce((sum: number, t: any) => sum + (t.users || 0), 0),
      });
    } catch (err: any) {
      console.error('Failed to fetch tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock fallback data for development
  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'City General Hospital',
      slug: 'city-general',
      type: 'HOSPITAL',
      status: 'ACTIVE',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionEndDate: '2025-12-31',
      users: 125,
      patients: 5420,
      createdAt: '2024-01-15',
      contactEmail: 'admin@citygeneral.com',
    },
    {
      id: '2',
      name: 'Metro Clinic',
      slug: 'metro-clinic',
      type: 'CLINIC',
      status: 'TRIAL',
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionEndDate: '2024-04-01',
      users: 15,
      patients: 450,
      createdAt: '2024-03-01',
      contactEmail: 'contact@metroclinic.com',
    },
    {
      id: '3',
      name: 'Care Plus Medical Center',
      slug: 'care-plus',
      type: 'HOSPITAL',
      status: 'ACTIVE',
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionEndDate: '2025-06-30',
      users: 80,
      patients: 3200,
      createdAt: '2024-02-10',
      contactEmail: 'info@careplus.com',
    },
    {
      id: '4',
      name: 'Quick Care Clinic',
      slug: 'quick-care',
      type: 'CLINIC',
      status: 'SUSPENDED',
      subscriptionPlan: 'BASIC',
      subscriptionEndDate: '2024-03-01',
      users: 8,
      patients: 120,
      createdAt: '2023-11-20',
      contactEmail: 'admin@quickcare.com',
    },
  ];

  const getStatusColor = (status: TenantStatus) => {
    const colors = {
      ACTIVE: 'green',
      TRIAL: 'yellow',
      SUSPENDED: 'red',
      INACTIVE: 'gray',
    };
    return colors[status];
  };

  const getPlanColor = (plan: SubscriptionPlan) => {
    const colors = {
      FREE: 'gray',
      BASIC: 'blue',
      PROFESSIONAL: 'violet',
      ENTERPRISE: 'grape',
    };
    return colors[plan];
  };

  // Use mock data if API fails or is empty
  const displayTenants = tenants.length > 0 ? tenants : mockTenants;

  const filteredTenants = displayTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    { label: 'Total Tenants', value: stats.total, icon: IconBuilding, color: '#667eea' },
    { label: 'Active', value: stats.active, icon: IconBuilding, color: '#10b981' },
    { label: 'Trial', value: stats.trial, icon: IconBuilding, color: '#f59e0b' },
    { label: 'Total Users', value: stats.totalUsers, icon: IconUsers, color: '#3b82f6' },
  ];

  return (
    <Stack gap="xl">
      {/* Header */}
      <div>
        <Title order={2} mb="xs">
          Tenant Management
        </Title>
        <Text c="dimmed">Manage all hospitals and clinics using your platform</Text>
      </div>

      {/* Error Display */}
      {error && (
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: '#ef4444' }}>
          <Text c="red" size="sm">
            {error}
          </Text>
        </Card>
      )}

      {/* Stats Overview */}
      <Group>
        {statsCards.map((stat, idx) => (
          <Card key={idx} shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
            <Group justify="apart">
              <div>
                <Text size="sm" c="dimmed">
                  {stat.label}
                </Text>
                <Title order={3}>{stat.value}</Title>
              </div>
              <stat.icon size={32} color={stat.color} />
            </Group>
          </Card>
        ))}
      </Group>

      {/* Filters and Actions */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group style={{ flex: 1 }}>
            <TextInput
              placeholder="Search tenants..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, maxWidth: '400px' }}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'all', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'TRIAL', label: 'Trial' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '200px' }}
            />
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Add New Tenant
          </Button>
        </Group>

        {/* Loading State */}
        {loading && (
          <Text ta="center" c="dimmed" py="xl">
            Loading tenants...
          </Text>
        )}

        {/* Tenants Table */}
        {!loading && (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tenant</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Plan</Table.Th>
                <Table.Th>Users/Patients</Table.Th>
                <Table.Th>Subscription End</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTenants.map((tenant) => (
                <Table.Tr key={tenant.id}>
                  <Table.Td>
                    <div>
                      <Text fw={600}>{tenant.name}</Text>
                      <Text size="xs" c="dimmed">
                        {tenant.slug}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>{tenant.type}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(tenant.status)} variant="light">
                      {tenant.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getPlanColor(tenant.subscriptionPlan)} variant="filled">
                      {tenant.subscriptionPlan}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {tenant.users} / {tenant.patients}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(tenant.subscriptionEndDate).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="orange">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Tenant Details Modal */}
      <Modal
        opened={selectedTenant !== null}
        onClose={() => setSelectedTenant(null)}
        title={<Title order={3}>{selectedTenant?.name}</Title>}
        size="lg"
      >
        {selectedTenant && (
          <Tabs defaultValue="details">
            <Tabs.List>
              <Tabs.Tab value="details" leftSection={<IconBuilding size={16} />}>
                Details
              </Tabs.Tab>
              <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                Users
              </Tabs.Tab>
              <Tabs.Tab value="subscription" leftSection={<IconCreditCard size={16} />}>
                Subscription
              </Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
                Settings
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="details" pt="md">
              <Stack gap="sm">
                <div>
                  <Text size="sm" c="dimmed">
                    Contact Email
                  </Text>
                  <Text fw={500}>{selectedTenant.contactEmail}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Created Date
                  </Text>
                  <Text fw={500}>{new Date(selectedTenant.createdAt).toLocaleDateString()}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Total Users
                  </Text>
                  <Text fw={500}>{selectedTenant.users}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Total Patients
                  </Text>
                  <Text fw={500}>{selectedTenant.patients}</Text>
                </div>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="subscription" pt="md">
              <Stack gap="md">
                <div>
                  <Text size="sm" c="dimmed" mb="xs">
                    Current Plan
                  </Text>
                  <Badge size="lg" color={getPlanColor(selectedTenant.subscriptionPlan)}>
                    {selectedTenant.subscriptionPlan}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">
                    Subscription End Date
                  </Text>
                  <Text fw={600}>
                    {new Date(selectedTenant.subscriptionEndDate).toLocaleDateString()}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed" mb="xs">
                    Usage
                  </Text>
                  <div>
                    <Text size="xs" mb={4}>
                      Users: {selectedTenant.users} / 150
                    </Text>
                    <Progress value={(selectedTenant.users / 150) * 100} color="blue" />
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Text size="xs" mb={4}>
                      Patients: {selectedTenant.patients} / 10000
                    </Text>
                    <Progress value={(selectedTenant.patients / 10000) * 100} color="green" />
                  </div>
                </div>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>

      {/* Create Tenant Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={<Title order={3}>Add New Tenant</Title>}
        size="md"
      >
        <Text c="dimmed" mb="md">
          This will be connected to the tenant registration API endpoint
        </Text>
        <Stack gap="md">
          <TextInput label="Hospital/Clinic Name" placeholder="Enter name" required />
          <TextInput label="Slug" placeholder="hospital-name" required />
          <Select
            label="Type"
            placeholder="Select type"
            data={[
              { value: 'HOSPITAL', label: 'Hospital' },
              { value: 'CLINIC', label: 'Clinic' },
              { value: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
            ]}
            required
          />
          <Select
            label="Subscription Plan"
            placeholder="Select plan"
            data={[
              { value: 'FREE', label: 'Free' },
              { value: 'BASIC', label: 'Basic' },
              { value: 'PROFESSIONAL', label: 'Professional' },
              { value: 'ENTERPRISE', label: 'Enterprise' },
            ]}
            required
          />
          <TextInput label="Admin Email" placeholder="admin@example.com" type="email" required />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              Create Tenant
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
