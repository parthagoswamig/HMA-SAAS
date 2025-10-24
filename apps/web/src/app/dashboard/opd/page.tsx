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
  Progress,
  Textarea,
  List,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import EmptyState from '../../../components/EmptyState';
import opdService from '../../../services/opd.service';
// import { LineChart, BarChart, DonutChart, AreaChart } from '@mantine/charts';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconStethoscope,
  IconCalendar,
  IconClock,
  IconUsers,
  IconPrescription,
  IconPrinter,
  IconRefresh,
  IconActivity,
  IconChartBar,
  IconCheck,
  IconCalendarEvent,
  IconMessage,
} from '@tabler/icons-react';

// Types
interface OPDVisit {
  id: string;
  visitNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentTime: string;
  actualArrivalTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  status: 'scheduled' | 'arrived' | 'in_consultation' | 'completed' | 'no_show' | 'cancelled';
  visitType: 'new' | 'follow_up' | 'emergency';
  chiefComplaint: string;
  diagnosis?: string;
  prescription?: string[];
  nextVisitDate?: string;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'insurance';
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
  waitingTime?: number;
  consultationDuration?: number;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availableSlots: string[];
  currentPatients: number;
  maxPatientsPerDay: number;
}

// Mock data
const mockOPDVisits: OPDVisit[] = [
  {
    id: '1',
    visitNumber: 'OPD2024001',
    patientId: 'P2024001',
    patientName: 'Rajesh Kumar',
    patientPhone: '+91 98765 43210',
    doctorId: 'D001',
    doctorName: 'Dr. Sharma',
    department: 'Cardiology',
    appointmentTime: '2024-01-15T09:00:00Z',
    actualArrivalTime: '2024-01-15T08:55:00Z',
    consultationStartTime: '2024-01-15T09:15:00Z',
    status: 'in_consultation',
    visitType: 'new',
    chiefComplaint: 'Chest pain and shortness of breath',
    consultationFee: 500,
    paymentStatus: 'paid',
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: 85,
      temperature: 98.6,
      weight: 75,
      height: 170,
    },
    waitingTime: 15,
  },
  {
    id: '2',
    visitNumber: 'OPD2024002',
    patientId: 'P2024002',
    patientName: 'Sunita Patel',
    patientPhone: '+91 87654 32109',
    doctorId: 'D002',
    doctorName: 'Dr. Reddy',
    department: 'General Medicine',
    appointmentTime: '2024-01-15T10:30:00Z',
    status: 'arrived',
    visitType: 'follow_up',
    chiefComplaint: 'Follow-up for diabetes management',
    consultationFee: 350,
    paymentStatus: 'insurance',
    actualArrivalTime: '2024-01-15T10:25:00Z',
    waitingTime: 5,
  },
  {
    id: '3',
    visitNumber: 'OPD2024003',
    patientId: 'P2024003',
    patientName: 'Mohammed Ali',
    patientPhone: '+91 76543 21098',
    doctorId: 'D003',
    doctorName: 'Dr. Singh',
    department: 'Orthopedics',
    appointmentTime: '2024-01-15T14:00:00Z',
    status: 'scheduled',
    visitType: 'new',
    chiefComplaint: 'Knee pain and stiffness',
    consultationFee: 600,
    paymentStatus: 'pending',
  },
  {
    id: '4',
    visitNumber: 'OPD2024004',
    patientId: 'P2024004',
    patientName: 'Priya Gupta',
    patientPhone: '+91 65432 10987',
    doctorId: 'D001',
    doctorName: 'Dr. Sharma',
    department: 'Cardiology',
    appointmentTime: '2024-01-15T11:30:00Z',
    consultationStartTime: '2024-01-15T11:35:00Z',
    consultationEndTime: '2024-01-15T12:05:00Z',
    status: 'completed',
    visitType: 'follow_up',
    chiefComplaint: 'Post-surgery follow-up',
    diagnosis: 'Post-operative recovery normal',
    prescription: ['Aspirin 75mg - 1 daily', 'Metoprolol 25mg - 1 BD'],
    nextVisitDate: '2024-02-15T11:30:00Z',
    consultationFee: 500,
    paymentStatus: 'paid',
    consultationDuration: 30,
    waitingTime: 5,
  },
];

