'use client';

import React, { useState, useMemo } from 'react';
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
  ActionIcon,
  Stack,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Alert,
  Progress,
  Textarea,
  PasswordInput,
  Switch,
  Code,
  Tooltip,
  // JsonInput,
  Divider,
  Timeline,
  // List,
  // RingProgress,
  // Center,
  // Accordion
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
// Charts removed due to MantineProvider compatibility issues
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconChartBar,
  IconRefresh,
  IconDownload,
  IconCheck,
  IconX,
  IconDatabase,
  IconApi,
  IconWand,
  IconArrowsRightLeft,
  IconLock,
  IconAlertCircle,
  IconClipboardData,
  IconTable,
  IconCloudUpload,
  IconBrain,
  IconBuildingWarehouse,
  IconDashboard,
  IconBrandPython,
  IconExternalLink,
  IconSchema,
  IconFileText,
  IconDeviceDesktopAnalytics,
  IconUserCircle,
  IconClock,
  IconPlug,
} from '@tabler/icons-react';

// Import types and mock data
import {
  APIEndpoint,
  DataSource,
  Integration,
  Dashboard,
  PredictiveModel,
  Alert as AlertType,
} from '../../../types/integration';
// Mock data imports removed

const IntegrationHub = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [selectedModel, setSelectedModel] = useState<PredictiveModel | null>(null);

  // Modal states
  const [integrationDetailOpened, { open: openIntegrationDetail, close: closeIntegrationDetail }] =
    useDisclosure(false);
  const [createIntegrationOpened, { open: openCreateIntegration, close: closeCreateIntegration }] =
    useDisclosure(false);
  const [endpointDetailOpened, { open: openEndpointDetail, close: closeEndpointDetail }] =
    useDisclosure(false);
  const [dashboardDetailOpened, { open: openDashboardDetail, close: closeDashboardDetail }] =
    useDisclosure(false);
  const [modelDetailOpened, { open: openModelDetail, close: closeModelDetail }] =
    useDisclosure(false);
  const [apiKeyOpened, { open: openApiKey, close: closeApiKey }] = useDisclosure(false);

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (integration) => {
        const matchesSearch =
          integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          integration.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedStatus || integration.status === selectedStatus;
        const matchesType = !selectedType || integration.type === selectedType;

        return matchesSearch && matchesStatus && matchesType;
      }
    );
  }, [searchQuery, selectedStatus, selectedType]);

  // Filter API endpoints
  const filteredEndpoints = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (endpoint) =>
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'pending':
        return 'orange';
      case 'updating':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleViewIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    openIntegrationDetail();
  };

  const handleViewEndpoint = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint);
    openEndpointDetail();
  };

  const handleViewDashboard = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard);
    openDashboardDetail();
  };

  const handleViewModel = (model: PredictiveModel) => {
    setSelectedModel(model);
    openModelDetail();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Quick stats
  const quickStats = [
    {
      title: 'Active Integrations',
      value: 0 /* TODO: Fetch from API */,
      icon: IconArrowsRightLeft,
      color: 'blue',
    },
    {
      title: 'Data Sources',
      value: 0 /* TODO: Fetch from API */,
      icon: IconDatabase,
      color: 'green',
    },
    {
      title: 'API Endpoints',
      value: 0 /* TODO: Fetch from API */,
      icon: IconApi,
      color: 'violet',
    },
    {
      title: 'ML Models',
      value: 0 /* TODO: Fetch from API */,
      icon: IconBrain,
      color: 'orange',
    },
  ];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Integration & Data Analytics Hub</Title>
          <Text c="dimmed" size="sm">
            Manage API integrations, data warehousing, analytics, and interoperability
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconApi size={16} />} onClick={openApiKey}>
            API Keys
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateIntegration}>
            New Integration
          </Button>
        </Group>
      </Group>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} padding="lg" radius="md" withBorder>
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
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="api" leftSection={<IconApi size={16} />}>
            API Management
          </Tabs.Tab>
          <Tabs.Tab value="integrations" leftSection={<IconArrowsRightLeft size={16} />}>
            Integrations
          </Tabs.Tab>
          <Tabs.Tab value="datawarehouse" leftSection={<IconBuildingWarehouse size={16} />}>
            Data Warehouse
          </Tabs.Tab>
          <Tabs.Tab value="dashboards" leftSection={<IconDashboard size={16} />}>
            Dashboards
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconDeviceDesktopAnalytics size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Integration Status */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Integration Status
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="green" variant="light" size="sm">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Active</Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    24
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="red" variant="light" size="sm">
                      <IconX size={12} />
                    </ThemeIcon>
                    <Text size="sm">Error</Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    3
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="yellow" variant="light" size="sm">
                      <IconAlertCircle size={12} />
                    </ThemeIcon>
                    <Text size="sm">Warning</Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    5
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="blue" variant="light" size="sm">
                      <IconClock size={12} />
                    </ThemeIcon>
                    <Text size="sm">Pending</Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    8
                  </Text>
                </Group>
              </Stack>
            </Card>

            {/* API Usage */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                API Usage (Last 7 days)
              </Title>
              <Stack gap="xs">
                {[
                  { date: 'Mon', calls: 1200 },
                  { date: 'Tue', calls: 1800 },
                  { date: 'Wed', calls: 1600 },
                  { date: 'Thu', calls: 2200 },
                  { date: 'Fri', calls: 2400 },
                  { date: 'Sat', calls: 1500 },
                  { date: 'Sun', calls: 1300 },
                ].map((item) => (
                  <Group key={item.date} justify="space-between">
                    <Text size="sm" c="dimmed">
                      {item.date}
                    </Text>
                    <Group gap="xs">
                      <Progress
                        value={(item.calls / 2400) * 100}
                        style={{ width: 100 }}
                        size="sm"
                      />
                      <Text size="sm" fw={500}>
                        {item.calls.toLocaleString()}
                      </Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Card>

            {/* Recent Integrations */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Recent Integrations
              </Title>
              <Timeline active={3} bulletSize={24} lineWidth={2}>
                {[].slice(0, 4).map((integration) => (
                  <Timeline.Item
                    key={integration.id}
                    bullet={
                      <ThemeIcon color={getStatusColor(integration.status)} size={24} radius="xl">
                        <IconArrowsRightLeft size={12} />
                      </ThemeIcon>
                    }
                    title={integration.name}
                  >
                    <Text size="sm" c="dimmed">
                      {integration.type}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDate(integration.lastSync)}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {/* Data Processing Metrics */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Data Processing
              </Title>
              <Stack gap="md">
                {['ETL Jobs', 'Warehouse Queries', 'API Response Time', 'ML Predictions'].map(
                  (metric, index) => {
                    const values = [92, 85, 98, 78];
                    return (
                      <div key={metric}>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" fw={500}>
                            {metric}
                          </Text>
                          <Text size="sm">{values[index]}%</Text>
                        </Group>
                        <Progress
                          value={values[index]}
                          size="md"
                          color={values[index] > 90 ? 'green' : 'blue'}
                        />
                      </div>
                    );
                  }
                )}
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        {/* API Management Tab */}
        <Tabs.Panel value="api">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>API Endpoints</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />}>Add Endpoint</Button>
                <Button variant="light" leftSection={<IconDownload size={16} />}>
                  Export Swagger
                </Button>
              </Group>
            </Group>

            {/* Search */}
            <TextInput
              placeholder="Search endpoints..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              mb="md"
            />

            {/* API Endpoints Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Path</Table.Th>
                    <Table.Th>Method</Table.Th>
                    <Table.Th>Version</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Auth</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredEndpoints.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <EmptyState
                          icon={<IconPlug size={48} />}
                          title="No integrations"
                          description="Connect external systems"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredEndpoints.map((endpoint) => (
                      <Table.Tr key={endpoint.id}>
                        <Table.Td>
                          <Code>{endpoint.path}</Code>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              endpoint.method === 'GET'
                                ? 'blue'
                                : endpoint.method === 'POST'
                                  ? 'green'
                                  : endpoint.method === 'PUT'
                                    ? 'orange'
                                    : endpoint.method === 'DELETE'
                                      ? 'red'
                                      : 'gray'
                            }
                          >
                            {endpoint.method}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{endpoint.version}</Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2}>
                            {endpoint.description}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            {endpoint.requiresAuth && <IconLock size={16} />}
                            <Text size="sm">{endpoint.authType}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(endpoint.status)} variant="light">
                            {endpoint.status.toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewEndpoint(endpoint)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="gray">
                              <IconExternalLink size={16} />
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

        {/* Integrations Tab */}
        <Tabs.Panel value="integrations">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>System Integrations</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openCreateIntegration}>
                New Integration
              </Button>
            </Group>

            {/* Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search integrations..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'error', label: 'Error' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'pending', label: 'Pending' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'ehr', label: 'EHR System' },
                  { value: 'payment', label: 'Payment Gateway' },
                  { value: 'analytics', label: 'Analytics' },
                  { value: 'lab', label: 'Laboratory' },
                  { value: 'pharmacy', label: 'Pharmacy' },
                  { value: 'imaging', label: 'Imaging' },
                ]}
                value={selectedType}
                onChange={setSelectedType}
                clearable
              />
            </Group>

            {/* Integrations Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        {integration.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {integration.type}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(integration.status)} variant="light">
                      {integration.status.toUpperCase()}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                    {integration.description}
                  </Text>

                  <Stack gap="xs" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Last Sync
                      </Text>
                      <Text size="sm">{formatDate(integration.lastSync)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Data Flow
                      </Text>
                      <Text size="sm">{integration.dataDirection}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Authentication
                      </Text>
                      <Text size="sm">{integration.authMethod}</Text>
                    </Group>
                  </Stack>

                  <Group justify="space-between">
                    <Button variant="light" size="xs" leftSection={<IconRefresh size={14} />}>
                      Sync Now
                    </Button>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleViewIntegration(integration)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Data Warehouse Tab */}
        <Tabs.Panel value="datawarehouse">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Data Warehouse</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />}>Add Data Source</Button>
                <Button variant="light" leftSection={<IconCloudUpload size={16} />}>
                  ETL Jobs
                </Button>
              </Group>
            </Group>

            {/* Data Sources and Warehouses */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
              {/* Data Sources */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Data Sources
                </Title>
                <Stack gap="md">
                  {[].map(
                    /* TODO: Fetch from API */ (source) => (
                      <Group
                        key={source.id}
                        justify="space-between"
                        p="sm"
                        style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                      >
                        <Group>
                          <ThemeIcon color={getStatusColor(source.status)} size="md" radius="xl">
                            <IconDatabase size={16} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={500}>
                              {source.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {source.type}
                            </Text>
                          </div>
                        </Group>
                        <Badge color={getStatusColor(source.status)}>{source.status}</Badge>
                      </Group>
                    )
                  )}
                </Stack>
              </Card>

              {/* Warehouses */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Data Warehouses
                </Title>
                <Stack gap="md">
                  {[].map(
                    /* TODO: Fetch from API */ (warehouse) => (
                      <Group
                        key={warehouse.id}
                        justify="space-between"
                        p="sm"
                        style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                      >
                        <Group>
                          <ThemeIcon color="blue" size="md" radius="xl">
                            <IconBuildingWarehouse size={16} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={500}>
                              {warehouse.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {warehouse.provider}
                            </Text>
                          </div>
                        </Group>
                        <Group>
                          <Text size="xs" c="dimmed">
                            Size: {warehouse.size}
                          </Text>
                          <Badge color={getStatusColor(warehouse.status)}>{warehouse.status}</Badge>
                        </Group>
                      </Group>
                    )
                  )}
                </Stack>
              </Card>
            </SimpleGrid>

            {/* Data Pipelines */}
            <Card padding="lg" radius="md" withBorder mb="lg">
              <Title order={4} mb="md">
                Data Pipelines
              </Title>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Pipeline Name</Table.Th>
                      <Table.Th>Source</Table.Th>
                      <Table.Th>Destination</Table.Th>
                      <Table.Th>Frequency</Table.Th>
                      <Table.Th>Last Run</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[].map(
                      /* TODO: Fetch from API */ (pipeline) => (
                        <Table.Tr key={pipeline.id}>
                          <Table.Td>
                            <Text fw={500}>{pipeline.name}</Text>
                          </Table.Td>
                          <Table.Td>{pipeline.source}</Table.Td>
                          <Table.Td>{pipeline.destination}</Table.Td>
                          <Table.Td>{pipeline.frequency}</Table.Td>
                          <Table.Td>
                            <Group>
                              <Text size="sm">{formatDate(pipeline.lastRun)}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={getStatusColor(pipeline.status)} variant="light">
                              {pipeline.status.toUpperCase()}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="blue">
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle" color="green">
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle" color="orange">
                                <IconRefresh size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      )
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>

            {/* Schema Browser Teaser */}
            <Group justify="center">
              <Button variant="outline" leftSection={<IconSchema size={16} />}>
                Open Schema Browser
              </Button>
            </Group>
          </Paper>
        </Tabs.Panel>

        {/* Dashboards Tab */}
        <Tabs.Panel value="dashboards">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Analytics Dashboards</Title>
              <Button leftSection={<IconPlus size={16} />}>Create Dashboard</Button>
            </Group>

            {/* Dashboards Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (dashboard) => (
                  <Card key={dashboard.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {dashboard.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {dashboard.category}
                        </Text>
                      </div>
                      <ThemeIcon color="blue" radius="xl" variant="light">
                        <IconDashboard size={18} />
                      </ThemeIcon>
                    </Group>

                    {dashboard.thumbnail && (
                      <div
                        style={{
                          height: 120,
                          background: `url(${dashboard.thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '8px',
                          marginBottom: '16px',
                        }}
                      />
                    )}

                    <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                      {dashboard.description}
                    </Text>

                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">
                        Last Updated
                      </Text>
                      <Text size="sm">{formatDate(dashboard.lastUpdated)}</Text>
                    </Group>

                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconUserCircle size={16} />
                        <Text size="sm">{dashboard.owner}</Text>
                      </Group>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewDashboard(dashboard)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconExternalLink size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>

            {/* Reports Section */}
            <Title order={3} mt="xl" mb="lg">
              Reports
            </Title>
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Report Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Schedule</Table.Th>
                    <Table.Th>Last Generated</Table.Th>
                    <Table.Th>Format</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[].map(
                    /* TODO: Fetch from API */ (report) => (
                      <Table.Tr key={report.id}>
                        <Table.Td>
                          <Text fw={500}>{report.name}</Text>
                        </Table.Td>
                        <Table.Td>{report.category}</Table.Td>
                        <Table.Td>{report.schedule}</Table.Td>
                        <Table.Td>{formatDate(report.lastGenerated)}</Table.Td>
                        <Table.Td>
                          <Group>
                            {report.format === 'PDF' && <IconFileText size={16} />}
                            {report.format === 'CSV' && <IconTable size={16} />}
                            {report.format === 'EXCEL' && <IconClipboardData size={16} />}
                            <Text size="sm">{report.format}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon variant="subtle" color="green">
                              <IconDownload size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="blue">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="gray">
                              <IconRefresh size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        {/* Analytics & ML Tab */}
        <Tabs.Panel value="analytics">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Predictive Analytics</Title>
              <Button leftSection={<IconBrain size={16} />}>Deploy New Model</Button>
            </Group>

            {/* Predictive Models */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (model) => (
                  <Card key={model.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {model.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {model.modelType}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(model.status)} variant="light">
                        {model.status.toUpperCase()}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                      {model.description}
                    </Text>

                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">
                        Accuracy
                      </Text>
                      <Group>
                        <Progress
                          value={model.accuracy * 100}
                          size="sm"
                          style={{ width: 100 }}
                          color={
                            model.accuracy > 0.9
                              ? 'green'
                              : model.accuracy > 0.75
                                ? 'blue'
                                : 'orange'
                          }
                        />
                        <Text size="sm">{(model.accuracy * 100).toFixed(1)}%</Text>
                      </Group>
                    </Group>

                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">
                        Last Trained
                      </Text>
                      <Text size="sm">{formatDate(model.lastTrained)}</Text>
                    </Group>

                    <Group justify="space-between" mb="md">
                      <Text size="sm" c="dimmed">
                        Framework
                      </Text>
                      <Group>
                        {model.framework === 'TensorFlow' && <IconBrandPython size={16} />}
                        {model.framework === 'PyTorch' && <IconBrandPython size={16} />}
                        {model.framework === 'scikit-learn' && <IconBrandPython size={16} />}
                        <Text size="sm">{model.framework}</Text>
                      </Group>
                    </Group>

                    <Group justify="space-between">
                      <Button variant="light" size="xs" leftSection={<IconWand size={14} />}>
                        Test Predict
                      </Button>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewModel(model)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>

            {/* ML Model Metrics Chart */}
            <Card padding="lg" radius="md" withBorder mt="xl">
              <Title order={4} mb="md">
                Model Performance Metrics
              </Title>
              <SimpleGrid cols={2}>
                <Stack gap="md">
                  {[
                    { model: 'Readmission', accuracy: 0.92, precision: 0.89, recall: 0.87 },
                    { model: 'LOS Prediction', accuracy: 0.85, precision: 0.83, recall: 0.81 },
                    { model: 'Disease Risk', accuracy: 0.88, precision: 0.86, recall: 0.84 },
                    { model: 'Cost Prediction', accuracy: 0.79, precision: 0.76, recall: 0.75 },
                  ].map((item) => (
                    <div key={item.model}>
                      <Text size="sm" fw={500} mb="xs">
                        {item.model}
                      </Text>
                      <Stack gap={4}>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Accuracy
                          </Text>
                          <Group gap="xs">
                            <Progress
                              value={item.accuracy * 100}
                              color="green"
                              style={{ width: 80 }}
                              size="xs"
                            />
                            <Text size="xs">{(item.accuracy * 100).toFixed(0)}%</Text>
                          </Group>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Precision
                          </Text>
                          <Group gap="xs">
                            <Progress
                              value={item.precision * 100}
                              color="blue"
                              style={{ width: 80 }}
                              size="xs"
                            />
                            <Text size="xs">{(item.precision * 100).toFixed(0)}%</Text>
                          </Group>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Recall
                          </Text>
                          <Group gap="xs">
                            <Progress
                              value={item.recall * 100}
                              color="violet"
                              style={{ width: 80 }}
                              size="xs"
                            />
                            <Text size="xs">{(item.recall * 100).toFixed(0)}%</Text>
                          </Group>
                        </Group>
                      </Stack>
                    </div>
                  ))}
                </Stack>
                <Stack gap="md" justify="center">
                  <Alert color="blue" variant="light" title="AI-Driven Insights">
                    <Text size="sm">
                      The readmission prediction model has shown a 15% improvement in accuracy after
                      the latest training with expanded patient history features.
                    </Text>
                  </Alert>
                  <Alert color="green" variant="light" title="Action Recommended">
                    <Text size="sm">
                      Consider deploying the Cost Prediction model to production as it has reached
                      stable performance metrics in the last 3 evaluation cycles.
                    </Text>
                  </Alert>
                </Stack>
              </SimpleGrid>
            </Card>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* API Key Modal */}
      <Modal opened={apiKeyOpened} onClose={closeApiKey} title="API Key Management" size="lg">
        <Stack gap="md">
          <Alert color="blue" variant="light">
            <Text size="sm">
              API keys are used to authenticate requests to the API. Keep your API keys secure and
              never share them publicly.
            </Text>
          </Alert>

          <Title order={4}>Your API Keys</Title>
          <ScrollArea>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Last Used</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {[].map(
                  /* TODO: Fetch from API */ (key) => (
                    <Table.Tr key={key.id}>
                      <Table.Td>{key.name}</Table.Td>
                      <Table.Td>
                        <Badge color={key.keyType === 'production' ? 'red' : 'blue'}>
                          {key.keyType}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(key.created)}</Table.Td>
                      <Table.Td>{formatDate(key.lastUsed)}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Revoke Key">
                            <ActionIcon color="red" variant="light">
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="View Usage">
                            <ActionIcon color="blue" variant="light">
                              <IconChartBar size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          <Divider />

          <Title order={4}>Generate New API Key</Title>
          <SimpleGrid cols={2}>
            <TextInput label="Key Name" placeholder="My Application Key" required />
            <Select
              label="Key Type"
              placeholder="Select type"
              data={[
                { value: 'development', label: 'Development' },
                { value: 'production', label: 'Production' },
              ]}
              required
            />
          </SimpleGrid>

          <Select
            label="Permissions"
            placeholder="Select permissions"
            data={[
              { value: 'read', label: 'Read Only' },
              { value: 'write', label: 'Read & Write' },
              { value: 'admin', label: 'Admin (Full Access)' },
            ]}
            required
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeApiKey}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'API Key Generated',
                  message:
                    "Your new API key has been created. Make sure to copy it now as it won't be shown again",
                  color: 'green',
                });
                // Simulate API key generation (in real app, would come from server)
                const simulatedKey = 'hcm_' + Math.random().toString(36).substring(2, 15);
                // Would show this key in a separate modal or in UI
              }}
            >
              Generate Key
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Integration Modal */}
      <Modal
        opened={createIntegrationOpened}
        onClose={closeCreateIntegration}
        title="Create New Integration"
        size="lg"
      >
        <Stack gap="md">
          <TextInput label="Integration Name" placeholder="Enter integration name" required />

          <Select
            label="Integration Type"
            placeholder="Select type"
            data={[
              { value: 'ehr', label: 'EHR System' },
              { value: 'payment', label: 'Payment Gateway' },
              { value: 'analytics', label: 'Analytics' },
              { value: 'lab', label: 'Laboratory' },
              { value: 'pharmacy', label: 'Pharmacy' },
              { value: 'imaging', label: 'Imaging' },
            ]}
            required
          />

          <Textarea label="Description" placeholder="Describe this integration" rows={3} />

          <SimpleGrid cols={2}>
            <Select
              label="Data Direction"
              placeholder="Select direction"
              data={[
                { value: 'inbound', label: 'Inbound' },
                { value: 'outbound', label: 'Outbound' },
                { value: 'bidirectional', label: 'Bidirectional' },
              ]}
            />

            <Select
              label="Authentication Method"
              placeholder="Select method"
              data={[
                { value: 'api_key', label: 'API Key' },
                { value: 'oauth2', label: 'OAuth 2.0' },
                { value: 'jwt', label: 'JWT' },
                { value: 'basic', label: 'Basic Auth' },
              ]}
            />
          </SimpleGrid>

          <TextInput label="API Endpoint URL" placeholder="https://api.example.com/v1/" />

          <PasswordInput
            label="API Secret/Key"
            placeholder="Enter API key or leave blank to configure later"
          />

          <Switch
            label="Enable Webhook Notifications"
            description="Receive real-time notifications when data changes"
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeCreateIntegration}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Integration Created',
                  message: 'Your new integration has been successfully created',
                  color: 'green',
                });
                closeCreateIntegration();
              }}
            >
              Create Integration
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default IntegrationHub;
