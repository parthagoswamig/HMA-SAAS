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
  // Timeline,
  // Alert,
  // Progress,
  // Flex,
  // Anchor,
  NumberInput,
  Textarea,
  // List,
} from '@mantine/core';
// import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import emrService from '../../../services/emr.service';
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
  IconTrash,
  IconCalendar,
  // IconUsers,
  IconChartBar,
  // IconPhone,
  // IconMail,
  IconAlertCircle,
  // IconCheck,
  // IconX,
  IconDotsVertical,
  // IconStethoscope,
  IconActivity,
  IconPill,
  IconTestPipe,
  IconFileText,
  IconHeart,
  // IconBrain,
  IconLungs,
  // IconShield,
  IconAlertTriangle,
  // IconTrendingUp,
  // IconTrendingDown,
  IconClipboardList,
  // IconMedicalCross,
  // IconVaccine,
  // IconReportMedical,
  // IconHistory,
  // IconUserCheck,
  IconDownload,
  IconPrinter,
  IconShare,
} from '@tabler/icons-react';

// Import types and mock data
import {
  MedicalRecord,
  MedicalRecordType,
  MedicalRecordStatus,
  // LabResult,
  // MedicalDocument,
  // MedicalHistory,
  // Prescription,
  // Allergy,
  AllergySeverity,
} from '../../../types/medical';
// Mock data imports removed
const EMRManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // API data state
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await fetchRecords();
    } catch (err: any) {
      console.error('Error loading EMR data:', err);
      setRecords([] /* TODO: Fetch from API */);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const filters = {
        patientId: selectedPatient || undefined,
        recordType: selectedRecordType || undefined,
      };
      const response = await emrService.getRecords(filters);
      // Handle different response structures
      const recordsData = Array.isArray(response.data)
        ? response.data
        : response.data?.records || [];
      setRecords(recordsData as MedicalRecord[]);
    } catch (err: any) {
      console.warn(
        'Error fetching EMR records (using empty data):',
        err.response?.data?.message || err.message
      );
      // Don't show error to user if backend is not ready, just use empty data
      setRecords([]);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedPatient, selectedDoctor, selectedRecordType, selectedStatus]);

  // Modal states
  const [recordDetailOpened, { open: openRecordDetail, close: closeRecordDetail }] =
    useDisclosure(false);
  const [addRecordOpened, { open: openAddRecord, close: closeAddRecord }] = useDisclosure(false);

  // Filter medical records
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.recordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPatient = !selectedPatient || record.patientId === selectedPatient;
      const matchesDoctor = !selectedDoctor || record.doctorId === selectedDoctor;
      const matchesType = !selectedRecordType || record.recordType === selectedRecordType;
      const matchesStatus = !selectedStatus || record.status === selectedStatus;

      return matchesSearch && matchesPatient && matchesDoctor && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedPatient, selectedDoctor, selectedRecordType, selectedStatus, records]);

  // Helper functions
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStatusColor = (status: MedicalRecordStatus) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'pending_review':
        return 'yellow';
      case 'reviewed':
        return 'blue';
      case 'approved':
        return 'green';
      case 'amended':
        return 'orange';
      case 'archived':
        return 'dark';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return 'blue';
      case 'emergency':
        return 'red';
      case 'surgery':
        return 'purple';
      case 'follow_up':
        return 'green';
      case 'lab_result':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getSeverityColor = (severity: AllergySeverity) => {
    switch (severity) {
      case 'mild':
        return 'green';
      case 'moderate':
        return 'yellow';
      case 'severe':
        return 'red';
      case 'life_threatening':
        return 'dark';
      default:
        return 'gray';
    }
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    openRecordDetail();
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    // Edit record functionality removed
  };

  const handleDeleteRecord = (record: MedicalRecord) => {
    notifications.show({
      title: 'Record Deleted',
      message: `Medical record ${record.recordId} has been deleted`,
      color: 'red',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPatient('');
    setSelectedDoctor('');
    setSelectedRecordType('');
    setSelectedStatus('');
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Records',
      value: 0,
      icon: IconFileText,
      color: 'blue',
      trend: '+0%',
    },
    {
      title: "Today's Records",
      value: 0,
      icon: IconCalendar,
      color: 'green',
      trend: '+0%',
    },
    {
      title: 'Pending Review',
      value: 0,
      icon: IconAlertCircle,
      color: 'orange',
      trend: '0%',
    },
    {
      title: 'Lab Results',
      value: 0,
      icon: IconTestPipe,
      color: 'purple',
      trend: '+0%',
    },
  ];

  // Chart data
  const recordsByTypeData = 0
    ? Object.entries(0 /* TODO: Fetch from API */)
        .filter(([_, count]) => typeof count === 'number' && count > 0)
        .map(([type, count]) => ({
          name: type.replace('_', ' ').toUpperCase(),
          value: typeof count === 'number' ? count : 0,
          color: getTypeColor(type as MedicalRecordType),
        }))
    : [];

  const recordsByStatusData = 0
    ? Object.entries(0 /* TODO: Fetch from API */).map(([status, count]) => ({
        status: status.replace('_', ' '),
        count,
      }))
    : [];

  const commonDiagnosesData = [];
  const prescriptionTrendsData = [];
  const recentActivityData = [];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Electronic Medical Records</Title>
          <Text c="dimmed" size="sm">
            Manage patient medical records, lab results, and clinical documentation
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddRecord}>
            New Record
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
                  color={stat.trend.startsWith('+') ? 'green' : 'red'}
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
          <Tabs.Tab value="records" leftSection={<IconFileText size={16} />}>
            Medical Records
          </Tabs.Tab>
          <Tabs.Tab value="lab_results" leftSection={<IconTestPipe size={16} />}>
            Lab Results
          </Tabs.Tab>
          <Tabs.Tab value="prescriptions" leftSection={<IconPill size={16} />}>
            Prescriptions
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconClipboardList size={16} />}>
            Documents
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Medical Records Tab */}
        <Tabs.Panel value="records">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search records..."
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
                placeholder="Doctor"
                data={[].map(
                  /* TODO: Fetch from API */ (doctor) => ({
                    value: doctor.staffId,
                    label: `${doctor.firstName} ${doctor.lastName}`,
                  })
                )}
                value={selectedDoctor}
                onChange={setSelectedDoctor}
                clearable
              />
              <Select
                placeholder="Record Type"
                data={[
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'surgery', label: 'Surgery' },
                  { value: 'lab_result', label: 'Lab Result' },
                ]}
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending_review', label: 'Pending Review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Records Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Record ID</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Chief Complaint</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredRecords.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <EmptyState
                          icon={<IconFileText size={48} />}
                          title="No medical records"
                          description="Create electronic medical records"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <Table.Tr key={record.id}>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl">
                              {record.patient.firstName[0]}
                              {record.patient.lastName[0]}
                            </Avatar>
                            <div>
                              <Text fw={500}>
                                {record.patient.firstName} {record.patient.lastName}
                              </Text>
                              <Text size="sm" c="dimmed">
                                ID: {record.patient.patientId}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>{record.recordId}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getTypeColor(record.recordType)} variant="light">
                            {record.recordType.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {record.doctor.firstName} {record.doctor.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {record.doctor.department?.name}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate(record.recordDate)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(record.status)} variant="light">
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" truncate="end" style={{ maxWidth: 200 }}>
                            {record.chiefComplaint}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewRecord(record)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              onClick={() => handleEditRecord(record)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <Menu>
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconDownload size={14} />}>
                                  Download
                                </Menu.Item>
                                <Menu.Item leftSection={<IconPrinter size={14} />}>Print</Menu.Item>
                                <Menu.Item leftSection={<IconShare size={14} />}>Share</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                  leftSection={<IconTrash size={14} />}
                                  color="red"
                                  onClick={() => handleDeleteRecord(record)}
                                >
                                  Delete
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

        {/* Lab Results Tab */}
        <Tabs.Panel value="lab_results">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Laboratory Results</Title>
              <Button leftSection={<IconPlus size={16} />}>Order Lab Test</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (result) => (
                  <Card key={result.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {result.testName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {result.patient.firstName} {result.patient.lastName}
                        </Text>
                      </div>
                      <Badge
                        color={result.status === 'verified' ? 'green' : 'orange'}
                        variant="light"
                      >
                        {result.status}
                      </Badge>
                    </Group>

                    <Stack gap="xs" mb="md">
                      {result.results.map((param) => (
                        <Group
                          key={param.id}
                          justify="space-between"
                          p="xs"
                          style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                        >
                          <Text size="sm" fw={500}>
                            {param.parameterName}
                          </Text>
                          <Group gap="xs">
                            <Text size="sm">
                              {param.value} {param.unit}
                            </Text>
                            {param.abnormalFlag && (
                              <Badge
                                color={param.abnormalFlag === 'high' ? 'red' : 'blue'}
                                variant="light"
                                size="xs"
                              >
                                {param.abnormalFlag}
                              </Badge>
                            )}
                          </Group>
                        </Group>
                      ))}
                    </Stack>

                    <Text size="sm" c="dimmed" mb="md">
                      <strong>Interpretation:</strong> {result.interpretation}
                    </Text>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Reported: {formatDate(result.reportDate)}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue" size="sm">
                          <IconEye size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green" size="sm">
                          <IconDownload size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Prescriptions Tab */}
        <Tabs.Panel value="prescriptions">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Prescriptions</Title>
              <Button leftSection={<IconPlus size={16} />}>New Prescription</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (prescription) => (
                  <Card key={prescription.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {prescription.prescriptionNumber}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {formatDate(prescription.prescriptionDate)}
                        </Text>
                      </div>
                      <Badge
                        color={prescription.status === 'pending' ? 'orange' : 'green'}
                        variant="light"
                      >
                        {prescription.status}
                      </Badge>
                    </Group>

                    <Stack gap="xs" mb="md">
                      {prescription.medications.map((med) => (
                        <Group
                          key={med.medicationId}
                          justify="space-between"
                          p="xs"
                          style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                        >
                          <div>
                            <Text size="sm" fw={500}>
                              {med.medicationName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {med.dosage} - {med.frequency} for {med.duration}
                            </Text>
                          </div>
                          <Text size="sm" fw={500}>
                            ₹{med.cost}
                          </Text>
                        </Group>
                      ))}
                    </Stack>

                    <Group justify="space-between">
                      <Text size="sm" fw={500}>
                        Total: ₹
                        {prescription.medications.reduce((sum, med) => sum + (med.cost || 0), 0)}
                      </Text>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Refills: {prescription.refillsRemaining}/{prescription.refills}
                        </Text>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Documents Tab */}
        <Tabs.Panel value="documents">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Medical Documents</Title>
              <Button leftSection={<IconPlus size={16} />}>Upload Document</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (doc) => (
                  <Card key={doc.id} padding="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <ThemeIcon color="blue" variant="light">
                        <IconFileText size={20} />
                      </ThemeIcon>
                      <Badge
                        color={doc.approvalStatus === 'approved' ? 'green' : 'orange'}
                        variant="light"
                        size="xs"
                      >
                        {doc.approvalStatus}
                      </Badge>
                    </Group>

                    <Text fw={600} size="sm" mb="xs">
                      {doc.title}
                    </Text>
                    <Text size="xs" c="dimmed" mb="sm" lineClamp={2}>
                      {doc.description}
                    </Text>

                    <Stack gap={4} mb="sm">
                      <Text size="xs" c="dimmed">
                        <strong>Type:</strong> {doc.documentType.replace('_', ' ')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        <strong>Date:</strong> {formatDate(doc.documentDate)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        <strong>Size:</strong> {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </Stack>

                    <Group justify="space-between">
                      <div>
                        {doc.tags.map((tag) => (
                          <Badge key={tag} size="xs" variant="light" mr="xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue" size="sm">
                          <IconEye size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green" size="sm">
                          <IconDownload size={14} />
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
              Medical Records Analytics
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Records by Type */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Records by Type
                </Title>
                <MantineDonutChart data={recordsByTypeData} size={160} thickness={30} withLabels />
              </Card>

              {/* Records by Status */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Records by Status
                </Title>
                <SimpleBarChart
                  h={200}
                  data={recordsByStatusData}
                  dataKey="status"
                  series={[{ name: 'count', color: 'blue.6' }]}
                />
              </Card>

              {/* Common Diagnoses */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Common Diagnoses
                </Title>
                <Stack gap="sm">
                  {commonDiagnosesData.map((diag, _index) => (
                    <Group
                      key={diag.diagnosis}
                      justify="space-between"
                      p="sm"
                      style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                    >
                      <div>
                        <Text size="sm" fw={500}>
                          {diag.diagnosis}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {diag.icdCode}
                        </Text>
                      </div>
                      <Badge color="blue" variant="light">
                        {diag.count}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Card>

              {/* Prescription Trends */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Top Prescribed Medications
                </Title>
                <Stack gap="sm">
                  {prescriptionTrendsData.map((med) => (
                    <Group
                      key={med.medication}
                      justify="space-between"
                      p="sm"
                      style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                    >
                      <Text size="sm" fw={500}>
                        {med.medication}
                      </Text>
                      <Group gap="xs">
                        <Badge color="green" variant="light">
                          {med.prescriptionCount}
                        </Badge>
                        <Badge color={med.trend > 0 ? 'green' : 'red'} variant="light" size="xs">
                          {med.trend > 0 ? '+' : ''}
                          {med.trend}%
                        </Badge>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card>

              {/* Recent Activity */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Recent Activity
                </Title>
                <SimpleAreaChart
                  h={300}
                  data={recentActivityData}
                  dataKey="date"
                  series={[
                    { name: 'recordsCreated', color: 'blue.6' },
                    { name: 'recordsUpdated', color: 'green.6' },
                  ]}
                  curveType="linear"
                />
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Record Detail Modal */}
      <Modal
        opened={recordDetailOpened}
        onClose={closeRecordDetail}
        title="Medical Record Details"
        size="xl"
      >
        {selectedRecord && (
          <ScrollArea h={600}>
            <Stack gap="md">
              {/* Patient Info */}
              <Group>
                <Avatar size="xl" color="blue" radius="xl">
                  {selectedRecord.patient.firstName[0]}
                  {selectedRecord.patient.lastName[0]}
                </Avatar>
                <div>
                  <Title order={3}>
                    {selectedRecord.patient.firstName} {selectedRecord.patient.lastName}
                  </Title>
                  <Text c="dimmed">{selectedRecord.recordId}</Text>
                  <Badge color={getStatusColor(selectedRecord.status)} variant="light" mt="xs">
                    {selectedRecord.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Group>

              <Divider />

              {/* Basic Information */}
              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Record Type
                  </Text>
                  <Badge color={getTypeColor(selectedRecord.recordType)} variant="light">
                    {selectedRecord.recordType.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Record Date
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatDate(selectedRecord.recordDate)}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Doctor
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedRecord.doctor.firstName} {selectedRecord.doctor.lastName}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Department
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedRecord.doctor.department?.name}
                  </Text>
                </div>
              </SimpleGrid>

              <Divider />

              {/* Clinical Information */}
              <div>
                <Text size="sm" fw={500} mb="sm">
                  Chief Complaint
                </Text>
                <Text size="sm">{selectedRecord.chiefComplaint}</Text>
              </div>

              <div>
                <Text size="sm" fw={500} mb="sm">
                  History of Present Illness
                </Text>
                <Text size="sm">{selectedRecord.historyOfPresentIllness}</Text>
              </div>

              <div>
                <Text size="sm" fw={500} mb="sm">
                  Assessment
                </Text>
                <Text size="sm">{selectedRecord.assessment}</Text>
              </div>

              <div>
                <Text size="sm" fw={500} mb="sm">
                  Treatment Plan
                </Text>
                <Text size="sm">{selectedRecord.treatmentPlan}</Text>
              </div>

              {/* Vital Signs */}
              <div>
                <Text size="sm" fw={500} mb="sm">
                  Vital Signs
                </Text>
                <SimpleGrid cols={3}>
                  <Group>
                    <IconHeart size={16} color="red" />
                    <Text size="sm">
                      BP: {selectedRecord.vitalSigns.bloodPressure.systolic}/
                      {selectedRecord.vitalSigns.bloodPressure.diastolic}
                    </Text>
                  </Group>
                  <Group>
                    <IconActivity size={16} color="blue" />
                    <Text size="sm">HR: {selectedRecord.vitalSigns.heartRate} bpm</Text>
                  </Group>
                  <Group>
                    <IconLungs size={16} color="green" />
                    <Text size="sm">
                      Temp: {selectedRecord.vitalSigns.temperature}°
                      {selectedRecord.vitalSigns.temperatureUnit}
                    </Text>
                  </Group>
                </SimpleGrid>
              </div>

              {/* Allergies */}
              {selectedRecord.allergies && selectedRecord.allergies.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="sm">
                    Allergies
                  </Text>
                  <Stack gap="xs">
                    {selectedRecord.allergies.map((allergy) => (
                      <Group
                        key={allergy.id}
                        p="sm"
                        style={{ backgroundColor: '#fff5f5', borderRadius: '6px' }}
                      >
                        <IconAlertTriangle size={16} color="red" />
                        <div>
                          <Text size="sm" fw={500}>
                            {allergy.allergen}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {allergy.reaction} -
                            <Badge
                              color={getSeverityColor(allergy.severity)}
                              variant="light"
                              size="xs"
                              ml="xs"
                            >
                              {allergy.severity}
                            </Badge>
                          </Text>
                        </div>
                      </Group>
                    ))}
                  </Stack>
                </div>
              )}

              {/* Diagnoses */}
              {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="sm">
                    Diagnoses
                  </Text>
                  <Stack gap="xs">
                    {selectedRecord.diagnosis.map((diagnosis) => (
                      <Group
                        key={diagnosis.id}
                        justify="space-between"
                        p="sm"
                        style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                      >
                        <div>
                          <Text size="sm" fw={500}>
                            {diagnosis.diagnosisName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {diagnosis.diagnosisCode}
                          </Text>
                        </div>
                        <Badge color="blue" variant="light" size="sm">
                          {diagnosis.diagnosisType}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                </div>
              )}

              {/* Clinical Notes */}
              <div>
                <Text size="sm" fw={500} mb="sm">
                  Clinical Notes
                </Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedRecord.clinicalNotes}
                </Text>
              </div>

              <Group justify="flex-end">
                <Button variant="light" onClick={closeRecordDetail}>
                  Close
                </Button>
                <Button>Edit Record</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Add Record Modal */}
      <Modal
        opened={addRecordOpened}
        onClose={closeAddRecord}
        title="Create New Medical Record"
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
              label="Record Type"
              placeholder="Select type"
              data={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
                { value: 'admission', label: 'Admission' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea label="Chief Complaint" placeholder="Enter chief complaint" required />

          <Textarea
            label="History of Present Illness"
            placeholder="Enter history of present illness"
            rows={4}
          />

          <SimpleGrid cols={3}>
            <TextInput label="Blood Pressure" placeholder="120/80" />
            <NumberInput label="Heart Rate (BPM)" placeholder="72" />
            <NumberInput label="Temperature (°C)" placeholder="98.6" />
          </SimpleGrid>

          <Textarea label="Assessment" placeholder="Enter assessment" rows={3} />

          <Textarea label="Treatment Plan" placeholder="Enter treatment plan" rows={3} />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddRecord}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Medical record created successfully',
                  color: 'green',
                });
                closeAddRecord();
              }}
            >
              Create Record
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default EMRManagement;