const mockDoctors: Doctor[] = [
  {
    id: 'D001',
    name: 'Dr. Sharma',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    qualification: 'MD, DM Cardiology',
    experience: 15,
    consultationFee: 500,
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    currentPatients: 8,
    maxPatientsPerDay: 20,
  },
  {
    id: 'D002',
    name: 'Dr. Reddy',
    specialization: 'General Physician',
    department: 'General Medicine',
    qualification: 'MBBS, MD Internal Medicine',
    experience: 12,
    consultationFee: 350,
    availableSlots: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30'],
    currentPatients: 15,
    maxPatientsPerDay: 25,
  },
  {
    id: 'D003',
    name: 'Dr. Singh',
    specialization: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    qualification: 'MS Orthopedics',
    experience: 18,
    consultationFee: 600,
    availableSlots: ['14:00', '14:30', '15:00', '15:30', '16:00'],
    currentPatients: 6,
    maxPatientsPerDay: 15,
  },
];

const OPDManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<OPDVisit | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // API data state
  const [opdVisits, setOpdVisits] = useState<OPDVisit[]>([]);
  const [opdStats, setOpdStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [visitDetailOpened, { open: openVisitDetail, close: closeVisitDetail }] =
    useDisclosure(false);
  const [newVisitOpened, { open: openNewVisit, close: closeNewVisit }] = useDisclosure(false);
  const [doctorScheduleOpened, { open: openDoctorSchedule, close: closeDoctorSchedule }] =
    useDisclosure(false);
  const [prescriptionOpened, { open: openPrescription, close: closePrescription }] =
    useDisclosure(false);

  const fetchVisits = useCallback(async () => {
    try {
      const filters = {
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
      };
      const response = await opdService.getVisits(filters);
      // Handle different response structures
      const visits = Array.isArray(response.data) ? response.data : response.data?.items || [];
      setOpdVisits(visits as OPDVisit[]);
    } catch (err: any) {
      console.warn(
        'Error fetching OPD visits (using empty data):',
        err.response?.data?.message || err.message
      );
      setOpdVisits([]);
    }
  }, [selectedStatus, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await opdService.getStats();
      setOpdStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching OPD stats (using default values):',
        err.response?.data?.message || err.message
      );
      // Set default stats when backend is unavailable
      setOpdStats({
        totalVisits: 0,
        todayVisits: 0,
        completed: 0,
        inProgress: 0,
        averageWaitTime: 0,
      });
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchVisits(), fetchStats()]);
    } catch (err: any) {
      console.error('Error loading OPD data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load OPD data');
      setOpdVisits([] /* TODO: Fetch from API */);
    } finally {
      setLoading(false);
    }
  }, [fetchVisits, fetchStats]);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!loading) {
      fetchVisits();
    }
  }, [searchQuery, selectedDepartment, selectedStatus, fetchVisits, loading]);

  // Filter visits
  const filteredVisits = useMemo(() => {
    return opdVisits.filter((visit) => {
      const matchesSearch =
        visit.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.visitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = !selectedDepartment || visit.department === selectedDepartment;
      const matchesStatus = !selectedStatus || visit.status === selectedStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [opdVisits, searchQuery, selectedDepartment, selectedStatus]);

  const handleViewVisit = (visit: OPDVisit) => {
    setSelectedVisit(visit);
    openVisitDetail();
  };

  const handleViewDoctorSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    openDoctorSchedule();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'arrived':
        return 'orange';
      case 'in_consultation':
        return 'yellow';
      case 'completed':
        return 'green';
      case 'no_show':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'red';
      case 'insurance':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Quick stats from API
  const statsDisplay = opdStats || {
    totalVisitsToday: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    cancelled: 0,
  };

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <Title order={1} className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">OPD Management</Title>
          <Text c="dimmed" className="text-xs sm:text-sm">
            Outpatient department consultation and queue management
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="light" leftSection={<IconRefresh size={16} />} className="w-full sm:w-auto" size="sm">
            Refresh Queue
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openNewVisit} className="w-full sm:w-auto" size="sm">
            New OPD Visit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {opdStats && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={{ base: 'sm', sm: 'md', lg: 'lg' }} mb={{ base: 'md', sm: 'lg' }}>
          <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Total Visits
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.totalVisits || 0}
                </Text>
              </div>
              <ThemeIcon color="blue" size="xl" radius="md" variant="light">
                <IconUsers size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Today&apos;s Visits
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.todayVisits || 0}
                </Text>
              </div>
              <ThemeIcon color="green" size="xl" radius="md" variant="light">
                <IconCalendar size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Completed
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.completed || 0}
                </Text>
              </div>
              <ThemeIcon color="cyan" size="xl" radius="md" variant="light">
                <IconCheck size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  In Progress
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.inProgress || 0}
                </Text>
              </div>
              <ThemeIcon color="orange" size="xl" radius="md" variant="light">
                <IconActivity size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Avg Wait Time
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.averageWaitTime || 0}min
                </Text>
              </div>
              <ThemeIcon color="red" size="xl" radius="md" variant="light">
                <IconClock size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="queue" leftSection={<IconUsers size={16} />}>
            Patient Queue
          </Tabs.Tab>
          <Tabs.Tab value="doctors" leftSection={<IconStethoscope size={16} />}>
            Doctor Schedule
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Patient Queue Tab */}
        <Tabs.Panel value="queue">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search visits..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Department"
                data={[
                  { value: 'Cardiology', label: 'Cardiology' },
                  { value: 'General Medicine', label: 'General Medicine' },
                  { value: 'Orthopedics', label: 'Orthopedics' },
                  { value: 'Pediatrics', label: 'Pediatrics' },
                  { value: 'Gynecology', label: 'Gynecology' },
                ]}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'arrived', label: 'Arrived' },
                  { value: 'in_consultation', label: 'In Consultation' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'no_show', label: 'No Show' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
            </Group>

            {/* Visits Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Visit #</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Appointment Time</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Payment</Table.Th>
                    <Table.Th>Wait Time</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredVisits.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <EmptyState
                          icon={<IconStethoscope size={48} />}
                          title="No OPD consultations"
                          description="Register your first outpatient consultation to get started"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredVisits.map((visit) => (
                      <Table.Tr key={visit.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {visit.visitNumber}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl" size="sm">
                              {visit.patientName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {visit.patientName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {visit.patientPhone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {visit.doctorName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {visit.department}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {visit.department}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatTime(visit.appointmentTime)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(visit.status)} variant="light" size="sm">
                            {visit.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge
                              color={getPaymentStatusColor(visit.paymentStatus)}
                              variant="light"
                              size="sm"
                            >
                              {visit.paymentStatus.toUpperCase()}
                            </Badge>
                            <Text size="xs" c="dimmed">
                              ₹{visit.consultationFee}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            size="sm"
                            c={visit.waitingTime && visit.waitingTime > 30 ? 'red' : 'dimmed'}
                          >
                            {visit.waitingTime ? `${visit.waitingTime}min` : '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewVisit(visit)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                            {visit.status === 'completed' && (
                              <ActionIcon variant="subtle" color="purple">
                                <IconPrescription size={16} />
                              </ActionIcon>
                            )}
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

        {/* Doctor Schedule Tab */}
        <Tabs.Panel value="doctors">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Doctor Schedules & Availability
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (doctor) => (
                  <Card key={doctor.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {doctor.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {doctor.specialization}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {doctor.qualification}
                        </Text>
                      </div>
                      <ThemeIcon color="blue" size="xl" radius="xl" variant="light">
                        <IconStethoscope size={20} />
                      </ThemeIcon>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Department
                        </Text>
                        <Badge variant="light">{doctor.department}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Experience
                        </Text>
                        <Text size="sm">{doctor.experience} years</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Consultation Fee
                        </Text>
                        <Text size="sm" fw={500}>
                          ₹{doctor.consultationFee}
                        </Text>
                      </Group>
                    </Stack>

                    <div style={{ marginBottom: 'var(--mantine-spacing-md)' }}>
                      <Text size="sm" c="dimmed" mb="xs">
                        Today&apos;s Load
                      </Text>
                      <Progress
                        value={(doctor.currentPatients / doctor.maxPatientsPerDay) * 100}
                        size="lg"
                        color={
                          doctor.currentPatients > doctor.maxPatientsPerDay * 0.8 ? 'red' : 'blue'
                        }
                      />
                      <Text size="xs" c="dimmed" mt="xs">
                        {doctor.currentPatients} / {doctor.maxPatientsPerDay} patients
                      </Text>
                    </div>

                    <Group justify="space-between">
                      <Button
                        variant="light"
                        size="xs"
                        onClick={() => handleViewDoctorSchedule(doctor)}
                      >
                        View Schedule
                      </Button>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconCalendarEvent size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconMessage size={16} />
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
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Daily Visit Trends */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Daily Visit Trends
              </Title>
              <Text c="dimmed" ta="center" p="xl">
                Chart component temporarily disabled
              </Text>
            </Card>

            {/* Department Distribution */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Department-wise Visits
              </Title>
              <Text c="dimmed" ta="center" p="xl">
                Chart component temporarily disabled
              </Text>
            </Card>

            {/* Wait Time Analysis */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Average Wait Times by Department
              </Title>
              <Text c="dimmed" ta="center" p="xl">
                Chart component temporarily disabled
              </Text>
            </Card>

            {/* Revenue Analysis */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                OPD Revenue Trends
              </Title>
              <Text c="dimmed" ta="center" p="xl">
                Chart component temporarily disabled
              </Text>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Visit Detail Modal */}
      <Modal
        opened={visitDetailOpened}
        onClose={closeVisitDetail}
        title="OPD Visit Details"
        size="lg"
      >
        {selectedVisit && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3}>{selectedVisit.patientName}</Title>
                <Text c="dimmed">Visit: {selectedVisit.visitNumber}</Text>
              </div>
              <Badge color={getStatusColor(selectedVisit.status)} variant="light">
                {selectedVisit.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </Group>

            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Doctor
                </Text>
                <Text>{selectedVisit.doctorName}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Department
                </Text>
                <Text>{selectedVisit.department}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Appointment Time
                </Text>
                <Text>{formatTime(selectedVisit.appointmentTime)}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Visit Type
                </Text>
                <Text tt="capitalize">{selectedVisit.visitType.replace('_', ' ')}</Text>
              </div>
            </SimpleGrid>

            <div>
              <Text size="sm" c="dimmed" fw={500} mb="xs">
                Chief Complaint
              </Text>
              <Text>{selectedVisit.chiefComplaint}</Text>
            </div>

            {selectedVisit.vitalSigns && (
              <div>
                <Text size="sm" c="dimmed" fw={500} mb="xs">
                  Vital Signs
                </Text>
                <SimpleGrid cols={3} spacing="sm">
                  <Text size="sm">BP: {selectedVisit.vitalSigns.bloodPressure}</Text>
                  <Text size="sm">HR: {selectedVisit.vitalSigns.heartRate} bpm</Text>
                  <Text size="sm">Temp: {selectedVisit.vitalSigns.temperature}°F</Text>
                  <Text size="sm">Weight: {selectedVisit.vitalSigns.weight} kg</Text>
                  <Text size="sm">Height: {selectedVisit.vitalSigns.height} cm</Text>
                </SimpleGrid>
              </div>
            )}

            {selectedVisit.diagnosis && (
              <div>
                <Text size="sm" c="dimmed" fw={500} mb="xs">
                  Diagnosis
                </Text>
                <Text>{selectedVisit.diagnosis}</Text>
              </div>
            )}

            {selectedVisit.prescription && selectedVisit.prescription.length > 0 && (
              <div>
                <Text size="sm" c="dimmed" fw={500} mb="xs">
                  Prescription
                </Text>
                <List size="sm">
                  {selectedVisit.prescription.map((med, index) => (
                    <List.Item key={index}>{med}</List.Item>
                  ))}
                </List>
              </div>
            )}

            <Group justify="space-between">
              <Group>
                <Text size="sm" c="dimmed">
                  Fee: ₹{selectedVisit.consultationFee}
                </Text>
                <Badge color={getPaymentStatusColor(selectedVisit.paymentStatus)} size="sm">
                  {selectedVisit.paymentStatus.toUpperCase()}
                </Badge>
              </Group>
              <Group>
                <Button variant="light" leftSection={<IconPrinter size={16} />}>
                  Print
                </Button>
                <Button onClick={closeVisitDetail}>Close</Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* New Visit Modal */}
      <Modal
        opened={newVisitOpened}
        onClose={closeNewVisit}
        title="Schedule New OPD Visit"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Patient"
              placeholder="Select patient"
              data={[
                { value: 'P001', label: 'Rajesh Kumar' },
                { value: 'P002', label: 'Sunita Patel' },
                { value: 'P003', label: 'Mohammed Ali' },
              ]}
              searchable
              required
            />
            <Select
              label="Visit Type"
              placeholder="Select visit type"
              data={[
                { value: 'new', label: 'New Patient' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
              ]}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Department"
              placeholder="Select department"
              data={[
                { value: 'cardiology', label: 'Cardiology' },
                { value: 'general', label: 'General Medicine' },
                { value: 'orthopedics', label: 'Orthopedics' },
              ]}
              required
            />
            <Select
              label="Doctor"
              placeholder="Select doctor"
              data={[
                { value: 'D001', label: 'Dr. Sharma (Cardiology)' },
                { value: 'D002', label: 'Dr. Reddy (General Medicine)' },
                { value: 'D003', label: 'Dr. Singh (Orthopedics)' },
              ]}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="md">
            <DatePickerInput label="Appointment Date" placeholder="Select date" required />
            <TimeInput label="Appointment Time" placeholder="Select time" required />
          </SimpleGrid>

          <Textarea label="Chief Complaint" placeholder="Enter chief complaint" rows={3} required />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewVisit}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // _notifications.show({
                //   title: 'OPD Visit Scheduled',
                //   message: 'New OPD visit has been successfully scheduled',
                //   color: 'green',
                // });
                console.log('OPD Visit Scheduled');
                closeNewVisit();
              }}
            >
              Schedule Visit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default OPDManagement;

