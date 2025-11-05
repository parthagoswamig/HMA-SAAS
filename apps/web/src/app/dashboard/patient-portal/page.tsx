'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Modal,
  Text,
  Tabs,
  Card,
  Avatar,
  ActionIcon,
  Stack,
  ThemeIcon,
  Alert,
  Textarea,
  Timeline,
  Indicator,
  rem,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {  DatePickerInput } from '@mantine/dates';
import patientPortalService from '../../../services/patient-portal.service';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconCalendar,
  IconChartBar,
  IconX,
  IconReportMedical,
  IconFileText,
  IconDownload,
  IconShare,
  IconSettings,
  IconRefresh,
  IconStethoscope,
  IconFlask,
  IconPill,
  IconCut,
  IconCalendarEvent,
  IconUserCircle,
  IconMessage,
  IconSend,
  IconBell,
} from '@tabler/icons-react';

// Import types and mock data
// Types are inferred from mock data
// Mock data imports removed
const PatientPortal = () => {
  // Current logged-in patient (mock data)
  const currentPatient = []; // TODO: Fetch from API

  // State management
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [selectedTestResult, setSelectedTestResult] = useState<any | null>(null);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // API data state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await patientPortalService.getMyAppointments();
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([] /* TODO: Fetch from API */);
    }
  }, []);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const response = await patientPortalService.getMyPrescriptions();
      setPrescriptions(response.data || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setPrescriptions([] /* TODO: Fetch from API */);
    }
  }, []);

  const fetchLabResults = useCallback(async () => {
    try {
      const response = await patientPortalService.getMyLabResults();
      setLabResults(response.data || []);
    } catch (err) {
      console.error('Error fetching lab results:', err);
      setLabResults([] /* TODO: Fetch from API */);
    }
  }, []);

  const fetchMedicalRecords = useCallback(async () => {
    try {
      const response = await patientPortalService.getMyRecords();
      setMedicalRecords(response.data || []);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setMedicalRecords([] /* TODO: Fetch from API */);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchAppointments(),
        fetchPrescriptions(),
        fetchLabResults(),
        fetchMedicalRecords(),
      ]);
    } catch (err: any) {
      console.error('Error loading patient portal data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
      setAppointments([] /* TODO: Fetch from API */);
      setPrescriptions([] /* TODO: Fetch from API */);
      setLabResults([] /* TODO: Fetch from API */);
      setMedicalRecords([] /* TODO: Fetch from API */);
    } finally {
      setLoading(false);
    }
  }, [fetchAppointments, fetchPrescriptions, fetchLabResults, fetchMedicalRecords]);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Modal states
  const [appointmentDetailOpened, { open: openAppointmentDetail, close: closeAppointmentDetail }] =
    useDisclosure(false);
  const [bookAppointmentOpened, { open: openBookAppointment, close: closeBookAppointment }] =
    useDisclosure(false);
  const [
    prescriptionDetailOpened,
    { open: openPrescriptionDetail, close: closePrescriptionDetail },
  ] = useDisclosure(false);
  const [testResultDetailOpened, { open: openTestResultDetail, close: closeTestResultDetail }] =
    useDisclosure(false);
  const [
    medicalRecordDetailOpened,
    { open: openMedicalRecordDetail, close: closeMedicalRecordDetail },
  ] = useDisclosure(false);
  const [profileSettingsOpened, { open: openProfileSettings, close: closeProfileSettings }] =
    useDisclosure(false);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        appointment.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        appointment.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;

      const matchesType = !selectedAppointmentType || appointment.type === selectedAppointmentType;
      const matchesStatus = !selectedStatus || appointment.status === selectedStatus;
      const matchesDoctor = !selectedDoctor || appointment.doctor === selectedDoctor;

      return matchesSearch && matchesType && matchesStatus && matchesDoctor;
    });
  }, [appointments, searchQuery, selectedAppointmentType, selectedStatus, selectedDoctor]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'confirmed':
        return 'green';
      case 'in_progress':
        return 'orange';
      case 'completed':
        return 'teal';
      case 'cancelled':
        return 'red';
      case 'no_show':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'blue';
      case 'follow_up':
        return 'green';
      case 'emergency':
        return 'red';
      case 'procedure':
        return 'purple';
      case 'diagnostic':
        return 'orange';
      case 'vaccination':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'normal':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    openAppointmentDetail();
  };

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    openPrescriptionDetail();
  };

  const handleViewTestResult = (testResult: any) => {
    setSelectedTestResult(testResult);
    openTestResultDetail();
  };

  const handleViewMedicalRecord = (record: any) => {
    setSelectedMedicalRecord(record);
    openMedicalRecordDetail();
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      notifications.show({
        title: 'Message Sent',
        message: 'Your message has been sent to your healthcare provider',
        color: 'green',
      });
      setNewMessage('');
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Quick stats for dashboard
  const quickStats = [
    {
      title: 'Upcoming Appointments',
      value: 0 /* TODO: Fetch from API */,
      icon: IconCalendarEvent,
      color: 'blue',
    },
    {
      title: 'Active Prescriptions',
      value: 0 /* TODO: Fetch from API */,
      icon: IconPill,
      color: 'green',
    },
    {
      title: 'Test Results',
      value: 0 /* TODO: Fetch from API */,
      icon: IconFlask,
      color: 'orange',
    },
    {
      title: 'Medical Records',
      value: 0 /* TODO: Fetch from API */,
      icon: IconMessage,
      color: 'red',
    },
  ];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Group>
            <Avatar size="lg" color="blue">
              PT
            </Avatar>
            <div>
              <Title order={1}>Welcome, Patient!</Title>
              <Text c="dimmed" size="sm">
                Patient Portal Dashboard
              </Text>
            </div>
          </Group>
        </div>
        <Group>
          <Indicator inline processing color="red" size={12} disabled={false}>
            <ActionIcon variant="light" size="lg" color="blue">
              <IconBell size={20} />
            </ActionIcon>
          </Indicator>
          <Button
            leftSection={<IconCalendarEvent size={16} />}
            onClick={openBookAppointment}
            color="blue"
          >
            Book Appointment
          </Button>
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            onClick={openProfileSettings}
          >
            Profile Settings
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
          <Tabs.Tab value="dashboard" leftSection={<IconChartBar size={16} />}>
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="appointments" leftSection={<IconCalendar size={16} />}>
            Appointments
          </Tabs.Tab>
          <Tabs.Tab value="prescriptions" leftSection={<IconPill size={16} />}>
            Prescriptions
          </Tabs.Tab>
          <Tabs.Tab value="test-results" leftSection={<IconFlask size={16} />}>
            Test Results
          </Tabs.Tab>
          <Tabs.Tab value="medical-records" leftSection={<IconFileText size={16} />}>
            Medical Records
          </Tabs.Tab>
          <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>
            <Group gap="xs">Messages</Group>
          </Tabs.Tab>
        </Tabs.List>

        {/* Dashboard Tab */}
        <Tabs.Panel value="dashboard">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Recent Notifications */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Recent Notifications
              </Title>
              <Stack gap="sm">
                {[] /* TODO: Fetch from API */
                  .slice(0, 5)
                  .map((notification) => (
                    <Alert
                      key={notification.id}
                      variant="light"
                      color={getPriorityColor(notification.priority)}
                      icon={
                        notification.type === 'appointment' ? (
                          <IconCalendar size={16} />
                        ) : notification.type === 'test_result' ? (
                          <IconFlask size={16} />
                        ) : notification.type === 'prescription' ? (
                          <IconPill size={16} />
                        ) : (
                          <IconBell size={16} />
                        )
                      }
                    >
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" fw={500}>
                            {notification.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {notification.message}
                          </Text>
                        </div>
                        <Text size="xs" c="dimmed">
                          {formatDate(notification.createdDate)}
                        </Text>
                      </Group>
                    </Alert>
                  ))}
              </Stack>
            </Card>
            {/* Upcoming Appointments */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Upcoming Appointments
              </Title>
              <Stack gap="sm">
                {appointments
                  .filter((apt) => apt.status === 'scheduled' || apt.status === 'confirmed')
                  .slice(0, 3)
                  .map((appointment) => (
                    <Card key={appointment.id} padding="sm" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>{appointment.doctor}</Text>
                          <Text size="sm" c="dimmed">
                            {appointment.department}
                          </Text>
                          <Group gap="xs" mt="xs">
                            <Badge size="xs" color={getAppointmentTypeColor(appointment.type)}>
                              {appointment.type}
                            </Badge>
                            <Badge size="xs" color={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </Group>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Text size="sm" fw={500}>
                            {formatDate(appointment.date)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {appointment.time}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  ))}
              </Stack>
            </Card>

            {/* Health Overview */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Health Overview
              </Title>
              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" c="dimmed">
                    Blood Pressure
                  </Text>
                  <Text fw={600} c="blue">
                    120/80 mmHg
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Heart Rate
                  </Text>
                  <Text fw={600} c="green">
                    72 bpm
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Weight
                  </Text>
                  <Text fw={600} c="purple">
                    68 kg
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Temperature
                  </Text>
                  <Text fw={600} c="orange">
                    98.6°F
                  </Text>
                </div>
              </SimpleGrid>
              <Text size="xs" c="dimmed" mt="md">
                Last updated: {formatDate('2024-01-15')}
              </Text>
            </Card>

            {/* Recent Test Results */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Recent Test Results
              </Title>
              <Stack gap="sm">
                {[] /* TODO: Fetch from API */
                  .slice(0, 3)
                  .map((result) => (
                    <Card key={result.id} padding="sm" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text fw={500}>{result.testName}</Text>
                          <Text size="sm" c="dimmed">
                            Ordered by: Dr. {result.orderedBy}
                          </Text>
                        </div>
                        <Badge
                          color={
                            result.status === 'completed'
                              ? 'green'
                              : result.status === 'pending'
                                ? 'orange'
                                : 'blue'
                          }
                          variant="light"
                        >
                          {result.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Group>
                    </Card>
                  ))}
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        {/* Appointments Tab */}
        <Tabs.Panel value="appointments">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search appointments..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'procedure', label: 'Procedure' },
                  { value: 'diagnostic', label: 'Diagnostic' },
                  { value: 'vaccination', label: 'Vaccination' },
                ]}
                value={selectedAppointmentType}
                onChange={setSelectedAppointmentType}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'no_show', label: 'No Show' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Doctor"
                data={[].map(
                  /* TODO: Fetch from API */ (doctor) => ({
                    value: doctor.id,
                    label: doctor.name,
                  })
                )}
                value={selectedDoctor}
                onChange={setSelectedDoctor}
                clearable
              />
            </Group>

            {/* Appointments Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {filteredAppointments.length === 0 ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <EmptyState
                    icon={<IconUserCircle size={48} />}
                    title="No portal activity"
                    description="Patient portal activity will appear here"
                    size="sm"
                  />
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {appointment.doctor}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {appointment.department}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(appointment.status)} variant="light">
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Date & Time
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(appointment.date)} at {appointment.time}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Type
                        </Text>
                        <Badge
                          color={getAppointmentTypeColor(appointment.type)}
                          variant="light"
                          size="sm"
                        >
                          {appointment.type.replace('_', ' ')}
                        </Badge>
                      </Group>
                    </Stack>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {appointment.department}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        {appointment.status === 'scheduled' && (
                          <ActionIcon variant="subtle" color="green">
                            <IconEdit size={16} />
                          </ActionIcon>
                        )}
                        {(appointment.status === 'scheduled' ||
                          appointment.status === 'confirmed') && (
                          <ActionIcon variant="subtle" color="red">
                            <IconX size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Card>
                ))
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Prescriptions Tab */}
        <Tabs.Panel value="prescriptions">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>My Prescriptions</Title>
              <Button leftSection={<IconDownload size={16} />} variant="light">
                Download All
              </Button>
            </Group>

            {/* Prescriptions Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (prescription) => (
                  <Card key={prescription.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {prescription.medicationName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Prescribed by: Dr. {prescription.doctorName}
                        </Text>
                      </div>
                      <Badge color={prescription.isActive ? 'green' : 'gray'} variant="light">
                        {prescription.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Dosage
                        </Text>
                        <Text size="sm" fw={500}>
                          {prescription.dosage}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Frequency
                        </Text>
                        <Text size="sm">{prescription.frequency}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Duration
                        </Text>
                        <Text size="sm">{prescription.duration}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Refills Left
                        </Text>
                        <Text
                          size="sm"
                          fw={500}
                          c={prescription.refillsLeft === 0 ? 'red' : 'blue'}
                        >
                          {prescription.refillsLeft}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Prescribed Date
                        </Text>
                        <Text size="sm">{formatDate(prescription.prescribedDate)}</Text>
                      </Group>
                    </Stack>

                    {prescription.instructions && (
                      <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                        Instructions: {prescription.instructions}
                      </Text>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Pharmacy: {prescription.pharmacyName || 'Any Pharmacy'}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewPrescription(prescription)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconDownload size={16} />
                        </ActionIcon>
                        {prescription.refillsLeft > 0 && prescription.isActive && (
                          <ActionIcon variant="subtle" color="orange">
                            <IconRefresh size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Test Results Tab */}
        <Tabs.Panel value="test-results">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Test Results</Title>
              <Button leftSection={<IconDownload size={16} />} variant="light">
                Download All
              </Button>
            </Group>

            {/* Test Results Grid */}
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
                          {result.category} - {result.testCode}
                        </Text>
                      </div>
                      <Badge
                        color={
                          result.status === 'completed'
                            ? 'green'
                            : result.status === 'pending'
                              ? 'orange'
                              : result.status === 'in_progress'
                                ? 'blue'
                                : 'gray'
                        }
                        variant="light"
                      >
                        {result.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Test Date
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(result.testDate)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Ordered by
                        </Text>
                        <Text size="sm">Dr. {result.orderedBy}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Lab/Facility
                        </Text>
                        <Text size="sm">{result.labName}</Text>
                      </Group>
                      {result.status === 'completed' && result.resultDate && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Result Date
                          </Text>
                          <Text size="sm">{formatDate(result.resultDate)}</Text>
                        </Group>
                      )}
                      {result.priority && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Priority
                          </Text>
                          <Badge
                            color={getPriorityColor(result.priority)}
                            variant="light"
                            size="sm"
                          >
                            {result.priority.toUpperCase()}
                          </Badge>
                        </Group>
                      )}
                    </Stack>

                    {result.notes && (
                      <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                        Notes: {result.notes}
                      </Text>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Reference ID: {result.id.slice(-8).toUpperCase()}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewTestResult(result)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        {result.status === 'completed' && (
                          <>
                            <ActionIcon variant="subtle" color="green">
                              <IconDownload size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="orange">
                              <IconShare size={16} />
                            </ActionIcon>
                          </>
                        )}
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Medical Records Tab */}
        <Tabs.Panel value="medical-records">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Medical Records</Title>
              <Button leftSection={<IconDownload size={16} />} variant="light">
                Export Records
              </Button>
            </Group>

            {/* Medical Records Timeline */}
            <Timeline active={0 /* TODO: Fetch from API */} bulletSize={24} lineWidth={2}>
              {[].map(
                /* TODO: Fetch from API */ (record, _index) => (
                  <Timeline.Item
                    key={record.id}
                    bullet={
                      <ThemeIcon
                        size={24}
                        variant="filled"
                        color={
                          record.type === 'consultation'
                            ? 'blue'
                            : record.type === 'diagnosis'
                              ? 'red'
                              : record.type === 'treatment'
                                ? 'green'
                                : record.type === 'surgery'
                                  ? 'purple'
                                  : record.type === 'vaccination'
                                    ? 'teal'
                                    : 'gray'
                        }
                      >
                        {record.type === 'consultation' ? (
                          <IconStethoscope size={14} />
                        ) : record.type === 'diagnosis' ? (
                          <IconReportMedical size={14} />
                        ) : record.type === 'treatment' ? (
                          <IconPill size={14} />
                        ) : record.type === 'surgery' ? (
                          <IconCut size={14} />
                        ) : record.type === 'vaccination' ? (
                          <IconPill size={14} />
                        ) : (
                          <IconFileText size={14} />
                        )}
                      </ThemeIcon>
                    }
                    title={
                      <Group justify="space-between">
                        <Text fw={500}>{record.title}</Text>
                        <Text size="sm" c="dimmed">
                          {formatDate(record.date)}
                        </Text>
                      </Group>
                    }
                  >
                    <Card withBorder p="md" mb="md">
                      <Group justify="space-between" mb="sm">
                        <div>
                          <Text size="sm" c="dimmed">
                            Provider: Dr. {record.providerName}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {record.department}
                          </Text>
                        </div>
                        <Badge
                          color={
                            record.type === 'consultation'
                              ? 'blue'
                              : record.type === 'diagnosis'
                                ? 'red'
                                : record.type === 'treatment'
                                  ? 'green'
                                  : record.type === 'surgery'
                                    ? 'purple'
                                    : record.type === 'vaccination'
                                      ? 'teal'
                                      : 'gray'
                          }
                          variant="light"
                        >
                          {record.type.toUpperCase()}
                        </Badge>
                      </Group>

                      <Text size="sm" lineClamp={3} mb="sm">
                        {record.description}
                      </Text>

                      {record.diagnosis && (
                        <Text size="sm" c="red" mb="sm">
                          Diagnosis: {record.diagnosis}
                        </Text>
                      )}

                      {record.treatment && (
                        <Text size="sm" c="green" mb="sm">
                          Treatment: {record.treatment}
                        </Text>
                      )}

                      <Group justify="space-between" mt="sm">
                        <Text size="xs" c="dimmed">
                          Visit ID: {record.id.slice(-8).toUpperCase()}
                        </Text>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleViewMedicalRecord(record)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="green">
                            <IconDownload size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  </Timeline.Item>
                )
              )}
            </Timeline>
          </Paper>
        </Tabs.Panel>

        {/* Messages Tab */}
        <Tabs.Panel value="messages">
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mt="md">
            {/* Message List */}
            <div style={{ gridColumn: 'span 2' }}>
              <Paper p="md" radius="md" withBorder>
                <Title order={4} mb="md">
                  Messages
                </Title>
                <Stack gap="sm">
                  {[].map(
                    /* TODO: Fetch from API */ (communication) => (
                      <Card key={communication.id} padding="md" withBorder>
                        <Group justify="space-between" mb="sm">
                          <Group>
                            <Avatar size="sm" color="blue">
                              {communication.senderType === 'doctor' ? 'DR' : 'ME'}
                            </Avatar>
                            <div>
                              <Text fw={500} size="sm">
                                {communication.senderType === 'doctor'
                                  ? `Dr. ${communication.senderName}`
                                  : 'You'}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {communication.subject}
                              </Text>
                            </div>
                          </Group>
                          <div style={{ textAlign: 'right' }}>
                            <Text size="xs" c="dimmed">
                              {formatDateTime(communication.sentDate)}
                            </Text>
                            {!communication.isRead && communication.senderType === 'doctor' && (
                              <Badge size="xs" color="red">
                                New
                              </Badge>
                            )}
                          </div>
                        </Group>

                        <Text size="sm" lineClamp={2} mb="sm">
                          {communication.message}
                        </Text>

                        <Group justify="space-between">
                          <Badge
                            variant="light"
                            color={
                              communication.type === 'appointment'
                                ? 'blue'
                                : communication.type === 'prescription'
                                  ? 'green'
                                  : communication.type === 'test_result'
                                    ? 'orange'
                                    : communication.type === 'general'
                                      ? 'purple'
                                      : 'gray'
                            }
                            size="xs"
                          >
                            {communication.type.replace('_', ' ')}
                          </Badge>
                          <Group gap="xs">
                            <ActionIcon variant="subtle" color="blue" size="sm">
                              <IconEye size={14} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green" size="sm">
                              <IconMessage size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Card>
                    )
                  )}
                </Stack>
              </Paper>
            </div>

            {/* Compose Message */}
            <Paper p="md" radius="md" withBorder>
              <Title order={4} mb="md">
                Send Message
              </Title>
              <Stack gap="md">
                <Select
                  label="To"
                  placeholder="Select healthcare provider"
                  data={[].map(
                    /* TODO: Fetch from API */ (doctor) => ({
                      value: doctor.id,
                      label: `${doctor.name} - ${doctor.specialization}`,
                    })
                  )}
                />

                <TextInput label="Subject" placeholder="Enter subject" />

                <Textarea
                  label="Message"
                  placeholder="Type your message here..."
                  rows={6}
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.currentTarget.value)}
                />

                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send Message
                </Button>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Book Appointment Modal */}
      <Modal
        opened={bookAppointmentOpened}
        onClose={closeBookAppointment}
        title="Book New Appointment"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <Select
              label="Doctor"
              placeholder="Select doctor"
              data={[].map(
                /* TODO: Fetch from API */ (doctor) => ({
                  value: doctor.id,
                  label: `${doctor.name} - ${doctor.specialization}`,
                })
              )}
              required
            />
            <Select
              label="Appointment Type"
              placeholder="Select type"
              data={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
                { value: 'procedure', label: 'Procedure' },
                { value: 'diagnostic', label: 'Diagnostic' },
                { value: 'vaccination', label: 'Vaccination' },
              ]}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <DatePickerInput
              label="Preferred Date"
              placeholder="Select date"
              minDate={new Date()}
              required
            />
            <Select
              label="Time Slot"
              placeholder="Select time"
              data={[
                { value: '09:00', label: '9:00 AM' },
                { value: '10:00', label: '10:00 AM' },
                { value: '11:00', label: '11:00 AM' },
                { value: '14:00', label: '2:00 PM' },
                { value: '15:00', label: '3:00 PM' },
                { value: '16:00', label: '4:00 PM' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea
            label="Reason for Visit"
            placeholder="Describe your symptoms or reason for appointment"
            rows={3}
            required
          />

          <Textarea
            label="Additional Notes"
            placeholder="Any additional information (optional)"
            rows={2}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeBookAppointment}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Appointment Requested',
                  message: 'Your appointment request has been submitted for approval',
                  color: 'green',
                });
                closeBookAppointment();
              }}
            >
              Book Appointment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default PatientPortal;

