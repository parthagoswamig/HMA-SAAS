'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Table,
  Modal,
  Text,
  Tabs,
  Card,
  Avatar,
  ActionIcon,
  Menu,
  Stack,
  Divider,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Alert,
  NumberInput,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  MantineDonutChart,
  SimpleBarChart,
  SimpleAreaChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconTestPipe,
  IconChartBar,
  IconAlertCircle,
  IconCheck,
  IconDotsVertical,
  IconFlask,
  IconMicroscope,
  IconClipboardList,
  IconFileText,
  IconDownload,
  IconDroplet,
  IconDna,
  IconClockHour4,
  IconBarcode,
  IconTemperature,
  IconShieldCheck,
  IconAlertTriangle,
  IconClipboard,
  IconReportMedical,
  IconAtom,
  IconSettings,
} from '@tabler/icons-react';

// Import types, services and mock data
import { LabTest, TestCategory, LabOrder, Sample } from '../../../types/laboratory';
import laboratoryService from '../../../services/laboratory.service';
// Mock data imports removed
const LaboratoryManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [_selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [_selectedSample, setSelectedSample] = useState<Sample | null>(null);

  // API data state
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labStats, setLabStats] = useState<any>(null);
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);

  // Modal states
  const [testDetailOpened, { open: openTestDetail, close: closeTestDetail }] = useDisclosure(false);
  const [addTestOpened, { open: openAddTest, close: closeAddTest }] = useDisclosure(false);
  const [_orderDetailOpened, { open: _openOrderDetail, close: _closeOrderDetail }] =
    useDisclosure(false);
  const [_addOrderOpened, { open: _openAddOrder, close: _closeAddOrder }] = useDisclosure(false);
  const [_sampleDetailOpened, { open: _openSampleDetail, close: _closeSampleDetail }] =
    useDisclosure(false);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      _setLoading(true);
      _setError(null);
      await Promise.all([fetchLabTests(), fetchLabOrders(), fetchLabStats()]);
    } catch (err: any) {
      console.error('Error loading laboratory data:', err);
      _setError(err.response?.data?.message || err.message || 'Failed to load laboratory data');
      // Fallback to mock data
      setLabTests([] /* TODO: Fetch from API */);
      setLabOrders([] /* TODO: Fetch from API */);
    } finally {
      _setLoading(false);
    }
  };

  const fetchLabTests = async () => {
    try {
      const filters = {
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      };
      const response = (await laboratoryService.getLabTests(filters)) as any;
      setLabTests(response.data?.items || response.data || []);
    } catch (err: any) {
      console.warn('Error fetching lab tests (using empty data):', err.message || err);
      setLabTests([]);
    }
  };

  const fetchLabOrders = async () => {
    try {
      const filters = {
        patientId: selectedPatient || undefined,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
      };
      const response = (await laboratoryService.getLabOrders(filters)) as any;
      setLabOrders(response.data?.items || response.data || []);
    } catch (err: any) {
      console.warn('Error fetching lab orders (using empty data):', err.message || err);
      setLabOrders([]);
    }
  };

  const fetchLabStats = async () => {
    try {
      const response = (await laboratoryService.getLabStats()) as any;
      setLabStats(response.data);
    } catch (err: any) {
      console.warn('Error fetching lab stats (using default values):', err.message || err);
      setLabStats({
        totalTests: 0,
        pendingTests: 0,
        completedTests: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
      });
    }
  };

  // Refetch when filters change
  useEffect(() => {
    if (!_loading) {
      if (activeTab === 'tests') {
        fetchLabTests();
      } else if (activeTab === 'orders') {
        fetchLabOrders();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery, selectedCategory, selectedStatus, selectedPatient]);

  // Filter lab tests
  const filteredTests = useMemo(() => {
    return labTests.filter((test) => {
      const matchesSearch =
        test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.testCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || test.category === selectedCategory;
      const matchesStatus = !selectedStatus || test.status === selectedStatus;
      const matchesType = !selectedType || test.testType === selectedType;

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedStatus, selectedType, labTests]);

  // Filter lab orders
  const filteredOrders = useMemo(() => {
    return labOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !selectedStatus || order.status === selectedStatus;
      const matchesPatient = !selectedPatient || order.patientId === selectedPatient;

      return matchesSearch && matchesStatus && matchesPatient;
    });
  }, [searchQuery, selectedStatus, selectedPatient, labOrders]);

  // Filter samples
  const filteredSamples = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (sample) => {
        const matchesSearch =
          sample.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sample.patientName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedStatus || sample.status === selectedStatus;
        const matchesType = !selectedType || sample.sampleType === selectedType;

        return matchesSearch && matchesStatus && matchesType;
      }
    );
  }, [searchQuery, selectedStatus, selectedType]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'processed':
      case 'operational':
      case 'passed':
        return 'green';
      case 'pending':
      case 'in_progress':
      case 'collected':
      case 'maintenance':
      case 'in_review':
        return 'orange';
      case 'cancelled':
      case 'rejected':
      case 'contaminated':
      case 'out_of_service':
      case 'failed':
        return 'red';
      case 'draft':
      case 'ordered':
      case 'received':
      case 'calibration':
        return 'blue';
      case 'expired':
        return 'dark';
      default:
        return 'gray';
    }
  };

  const getCategoryColor = (category: TestCategory) => {
    switch (category) {
      case 'hematology':
        return 'red';
      case 'biochemistry':
        return 'blue';
      case 'microbiology':
        return 'green';
      case 'immunology':
        return 'purple';
      case 'pathology':
        return 'orange';
      case 'molecular':
        return 'cyan';
      case 'genetics':
        return 'pink';
      default:
        return 'gray';
    }
  };

  const getCategoryIcon = (category: TestCategory) => {
    switch (category) {
      case 'hematology':
        return <IconDroplet size={16} />;
      case 'biochemistry':
        return <IconFlask size={16} />;
      case 'microbiology':
        return <IconMicroscope size={16} />;
      case 'immunology':
        return <IconShieldCheck size={16} />;
      case 'pathology':
        return <IconReportMedical size={16} />;
      case 'molecular':
        return <IconDna size={16} />;
      case 'genetics':
        return <IconAtom size={16} />;
      default:
        return <IconTestPipe size={16} />;
    }
  };

  const handleViewTest = (test: LabTest) => {
    setSelectedTest(test);
    openTestDetail();
  };

  const _handleViewOrder = (order: LabOrder) => {
    setSelectedOrder(order);
    _openOrderDetail();
  };

  const _handleViewSample = (sample: Sample) => {
    setSelectedSample(sample);
    _openSampleDetail();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedPatient('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Tests',
      value: labStats?.totalTests || 0 /* TODO: Fetch from API */,
      icon: IconTestPipe,
      color: 'blue',
      trend: '+0%',
    },
    {
      title: 'Pending Results',
      value: labStats?.pendingTests || 0 /* TODO: Fetch from API */,
      icon: IconClockHour4,
      color: 'orange',
      trend: '0%',
    },
    {
      title: 'Completed Today',
      value: labStats?.completedToday || 0,
      icon: IconCheck,
      color: 'green',
      trend: '+0%',
    },
    {
      title: 'Equipment Status',
      value:
        labStats?.equipmentOperational && labStats?.totalEquipment
          ? `${labStats.equipmentOperational}/${labStats.totalEquipment}`
          : `${0 /* TODO: Fetch from API */}/${0 /* TODO: Fetch from API */}`,
      icon: IconSettings,
      color: 'purple',
      trend: '0%',
    },
  ];

  // Chart data
  const testCategoryData =
    labStats?.testsByCategory && typeof labStats.testsByCategory === 'object'
      ? Object.entries(labStats.testsByCategory).map(([category, count]) => ({
          name: category.replace('_', ' ').toUpperCase(),
          value: count as number,
          color: getCategoryColor(category as TestCategory),
        }))
      : [];

  const dailyTestsData = Array.isArray(labStats?.dailyTestVolume) ? labStats.dailyTestVolume : [];
  const turnaroundTimeData = Array.isArray(labStats?.averageTurnaroundTime)
    ? labStats.averageTurnaroundTime
    : [];

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <Title order={1} className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">Laboratory Management</Title>
          <Text c="dimmed" className="text-xs sm:text-sm">
            Manage lab tests, samples, results, and equipment
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button leftSection={<IconPlus size={16} />} onClick={openAddTest} className="w-full sm:w-auto" size="sm">
            Add Test
          </Button>
          <Button variant="light" leftSection={<IconFlask size={16} />} onClick={_openAddOrder} className="w-full sm:w-auto" size="sm">
            New Order
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {_loading && (
        <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="lg">
          Loading laboratory data...
        </Alert>
      )}

      {/* Error State */}
      {_error && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          mb="lg"
          withCloseButton
          onClose={() => _setError(null)}
        >
          {_error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 'sm', sm: 'md', lg: 'lg' }} mb={{ base: 'md', sm: 'lg' }}>
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <ThemeIcon color={stat.color} size="xl" radius="md" variant="light">
                  <Icon size={24} />
                </ThemeIcon>
              </Group>
              <Group justify="space-between" mt="sm">
                <Badge
                  color={
                    stat.trend.includes('%') && stat.trend.startsWith('+')
                      ? 'green'
                      : stat.trend.includes('%')
                        ? 'red'
                        : 'blue'
                  }
                  variant="light"
                  size="sm"
                >
                  {stat.trend}
                </Badge>
                <Text size="xs" c="dimmed">
                  {stat.trend.includes('%') ? 'vs last month' : 'operational'}
                </Text>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="flex-wrap">
          <Tabs.Tab value="tests" leftSection={<IconTestPipe size={16} />} className="text-xs sm:text-sm">
            Lab Tests
          </Tabs.Tab>
          <Tabs.Tab value="orders" leftSection={<IconClipboardList size={16} />} className="text-xs sm:text-sm">
            Lab Orders
          </Tabs.Tab>
          <Tabs.Tab value="samples" leftSection={<IconFlask size={16} />} className="text-xs sm:text-sm">
            Samples
          </Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconSettings size={16} />} className="text-xs sm:text-sm">
            Equipment
          </Tabs.Tab>
          <Tabs.Tab value="qc" leftSection={<IconShieldCheck size={16} />} className="text-xs sm:text-sm">
            Quality Control
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<IconChartBar size={16} />} className="text-xs sm:text-sm">
            Reports
          </Tabs.Tab>
        </Tabs.List>

        {/* Lab Tests Tab */}
        <Tabs.Panel value="tests">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search tests..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Category"
                data={[
                  { value: 'hematology', label: 'Hematology' },
                  { value: 'biochemistry', label: 'Biochemistry' },
                  { value: 'microbiology', label: 'Microbiology' },
                  { value: 'immunology', label: 'Immunology' },
                  { value: 'pathology', label: 'Pathology' },
                  { value: 'molecular', label: 'Molecular' },
                  { value: 'genetics', label: 'Genetics' },
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'routine', label: 'Routine' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'stat', label: 'STAT' },
                  { value: 'research', label: 'Research' },
                ]}
                value={selectedType}
                onChange={setSelectedType}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Tests Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredTests.map((test) => (
                <Card key={test.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div style={{ flex: 1 }}>
                      <Group>
                        <ThemeIcon
                          color={getCategoryColor(test.category)}
                          variant="light"
                          size="lg"
                        >
                          {getCategoryIcon(test.category)}
                        </ThemeIcon>
                        <div>
                          <Text fw={600} size="sm" lineClamp={1}>
                            {test.testName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {test.testCode}
                          </Text>
                        </div>
                      </Group>
                    </div>
                    <Badge color={getStatusColor(test.status)} variant="light" size="sm">
                      {test.status}
                    </Badge>
                  </Group>

                  <Stack gap="sm" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Category
                      </Text>
                      <Badge color={getCategoryColor(test.category)} variant="light" size="xs">
                        {test.category}
                      </Badge>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Type
                      </Text>
                      <Text size="sm" fw={500}>
                        {test.testType.toUpperCase()}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Price
                      </Text>
                      <Text size="sm" fw={600}>
                        {formatCurrency(test.price)}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Turnaround Time
                      </Text>
                      <Text size="sm">{test.turnaroundTime}</Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Sample Type
                      </Text>
                      <Text size="sm">{test.sampleType.replace('_', ' ')}</Text>
                    </Group>
                  </Stack>

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {test.description}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleViewTest(test)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconClipboard size={14} />}>
                            Order Test
                          </Menu.Item>
                          <Menu.Item leftSection={<IconDownload size={14} />}>
                            Export Details
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Lab Orders Tab */}
        <Tabs.Panel value="orders">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Laboratory Orders</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={_openAddOrder}>
                New Order
              </Button>
            </Group>

            {/* Order Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search orders..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Patient"
                data={[].map(
                  /* TODO: Fetch from API */ (patient) => ({
                    value: patient.id,
                    label: `${patient.firstName} ${patient.lastName}`,
                  })
                )}
                value={selectedPatient}
                onChange={setSelectedPatient}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
            </Group>

            {/* Orders Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Order #</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Tests</Table.Th>
                    <Table.Th>Order Date</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredOrders.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <EmptyState
                          icon={<IconTestPipe size={48} />}
                          title="No lab tests"
                          description="Order your first lab test to begin diagnostics"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <Table.Tr key={order.id}>
                        <Table.Td>
                          <Text fw={500}>{order.orderNumber}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl" size="sm">
                              {order.patient.firstName[0]}
                              {order.patient.lastName[0]}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {order.patient.firstName} {order.patient.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {order.patient.patientId}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {order.orderingDoctor.firstName} {order.orderingDoctor.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {order.orderingDoctor.department?.name}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{order.tests.length} tests</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {typeof order.orderDate === 'string'
                              ? order.orderDate
                              : new Date(order.orderDate).toISOString().split('T')[0]}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              order.priority === 'stat'
                                ? 'red'
                                : order.priority === 'urgent'
                                  ? 'orange'
                                  : 'blue'
                            }
                            variant="light"
                            size="sm"
                          >
                            {order.priority.toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(order.status)} variant="light">
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => _handleViewOrder(order)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="orange">
                              <IconDownload size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        {/* Samples Tab */}
        <Tabs.Panel value="samples">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Sample Management</Title>
              <Group>
                <Button leftSection={<IconBarcode size={16} />} variant="light">
                  Scan Sample
                </Button>
                <Button leftSection={<IconFlask size={16} />}>Register Sample</Button>
              </Group>
            </Group>

            {/* Sample Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search samples..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Sample Type"
                data={[
                  { value: 'blood', label: 'Blood' },
                  { value: 'urine', label: 'Urine' },
                  { value: 'stool', label: 'Stool' },
                  { value: 'sputum', label: 'Sputum' },
                  { value: 'csf', label: 'CSF' },
                  { value: 'tissue', label: 'Tissue' },
                  { value: 'swab', label: 'Swab' },
                ]}
                value={selectedType}
                onChange={setSelectedType}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'collected', label: 'Collected' },
                  { value: 'received', label: 'Received' },
                  { value: 'processed', label: 'Processed' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
            </Group>

            {/* Samples Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredSamples.map((sample) => (
                <Card key={sample.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        {sample.sampleId}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {sample.patientName}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(sample.status)} variant="light">
                      {sample.status}
                    </Badge>
                  </Group>

                  <Stack gap="sm" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Sample Type
                      </Text>
                      <Group gap="xs">
                        <IconFlask size={16} />
                        <Text size="sm" fw={500}>
                          {sample.sampleType.replace('_', ' ').toUpperCase()}
                        </Text>
                      </Group>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Collection Date
                      </Text>
                      <Text size="sm">
                        {typeof sample.collectionDate === 'string'
                          ? sample.collectionDate
                          : new Date(sample.collectionDate).toISOString().split('T')[0]}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Collection Time
                      </Text>
                      <Text size="sm">{(sample as any).collectionTime || 'N/A'}</Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Volume
                      </Text>
                      <Text size="sm">
                        {sample.volume} {sample.unit}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Container
                      </Text>
                      <Text size="sm">{sample.containerType}</Text>
                    </Group>

                    {sample.storageConditions && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Storage
                        </Text>
                        <Group gap="xs">
                          <IconTemperature size={14} />
                          <Text size="sm">{sample.storageConditions}</Text>
                        </Group>
                      </Group>
                    )}
                  </Stack>

                  {sample.notes && (
                    <Alert variant="light" color="blue" mb="md">
                      <Text size="sm">{sample.notes}</Text>
                    </Alert>
                  )}

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Collected by: {sample.collectedBy}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => _handleViewSample(sample)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconBarcode size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Equipment Tab */}
        <Tabs.Panel value="equipment">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Laboratory Equipment</Title>
              <Button leftSection={<IconPlus size={16} />}>Add Equipment</Button>
            </Group>

            {/* Equipment Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (equipment) => (
                  <Card key={equipment.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div style={{ flex: 1 }}>
                        <Text fw={600} size="lg" lineClamp={1}>
                          {equipment.equipmentName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {equipment.manufacturer} - {equipment.model}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(equipment.status)} variant="light">
                        {equipment.status.replace('_', ' ')}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Serial Number
                        </Text>
                        <Text size="sm" fw={500}>
                          {equipment.serialNumber}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Location
                        </Text>
                        <Text size="sm">{equipment.location}</Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Installation Date
                        </Text>
                        <Text size="sm">
                          {typeof equipment.installationDate === 'string'
                            ? equipment.installationDate
                            : new Date(equipment.installationDate).toISOString().split('T')[0]}
                        </Text>
                      </Group>

                      {equipment.lastMaintenanceDate && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Last Maintenance
                          </Text>
                          <Text size="sm">
                            {typeof equipment.lastMaintenanceDate === 'string'
                              ? equipment.lastMaintenanceDate
                              : new Date(equipment.lastMaintenanceDate).toISOString().split('T')[0]}
                          </Text>
                        </Group>
                      )}

                      {equipment.nextMaintenanceDate && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Next Maintenance
                          </Text>
                          <Text size="sm" c="dimmed">
                            {typeof equipment.nextMaintenanceDate === 'string'
                              ? equipment.nextMaintenanceDate
                              : new Date(equipment.nextMaintenanceDate).toISOString().split('T')[0]}
                          </Text>
                        </Group>
                      )}

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Warranty
                        </Text>
                        <Text
                          size="sm"
                          c={new Date(equipment.warrantyExpiry) < new Date() ? 'red' : 'green'}
                        >
                          {new Date(equipment.warrantyExpiry) < new Date() ? 'Expired' : 'Valid'}
                        </Text>
                      </Group>
                    </Stack>

                    <Group justify="space-between">
                      <Text size="sm" fw={600} c="blue">
                        {formatCurrency(equipment.purchasePrice)}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconSettings size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Quality Control Tab */}
        <Tabs.Panel value="qc">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Quality Control</Title>
              <Button leftSection={<IconPlus size={16} />}>Add QC Test</Button>
            </Group>

            {/* QC Grid */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (qc) => (
                  <Card key={qc.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {qc.testName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {qc.controlLotNumber}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(qc.status)} variant="light">
                        {qc.status}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Test Date
                        </Text>
                        <Text size="sm">
                          {typeof qc.testDate === 'string'
                            ? qc.testDate
                            : new Date(qc.testDate).toISOString().split('T')[0]}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Expected Value
                        </Text>
                        <Text size="sm" fw={500}>
                          {qc.expectedValue}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Actual Value
                        </Text>
                        <Text size="sm" fw={500}>
                          {qc.actualValue}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Acceptable Range
                        </Text>
                        <Text size="sm">{qc.acceptableRange}</Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Performed By
                        </Text>
                        <Text size="sm">{qc.performedBy}</Text>
                      </Group>
                    </Stack>

                    {qc.comments && (
                      <Alert
                        variant="light"
                        color={qc.status === 'failed' ? 'red' : 'blue'}
                        mb="md"
                      >
                        <Text size="sm">{qc.comments}</Text>
                      </Alert>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Control Type: {qc.controlType}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Reports Tab */}
        <Tabs.Panel value="reports">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Laboratory Reports & Analytics
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Test Distribution by Category */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Tests by Category
                </Title>
                <MantineDonutChart data={testCategoryData} size={160} thickness={30} withLabels />
              </Card>

              {/* Daily Test Volume */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Daily Test Volume
                </Title>
                <SimpleAreaChart
                  data={dailyTestsData}
                  dataKey="date"
                  series={[{ name: 'tests', color: 'blue.6' }]}
                />
              </Card>

              {/* Turnaround Time Analysis */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Average Turnaround Time by Category
                </Title>
                <SimpleBarChart
                  data={turnaroundTimeData}
                  dataKey="category"
                  series={[{ name: 'hours', color: 'orange.6' }]}
                />
              </Card>

              {/* Key Performance Indicators */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Key Performance Indicators
                </Title>
                <Stack gap="md">
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Test Accuracy Rate
                    </Text>
                    <Text size="sm" fw={600} c="green">
                      {0 /* TODO: Fetch from API */}%
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Average TAT
                    </Text>
                    <Text size="sm" fw={600}>
                      {0 /* TODO: Fetch from API */} hours
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Sample Rejection Rate
                    </Text>
                    <Text size="sm" fw={600} c="red">
                      {0 /* TODO: Fetch from API */}%
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Equipment Uptime
                    </Text>
                    <Text size="sm" fw={600} c="green">
                      {0 /* TODO: Fetch from API */}%
                    </Text>
                  </Group>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Quick Reports
                </Title>
                <Stack gap="sm">
                  <Button fullWidth leftSection={<IconDownload size={16} />} variant="light">
                    Export Test Results
                  </Button>
                  <Button fullWidth leftSection={<IconFileText size={16} />} variant="light">
                    Quality Control Report
                  </Button>
                  <Button fullWidth leftSection={<IconChartBar size={16} />} variant="light">
                    Workload Analysis
                  </Button>
                  <Button fullWidth leftSection={<IconSettings size={16} />} variant="light">
                    Equipment Performance
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Test Detail Modal */}
      <Modal opened={testDetailOpened} onClose={closeTestDetail} title="Test Details" size="lg">
        {selectedTest && (
          <ScrollArea h={500}>
            <Stack gap="md">
              <Group>
                <ThemeIcon
                  color={getCategoryColor(selectedTest.category)}
                  size="xl"
                  variant="light"
                >
                  {getCategoryIcon(selectedTest.category)}
                </ThemeIcon>
                <div>
                  <Title order={3}>{selectedTest.testName}</Title>
                  <Text c="dimmed">{selectedTest.testCode}</Text>
                  <Badge color={getStatusColor(selectedTest.status)} variant="light" mt="xs">
                    {selectedTest.status}
                  </Badge>
                </div>
              </Group>

              <Divider />

              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Category
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedTest.category}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Type
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedTest.testType}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Price
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(selectedTest.price)}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Turnaround Time
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedTest.turnaroundTime}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Sample Type
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedTest.sampleType.replace('_', ' ')}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Sample Volume
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedTest.sampleVolume}
                  </Text>
                </div>
              </SimpleGrid>

              <div>
                <Text size="sm" fw={500} mb="sm">
                  Description
                </Text>
                <Text size="sm">{selectedTest.description}</Text>
              </div>

              {selectedTest.parameters && selectedTest.parameters.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="sm">
                    Test Parameters
                  </Text>
                  <Stack gap="xs">
                    {selectedTest.parameters.map((param) => (
                      <Group
                        key={param.id}
                        justify="space-between"
                        p="sm"
                        style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                      >
                        <Text size="sm" fw={500}>
                          {param.parameterName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {param.normalRange} {param.unit}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </div>
              )}

              <Group justify="flex-end">
                <Button variant="light" onClick={closeTestDetail}>
                  Close
                </Button>
                <Button>Edit Test</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Add Test Modal */}
      <Modal opened={addTestOpened} onClose={closeAddTest} title="Add New Test" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput label="Test Name" placeholder="Enter test name" required />
            <TextInput label="Test Code" placeholder="Enter test code" required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Category"
              placeholder="Select category"
              data={[
                { value: 'hematology', label: 'Hematology' },
                { value: 'biochemistry', label: 'Biochemistry' },
                { value: 'microbiology', label: 'Microbiology' },
                { value: 'immunology', label: 'Immunology' },
                { value: 'pathology', label: 'Pathology' },
                { value: 'molecular', label: 'Molecular' },
                { value: 'genetics', label: 'Genetics' },
              ]}
              required
            />
            <Select
              label="Test Type"
              placeholder="Select type"
              data={[
                { value: 'routine', label: 'Routine' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'stat', label: 'STAT' },
                { value: 'research', label: 'Research' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea label="Description" placeholder="Enter test description" rows={3} />

          <SimpleGrid cols={3}>
            <NumberInput label="Price" placeholder="Enter price" leftSection="₹" min={0} required />
            <TextInput label="Turnaround Time" placeholder="e.g., 2-4 hours" required />
            <Select
              label="Sample Type"
              placeholder="Select sample type"
              data={[
                { value: 'blood', label: 'Blood' },
                { value: 'urine', label: 'Urine' },
                { value: 'stool', label: 'Stool' },
                { value: 'sputum', label: 'Sputum' },
                { value: 'tissue', label: 'Tissue' },
              ]}
              required
            />
          </SimpleGrid>

          <TextInput label="Sample Volume" placeholder="e.g., 5ml" required />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddTest}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Test added successfully',
                  color: 'green',
                });
                closeAddTest();
              }}
            >
              Add Test
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default LaboratoryManagement;

