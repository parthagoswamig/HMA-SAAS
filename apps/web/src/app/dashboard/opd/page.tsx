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
  visitNumber?: string;
  visitDate: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  patientName?: string; // Computed field
  patientPhone?: string; // Computed field
  doctorId: string;
  doctor?: {
    id: string;
    firstName?: string;
    lastName?: string;
    user?: {
      firstName: string;
      lastName: string;
    };
    department?: {
      name: string;
    };
  };
  doctorName?: string; // Computed field
  departmentId?: string;
  department?: string | { name: string }; // Can be string or object
  reason: string;
  chiefComplaint?: string;
  appointmentTime?: string; // Computed from visitDate
  actualArrivalTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'scheduled' | 'arrived' | 'in_consultation' | 'completed' | 'no_show' | 'cancelled';
  visitType?: 'new' | 'follow_up' | 'emergency';
  diagnosis?: string;
  prescription?: string;
  prescriptionArray?: string[]; // Computed from prescription
  followUpDate?: string;
  nextVisitDate?: string;
  consultationFee?: number;
  paymentStatus?: 'pending' | 'paid' | 'insurance';
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  waitingTime?: number;
  consultationDuration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

// Mock data removed - using real API data

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
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
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
      console.log('✅ [DEBUG] OPD Visits API response:', response);
      // Handle different response structures - backend returns items, not visits
      const visits = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || [];
      
      // Transform visits to add computed fields
      const transformedVisits = visits.map((visit: any) => ({
        ...visit,
        patientName: visit.patient ? `${visit.patient.firstName} ${visit.patient.lastName}` : 'Unknown Patient',
        patientPhone: visit.patient?.phone || visit.patient?.email || 'N/A',
        doctorName: visit.doctor?.user ? `Dr. ${visit.doctor.user.firstName} ${visit.doctor.user.lastName}` : 
                    visit.doctor ? `Dr. ${visit.doctor.firstName || ''} ${visit.doctor.lastName || ''}` : 'Unknown Doctor',
        department: typeof visit.department === 'object' ? visit.department?.name : visit.department || visit.doctor?.department?.name || 'General',
        appointmentTime: visit.visitDate || visit.appointmentTime,
        visitNumber: visit.visitNumber || `OPD-${visit.id?.slice(0, 8)}`,
        prescriptionArray: visit.prescription ? [visit.prescription] : [],
      }));
      
      console.log('✅ [DEBUG] OPD Visits transformed:', transformedVisits.length, 'visits');
      setOpdVisits(transformedVisits as OPDVisit[]);
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
      console.log('✅ [DEBUG] OPD Stats API response:', response);
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

  const fetchDepartments = useCallback(async () => {
    try {
      const hrService = (await import('../../../services/hr.service')).default;
      const response = await hrService.getDepartments({});
      console.log('✅ [DEBUG] Departments API response:', response);
      const departmentsList = Array.isArray(response.data?.items) ? response.data.items : [];
      console.log('✅ [DEBUG] Departments parsed:', departmentsList.length, 'departments');
      const departmentNames = departmentsList.map((d: any) => d.name).filter(Boolean);
      console.log('✅ [DEBUG] Department names extracted:', departmentNames);
      setDepartments(departmentNames);
    } catch (err: any) {
      console.warn('Error fetching departments:', err.response?.data?.message || err.message);
      setDepartments(['General']); // Fallback to default department
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const staffService = (await import('../../../services/staff.service')).default;
      const response = await staffService.getStaff({ role: 'DOCTOR' });
      console.log('✅ [DEBUG] Doctors API response:', response);
      const doctorsList = Array.isArray(response.data?.staff) ? response.data.staff : [];
      console.log('✅ [DEBUG] Doctors parsed:', doctorsList.length, 'doctors');
      setDoctors(doctorsList);
    } catch (err: any) {
      console.warn('Error fetching doctors:', err.response?.data?.message || err.message);
      setDoctors([]);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const patientsService = (await import('../../../services/patients.service')).default;
      const response = await patientsService.getPatients({});
      console.log('✅ [DEBUG] Patients API response:', response);
      const patientsList = Array.isArray(response.data?.patients) ? response.data.patients : [];
      console.log('✅ [DEBUG] Patients parsed:', patientsList.length, 'patients');
      setPatients(patientsList);
    } catch (err: any) {
      console.warn('Error fetching patients:', err.response?.data?.message || err.message);
      setPatients([]);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchVisits(), fetchStats(), fetchDepartments(), fetchDoctors(), fetchPatients()]);
    } catch (err: any) {
      console.error('Error loading OPD data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load OPD data');
      setOpdVisits([]);
    } finally {
      setLoading(false);
    }
  }, [fetchVisits, fetchStats, fetchDepartments, fetchDoctors, fetchPatients]);

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
        (visit.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (visit.visitNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (visit.doctorName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const deptName = typeof visit.department === 'object' ? visit.department?.name : visit.department;
      const matchesDepartment = !selectedDepartment || deptName === selectedDepartment;
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
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
      case 'waiting':
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
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />} 
            className="w-full sm:w-auto" 
            size="sm"
            onClick={fetchAllData}
          >
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
                data={departments.map(d => ({ value: d, label: d }))}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                searchable
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
                      <Table.Td colSpan={9}>
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
                              {typeof visit.department === 'object' ? visit.department?.name : visit.department}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {typeof visit.department === 'object' ? visit.department?.name : visit.department}
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
              {doctors.length === 0 ? (
                <Text c="dimmed" ta="center" p="xl">No doctors available</Text>
              ) : (
                doctors.map((doctor) => (
                  <Card key={doctor.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          Dr. {doctor.user?.firstName || doctor.firstName || 'Unknown'} {doctor.user?.lastName || doctor.lastName || ''}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {doctor.specialization || doctor.role || 'Doctor'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {doctor.qualification || 'Medical Professional'}
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
                        <Badge variant="light">{doctor.department?.name || 'General'}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Experience
                        </Text>
                        <Text size="sm">{doctor.experience || 'N/A'}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Status
                        </Text>
                        <Badge color={doctor.isActive ? 'green' : 'gray'} variant="light">
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Group>
                    </Stack>

                    <Group justify="space-between">
                      <Button
                        variant="light"
                        size="xs"
                        onClick={() => handleViewDoctorSchedule(doctor as any)}
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
                ))
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Visit Statistics */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Visit Statistics
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">Total Visits</Text>
                  <Badge color="blue" size="lg">{opdVisits.length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Completed</Text>
                  <Badge color="green" size="lg">{opdVisits.filter(v => v.status === 'completed').length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">In Progress</Text>
                  <Badge color="orange" size="lg">{opdVisits.filter(v => v.status === 'in_consultation').length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Scheduled</Text>
                  <Badge color="cyan" size="lg">{opdVisits.filter(v => v.status === 'scheduled').length}</Badge>
                </Group>
              </Stack>
            </Card>

            {/* Department Distribution */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Department-wise Visits
              </Title>
              <Stack gap="md">
                {departments.map(dept => {
                  const count = opdVisits.filter(v => v.department === dept).length;
                  return (
                    <Group key={dept} justify="space-between">
                      <Text size="sm">{dept}</Text>
                      <Badge color="blue" size="lg">{count}</Badge>
                    </Group>
                  );
                })}
                {departments.length === 0 && (
                  <Text c="dimmed" ta="center" size="sm">No department data available</Text>
                )}
              </Stack>
            </Card>

            {/* Payment Status */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Payment Status
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">Paid</Text>
                  <Badge color="green" size="lg">{opdVisits.filter(v => v.paymentStatus === 'paid').length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Pending</Text>
                  <Badge color="red" size="lg">{opdVisits.filter(v => v.paymentStatus === 'pending').length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Insurance</Text>
                  <Badge color="blue" size="lg">{opdVisits.filter(v => v.paymentStatus === 'insurance').length}</Badge>
                </Group>
              </Stack>
            </Card>

            {/* Visit Types */}
            <Card padding="md" radius="md" withBorder className="p-3 sm:p-4 md:p-5">
              <Title order={4} mb="md">
                Visit Types
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">New Patients</Text>
                  <Badge color="blue" size="lg">{opdVisits.filter(v => v.visitType === 'new').length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Follow-up</Text>
                  <Badge color="cyan" size="lg">{opdVisits.filter(v => v.visitType === 'follow_up').length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Emergency</Text>
                  <Badge color="red" size="lg">{opdVisits.filter(v => v.visitType === 'emergency').length}</Badge>
                </Group>
              </Stack>
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
                <Text>{typeof selectedVisit.department === 'object' ? selectedVisit.department?.name : selectedVisit.department}</Text>
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
                <Text tt="capitalize">{selectedVisit.visitType?.replace('_', ' ') || 'N/A'}</Text>
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

            {selectedVisit.prescriptionArray && selectedVisit.prescriptionArray.length > 0 && (
              <div>
                <Text size="sm" c="dimmed" fw={500} mb="xs">
                  Prescription
                </Text>
                <List size="sm">
                  {selectedVisit.prescriptionArray?.map((med, index) => (
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
              data={patients.map(p => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName} - ${p.patientId || p.medicalRecordNumber || ''}`
              }))}
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
              data={departments.map(d => ({ value: d, label: d }))}
              searchable
              required
            />
            <Select
              label="Doctor"
              placeholder="Select doctor"
              data={doctors.map(d => ({
                value: d.id,
                label: `Dr. ${d.user?.firstName || d.firstName || ''} ${d.user?.lastName || d.lastName || ''} (${d.department?.name || 'General'})`
              }))}
              searchable
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

