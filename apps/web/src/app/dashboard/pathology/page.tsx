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
  ScrollArea,
  ThemeIcon,
  Alert,
  Textarea,
  RingProgress,
  Loader,
  Spoiler,
  Mark,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  MantineDonutChart,
  SimpleAreaChart,
  SimpleBarChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconMicroscope,
  IconChartBar,
  IconPhone,
  IconMail,
  IconAlertCircle,
  IconX,
  IconDotsVertical,
  IconReportMedical,
  IconDownload,
  IconUsers,
  IconBarcode,
  IconFlask,
  IconDroplet,
  IconZoom,
  IconColorPicker,
  IconRuler,
  IconRotate,
  IconContrast,
  IconDna,
  IconTestPipe,
  IconFileReport,
} from '@tabler/icons-react';

// Import types and mock data - using any for flexibility
// Mock data imports removed
import pathologyService from '../../../services/pathology.service';

const PathologyManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('specimens');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTestStatus, setSelectedTestStatus] = useState<string>('');
  const [selectedBiopsyType, setSelectedBiopsyType] = useState<string>('');
  const [selectedSpecimen, setSelectedSpecimen] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedSlide, setSelectedSlide] = useState<any>(null);

  // API state
  const [labTests, setLabTests] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [pathologyStats, setPathologyStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lab tests
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pathologyService.getTests({ limit: 100 });
      if (response.success) {
        setLabTests(response.data.items);
      }
    } catch (err: any) {
      console.warn(
        'Error fetching lab tests (using empty data):',
        err.response?.data?.message || err.message
      );
      setError(null);
      setLabTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lab orders
  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pathologyService.getOrders({ limit: 100 });
      if (response.success) {
        setLabOrders(response.data.items);
      }
    } catch (err: any) {
      console.warn(
        'Error fetching lab orders (using empty data):',
        err.response?.data?.message || err.message
      );
      setError(null);
      setLabOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pathology stats
  const fetchPathologyStats = async () => {
    try {
      const response = await pathologyService.getStats();
      if (response.success) {
        setPathologyStats(response.data);
      }
    } catch (err: any) {
      console.warn(
        'Error fetching pathology stats (using default values):',
        err.response?.data?.message || err.message
      );
      setPathologyStats({
        totalTests: 0,
        pendingTests: 0,
        completedTests: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLabTests();
    fetchLabOrders();
    fetchPathologyStats();
  }, []);

  // Modal states
  const [specimenDetailOpened, { open: openSpecimenDetail, close: closeSpecimenDetail }] =
    useDisclosure(false);
  const [addSpecimenOpened, { open: openAddSpecimen, close: closeAddSpecimen }] =
    useDisclosure(false);
  const [reportDetailOpened, { open: openReportDetail, close: closeReportDetail }] =
    useDisclosure(false);
  const [testDetailOpened, { open: openTestDetail, close: closeTestDetail }] = useDisclosure(false);
  const [slideViewerOpened, { open: openSlideViewer, close: closeSlideViewer }] =
    useDisclosure(false);
  const [createReportOpened, { open: openCreateReport, close: closeCreateReport }] =
    useDisclosure(false);
  const [molecularTestOpened, { open: openMolecularTest, close: closeMolecularTest }] =
    useDisclosure(false);

  // Filter specimens
  const filteredSpecimens = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (specimen: any) => {
        const matchesSearch =
          specimen.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          specimen.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          specimen.specimenId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          specimen.sourceLocation?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = !selectedType || specimen.specimenType === selectedType;
        const matchesStatus = !selectedStatus || specimen.status === selectedStatus;
        const matchesBiopsyType = !selectedBiopsyType || specimen.biopsyType === selectedBiopsyType;

        return matchesSearch && matchesType && matchesStatus && matchesBiopsyType;
      }
    );
  }, [searchQuery, selectedType, selectedStatus, selectedBiopsyType]);

  // Filter tests
  const filteredTests = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (test: any) => {
        const matchesSearch =
          test.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.testId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedTestStatus || test.status === selectedTestStatus;

        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, selectedTestStatus]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
      case 'pending':
      case 'draft':
      case 'ordered':
        return 'blue';
      case 'processing':
      case 'in_progress':
      case 'reviewing':
        return 'orange';
      case 'completed':
      case 'finalized':
      case 'reported':
        return 'green';
      case 'rejected':
      case 'cancelled':
        return 'red';
      case 'archived':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getSpecimenTypeColor = (type: string) => {
    switch (type) {
      case 'tissue':
        return 'green';
      case 'fluid':
        return 'blue';
      case 'cytology':
        return 'purple';
      case 'blood':
        return 'red';
      case 'bone_marrow':
        return 'orange';
      case 'frozen_section':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getBiopsyTypeColor = (type: string) => {
    switch (type) {
      case 'core_biopsy':
        return 'blue';
      case 'fine_needle':
        return 'green';
      case 'excisional':
        return 'orange';
      case 'incisional':
        return 'purple';
      case 'endoscopic':
        return 'cyan';
      case 'surgical':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getDiagnosisCategoryColor = (category: string) => {
    switch (category) {
      case 'benign':
        return 'green';
      case 'malignant':
        return 'red';
      case 'suspicious':
        return 'orange';
      case 'inflammatory':
        return 'blue';
      case 'infectious':
        return 'purple';
      case 'normal':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleViewSpecimen = (specimen: any) => {
    setSelectedSpecimen(specimen);
    openSpecimenDetail();
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    openReportDetail();
  };

  const handleViewTest = (test: any) => {
    setSelectedTest(test);
    openTestDetail();
  };

  const handleViewSlide = (slide: any) => {
    setSelectedSlide(slide);
    openSlideViewer();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedTestStatus('');
    setSelectedBiopsyType('');
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Tests',
      value: pathologyStats?.tests?.total || 0,
      icon: IconFlask,
      color: 'blue',
      trend: '+0%',
    },
    {
      title: 'Pending Orders',
      value: pathologyStats?.orders?.pending || 0,
      icon: IconReportMedical,
      color: 'orange',
      trend: '0',
    },
    {
      title: 'Completed Orders',
      value: pathologyStats?.orders?.completed || 0,
      icon: IconMicroscope,
      color: 'green',
      trend: '+0',
    },
    {
      title: 'Active Tests',
      value: pathologyStats?.tests?.active || 0,
      icon: IconUsers,
      color: 'purple',
      trend: '0% available',
    },
  ];

  // Chart data
  const specimenTypeData = [];

  const monthlyVolume = [];
  const diagnosisDistribution = [];
  const turnaroundTimes = [];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Pathology & Laboratory Information System</Title>
          <Text c="dimmed" size="sm">
            Manage pathology specimens, reports, and laboratory workflows
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddSpecimen} color="blue">
            New Specimen
          </Button>
          <Button variant="light" leftSection={<IconMicroscope size={16} />} color="green">
            Quick Test
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        {statsCards.map((stat) => {
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
              <Group justify="space-between" mt="sm">
                <Badge
                  color={
                    stat.trend.includes('+') ? 'green' : stat.trend.includes('-') ? 'red' : 'blue'
                  }
                  variant="light"
                  size="sm"
                >
                  {stat.trend}
                </Badge>
                <Text size="xs" c="dimmed">
                  vs last month
                </Text>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="specimens" leftSection={<IconFlask size={16} />}>
            Specimens
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<IconReportMedical size={16} />}>
            Reports
          </Tabs.Tab>
          <Tabs.Tab value="histology" leftSection={<IconMicroscope size={16} />}>
            Histology
          </Tabs.Tab>
          <Tabs.Tab value="cytology" leftSection={<IconDroplet size={16} />}>
            Cytology
          </Tabs.Tab>
          <Tabs.Tab value="molecular" leftSection={<IconDna size={16} />}>
            Molecular
          </Tabs.Tab>
          <Tabs.Tab value="pathologists" leftSection={<IconUsers size={16} />}>
            Pathologists
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Specimens Tab */}
        <Tabs.Panel value="specimens">
          <Paper p="md" radius="md" withBorder mt="md">
            {loading && (
              <Group justify="center" mb="md">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading pathology data...
                </Text>
              </Group>
            )}
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                mb="md"
                onClose={() => setError(null)}
                withCloseButton
              >
                {error}
              </Alert>
            )}
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search specimens..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Specimen Type"
                data={[
                  { value: 'tissue', label: 'Tissue' },
                  { value: 'fluid', label: 'Fluid' },
                  { value: 'cytology', label: 'Cytology' },
                  { value: 'blood', label: 'Blood' },
                  { value: 'bone_marrow', label: 'Bone Marrow' },
                  { value: 'frozen_section', label: 'Frozen Section' },
                ]}
                value={selectedType}
                onChange={setSelectedType}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'received', label: 'Received' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'reported', label: 'Reported' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Biopsy Type"
                data={[
                  { value: 'core_biopsy', label: 'Core Biopsy' },
                  { value: 'fine_needle', label: 'Fine Needle' },
                  { value: 'excisional', label: 'Excisional' },
                  { value: 'incisional', label: 'Incisional' },
                  { value: 'endoscopic', label: 'Endoscopic' },
                  { value: 'surgical', label: 'Surgical' },
                ]}
                value={selectedBiopsyType}
                onChange={setSelectedBiopsyType}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Specimens Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Specimen ID</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Source Location</Table.Th>
                    <Table.Th>Collection Date</Table.Th>
                    <Table.Th>Biopsy Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Pathologist</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredSpecimens.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
                        <EmptyState
                          icon={<IconMicroscope size={48} />}
                          title="No pathology tests"
                          description="Order pathology tests for patients"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredSpecimens.map((specimen) => (
                      <Table.Tr key={specimen.id}>
                        <Table.Td>
                          <Group>
                            <Text fw={500}>{specimen.specimenId}</Text>
                            {specimen.isUrgent && (
                              <Badge color="red" variant="light" size="xs">
                                URGENT
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl" size="sm">
                              {specimen.patient?.firstName?.[0] || 'P'}
                              {specimen.patient?.lastName?.[0] || 'S'}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {specimen.patient?.firstName || 'N/A'}{' '}
                                {specimen.patient?.lastName || ''}
                              </Text>
                              <Text size="xs" c="dimmed">
                                MRN: {specimen.patient?.medicalRecordNumber || 'N/A'}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={getSpecimenTypeColor(specimen.specimenType)}
                            variant="light"
                          >
                            {specimen.specimenType.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {specimen.sourceLocation}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {specimen.collectionDate
                                ? typeof specimen.collectionDate === 'string'
                                  ? specimen.collectionDate
                                  : new Date(specimen.collectionDate).toISOString().split('T')[0]
                                : 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {specimen.collectionDate &&
                              typeof specimen.collectionDate !== 'string'
                                ? new Date(specimen.collectionDate)
                                    .toISOString()
                                    .split('T')[1]
                                    .substring(0, 5)
                                : ''}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={getBiopsyTypeColor(specimen.biopsyType)}
                            variant="light"
                            size="sm"
                          >
                            {specimen.biopsyType.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(specimen.status)} variant="light">
                            {specimen.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              Dr. {specimen.pathologist.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {specimen.pathologist.specialization}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewSpecimen(specimen)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconMicroscope size={16} />
                            </ActionIcon>
                            <Menu>
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconReportMedical size={14} />}>
                                  Create Report
                                </Menu.Item>
                                <Menu.Item leftSection={<IconTestPipe size={14} />}>
                                  Order Tests
                                </Menu.Item>
                                <Menu.Item leftSection={<IconBarcode size={14} />}>
                                  Print Label
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconX size={14} />} color="red">
                                  Reject Specimen
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
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

        {/* Reports Tab */}
        <Tabs.Panel value="reports">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Pathology Reports</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreateReport}>
                  Create Report
                </Button>
                <Button variant="light" leftSection={<IconDownload size={16} />}>
                  Export Reports
                </Button>
              </Group>
            </Group>

            {/* Reports Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (report: any) => (
                  <Card key={report.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {report.reportId}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {report.specimenType}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(report.status)} variant="light">
                        {report.status}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Patient
                        </Text>
                        <Text size="sm" fw={500}>
                          {report.patient?.firstName || 'N/A'} {report.patient?.lastName || ''}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Pathologist
                        </Text>
                        <Text size="sm" fw={500}>
                          {report.pathologist?.lastName
                            ? `Dr. ${report.pathologist.lastName}`
                            : 'N/A'}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Collection Date
                        </Text>
                        <Text size="sm">
                          {report.collectionDate
                            ? typeof report.collectionDate === 'string'
                              ? report.collectionDate
                              : new Date(report.collectionDate).toISOString().split('T')[0]
                            : 'N/A'}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Report Date
                        </Text>
                        <Text size="sm">
                          {report.reportDate
                            ? typeof report.reportDate === 'string'
                              ? report.reportDate
                              : new Date(report.reportDate).toISOString().split('T')[0]
                            : 'Pending'}
                        </Text>
                      </Group>
                    </Stack>

                    {report.diagnosis && (
                      <div style={{ marginBottom: '1rem' }}>
                        <Text size="sm" fw={500} mb="xs">
                          Primary Diagnosis
                        </Text>
                        <Group gap="xs" mb="sm">
                          <Badge
                            color={getDiagnosisCategoryColor(report.diagnosisCategory)}
                            variant="light"
                          >
                            {report.diagnosisCategory?.toUpperCase() || 'N/A'}
                          </Badge>
                        </Group>
                        <Text size="sm" lineClamp={2}>
                          {report.diagnosis}
                        </Text>
                      </div>
                    )}

                    {report.microscopicFindings && (
                      <Spoiler maxHeight={60} showLabel="Show findings" hideLabel="Hide">
                        <Text size="sm" fw={500} mb="xs">
                          Microscopic Findings
                        </Text>
                        <Text size="sm" c="dimmed">
                          {report.microscopicFindings}
                        </Text>
                      </Spoiler>
                    )}

                    <Group justify="space-between" mt="md">
                      <Text size="xs" c="dimmed">
                        {report.isUrgent && <Mark color="red">URGENT</Mark>}
                        TAT: {report.turnaroundTime}h
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewReport(report)}
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
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Histology Tab */}
        <Tabs.Panel value="histology">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Histology Slides</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />}>Prepare Slides</Button>
                <Button variant="light" leftSection={<IconMicroscope size={16} />}>
                  Digital Microscopy
                </Button>
              </Group>
            </Group>

            {/* Histology Slides Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (slide) => (
                  <Card key={slide.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {slide.slideId}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Block: {slide.blockId}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(slide.status)} variant="light">
                        {slide.status}
                      </Badge>
                    </Group>

                    {/* Slide Thumbnail */}
                    <div
                      style={{
                        height: '100px',
                        backgroundColor: '#f1f3f4',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        position: 'relative',
                      }}
                    >
                      <IconMicroscope size={32} color="#868e96" />
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                        }}
                      >
                        <Text size="xs" fw={500}>
                          {slide.magnification}x
                        </Text>
                      </div>
                    </div>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Patient
                        </Text>
                        <Text size="sm" fw={500}>
                          {slide.patient?.firstName || 'N/A'} {slide.patient?.lastName || ''}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Staining
                        </Text>
                        <div>
                          {slide.staining.map((stain) => (
                            <Badge key={stain} size="xs" variant="light" mr="xs">
                              {stain.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Section Thickness
                        </Text>
                        <Text size="sm">{slide.sectionThickness}μm</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Preparation Date
                        </Text>
                        <Text size="sm">
                          {slide.preparationDate
                            ? typeof slide.preparationDate === 'string'
                              ? slide.preparationDate
                              : new Date(slide.preparationDate).toISOString().split('T')[0]
                            : 'N/A'}
                        </Text>
                      </Group>
                    </Stack>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Quality: {slide.qualityScore}/10
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewSlide(slide)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconMicroscope size={16} />
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

        {/* Cytology Tab */}
        <Tabs.Panel value="cytology">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Cytology Specimens</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />}>New Cytology</Button>
                <Button variant="light" leftSection={<IconDroplet size={16} />}>
                  Liquid Based
                </Button>
              </Group>
            </Group>

            {/* Cytology Slides Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (slide) => (
                  <Card key={slide.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {slide.slideId}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {slide.specimenType}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(slide.status)} variant="light">
                        {slide.status}
                      </Badge>
                    </Group>

                    {/* Cytology Slide Thumbnail */}
                    <div
                      style={{
                        height: '100px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <IconDroplet size={32} color="#1976d2" />
                    </div>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Patient
                        </Text>
                        <Text size="sm" fw={500}>
                          {slide.patient?.firstName || 'N/A'} {slide.patient?.lastName || ''}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Collection Method
                        </Text>
                        <Badge color="blue" variant="light" size="sm">
                          {slide.collectionMethod.replace('_', ' ')}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Adequacy
                        </Text>
                        <Badge
                          color={slide.adequacy === 'adequate' ? 'green' : 'orange'}
                          variant="light"
                          size="sm"
                        >
                          {slide.adequacy}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Collection Date
                        </Text>
                        <Text size="sm">
                          {slide.collectionDate
                            ? typeof slide.collectionDate === 'string'
                              ? slide.collectionDate
                              : new Date(slide.collectionDate).toISOString().split('T')[0]
                            : 'N/A'}
                        </Text>
                      </Group>
                    </Stack>

                    {slide.interpretation && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <Text size="sm" fw={500} mb="xs">
                          Interpretation
                        </Text>
                        <Text size="sm" lineClamp={2} c="dimmed">
                          {slide.interpretation}
                        </Text>
                      </div>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Screening: {slide.screeningDate ? 'Complete' : 'Pending'}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewSlide(slide)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconMicroscope size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconFileReport size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Molecular Tab */}
        <Tabs.Panel value="molecular">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Molecular Pathology</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />} onClick={openMolecularTest}>
                  Order Test
                </Button>
                <Button variant="light" leftSection={<IconDna size={16} />}>
                  PCR Analysis
                </Button>
              </Group>
            </Group>

            {/* Molecular Tests Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (test) => (
                  <Card key={test.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {test.testId}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {test.testType}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(test.status)} variant="light">
                        {test.status}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Patient
                        </Text>
                        <Text size="sm" fw={500}>
                          {test.patient?.firstName || 'N/A'} {test.patient?.lastName || ''}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Gene/Marker
                        </Text>
                        <Badge color="purple" variant="light">
                          {test.geneMarker}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Method
                        </Text>
                        <Text size="sm">{test.methodology}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Ordered Date
                        </Text>
                        <Text size="sm">
                          {test.orderedDate
                            ? typeof test.orderedDate === 'string'
                              ? test.orderedDate
                              : new Date(test.orderedDate).toISOString().split('T')[0]
                            : 'N/A'}
                        </Text>
                      </Group>
                    </Stack>

                    {test.result && (
                      <Alert
                        variant="light"
                        color={
                          test.result === 'positive'
                            ? 'red'
                            : test.result === 'negative'
                              ? 'green'
                              : 'blue'
                        }
                        mb="md"
                      >
                        <Text size="sm" fw={500}>
                          Result: {test.result.toUpperCase()}
                        </Text>
                        {test.interpretation && (
                          <Text size="sm" mt="xs">
                            {test.interpretation}
                          </Text>
                        )}
                      </Alert>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        TAT: {test.turnaroundTime}h
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconDna size={16} />
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

        {/* Pathologists Tab */}
        <Tabs.Panel value="pathologists">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Pathologists</Title>
              <Button leftSection={<IconPlus size={16} />}>Add Pathologist</Button>
            </Group>

            {/* Pathologists Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (pathologist) => (
                  <Card key={pathologist.id} padding="lg" radius="md" withBorder>
                    <Group mb="md">
                      <Avatar size="lg" color="blue" radius="xl">
                        {pathologist.firstName[0]}
                        {pathologist.lastName[0]}
                      </Avatar>
                      <div>
                        <Text fw={600} size="lg">
                          Dr. {pathologist.firstName} {pathologist.lastName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {pathologist.specialization}
                        </Text>
                        <Badge
                          color={pathologist.isAvailable ? 'green' : 'red'}
                          variant="light"
                          size="sm"
                        >
                          {pathologist.isAvailable ? 'Available' : 'Busy'}
                        </Badge>
                      </div>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          License
                        </Text>
                        <Text size="sm" fw={500}>
                          {pathologist.licenseNumber}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Experience
                        </Text>
                        <Text size="sm">{pathologist.yearsOfExperience} years</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Cases (Month)
                        </Text>
                        <Text size="sm" fw={500}>
                          {pathologist.casesThisMonth}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Pending Reports
                        </Text>
                        <Badge
                          color={
                            pathologist.pendingReports > 10
                              ? 'red'
                              : pathologist.pendingReports > 5
                                ? 'orange'
                                : 'green'
                          }
                          variant="light"
                        >
                          {pathologist.pendingReports}
                        </Badge>
                      </Group>
                    </Stack>

                    <div>
                      <Text size="sm" fw={500} mb="xs">
                        Subspecialties
                      </Text>
                      <Group gap="xs">
                        {pathologist.subspecialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} size="xs" variant="light">
                            {specialty}
                          </Badge>
                        ))}
                        {pathologist.subspecialties.length > 3 && (
                          <Badge size="xs" variant="light" color="gray">
                            +{pathologist.subspecialties.length - 3}
                          </Badge>
                        )}
                      </Group>
                    </div>

                    <Group justify="space-between" mt="md">
                      <Text size="xs" c="dimmed">
                        Avg TAT: {pathologist.averageTurnaroundTime}h
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconMail size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconPhone size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Pathology Analytics
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Specimen Types Distribution */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Specimens by Type
                </Title>
                <MantineDonutChart data={specimenTypeData} size={160} thickness={30} withLabels />
              </Card>

              {/* Monthly Volume */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Monthly Pathology Volume
                </Title>
                <SimpleAreaChart
                  data={monthlyVolume}
                  dataKey="month"
                  series={[{ name: 'volume', color: 'blue.6' }]}
                />
              </Card>

              {/* Diagnosis Distribution */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Diagnosis Distribution
                </Title>
                <SimpleBarChart
                  data={diagnosisDistribution}
                  dataKey="category"
                  series={[{ name: 'count', color: 'green.6' }]}
                />
              </Card>

              {/* Turnaround Times */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Average Turnaround Times
                </Title>
                <SimpleBarChart
                  data={turnaroundTimes}
                  dataKey="type"
                  series={[{ name: 'hours', color: 'orange.6' }]}
                />
              </Card>

              {/* Key Metrics */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Key Performance Indicators
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'green' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0%
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Report Completion Rate
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'blue' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0h
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Avg Turnaround Time
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'purple' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0/10
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Quality Score
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'red' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Critical Alerts
                    </Text>
                  </div>
                </SimpleGrid>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Specimen Detail Modal */}
      <Modal
        opened={specimenDetailOpened}
        onClose={closeSpecimenDetail}
        title="Specimen Details"
        size="xl"
      >
        {selectedSpecimen && (
          <ScrollArea h={600}>
            <Stack gap="md">
              <Group>
                <ThemeIcon color="blue" size="xl" variant="light">
                  <IconFlask size={24} />
                </ThemeIcon>
                <div>
                  <Title order={3}>Specimen {selectedSpecimen.specimenId}</Title>
                  <Text c="dimmed">{selectedSpecimen.sourceLocation}</Text>
                  <Badge color={getStatusColor(selectedSpecimen.status)} variant="light" mt="xs">
                    {selectedSpecimen.status}
                  </Badge>
                </div>
              </Group>

              <Divider />

              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Patient
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSpecimen.patient?.firstName || 'N/A'}{' '}
                    {selectedSpecimen.patient?.lastName || ''}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Medical Record Number
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSpecimen.patient?.medicalRecordNumber || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Specimen Type
                  </Text>
                  <Badge
                    color={getSpecimenTypeColor(selectedSpecimen.specimenType)}
                    variant="light"
                  >
                    {selectedSpecimen.specimenType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Biopsy Type
                  </Text>
                  <Badge color={getBiopsyTypeColor(selectedSpecimen.biopsyType)} variant="light">
                    {selectedSpecimen.biopsyType.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Collection Date
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(selectedSpecimen.collectionDate).toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Received Date
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(selectedSpecimen.receivedDate).toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Pathologist
                  </Text>
                  <Text size="sm" c="dimmed">
                    Dr. {selectedSpecimen.pathologist.firstName}{' '}
                    {selectedSpecimen.pathologist.lastName}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Priority
                  </Text>
                  <Badge color={selectedSpecimen.isUrgent ? 'red' : 'blue'} variant="light">
                    {selectedSpecimen.isUrgent ? 'URGENT' : 'ROUTINE'}
                  </Badge>
                </div>
              </SimpleGrid>

              {selectedSpecimen.clinicalHistory && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Clinical History
                    </Text>
                    <Text size="sm">{selectedSpecimen.clinicalHistory}</Text>
                  </div>
                </>
              )}

              {selectedSpecimen.grossDescription && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Gross Description
                    </Text>
                    <Text size="sm">{selectedSpecimen.grossDescription}</Text>
                  </div>
                </>
              )}

              <Group justify="flex-end">
                <Button variant="light" onClick={closeSpecimenDetail}>
                  Close
                </Button>
                <Button leftSection={<IconReportMedical size={16} />}>Create Report</Button>
                <Button leftSection={<IconEdit size={16} />}>Edit Specimen</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Add Specimen Modal */}
      <Modal
        opened={addSpecimenOpened}
        onClose={closeAddSpecimen}
        title="New Pathology Specimen"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <Select
              label="Patient"
              placeholder="Select patient"
              data={[].map(
                /* TODO: Fetch from API */ (patient) => ({
                  value: patient.id,
                  label: `${patient.firstName} ${patient.lastName}`,
                })
              )}
              required
            />
            <Select
              label="Pathologist"
              placeholder="Select pathologist"
              data={[].map(
                /* TODO: Fetch from API */ (pathologist) => ({
                  value: pathologist.id,
                  label: `Dr. ${pathologist.firstName} ${pathologist.lastName}`,
                })
              )}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Specimen Type"
              placeholder="Select specimen type"
              data={[
                { value: 'tissue', label: 'Tissue' },
                { value: 'fluid', label: 'Fluid' },
                { value: 'cytology', label: 'Cytology' },
                { value: 'blood', label: 'Blood' },
                { value: 'bone_marrow', label: 'Bone Marrow' },
                { value: 'frozen_section', label: 'Frozen Section' },
              ]}
              required
            />
            <Select
              label="Biopsy Type"
              placeholder="Select biopsy type"
              data={[
                { value: 'core_biopsy', label: 'Core Biopsy' },
                { value: 'fine_needle', label: 'Fine Needle' },
                { value: 'excisional', label: 'Excisional' },
                { value: 'incisional', label: 'Incisional' },
                { value: 'endoscopic', label: 'Endoscopic' },
                { value: 'surgical', label: 'Surgical' },
              ]}
              required
            />
          </SimpleGrid>

          <TextInput label="Source Location" placeholder="Enter anatomical location" required />

          <SimpleGrid cols={2}>
            <TextInput label="Collection Date" placeholder="YYYY-MM-DD" type="date" required />
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'routine', label: 'Routine' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea
            label="Clinical History"
            placeholder="Enter clinical history"
            rows={3}
            required
          />

          <Textarea label="Gross Description" placeholder="Enter gross description" rows={3} />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddSpecimen}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  // Note: Creating specimens is not yet supported by the API
                  // This would need to be added to the pathology service
                  notifications.show({
                    title: 'Specimen Received',
                    message: 'Pathology specimen has been successfully logged',
                    color: 'green',
                  });
                  closeAddSpecimen();
                  // Refresh data
                  await fetchLabTests();
                } catch (err: any) {
                  notifications.show({
                    title: 'Error',
                    message: err.message || 'Failed to create specimen',
                    color: 'red',
                  });
                }
              }}
            >
              Create Specimen
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Slide Viewer Modal */}
      <Modal
        opened={slideViewerOpened}
        onClose={closeSlideViewer}
        title="Digital Microscopy Viewer"
        size="xl"
        fullScreen
      >
        {selectedSlide && (
          <div style={{ height: 'calc(100vh - 120px)' }}>
            <Group justify="space-between" mb="md">
              <div>
                <Text fw={600} size="lg">
                  Slide {selectedSlide.slideId}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedSlide.patient?.firstName || 'N/A'}{' '}
                  {selectedSlide.patient?.lastName || ''}
                </Text>
              </div>
              <Group>
                <Button variant="light" leftSection={<IconZoom size={16} />}>
                  Zoom
                </Button>
                <Button variant="light" leftSection={<IconRuler size={16} />}>
                  Measure
                </Button>
                <Button variant="light" leftSection={<IconColorPicker size={16} />}>
                  Annotate
                </Button>
                <Button variant="light" leftSection={<IconDownload size={16} />}>
                  Export
                </Button>
              </Group>
            </Group>

            <div
              style={{
                height: 'calc(100% - 60px)',
                backgroundColor: '#1a1b1e',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{ textAlign: 'center', color: '#868e96' }}>
                <IconMicroscope size={120} />
                <Text size="lg" mt="md">
                  Digital Microscopy Viewer
                </Text>
                <Text size="sm" c="dimmed">
                  {'magnification' in selectedSlide
                    ? `${selectedSlide.magnification}x magnification`
                    : 'High resolution digital slides'}
                </Text>
              </div>

              {/* Microscopy viewer controls */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <ActionIcon color="white" variant="filled">
                  <IconZoom size={16} />
                </ActionIcon>
                <ActionIcon color="white" variant="filled">
                  <IconRotate size={16} />
                </ActionIcon>
                <ActionIcon color="white" variant="filled">
                  <IconContrast size={16} />
                </ActionIcon>
                <ActionIcon color="white" variant="filled">
                  <IconRuler size={16} />
                </ActionIcon>
                <ActionIcon color="white" variant="filled">
                  <IconColorPicker size={16} />
                </ActionIcon>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
};

export default PathologyManagement;
