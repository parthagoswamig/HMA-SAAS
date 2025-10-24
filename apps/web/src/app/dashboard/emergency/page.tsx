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
  Avatar,
  ActionIcon,
  Stack,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Alert,
  NumberInput,
  Textarea,
  // Timeline,
  // RingProgress,
  // List,
  // MultiSelect,
  // Center,
  Divider,
  Stepper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  MantineDonutChart,
  SimpleAreaChart,
  SimpleLineChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  // IconTrash,
  // IconCalendar,
  IconUrgent,
  IconChartBar,
  // IconPhone,
  // IconMail,
  // IconAlertCircle,
  IconCheck,
  // IconX,
  // IconDotsVertical,
  IconAlertTriangle,
  // IconHeartbeat,
  IconClipboardList,
  // IconFileText,
  IconDownload,
  // IconPrinter,
  // IconShare,
  IconActivity,
  // IconExclamationMark,
  IconClockHour4,
  // IconTrendingUp,
  // IconTrendingDown,
  // IconUsers,
  // IconCalculator,
  IconSettings,
  // IconRefresh,
  // IconFilter,
  // IconBarcode,
  // IconTemperature,
  // IconShieldCheck,
  // IconCircleCheck,
  IconClipboard,
  // IconReportMedical,
  IconLungs,
  IconHeart,
  IconBrain,
  // IconBone,
  // IconStethoscope,
  // IconMedicalCross,
  // IconPackage,
  // IconTruck,
  // IconCash,
  // IconReceipt,
  // IconNotes,
  // IconClock,
  // IconTag,
  // IconAlarm,
  // IconInfoCircle,
  IconBed,
  IconAmbulance,
  IconBell,
  // IconFlask,
  // IconDroplet,
  // IconNurse,
  // IconBandage,
  // IconPill,
} from '@tabler/icons-react';

// Import types and mock data
import {
  // EmergencyCase,
  // Triage,
  TriageLevel,
  CaseStatus,
  ICUBed,
  BedStatus,
  // VitalSigns,
  // CriticalCareEquipment,
  EquipmentStatus,
  // EmergencyProtocol,
  // EmergencyStats,
  // EmergencyFilters
} from '../../../types/emergency';

// Mock data imports removed - using API data only

const EmergencyManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTriage, setSelectedTriage] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedBedStatus, setSelectedBedStatus] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Modal states
  const [caseDetailOpened, { open: openCaseDetail, close: closeCaseDetail }] = useDisclosure(false);
  const [addCaseOpened, { open: openAddCase, close: closeAddCase }] = useDisclosure(false);
  const [protocolOpened, { open: openProtocol, close: closeProtocol }] = useDisclosure(false);
  const [triageOpened, { open: openTriage, close: closeTriage }] = useDisclosure(false);

  // Filter emergency cases
  const filteredCases = useMemo(() => {
    const cases: any[] = []; // TODO: Fetch from API
    return cases.filter((emergencyCase) => {
      const matchesSearch =
        emergencyCase.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emergencyCase.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emergencyCase.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTriage = !selectedTriage || emergencyCase.triageLevel === selectedTriage;
      const matchesStatus = !selectedStatus || emergencyCase.status === selectedStatus;

      return matchesSearch && matchesTriage && matchesStatus;
    });
  }, [searchQuery, selectedTriage, selectedStatus]);

  // Filter ICU beds
  const filteredBeds = useMemo(() => {
    const beds: any[] = []; // TODO: Fetch from API
    return beds.filter((bed) => {
      const matchesSearch =
        bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bed.patientName && bed.patientName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = !selectedBedStatus || bed.status === selectedBedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedBedStatus]);

  // Helper functions
  const getTriageColor = (level: number | TriageLevel) => {
    switch (level) {
      case 1:
      case 'immediate':
        return 'red'; // Resuscitation/Immediate
      case 2:
      case 'urgent':
        return 'orange'; // Emergency/Urgent
      case 3:
      case 'less_urgent':
        return 'yellow'; // Urgent/Less Urgent
      case 4:
      case 'non_urgent':
        return 'green'; // Less Urgent/Non-urgent
      case 5:
        return 'blue'; // Non-urgent
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: CaseStatus | BedStatus | EquipmentStatus) => {
    const statusStr = status as string;
    if (['waiting', 'available', 'operational'].includes(statusStr)) return 'green';
    if (
      ['in_progress', 'occupied', 'maintenance', 'in_treatment', 'observation'].includes(statusStr)
    )
      return 'orange';
    if (['completed', 'discharged'].includes(statusStr)) return 'blue';
    if (['cancelled', 'out_of_service'].includes(statusStr)) return 'red';
    if (['transferred', 'admitted'].includes(statusStr)) return 'purple';
    if (['reserved', 'in_use'].includes(statusStr)) return 'yellow';
    return 'gray';
  };

  const getTriageLabel = (level: number | TriageLevel) => {
    switch (level) {
      case 1:
        return 'Resuscitation';
      case 2:
        return 'Emergency';
      case 3:
        return 'Urgent';
      case 4:
        return 'Less Urgent';
      case 5:
        return 'Non-urgent';
      case 'immediate':
        return 'Immediate';
      case 'urgent':
        return 'Urgent';
      case 'less_urgent':
        return 'Less Urgent';
      case 'non_urgent':
        return 'Non-urgent';
      default:
        return 'Unknown';
    }
  };

  const handleViewCase = (emergencyCase: any) => {
    setSelectedCase(emergencyCase);
    openCaseDetail();
  };

  const handleViewBed = (_bed: ICUBed) => {
    // Bed detail functionality removed
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTriage('');
    setSelectedStatus('');
    setSelectedBedStatus('');
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Active Cases',
      value: 0,
      icon: IconUrgent,
      color: 'red',
      trend: '+0',
    },
    {
      title: 'ICU Beds',
      value: `0/0`,
      icon: IconBed,
      color: 'blue',
      trend: '0% occupied',
    },
    {
      title: 'Average Wait Time',
      value: `0min`,
      icon: IconClockHour4,
      color: 'orange',
      trend: '0min',
    },
    {
      title: 'Code Blue Today',
      value: 0,
      icon: IconAlertTriangle,
      color: 'purple',
      trend: '+0',
    },
  ];

  // Chart data
  const triageDistribution = [];

  const hourlyAdmissions = [];
  const bedOccupancy = [];

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Emergency Management & Disaster Response</Title>
          <Text c="dimmed" size="sm">
            Manage emergency incidents, resources, evacuation procedures, and disaster recovery
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddCase} color="red">
            Emergency Case
          </Button>
          <Button
            variant="light"
            leftSection={<IconBell size={16} />}
            color="red"
            onClick={openProtocol}
          >
            Code Blue
          </Button>
        </Group>
      </Group>

      {/* Critical Alerts */}
      <Alert
        variant="light"
        color="red"
        title="Critical Alerts"
        icon={<IconAlertTriangle size={16} />}
        mb="lg"
      >
        <Stack gap="xs">
          <Text size="sm">• 3 patients waiting in resuscitation bay</Text>
          <Text size="sm">• ICU Bed #7 - Equipment malfunction</Text>
          <Text size="sm">• Code Blue - Room 204 (5 minutes ago)</Text>
        </Stack>
      </Alert>

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
                    stat.trend.includes('+') || stat.trend.includes('-')
                      ? stat.trend.startsWith('+')
                        ? 'red'
                        : 'green'
                      : 'blue'
                  }
                  variant="light"
                  size="sm"
                >
                  {stat.trend}
                </Badge>
                <Text size="xs" c="dimmed">
                  real-time
                </Text>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={16} />}>
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="triage" leftSection={<IconUrgent size={16} />}>
            Triage Queue
          </Tabs.Tab>
          <Tabs.Tab value="cases" leftSection={<IconAlertTriangle size={16} />}>
            Emergency Cases
          </Tabs.Tab>
          <Tabs.Tab value="icu" leftSection={<IconBed size={16} />}>
            ICU Management
          </Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconSettings size={16} />}>
            Equipment
          </Tabs.Tab>
          <Tabs.Tab value="protocols" leftSection={<IconClipboardList size={16} />}>
            Protocols
          </Tabs.Tab>
        </Tabs.List>

        {/* Dashboard Tab */}
        <Tabs.Panel value="dashboard">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Emergency Department Overview
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Triage Distribution */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Triage Distribution
                </Title>
                <MantineDonutChart data={triageDistribution} size={160} thickness={30} />
              </Card>

              {/* Hourly Admissions */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Hourly Admissions
                </Title>
                <SimpleAreaChart
                  data={hourlyAdmissions}
                  dataKey="hour"
                  series={[{ name: 'admissions', color: 'red.6' }]}
                />
              </Card>

              {/* ICU Bed Occupancy */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  ICU Bed Occupancy Trend
                </Title>
                <SimpleLineChart
                  data={bedOccupancy}
                  dataKey="date"
                  series={[
                    { name: 'occupied', color: 'blue.6', label: 'Occupied' },
                    { name: 'available', color: 'green.6', label: 'Available' },
                  ]}
                />
              </Card>

              {/* Quick Stats */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Quick Statistics
                </Title>
                <Stack gap="md">
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Mortality Rate
                    </Text>
                    <Text size="sm" fw={600} c="red">
                      2.1%
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Left Without Being Seen
                    </Text>
                    <Text size="sm" fw={600} c="orange">
                      3.5%
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Door-to-Doc Time
                    </Text>
                    <Text size="sm" fw={600}>
                      15min
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Return Rate (72h)
                    </Text>
                    <Text size="sm" fw={600} c="yellow">
                      4.2%
                    </Text>
                  </Group>
                </Stack>
              </Card>

              {/* Emergency Protocols */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Active Protocols
                </Title>
                <Stack gap="sm">
                  <Button
                    fullWidth
                    leftSection={<IconAlertTriangle size={16} />}
                    variant="light"
                    color="red"
                  >
                    Code Blue Protocol
                  </Button>
                  <Button
                    fullWidth
                    leftSection={<IconHeart size={16} />}
                    variant="light"
                    color="purple"
                  >
                    Cardiac Arrest
                  </Button>
                  <Button
                    fullWidth
                    leftSection={<IconBrain size={16} />}
                    variant="light"
                    color="orange"
                  >
                    Stroke Protocol
                  </Button>
                  <Button
                    fullWidth
                    leftSection={<IconLungs size={16} />}
                    variant="light"
                    color="blue"
                  >
                    Respiratory Distress
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Triage Queue Tab */}
        <Tabs.Panel value="triage">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Triage Queue</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openTriage}>
                Add to Triage
              </Button>
            </Group>

            {/* Triage Queue Display */}
            <Stack gap="md">
              {[].map((patient, index) => (
                <Card key={patient.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon color={getTriageColor(patient.triageLevel)} size="xl" radius="md">
                        <Text fw={700} c="white">
                          {patient.triageLevel}
                        </Text>
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="lg">
                          {patient.patientName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {patient.complaint}
                        </Text>
                      </div>
                    </Group>

                    <Group>
                      <div style={{ textAlign: 'right' }}>
                        <Text size="sm" fw={500}>
                          Wait Time: {patient.waitTime}min
                        </Text>
                        <Text size="xs" c="dimmed">
                          Priority: {getTriageLabel(parseInt(patient.triageLevel))}
                        </Text>
                      </div>
                      <Badge color={getTriageColor(patient.triageLevel)} variant="light" size="lg">
                        #{index + 1}
                      </Badge>
                    </Group>
                  </Group>

                  <Group justify="space-between" mt="md">
                    <Text size="sm" c="dimmed">
                      Assigned: {patient.assignedNurse}
                    </Text>
                    <Group>
                      <ActionIcon variant="subtle" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconCheck size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Emergency Cases Tab */}
        <Tabs.Panel value="cases">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Emergency Cases</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openAddCase} color="red">
                New Emergency Case
              </Button>
            </Group>

            {/* Case Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search cases..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Triage Level"
                data={[
                  { value: '1', label: 'Level 1 - Resuscitation' },
                  { value: '2', label: 'Level 2 - Emergency' },
                  { value: '3', label: 'Level 3 - Urgent' },
                  { value: '4', label: 'Level 4 - Less Urgent' },
                  { value: '5', label: 'Level 5 - Non-urgent' },
                ]}
                value={selectedTriage}
                onChange={setSelectedTriage}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'waiting', label: 'Waiting' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'transferred', label: 'Transferred' },
                  { value: 'discharged', label: 'Discharged' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Cases Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Case #</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Triage</Table.Th>
                    <Table.Th>Chief Complaint</Table.Th>
                    <Table.Th>Arrival Time</Table.Th>
                    <Table.Th>Assigned Staff</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[].length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <EmptyState
                          icon={<IconAmbulance size={48} />}
                          title="No emergency cases"
                          description="Register emergency cases as they arrive"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    [].map((emergencyCase) => (
                      <Table.Tr key={emergencyCase.id}>
                        <Table.Td>
                          <Text fw={500}>{emergencyCase.caseNumber}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Avatar color="red" radius="xl" size="sm">
                              {emergencyCase.patient.firstName[0]}
                              {emergencyCase.patient.lastName[0]}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {emergencyCase.patient.firstName} {emergencyCase.patient.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                DOB: {emergencyCase.patient.dateOfBirth}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <ThemeIcon
                              color={getTriageColor(emergencyCase.triageLevel)}
                              size="md"
                              radius="md"
                            >
                              <Text fw={700} c="white" size="xs">
                                {emergencyCase.triageLevel}
                              </Text>
                            </ThemeIcon>
                            <div>
                              <Text size="sm" fw={500}>
                                {getTriageLabel(emergencyCase.triageLevel)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {emergencyCase.assignedTo}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2} style={{ maxWidth: 200 }}>
                            {emergencyCase.chiefComplaint}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date(emergencyCase.arrivalTime).toLocaleTimeString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {emergencyCase.assignedTo || 'Not Assigned'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Priority: {emergencyCase.priority}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(emergencyCase.status)} variant="light">
                            {emergencyCase.status.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewCase(emergencyCase)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="orange">
                              <IconActivity size={16} />
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

        {/* ICU Management Tab */}
        <Tabs.Panel value="icu">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>ICU Bed Management</Title>
              <Group>
                <Button leftSection={<IconBed size={16} />} variant="light">
                  Bed Assignment
                </Button>
                <Button leftSection={<IconActivity size={16} />}>Monitor Vitals</Button>
              </Group>
            </Group>

            {/* Bed Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search beds..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Bed Status"
                data={[
                  { value: 'available', label: 'Available' },
                  { value: 'occupied', label: 'Occupied' },
                  { value: 'cleaned', label: 'Cleaned' },
                  { value: 'maintenance', label: 'Maintenance' },
                ]}
                value={selectedBedStatus}
                onChange={setSelectedBedStatus}
                clearable
              />
            </Group>

            {/* ICU Beds Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map((bed) => (
                <Card key={bed.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        Bed {bed.bedNumber}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {bed.ward} - {bed.roomNumber}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(bed.status)} variant="light">
                      {bed.status}
                    </Badge>
                  </Group>

                  {bed.patient && (
                    <>
                      <Group mb="md">
                        <Avatar color="blue" radius="xl">
                          {bed.patient.firstName[0]}
                          {bed.patient.lastName[0]}
                        </Avatar>
                        <div>
                          <Text fw={500}>
                            {bed.patient.firstName} {bed.patient.lastName}
                          </Text>
                          <Text size="sm" c="dimmed">
                            Age: {bed.patient.age} | ID: {bed.patient.patientId}
                          </Text>
                        </div>
                      </Group>

                      <Text size="sm" fw={500} mb="sm">
                        Current Vitals
                      </Text>
                      <Stack gap="xs" mb="md">
                        <Group
                          justify="space-between"
                          p="xs"
                          style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                        >
                          <Group gap="xs">
                            <IconHeart size={16} color="red" />
                            <Text size="sm">Heart Rate</Text>
                          </Group>
                          <Text size="sm" fw={600}>
                            {bed.currentVitals?.heartRate} bpm
                          </Text>
                        </Group>
                        <Group
                          justify="space-between"
                          p="xs"
                          style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                        >
                          <Group gap="xs">
                            <IconActivity size={16} color="blue" />
                            <Text size="sm">Blood Pressure</Text>
                          </Group>
                          <Text size="sm" fw={600}>
                            {bed.currentVitals?.bloodPressure.systolic}/
                            {bed.currentVitals?.bloodPressure.diastolic}
                          </Text>
                        </Group>
                        <Group
                          justify="space-between"
                          p="xs"
                          style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                        >
                          <Group gap="xs">
                            <IconLungs size={16} color="green" />
                            <Text size="sm">Oxygen</Text>
                          </Group>
                          <Text size="sm" fw={600}>
                            {bed.currentVitals?.oxygenSaturation}%
                          </Text>
                        </Group>
                      </Stack>
                    </>
                  )}

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Last Updated:{' '}
                      {bed.lastUpdated ? new Date(bed.lastUpdated).toLocaleTimeString() : 'N/A'}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleViewBed(bed)}>
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconActivity size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconSettings size={16} />
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
              <Title order={3}>Critical Care Equipment</Title>
              <Button leftSection={<IconSettings size={16} />}>Equipment Check</Button>
            </Group>

            {/* Equipment Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map((equipment) => (
                <Card key={equipment.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        {equipment.equipmentName}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {equipment.location}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(equipment.status)} variant="light">
                      {equipment.status.replace('_', ' ')}
                    </Badge>
                  </Group>

                  <Stack gap="sm" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Model
                      </Text>
                      <Text size="sm" fw={500}>
                        {equipment.model}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Serial
                      </Text>
                      <Text size="sm" fw={500}>
                        {equipment.serialNumber}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Last Maintenance
                      </Text>
                      <Text size="sm">{equipment.lastMaintenanceDate}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Next Due
                      </Text>
                      <Text size="sm" c="dimmed">
                        {equipment.nextMaintenanceDate}
                      </Text>
                    </Group>
                  </Stack>

                  {equipment.currentReadings && (
                    <Alert variant="light" color="blue" mb="md">
                      <Text size="sm">
                        <strong>Current Reading:</strong> {equipment.currentReadings}
                      </Text>
                    </Alert>
                  )}

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Technician: {equipment.assignedTechnician}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconSettings size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconClipboard size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Protocols Tab */}
        <Tabs.Panel value="protocols">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Emergency Protocols</Title>
              <Button leftSection={<IconPlus size={16} />}>Add Protocol</Button>
            </Group>

            {/* Emergency Protocols */}
            <Stack gap="lg">
              {[].map((protocol) => (
                <Card key={protocol.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        {protocol.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {protocol.category}
                      </Text>
                    </div>
                    <Group>
                      <Badge color="blue" variant="light">
                        Version {protocol.version}
                      </Badge>
                      <Badge color="green" variant="light">
                        Active
                      </Badge>
                    </Group>
                  </Group>

                  <Text size="sm" mb="md">
                    {protocol.description}
                  </Text>

                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Protocol Steps
                    </Text>
                    <Stepper active={-1}>
                      {protocol.steps.map((step, index) => (
                        <Stepper.Step key={index} label={`Step ${index + 1}`} description={step} />
                      ))}
                    </Stepper>
                  </div>

                  <Group justify="space-between" mt="md">
                    <Text size="xs" c="dimmed">
                      Last Updated: {protocol.lastUpdated}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue">
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
              ))}
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Case Detail Modal */}
      <Modal
        opened={caseDetailOpened}
        onClose={closeCaseDetail}
        title="Emergency Case Details"
        size="xl"
      >
        {selectedCase && (
          <ScrollArea h={600}>
            <Stack gap="md">
              <Group>
                <Avatar color="red" size="xl" radius="xl">
                  {selectedCase.patient.firstName[0]}
                  {selectedCase.patient.lastName[0]}
                </Avatar>
                <div>
                  <Title order={3}>
                    {selectedCase.patient.firstName} {selectedCase.patient.lastName}
                  </Title>
                  <Text c="dimmed">Case: {selectedCase.caseNumber}</Text>
                  <Badge color={getStatusColor(selectedCase.status)} variant="light" mt="xs">
                    {selectedCase.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Group>

              <Divider />

              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Triage Level
                  </Text>
                  <Group>
                    <ThemeIcon
                      color={getTriageColor(selectedCase.triageLevel)}
                      size="sm"
                      radius="md"
                    >
                      <Text fw={700} c="white" size="xs">
                        {selectedCase.triageLevel}
                      </Text>
                    </ThemeIcon>
                    <Text size="sm">{getTriageLabel(selectedCase.triageLevel)}</Text>
                  </Group>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Arrival Time
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(selectedCase.arrivalTime).toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Chief Complaint
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedCase.chiefComplaint}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Assigned To
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedCase.assignedTo || 'Not Assigned'}
                  </Text>
                </div>
              </SimpleGrid>

              {/* Vitals not available in simplified mock; display basic info instead */}
              <Divider />
              <div>
                <Text size="sm" fw={500} mb="sm">
                  Summary
                </Text>
                <SimpleGrid cols={2}>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm">Bed</Text>
                    <Text size="sm" fw={600}>
                      {selectedCase.bedNumber || '—'}
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm">Priority</Text>
                    <Text size="sm" fw={600}>
                      {selectedCase.priority ?? '—'}
                    </Text>
                  </Group>
                </SimpleGrid>
              </div>

              <Group justify="flex-end">
                <Button variant="light" onClick={closeCaseDetail}>
                  Close
                </Button>
                <Button>Update Case</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Add Case Modal */}
      <Modal opened={addCaseOpened} onClose={closeAddCase} title="New Emergency Case" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <Select
              label="Patient"
              placeholder="Select patient"
              data={[]} // TODO: Fetch from patients API
              searchable
              required
            />
            <Select
              label="Triage Level"
              placeholder="Select triage level"
              data={[
                { value: '1', label: 'Level 1 - Resuscitation' },
                { value: '2', label: 'Level 2 - Emergency' },
                { value: '3', label: 'Level 3 - Urgent' },
                { value: '4', label: 'Level 4 - Less Urgent' },
                { value: '5', label: 'Level 5 - Non-urgent' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea label="Chief Complaint" placeholder="Enter chief complaint" rows={3} required />

          <Select
            label="Mode of Arrival"
            placeholder="Select mode of arrival"
            data={[
              { value: 'ambulance', label: 'Ambulance' },
              { value: 'walk_in', label: 'Walk-in' },
              { value: 'police', label: 'Police' },
              { value: 'helicopter', label: 'Helicopter' },
            ]}
            required
          />

          <Text size="sm" fw={500} mt="md">
            Initial Vital Signs
          </Text>
          <SimpleGrid cols={3}>
            <NumberInput label="Heart Rate (bpm)" placeholder="72" />
            <TextInput label="Blood Pressure" placeholder="120/80" />
            <NumberInput label="Temperature (°F)" placeholder="98.6" />
            <NumberInput label="Oxygen Saturation (%)" placeholder="98" />
            <NumberInput label="Respiratory Rate" placeholder="16" />
            <NumberInput label="Pain Scale (0-10)" placeholder="0" min={0} max={10} />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddCase}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                notifications.show({
                  title: 'Emergency Case Created',
                  message: 'New emergency case has been added to the system',
                  color: 'green',
                });
                closeAddCase();
              }}
            >
              Create Case
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Code Blue Protocol Modal */}
      <Modal opened={protocolOpened} onClose={closeProtocol} title="Code Blue Protocol" size="lg">
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={16} />}>
            <strong>Code Blue Activated</strong> - Emergency cardiac arrest response protocol initiated
          </Alert>

          <Stepper active={0} orientation="vertical">
            <Stepper.Step
              label="Step 1"
              description="Call for help and activate Code Blue team"
              completedIcon={<IconCheck size={16} />}
            >
              <Text size="sm" c="dimmed">
                Immediately call &ldquo;Code Blue&rdquo; over hospital intercom and alert cardiac arrest response team
              </Text>
            </Stepper.Step>
            <Stepper.Step
              label="Step 2"
              description="Start CPR and attach AED"
              completedIcon={<IconCheck size={16} />}
            >
              <Text size="sm" c="dimmed">
                Begin chest compressions at 100-120/min rate and attach automated external defibrillator
              </Text>
            </Stepper.Step>
            <Stepper.Step
              label="Step 3"
              description="Establish IV access and administer epinephrine"
              completedIcon={<IconCheck size={16} />}
            >
              <Text size="sm" c="dimmed">
                Insert intravenous line and administer 1mg epinephrine IV every 3-5 minutes
              </Text>
            </Stepper.Step>
            <Stepper.Step
              label="Step 4"
              description="Advanced cardiac life support"
              completedIcon={<IconCheck size={16} />}
            >
              <Text size="sm" c="dimmed">
                Continue ACLS protocol including airway management, rhythm analysis, and defibrillation
              </Text>
            </Stepper.Step>
          </Stepper>

          <SimpleGrid cols={2} spacing="md">
            <Button variant="light" color="red" fullWidth>
              Emergency Contacts
            </Button>
            <Button variant="light" color="blue" fullWidth>
              Equipment Checklist
            </Button>
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeProtocol}>
              Close
            </Button>
            <Button color="red">Activate Response Team</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add to Triage Modal */}
      <Modal opened={triageOpened} onClose={closeTriage} title="Add Patient to Triage" size="lg">
        <Stack gap="md">
          <TextInput
            label="Patient Name"
            placeholder="Enter patient name"
            required
          />

          <TextInput
            label="Patient ID"
            placeholder="Enter patient ID or registration number"
          />

          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Age Group"
              placeholder="Select age group"
              data={[
                { value: 'infant', label: 'Infant (0-1 year)' },
                { value: 'child', label: 'Child (1-12 years)' },
                { value: 'adolescent', label: 'Adolescent (13-18 years)' },
                { value: 'adult', label: 'Adult (19-64 years)' },
                { value: 'elderly', label: 'Elderly (65+ years)' },
              ]}
              required
            />
            <Select
              label="Gender"
              placeholder="Select gender"
              data={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              required
            />
          </SimpleGrid>

          <Select
            label="Triage Level"
            placeholder="Select triage level"
            data={[
              { value: '1', label: 'Level 1 - Resuscitation (Immediate)' },
              { value: '2', label: 'Level 2 - Emergency (Urgent)' },
              { value: '3', label: 'Level 3 - Urgent (Less urgent)' },
              { value: '4', label: 'Level 4 - Less Urgent (Semi-urgent)' },
              { value: '5', label: 'Level 5 - Non-urgent (Non-urgent)' },
            ]}
            required
          />

          <Textarea
            label="Chief Complaint"
            placeholder="Describe the main complaint or reason for visit"
            minRows={3}
            required
          />

          <Select
            label="Assigned Nurse"
            placeholder="Select assigned nurse"
            data={[
              { value: 'nurse1', label: 'Nurse Sarah Johnson' },
              { value: 'nurse2', label: 'Nurse Michael Chen' },
              { value: 'nurse3', label: 'Nurse Emily Davis' },
              { value: 'nurse4', label: 'Nurse Robert Wilson' },
            ]}
            required
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeTriage}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Patient Added to Triage',
                  message: 'Patient has been successfully added to the triage queue',
                  color: 'green',
                });
                closeTriage();
              }}
            >
              Add to Triage
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default EmergencyManagement;
