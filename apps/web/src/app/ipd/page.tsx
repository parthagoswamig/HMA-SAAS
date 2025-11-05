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
  Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconBedFilled,
  IconHome,
  IconCheck,
  IconX,
  IconEdit,
  IconEye,
  IconDotsVertical,
  IconAlertCircle,
  IconSettings,
  IconClock,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import WardForm from '../../components/ipd/WardForm';
import BedForm from '../../components/ipd/BedForm';
import WardDetails from '../../components/ipd/WardDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import ipdService from '../../services/ipd.service';
import type {
  CreateWardDto,
  UpdateWardDto,
  CreateBedDto,
  WardFilters,
  BedFilters,
} from '../../services/ipd.service';

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

function IpdPage() {
  const { user, setUser } = useAppStore();
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('wards');

  const [wardFormOpened, { open: openWardForm, close: closeWardForm }] = useDisclosure(false);
  const [bedFormOpened, { open: openBedForm, close: closeBedForm }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchWards();
    fetchBeds();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const filters: WardFilters = {
        page: 1,
        limit: 100,
      };

      const response = await ipdService.getWards(filters);
      if (response.success && response.data) {
        let filteredWards = response.data.items;

        // Apply search filter
        if (searchQuery) {
          filteredWards = filteredWards.filter(
            (w) =>
              w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (w.location && w.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        setWards(filteredWards);
      }
    } catch (error: any) {
      console.error('Error fetching wards:', error);
      notifications.show({
        title: 'Error Loading Wards',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch wards. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const filters: BedFilters = {
        page: 1,
        limit: 100,
      };
      if (wardFilter) filters.wardId = wardFilter;
      if (statusFilter) filters.status = statusFilter;

      const response = await ipdService.getBeds(filters);
      if (response.success && response.data) {
        let filteredBeds = response.data.items;

        // Apply search filter
        if (searchQuery) {
          filteredBeds = filteredBeds.filter(
            (b) =>
              b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (b.ward && b.ward.name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        setBeds(filteredBeds);
      }
    } catch (error: any) {
      console.error('Error fetching beds:', error);
      notifications.show({
        title: 'Error Loading Beds',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch beds. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ipdService.getStats();
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
          'Failed to fetch IPD statistics. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleCreateWard = async (data: CreateWardDto) => {
    try {
      const response = await ipdService.createWard(data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Ward created successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeWardForm();
        fetchWards();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating ward:', error);
      notifications.show({
        title: 'Error Creating Ward',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create ward. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleUpdateWard = async (data: UpdateWardDto) => {
    if (!selectedWard) return;

    try {
      const response = await ipdService.updateWard(selectedWard.id, data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Ward updated successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeWardForm();
        setSelectedWard(null);
        fetchWards();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating ward:', error);
      notifications.show({
        title: 'Error Updating Ward',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update ward. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleCreateBed = async (data: CreateBedDto) => {
    try {
      const response = await ipdService.createBed(data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Bed created successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeBedForm();
        fetchBeds();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating bed:', error);
      notifications.show({
        title: 'Error Creating Bed',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create bed. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleUpdateBedStatus = async (bed: any, status: string) => {
    try {
      const response = await ipdService.updateBedStatus(bed.id, { status: status as any });

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Bed status updated successfully',
          color: 'green',
          autoClose: 3000,
        });

        fetchBeds();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating bed status:', error);
      notifications.show({
        title: 'Error Updating Status',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update bed status. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleViewWard = (ward: any) => {
    setSelectedWard(ward);
    openDetails();
  };

  const handleEditWard = (ward: any) => {
    setSelectedWard(ward);
    openWardForm();
  };

  const handleNewWard = () => {
    setSelectedWard(null);
    openWardForm();
  };

  const handleNewBed = () => {
    setSelectedBed(null);
    openBedForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'OCCUPIED':
        return 'red';
      case 'MAINTENANCE':
        return 'yellow';
      case 'RESERVED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const wardColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Ward Name',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const ward = record as any;
        return (
          <div>
            <Text fw={600}>{ward.name}</Text>
            <Text size="xs" c="dimmed">
              {ward.location || 'No location'}
            </Text>
          </div>
        );
      },
    },
    {
      key: 'capacity',
      title: 'Capacity',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const ward = record as any;
        return <Text fw={500}>{ward.capacity} beds</Text>;
      },
    },
    {
      key: 'beds',
      title: 'Beds',
      render: (value: unknown, record: Record<string, unknown>) => {
        const ward = record as any;
        const totalBeds = ward._count?.beds || 0;
        const occupied = ward.beds?.filter((b: any) => b.status === 'OCCUPIED').length || 0;
        const available = ward.beds?.filter((b: any) => b.status === 'AVAILABLE').length || 0;
        return (
          <div>
            <Text size="sm">Total: {totalBeds}</Text>
            <Group gap="xs">
              <Badge size="xs" color="green">
                Avail: {available}
              </Badge>
              <Badge size="xs" color="red">
                Occup: {occupied}
              </Badge>
            </Group>
          </div>
        );
      },
    },
    {
      key: 'floor',
      title: 'Floor',
      render: (value: unknown, record: Record<string, unknown>) => {
        const ward = record as any;
        return <Text size="sm">{ward.floor || '-'}</Text>;
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const ward = record as any;
        return (
          <Badge color={ward.isActive ? 'green' : 'red'}>
            {ward.isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, record: Record<string, unknown>) => {
        const ward = record as any;
        return (
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => handleViewWard(ward)}>
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => handleEditWard(ward)}>
              <IconEdit size={16} />
            </ActionIcon>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleViewWard(ward)}>
                  View Details
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleEditWard(ward)}
                >
                  Edit Ward
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        );
      },
    },
  ];

  const bedColumns: TableColumn[] = [
    {
      key: 'bedNumber',
      title: 'Bed Number',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const bed = record as any;
        return <Text fw={600}>{bed.bedNumber}</Text>;
      },
    },
    {
      key: 'ward',
      title: 'Ward',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const bed = record as any;
        return (
          <div>
            <Text fw={500}>{bed.ward?.name || 'N/A'}</Text>
            <Text size="xs" c="dimmed">
              {bed.ward?.location || ''}
            </Text>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const bed = record as any;
        return <Badge color={getStatusColor(bed.status)}>{bed.status}</Badge>;
      },
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: unknown, record: Record<string, unknown>) => {
        const bed = record as any;
        return <Text size="sm">{bed.description || '-'}</Text>;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, record: Record<string, unknown>) => {
        const bed = record as any;
        return (
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Change Status</Menu.Label>
              <Menu.Item
                leftSection={<IconCheck size={14} />}
                onClick={() => handleUpdateBedStatus(bed, 'AVAILABLE')}
                disabled={bed.status === 'AVAILABLE'}
              >
                Mark Available
              </Menu.Item>
              <Menu.Item
                leftSection={<IconX size={14} />}
                onClick={() => handleUpdateBedStatus(bed, 'OCCUPIED')}
                disabled={bed.status === 'OCCUPIED'}
              >
                Mark Occupied
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => handleUpdateBedStatus(bed, 'MAINTENANCE')}
                disabled={bed.status === 'MAINTENANCE'}
              >
                Mark Maintenance
              </Menu.Item>
              <Menu.Item
                leftSection={<IconClock size={14} />}
                onClick={() => handleUpdateBedStatus(bed, 'RESERVED')}
                disabled={bed.status === 'RESERVED'}
              >
                Mark Reserved
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        );
      },
    },
  ];

  const layoutUser = user || mockUser;
  const userForLayout = {
    id: layoutUser.id,
    name: `${layoutUser.firstName} ${layoutUser.lastName}`,
    email: layoutUser.email,
    role: layoutUser.role,
  };

  return (
    <Layout user={userForLayout} notifications={0} onLogout={() => {}}>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>IPD Management</Title>
              <Text c="dimmed" size="sm">
                Manage in-patient wards and beds
              </Text>
            </div>
            <Group>
              <Button leftSection={<IconHome size={16} />} onClick={handleNewWard}>
                New Ward
              </Button>
              <Button leftSection={<IconBedFilled size={16} />} onClick={handleNewBed}>
                New Bed
              </Button>
            </Group>
          </Group>

          {/* Statistics Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Wards
                  </Text>
                  <Text fw={700} size="xl">
                    {stats?.wards?.total || 0}
                  </Text>
                </div>
                <IconHome size={32} color="#228be6" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Beds
                  </Text>
                  <Text fw={700} size="xl">
                    {stats?.beds?.total || 0}
                  </Text>
                </div>
                <IconBedFilled size={32} color="#228be6" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Available
                  </Text>
                  <Text fw={700} size="xl" c="green">
                    {stats?.beds?.available || 0}
                  </Text>
                </div>
                <IconCheck size={32} color="#40c057" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Occupied
                  </Text>
                  <Text fw={700} size="xl" c="red">
                    {stats?.beds?.occupied || 0}
                  </Text>
                </div>
                <IconX size={32} color="#fa5252" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Occupancy Rate
                  </Text>
                  <Text fw={700} size="xl" c="blue">
                    {stats?.occupancyRate || 0}%
                  </Text>
                </div>
                <IconBedFilled size={32} color="#228be6" />
              </Group>
            </Card>
          </SimpleGrid>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="wards" leftSection={<IconHome size={16} />}>
                Wards
              </Tabs.Tab>
              <Tabs.Tab value="beds" leftSection={<IconBedFilled size={16} />}>
                Beds
              </Tabs.Tab>
            </Tabs.List>

            {/* Wards Tab */}
            <Tabs.Panel value="wards" pt="md">
              <Stack gap="md">
                {/* Filters */}
                <Paper withBorder p="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                      <TextInput
                        placeholder="Search wards..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                      <Button fullWidth onClick={fetchWards}>
                        Apply Filters
                      </Button>
                    </Grid.Col>
                  </Grid>
                </Paper>

                {/* Wards Table */}
                <Paper withBorder>
                  <LoadingOverlay visible={loading} />
                  {wards.length === 0 && !loading ? (
                    <Alert icon={<IconAlertCircle size={16} />} title="No wards found" color="blue">
                      No wards match your current filters. Try adjusting your search criteria.
                    </Alert>
                  ) : (
                    <DataTable columns={wardColumns} data={wards} loading={loading} />
                  )}
                </Paper>
              </Stack>
            </Tabs.Panel>

            {/* Beds Tab */}
            <Tabs.Panel value="beds" pt="md">
              <Stack gap="md">
                {/* Filters */}
                <Paper withBorder p="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <TextInput
                        placeholder="Search beds..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Select
                        placeholder="Filter by ward"
                        data={[
                          { value: '', label: 'All Wards' },
                          ...wards.map((w) => ({ value: w.id, label: w.name })),
                        ]}
                        value={wardFilter}
                        onChange={(value) => setWardFilter(value || '')}
                        clearable
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Select
                        placeholder="Filter by status"
                        data={[
                          { value: '', label: 'All Status' },
                          { value: 'AVAILABLE', label: 'Available' },
                          { value: 'OCCUPIED', label: 'Occupied' },
                          { value: 'MAINTENANCE', label: 'Maintenance' },
                          { value: 'RESERVED', label: 'Reserved' },
                        ]}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value || '')}
                        clearable
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Button fullWidth onClick={fetchBeds}>
                        Apply Filters
                      </Button>
                    </Grid.Col>
                  </Grid>
                </Paper>

                {/* Beds Table */}
                <Paper withBorder>
                  <LoadingOverlay visible={loading} />
                  {beds.length === 0 && !loading ? (
                    <Alert icon={<IconAlertCircle size={16} />} title="No beds found" color="blue">
                      No beds match your current filters. Try adjusting your search criteria.
                    </Alert>
                  ) : (
                    <DataTable columns={bedColumns} data={beds} loading={loading} />
                  )}
                </Paper>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>

      {/* Ward Form Modal */}
      <WardForm
        opened={wardFormOpened}
        onClose={closeWardForm}
        ward={selectedWard}
        onSubmit={selectedWard ? handleUpdateWard : handleCreateWard}
      />

      {/* Bed Form Modal */}
      <BedForm
        opened={bedFormOpened}
        onClose={closeBedForm}
        bed={selectedBed}
        onSubmit={handleCreateBed}
      />

      {/* Ward Details Modal */}
      {selectedWard && (
        <WardDetails
          opened={detailsOpened}
          onClose={closeDetails}
          ward={selectedWard}
          onEdit={handleEditWard}
        />
      )}
    </Layout>
  );
}

export default IpdPage;
