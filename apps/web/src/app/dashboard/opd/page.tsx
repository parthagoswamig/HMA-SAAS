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
  Alert,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import EmptyState from '../../../components/EmptyState';
import opdService from '../../../services/opd.service';
import OpdVisitForm from '../../../components/opd/OpdVisitForm';
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
  IconX,
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

// Mock data removed - using API data instead
const defaultDoctors: Doctor[] = [
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
  const [consultationOpened, { open: openConsultation, close: closeConsultation }] = useDisclosure(false);

  const fetchVisits = useCallback(async () => {
    try {
      const filters = {
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
        departmentId: selectedDepartment || undefined,
        date: new Date().toISOString().split('T')[0],
      };
      const response = await opdService.getVisits(filters);
      // Handle different response structures
      const visits = Array.isArray(response.data) ? response.data : response.data?.items || [];
      
      // Map API response to OPDVisit interface
      const mappedVisits = visits.map((v: any) => ({
        id: v.id,
        visitNumber: `OPD${v.id.slice(-6).toUpperCase()}`,
        patientId: v.patientId,
        patientName: v.patient ? `${v.patient.firstName} ${v.patient.lastName}` : 'Unknown',
        patientPhone: v.patient?.phone || 'N/A',
        doctorId: v.doctorId,
        doctorName: v.doctor ? `Dr. ${v.doctor.firstName} ${v.doctor.lastName}` : 'Unknown',
        department: v.department?.name || v.departmentId || 'General',
        appointmentTime: v.visitDate,
        actualArrivalTime: v.actualArrivalTime,
        consultationStartTime: v.consultationStartTime,
        consultationEndTime: v.consultationEndTime,
        status: v.status?.toLowerCase() || 'scheduled',
        visitType: v.visitType || 'new',
        chiefComplaint: v.chiefComplaint || v.reason || '',
        diagnosis: v.diagnosis,
        prescription: v.prescription ? [v.prescription] : [],
        nextVisitDate: v.followUpDate,
        consultationFee: 500,
        paymentStatus: 'pending' as const,
        vitalSigns: v.vitalSigns,
        waitingTime: v.waitingTime || 0,
        consultationDuration: v.consultationDuration || 0,
      }));
      
      setOpdVisits(mappedVisits);
    } catch (err: any) {
      console.warn(
        'Error fetching OPD visits:',
        err.response?.data?.message || err.message
      );
      setOpdVisits([]);
    }
  }, [selectedStatus, searchQuery, selectedDepartment]);

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
        totalVisitsToday: 0,
        waiting: 0,
        inConsultation: 0,
        completed: 0,
        cancelled: 0,
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
      setOpdVisits([]);
    } finally {
      setLoading(false);
    }
  }, [fetchVisits, fetchStats]);

  // Initialize with API data
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

  const handleStartConsultation = async (visit: OPDVisit) => {
    try {
      await opdService.updateVisit(visit.id, {
        status: 'IN_CONSULTATION',
      });
      notifications.show({
        title: 'Success',
        message: 'Consultation started',
        color: 'green',
      });
      fetchVisits();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to start consultation',
        color: 'red',
      });
    }
  };

  const handleCompleteVisit = async (visit: OPDVisit) => {
    setSelectedVisit(visit);
    openConsultation();
  };

  const handleCancelVisit = async (visitId: string) => {
    if (!confirm('Are you sure you want to cancel this visit?')) return;
    
    try {
      await opdService.cancelVisit(visitId);
      notifications.show({
        title: 'Success',
        message: 'Visit cancelled successfully',
        color: 'green',
      });
      fetchVisits();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to cancel visit',
        color: 'red',
      });
    }
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
    <Container fluid px={0} style={{ maxWidth: '100%' }}>
      <Stack gap="lg" px="md">
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
                  Today's Visits
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.totalVisitsToday || 0}
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
                  Waiting
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.waiting || 0}
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
                  In Consultation
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.inConsultation || 0}
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
                  Cancelled
                </Text>
                <Text fw={700} size="xl">
                  {opdStats.cancelled || 0}
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
                              size="sm"
                              onClick={() => handleViewVisit(visit)}
                              title="View Details"
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          {visit.status === 'scheduled' && (
                            <ActionIcon 
                              variant="subtle" 
                              color="green" 
                              size="sm"
                              onClick={() => handleStartConsultation(visit)}
                              title="Start Consultation"
                            >
                              <IconActivity size={16} />
                            </ActionIcon>
                          )}
                          {visit.status === 'in_consultation' && (
                            <ActionIcon 
                              variant="subtle" 
                              color="teal" 
                              size="sm"
                              onClick={() => handleCompleteVisit(visit)}
                              title="Complete Visit"
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          )}
                          {(visit.status === 'scheduled' || visit.status === 'arrived') && (
                            <ActionIcon 
                              variant="subtle" 
                              color="red" 
                              size="sm"
                              onClick={() => handleCancelVisit(visit.id)}
                              title="Cancel Visit"
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          )}
                          {visit.status === 'completed' && (
                            <ActionIcon 
                              variant="subtle" 
                              color="purple" 
                              size="sm"
                              title="View Prescription"
                            >
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

      {/* New Visit Modal using OpdVisitForm */}
      <OpdVisitForm
        opened={newVisitOpened}
        onClose={closeNewVisit}
        onSuccess={() => {
          fetchVisits();
          fetchStats();
        }}
      />

      {/* Complete Consultation Modal */}
      <Modal
        opened={consultationOpened}
        onClose={closeConsultation}
        title="Complete Consultation"
        size="lg"
      >
        {selectedVisit && (
          <Stack gap="md">
            <Alert icon={<IconStethoscope size={20} />} color="blue" variant="light">
              Completing consultation for <strong>{selectedVisit.patientName}</strong>
            </Alert>

            <Textarea
              label="Diagnosis"
              placeholder="Enter diagnosis"
              rows={3}
              required
            />

            <Textarea
              label="Prescription"
              placeholder="Enter prescription details"
              rows={4}
            />

            <DatePickerInput
              label="Follow-up Date (Optional)"
              placeholder="Select follow-up date"
              clearable
            />

            <Textarea
              label="Additional Notes"
              placeholder="Enter any additional notes"
              rows={3}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={closeConsultation}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await opdService.updateVisit(selectedVisit.id, {
                      status: 'COMPLETED',
                      diagnosis: 'Sample diagnosis',
                      prescription: 'Sample prescription',
                    });
                    notifications.show({
                      title: 'Success',
                      message: 'Consultation completed successfully',
                      color: 'green',
                    });
                    closeConsultation();
                    fetchVisits();
                    fetchStats();
                  } catch (error: any) {
                    notifications.show({
                      title: 'Error',
                      message: error?.response?.data?.message || 'Failed to complete consultation',
                      color: 'red',
                    });
                  }
                }}
              >
                Complete Consultation
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
      </Stack>
    </Container>
  );
};

export default OPDManagement;

