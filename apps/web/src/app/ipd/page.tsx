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

// User will be fetched from app store

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
    fetchWards();
    fetchBeds();
    fetchStats();
  }, []);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const filters: WardFilters = {
        search: searchQuery || undefined,
        limit: 100,
      };
      const response = await ipdService.getWards(filters);
      if (response.success && response.data) {
        setWards(response.data.items || []);
      }
    } catch (error: any) {
      console.error('Error fetching wards:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to fetch wards',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBeds = async () => {
    try {
      const filters: BedFilters = {
        wardId: wardFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        limit: 100,
      };
      const response = await ipdService.getBeds(filters);
      if (response.success && response.data) {
        setBeds(response.data.items || []);
      }
    } catch (error: any) {
      console.error('Error fetching beds:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to fetch beds',
        color: 'red',
      });
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
      // Set default stats on error
      setStats({
        totalWards: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        occupancyRate: 0,
      });
      notifications.show({
        title: 'Error Loading Statistics',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch IPD statistics. Please try again.',
        color: 'red',
      });
    }
  };

  const handleSubmitWard = async (data: CreateWardDto | UpdateWardDto) => {
    try {
      let response;
      if (selectedWard) {
        response = await ipdService.updateWard(selectedWard.id, data as UpdateWardDto);
      } else {
        response = await ipdService.createWard(data as CreateWardDto);
      }
      
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: selectedWard ? 'Ward updated successfully' : 'Ward created successfully',
          color: 'green',
        });
        fetchWards();
        fetchStats();
        closeWardForm();
        setSelectedWard(null);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save ward',
        color: 'red',
      });
    }
  };

  const handleSubmitBed = async (data: CreateBedDto) => {
    try {
      const response = await ipdService.createBed(data);
      
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Bed added successfully',
          color: 'green',
        });
        fetchBeds();
        fetchStats();
        closeBedForm();
        setSelectedBed(null);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to add bed',
        color: 'red',
      });
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
        });
        fetchBeds();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating bed status:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update bed status',
        color: 'red',
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
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => {
                setSelectedWard(ward);
                openDetails();
              }}
              title="View Details"
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => {
                setSelectedWard(ward);
                openWardForm();
              }}
              title="Edit Ward"
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this ward?')) {
                  try {
                    await ipdService.deleteWard(ward.id);
                    notifications.show({
                      title: 'Success',
                      message: 'Ward deleted successfully',
                      color: 'green',
                    });
                    fetchWards();
                    fetchStats();
                  } catch (error: any) {
                    notifications.show({
                      title: 'Error',
                      message: error?.response?.data?.message || 'Failed to delete ward',
                      color: 'red',
                    });
                  }
                }
              }}
              title="Delete Ward"
            >
              <IconX size={16} />
            </ActionIcon>
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

  const layoutUser = user || {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hospital.com',
    role: 'ADMIN',
  };
  const userForLayout = {
    id: layoutUser.id,
    name: `${layoutUser.firstName} ${layoutUser.lastName}`,
    email: layoutUser.email,
    role: layoutUser.role as any,
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
        onSubmit={handleSubmitWard}
      />

      {/* Bed Form Modal */}
      <BedForm
        opened={bedFormOpened}
        onClose={closeBedForm}
        bed={selectedBed}
        onSubmit={handleSubmitBed}
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
