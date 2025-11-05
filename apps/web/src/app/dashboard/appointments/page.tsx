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
  ThemeIcon,
  Timeline,
  Alert,
  Progress,
  // Anchor,
  NumberInput,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import { Calendar, DatePickerInput } from '@mantine/dates';
// import { AreaChart, BarChart, DonutChart, LineChart } from '@mantine/charts';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  // IconTrash,
  IconCalendar,
  IconClock,
  IconUsers,
  IconChartBar,
  // IconPhone,
  // IconMail,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconDotsVertical,
  IconCalendarEvent,
  IconStethoscope,
  // IconActivity,
  // IconTrendingUp,
  // IconTrendingDown,
  IconClockHour3,
  IconUserCheck,
  // IconUserX,
  // IconCurrencyRupee,
  // IconVideo,
  IconBell,
  // IconHistory,
  // IconCalendarStats,
  // IconReport
} from '@tabler/icons-react';

// Import types and services
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
  // AppointmentSearchFilters,
  // AppointmentStats
} from '../../../types/appointment';
import appointmentsService from '../../../services/appointments.service';
import patientsService from '../../../services/patients.service';
import staffService from '../../../services/staff.service';

const AppointmentManagement = () => {
  // Utility function for consistent date formatting
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  // State management
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  
  // Form state for new appointment
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: null as Date | null,
    appointmentTime: '',
    appointmentType: '',
    priority: '',
    reason: '',
    consultationFee: 0,
  });

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
    fetchAppointments();
    fetchStats();
    fetchPatients();
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch patients
  const fetchPatients = async () => {
    try {
      console.log('🔵 [DEBUG] Fetching patients for appointment form...');
      const response = await patientsService.getPatients();
      const patientsList = Array.isArray(response.data?.patients) ? response.data.patients : [];
      console.log('✅ [DEBUG] Patients fetched:', patientsList.length, 'patients');
      setPatients(patientsList);
    } catch (error: any) {
      console.error('❌ [DEBUG] Error fetching patients:', error.response?.data || error.message);
      setPatients([]);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      console.log('🔵 [DEBUG] Fetching doctors for appointment form...');
      const response = await staffService.getStaff({ role: 'DOCTOR' });
      console.log('✅ [DEBUG] Doctors response:', response);
      const doctorsList = Array.isArray(response.data?.staff) ? response.data.staff : [];
      console.log('✅ [DEBUG] Doctors fetched:', doctorsList.length, 'doctors');
      setDoctors(doctorsList);
      
      // Extract unique departments
      const depts = [...new Set(doctorsList.map((d: any) => d.department?.name || 'General').filter(Boolean))];
      setDepartments(depts as string[]);
    } catch (error: any) {
      console.error('❌ [DEBUG] Error fetching doctors:', error.response?.data || error.message);
      setDoctors([]);
    }
  };

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      const filters = {
        doctorId: selectedDoctor || undefined,
        status: selectedStatus || undefined,
        startDate: selectedDate ? selectedDate.toISOString() : undefined,
        search: searchQuery || undefined,
      };
      const response = await appointmentsService.getAppointments(filters);
      console.log('Appointments API response:', response);
      setAppointments(response.data || []);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch appointments';
      console.warn('Error fetching appointments (using empty data):', errorMsg);
      setError(null);
      setAppointments([]);
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await appointmentsService.getAppointmentStats();
      console.log('Appointment stats API response:', response);
      setAppointmentStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching appointment stats (using default values):',
        err.response?.data?.message || err.message
      );
      setAppointmentStats({
        total: 0,
        today: 0,
        pending: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
      });
    }
  };

  // Refetch when filters change
  useEffect(() => {
    if (isClient) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, selectedStatus, selectedDate, searchQuery]);

  // Modal states
  const [appointmentDetailOpened, { open: openAppointmentDetail, close: closeAppointmentDetail }] =
    useDisclosure(false);
  const [bookAppointmentOpened, { open: openBookAppointment, close: closeBookAppointment }] =
    useDisclosure(false);

  // Filter appointments - now using API data
  const filteredAppointments = useMemo(() => {
    console.log('🔍 [DEBUG] Filtering appointments:', {
      totalAppointments: appointments.length,
      selectedDoctor,
      selectedDepartment,
      selectedType
    });
    
    const filtered = appointments.filter((appointment) => {
      if (selectedDoctor && appointment.doctor?.id !== selectedDoctor) {
        return false;
      }
      if (selectedDepartment) {
        const deptName = typeof appointment.department === 'object' ? appointment.department?.name : appointment.department;
        if (deptName !== selectedDepartment) {
          return false;
        }
      }
      const matchesType = !selectedType || appointment.appointmentType === selectedType;
      return matchesType; // Other filtering is handled by API
    });
    
    console.log('✅ [DEBUG] Filtered appointments:', filtered.length);
    return filtered;
  }, [appointments, selectedType, selectedDoctor, selectedDepartment]);

  // Helper functions
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'blue';
      case 'ARRIVED':
        return 'teal';
      case 'IN_PROGRESS':
        return 'yellow';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'NO_SHOW':
        return 'gray';
      case 'RESCHEDULED':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
      case 'emergency':
        return 'red';
      case 'consultation':
        return 'blue';
      case 'follow_up':
        return 'green';
      case 'surgery_consultation':
        return 'purple';
      case 'telemedicine':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: AppointmentPriority) => {
    switch (priority) {
      case 'emergency':
        return 'red';
      case 'urgent':
        return 'orange';
      case 'high':
        return 'yellow';
      case 'normal':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openAppointmentDetail();
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentsService.updateAppointmentStatus(appointmentId, newStatus);
      notifications.show({
        title: 'Appointment Updated',
        message: `Appointment status changed to ${newStatus}`,
        color: 'green',
      });
      fetchAppointments(); // Refresh the list
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update appointment status',
        color: 'red',
      });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (
      !window.confirm(
        `Cancel appointment for ${appointment.patient.firstName} ${appointment.patient.lastName}?`
      )
    ) {
      return;
    }

    try {
      await appointmentsService.updateAppointmentStatus(appointment.id, 'CANCELLED');
      notifications.show({
        title: 'Appointment Cancelled',
        message: `Appointment for ${appointment.patient.firstName} ${appointment.patient.lastName} has been cancelled`,
        color: 'green',
      });
      fetchAppointments(); // Refresh the list
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to cancel appointment',
        color: 'red',
      });
    }
  };

  // Handle book appointment
  const handleBookAppointment = async () => {
    try {
      console.log('📅 [DEBUG] Booking appointment with data:', formData);
      
      // Validate required fields
      if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please fill in all required fields',
          color: 'red',
        });
        return;
      }

      // Combine date and time - ensure we have a proper Date object
      const [hours, minutes] = formData.appointmentTime.split(':');
      const dateObj = formData.appointmentDate instanceof Date 
        ? new Date(formData.appointmentDate) 
        : new Date(formData.appointmentDate as any);
      
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDateTime: dateObj.toISOString(),
        reason: formData.reason || 'Consultation',
        notes: `Type: ${formData.appointmentType || 'consultation'}, Priority: ${formData.priority || 'normal'}, Fee: ₹${formData.consultationFee || 0}`,
        // Don't send status - let backend set default
      };

      console.log('📅 [DEBUG] Date object:', dateObj);
      console.log('📅 [DEBUG] ISO String:', dateObj.toISOString());
      console.log('📅 [DEBUG] Submitting appointment:', appointmentData);
      const response = await appointmentsService.createAppointment(appointmentData);
      
      console.log('✅ [DEBUG] Appointment created successfully:', response);
      
      // Show success alert
      alert('✅ SUCCESS!\n\nAppointment has been booked successfully!');
      
      // Show notification
      notifications.show({
        title: '✅ Appointment Booked Successfully!',
        message: 'The appointment has been scheduled and saved.',
        color: 'green',
        autoClose: 5000,
      });

      // Reset form and close modal
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: null,
        appointmentTime: '',
        appointmentType: '',
        priority: '',
        reason: '',
        consultationFee: 0,
      });
      closeBookAppointment();
      fetchAppointments();
      fetchStats();
    } catch (error: any) {
      console.error('❌ [DEBUG] Error booking appointment:', error);
      console.error('❌ [DEBUG] Error response:', error.response);
      console.error('❌ [DEBUG] Error data:', error.response?.data);
      console.error('❌ [DEBUG] Full error object:', JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to book appointment';
      const errorDetails = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
      
      // Show both alert and notification
      alert(`❌ Appointment Booking Failed!\n\nError: ${errorDetails}`);
      
      notifications.show({
        title: '❌ Appointment Booking Failed',
        message: errorDetails,
        color: 'red',
        autoClose: false, // Don't auto-close so user can read it
      });
    }
  };

  // Statistics cards
  const statsCards = appointmentStats
    ? [
        {
          title: 'Total',
          value: appointmentStats.total || 0,
          icon: IconCalendarEvent,
          color: 'blue',
          trend: null,
        },
        {
          title: 'Today',
          value: appointmentStats.today || 0,
          icon: IconClock,
          color: 'green',
          trend: null,
        },
        {
          title: 'Pending',
          value: appointmentStats.pending || 0,
          icon: IconClockHour3,
          color: 'yellow',
          trend: null,
        },
        {
          title: 'Completed',
          value: appointmentStats.completed || 0,
          icon: IconCheck,
          color: 'teal',
          trend: null,
        },
      ]
    : [];

  return (
    <Container size="xl" py="md" className="px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <Title order={1} className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">Appointment Management</Title>
          <Text c="dimmed" size="sm" className="text-xs sm:text-sm">
            Schedule, manage, and track patient appointments
          </Text>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={openBookAppointment}
          className="w-full sm:w-auto"
          size="sm"
        >
          Book Appointment
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          variant="light"
          mb="lg"
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {appointmentStats && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 'sm', sm: 'md', lg: 'lg' }} mb="lg">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} padding="md" className="p-3 sm:p-4 md:p-5" radius="md" withBorder>
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
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'appointments')}>
        <Tabs.List className="flex-wrap">
          <Tabs.Tab value="appointments" leftSection={<IconCalendarEvent size={16} />} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Appointments</span>
            <span className="sm:hidden">Appts</span>
          </Tabs.Tab>
          <Tabs.Tab value="calendar" leftSection={<IconCalendar size={16} />} className="text-xs sm:text-sm">
            Calendar
          </Tabs.Tab>
          <Tabs.Tab value="queue" leftSection={<IconUsers size={16} />} className="text-xs sm:text-sm">
            Queue
          </Tabs.Tab>
          <Tabs.Tab value="reminders" leftSection={<IconBell size={16} />} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Reminders</span>
            <span className="sm:hidden">🔔</span>
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">📊</span>
          </Tabs.Tab>
        </Tabs.List>

        {/* Appointments Tab */}
        <Tabs.Panel value="appointments">
          <Paper p="md" className="p-3 sm:p-4 md:p-6" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <TextInput
                placeholder="Search appointments..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                className="w-full sm:flex-1"
                size="sm"
              />
              <Select
                placeholder="Doctor"
                data={doctors.map(d => ({
                  value: d.id,
                  label: `Dr. ${d.user?.firstName || d.firstName || ''} ${d.user?.lastName || d.lastName || ''}`
                }))}
                value={selectedDoctor}
                onChange={(value) => setSelectedDoctor(value || '')}
                searchable
                clearable
                className="w-full sm:w-auto"
                size="sm"
              />
              <Select
                placeholder="Department"
                data={departments.map(d => ({ value: d, label: d }))}
                value={selectedDepartment}
                onChange={(value) => setSelectedDepartment(value || '')}
                searchable
                clearable
                className="w-full sm:w-auto"
                size="sm"
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'arrived', label: 'Arrived' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'no_show', label: 'No Show' },
                  { value: 'rescheduled', label: 'Rescheduled' },
                ]}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value || '')}
                clearable
                className="w-full sm:w-auto"
                size="sm"
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'telemedicine', label: 'Telemedicine' },
                ]}
                value={selectedType}
                onChange={(value) => setSelectedType(value || '')}
                clearable
                className="w-full sm:w-auto"
                size="sm"
              />
              <DatePickerInput
                placeholder="Select date"
                value={selectedDate}
                onChange={setSelectedDate as any}
                clearable
                className="w-full sm:w-auto"
                size="sm"
              />
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Fee</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredAppointments.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <EmptyState
                          icon={<IconCalendar size={48} />}
                          title="No appointments found"
                          description={
                            searchQuery || selectedDoctor || selectedStatus
                              ? 'No appointments match your search criteria. Try adjusting your filters.'
                              : 'No appointments scheduled yet. Book your first appointment to get started.'
                          }
                          action={
                            !searchQuery && !selectedDoctor && !selectedStatus
                              ? {
                                  label: 'Book Appointment',
                                  onClick: openBookAppointment,
                                }
                              : undefined
                          }
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <Table.Tr key={appointment.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="sm" color="blue">
                              {appointment.patient?.firstName?.[0] || 'P'}
                              {appointment.patient?.lastName?.[0] || ''}
                            </Avatar>
                            <div>
                              <Text fw={500}>
                                {appointment.patient?.firstName || 'Unknown'} {appointment.patient?.lastName || 'Patient'}
                              </Text>
                              <Text size="sm" c="dimmed">
                                {appointment.appointmentNumber || 'N/A'}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text fw={500}>
                              Dr. {appointment.doctor?.user?.firstName || appointment.doctor?.firstName || 'Unknown'} {appointment.doctor?.user?.lastName || appointment.doctor?.lastName || ''}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {appointment.doctor?.department?.name || (typeof appointment.department === 'object' ? appointment.department?.name : appointment.department) || 'General'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text fw={500}>
                              {isClient && appointment.startTime ? new Date(appointment.startTime).toLocaleDateString() : 'N/A'}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {isClient && appointment.startTime ? new Date(appointment.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light">
                            {appointment.reason || 'Consultation'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(appointment.status)} variant="light">
                            {(appointment.status || 'N/A').replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color="gray"
                            variant="light"
                            size="sm"
                          >
                            Normal
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text fw={500}>₹{appointment.consultationFee || 500}</Text>
                            <Badge
                              color="orange"
                              variant="light"
                              size="xs"
                            >
                              Pending
                            </Badge>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewAppointment(appointment)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="subtle" 
                              color="green"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                openBookAppointment();
                              }}
                              title="Edit Appointment"
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
                                <Menu.Item
                                  leftSection={<IconCheck size={14} />}
                                  onClick={() => handleStatusUpdate(appointment.id, 'ARRIVED')}
                                >
                                  Confirm
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconUserCheck size={14} />}
                                  onClick={() => handleStatusUpdate(appointment.id, 'ARRIVED')}
                                >
                                  Check In
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconX size={14} />}
                                  color="red"
                                  onClick={() => handleCancelAppointment(appointment)}
                                >
                                  Cancel
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
                </div>
              </div>
            </div>
          </Paper>
        </Tabs.Panel>

        {/* Calendar Tab */}
        <Tabs.Panel value="calendar">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Appointment Calendar</Title>
              <Group>
                <Select
                  placeholder="Select Doctor"
                  data={doctors.map(d => ({
                    value: d.id,
                    label: `Dr. ${d.user?.firstName || d.firstName || ''} ${d.user?.lastName || d.lastName || ''}`
                  }))}
                  value={selectedDoctor}
                  onChange={(value) => setSelectedDoctor(value || '')}
                  searchable
                  clearable
                />
                <Button leftSection={<IconPlus size={16} />} onClick={openBookAppointment}>
                  Book Appointment
                </Button>
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Calendar
                </Title>
                <Calendar
                  size="md"
                  static
                  renderDay={(date) => {
                    const dateObj = new Date(date as any);
                    const hasAppointments = (Array.isArray(appointments) ? appointments : []).some(
                      (apt) =>
                        new Date(apt.appointmentDate).toDateString() === dateObj.toDateString()
                    );
                    return (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: hasAppointments ? '#e3f2fd' : 'transparent',
                          borderRadius: '4px',
                        }}
                      >
                        {dateObj.getDate()}
                      </div>
                    );
                  }}
                />
              </Card>

              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Today&apos;s Schedule
                </Title>
                <Stack gap="sm">
                  {(Array.isArray(appointments) ? appointments : [])
                    .filter(
                      (apt) =>
                        new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
                    )
                    .map((appointment) => (
                      <Group
                        key={appointment.id}
                        justify="space-between"
                        p="sm"
                        style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}
                      >
                        <div>
                          <Text fw={500}>{appointment.appointmentTime || 'N/A'}</Text>
                          <Text size="sm" c="dimmed">
                            {appointment.patient?.firstName || 'Unknown'} {appointment.patient?.lastName || 'Patient'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {appointment.doctor?.firstName || 'Unknown'} {appointment.doctor?.lastName || 'Doctor'}
                          </Text>
                        </div>
                        <Badge color={getStatusColor(appointment.status)} variant="light" size="sm">
                          {appointment.status}
                        </Badge>
                      </Group>
                    ))}
                </Stack>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Queue Management Tab */}
        <Tabs.Panel value="queue">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Queue Management
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} mb="lg">
              <Card padding="md" radius="md" withBorder>
                <Group justify="center">
                  <ThemeIcon size="xl" color="blue" variant="light">
                    <IconUsers size={24} />
                  </ThemeIcon>
                </Group>
                <Text ta="center" fw={600} size="lg" mt="sm">
                  {appointments.filter(apt => apt.status === 'SCHEDULED' || apt.status === 'ARRIVED').length}
                </Text>
                <Text ta="center" size="sm" c="dimmed">
                  Waiting
                </Text>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Group justify="center">
                  <ThemeIcon size="xl" color="green" variant="light">
                    <IconStethoscope size={24} />
                  </ThemeIcon>
                </Group>
                <Text ta="center" fw={600} size="lg" mt="sm">
                  {appointments.filter(apt => apt.status === 'IN_PROGRESS').length}
                </Text>
                <Text ta="center" size="sm" c="dimmed">
                  In Consultation
                </Text>
              </Card>

              <Card padding="md" radius="md" withBorder>
                <Group justify="center">
                  <ThemeIcon size="xl" color="orange" variant="light">
                    <IconClockHour3 size={24} />
                  </ThemeIcon>
                </Group>
                <Text ta="center" fw={600} size="lg" mt="sm">
                  {appointments.length > 0 ? '15' : '0'} min
                </Text>
                <Text ta="center" size="sm" c="dimmed">
                  Avg Wait Time
                </Text>
              </Card>
            </SimpleGrid>

            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Current Queue
              </Title>
              {(Array.isArray(appointments) ? appointments : [])
                .filter((apt) => apt.status === 'SCHEDULED' || apt.status === 'ARRIVED')
                .slice(0, 5) // Show first 5 appointments as a simple queue
                .map((appointment, index) => (
                  <Group
                    key={appointment.id}
                    justify="space-between"
                    p="md"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                  >
                    <Group>
                      <Badge color="blue" variant="light" size="lg">
                        {index + 1}
                      </Badge>
                      <div>
                        <Text fw={500}>
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {appointment.reason || 'Consultation'}
                        </Text>
                      </div>
                    </Group>
                    <Group>
                      <Text size="sm" c="dimmed">
                        Est. {appointment.appointmentTime}
                      </Text>
                      <Badge
                        color={appointment.status === 'ARRIVED' ? 'green' : 'blue'}
                        variant="light"
                      >
                        {appointment.status}
                      </Badge>
                    </Group>
                  </Group>
                ))}
            </Card>
          </Paper>
        </Tabs.Panel>

        {/* Reminders Tab */}
        <Tabs.Panel value="reminders">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Appointment Reminders</Title>
              <Button leftSection={<IconBell size={16} />}>Configure Reminders</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Reminder Settings
                </Title>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text>24-hour reminder</Text>
                    <Badge color="green" variant="light">
                      Enabled
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text>2-hour reminder</Text>
                    <Badge color="green" variant="light">
                      Enabled
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text>SMS notifications</Text>
                    <Badge color="blue" variant="light">
                      Active
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text>Email notifications</Text>
                    <Badge color="blue" variant="light">
                      Active
                    </Badge>
                  </Group>
                </Stack>
              </Card>

              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Recent Reminders
                </Title>
                <Timeline>
                  {[
                    {
                      id: '1',
                      reminderType: 'appointment_reminder',
                      message: 'Upcoming appointment in 2 hours',
                      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                      status: 'sent',
                    },
                    {
                      id: '2',
                      reminderType: 'follow_up',
                      message: 'Follow-up appointment reminder',
                      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                      status: 'pending',
                    },
                    {
                      id: '3',
                      reminderType: 'appointment_reminder',
                      message: 'Appointment confirmation sent',
                      scheduledTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                      status: 'sent',
                    },
                  ].map((reminder) => (
                    <Timeline.Item
                      key={reminder.id}
                      bullet={<IconBell size={12} />}
                      title={(reminder.reminderType || 'N/A').replace('_', ' ').toUpperCase()}
                    >
                      <Text size="sm" c="dimmed">
                        {reminder.message}
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        {new Date(reminder.scheduledTime).toLocaleString()}
                      </Text>
                      <Badge
                        color={reminder.status === 'sent' ? 'green' : 'blue'}
                        variant="light"
                        size="xs"
                        mt="xs"
                      >
                        {reminder.status}
                      </Badge>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Appointment Analytics
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Appointments by Status */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Appointments by Status
                </Title>
                <Stack gap="md" mt="md">
                  <Group justify="space-between">
                    <Text size="sm">Scheduled</Text>
                    <Badge color="blue" size="lg">{appointmentStats?.scheduled || 0}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Completed</Text>
                    <Badge color="green" size="lg">{appointmentStats?.completed || 0}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Cancelled</Text>
                    <Badge color="red" size="lg">{appointmentStats?.cancelled || 0}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Pending</Text>
                    <Badge color="orange" size="lg">{appointmentStats?.pending || 0}</Badge>
                  </Group>
                </Stack>
              </Card>

              {/* Appointments by Type */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Appointments by Type
                </Title>
                <Stack gap="md" mt="md">
                  <Group justify="space-between">
                    <Text size="sm">Total Appointments</Text>
                    <Badge color="blue" size="lg">{appointmentStats?.total || 0}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Today</Text>
                    <Badge color="green" size="lg">{appointmentStats?.today || 0}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">This Week</Text>
                    <Badge color="cyan" size="lg">{filteredAppointments.length || 0}</Badge>
                  </Group>
                </Stack>
              </Card>

              {/* Daily Appointments Trend */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Recent Appointments Summary
                </Title>
                <SimpleGrid cols={{ base: 2, sm: 4 }} mt="md">
                  <div>
                    <Text size="xs" c="dimmed">Total</Text>
                    <Text size="xl" fw={700}>{appointmentStats?.total || 0}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Today</Text>
                    <Text size="xl" fw={700} c="blue">{appointmentStats?.today || 0}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Completed</Text>
                    <Text size="xl" fw={700} c="green">{appointmentStats?.completed || 0}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Pending</Text>
                    <Text size="xl" fw={700} c="orange">{appointmentStats?.pending || 0}</Text>
                  </div>
                </SimpleGrid>
              </Card>

              {/* Peak Hours */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Peak Hours
                </Title>
                <Text c="dimmed" ta="center" p="xl">
                  Chart component temporarily disabled
                </Text>
              </Card>

              {/* Revenue Metrics */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Revenue Overview
                </Title>
                <Stack gap="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Total Revenue</Text>
                      <Text size="sm" fw={500}>
                        ₹{(appointmentStats?.totalRevenue || 0).toLocaleString()}
                      </Text>
                    </Group>
                    <Progress value={85} color="green" />
                  </div>

                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Pending Payments</Text>
                      <Text size="sm" fw={500}>
                        ₹{(appointmentStats?.pendingPayments || 0).toLocaleString()}
                      </Text>
                    </Group>
                    <Progress value={15} color="red" />
                  </div>

                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Average Fee</Text>
                      <Text size="sm" fw={500}>
                        ₹{appointmentStats?.averageFee || 0}
                      </Text>
                    </Group>
                    <Progress value={75} color="blue" />
                  </div>
                </Stack>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Appointment Detail Modal */}
      <Modal
        opened={appointmentDetailOpened}
        onClose={closeAppointmentDetail}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <Stack gap="md">
            {/* Basic Info */}
            <Group>
              <Avatar size="xl" color="blue" radius="xl">
                {selectedAppointment.patient.firstName[0]}
                {selectedAppointment.patient.lastName[0]}
              </Avatar>
              <div>
                <Title order={3}>
                  {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}
                </Title>
                <Text c="dimmed">{selectedAppointment.appointmentNumber}</Text>
                <Badge color={getStatusColor(selectedAppointment.status)} variant="light" mt="xs">
                  {(selectedAppointment.status || 'N/A').replace('_', ' ')}
                </Badge>
              </div>
            </Group>

            <Divider />

            {/* Appointment Details */}
            <SimpleGrid cols={2}>
              <div>
                <Text size="sm" fw={500}>
                  Doctor
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Department
                </Text>
                <Text size="sm" c="dimmed">
                  {typeof selectedAppointment.department === 'object' ? selectedAppointment.department?.name : selectedAppointment.department || 'N/A'}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Date & Time
                </Text>
                <Text size="sm" c="dimmed">
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at{' '}
                  {selectedAppointment.appointmentTime}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Duration
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedAppointment.duration} minutes
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Type
                </Text>
                <Badge
                  color={getTypeColor(selectedAppointment.appointmentType)}
                  variant="light"
                  size="sm"
                >
                  {(selectedAppointment.appointmentType || 'N/A').replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Priority
                </Text>
                <Badge
                  color={getPriorityColor(selectedAppointment.priority)}
                  variant="light"
                  size="sm"
                >
                  {selectedAppointment.priority}
                </Badge>
              </div>
            </SimpleGrid>

            {/* Reason and Notes */}
            <div>
              <Text size="sm" fw={500}>
                Reason for Visit
              </Text>
              <Text size="sm" c="dimmed">
                {selectedAppointment.reason}
              </Text>
            </div>

            {selectedAppointment.notes && (
              <div>
                <Text size="sm" fw={500}>
                  Notes
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedAppointment.notes}
                </Text>
              </div>
            )}

            {/* Payment Info */}
            <div>
              <Text size="sm" fw={500}>
                Consultation Fee
              </Text>
              <Group>
                <Text size="sm" c="dimmed">
                  ₹{selectedAppointment.consultationFee}
                </Text>
                <Badge
                  color={selectedAppointment.isPaid ? 'green' : 'red'}
                  variant="light"
                  size="sm"
                >
                  {selectedAppointment.isPaid ? 'Paid' : 'Pending'}
                </Badge>
              </Group>
            </div>

            <Group justify="flex-end">
              <Button variant="light" onClick={closeAppointmentDetail}>
                Close
              </Button>
              {/* <Button onClick={openReschedule}>Reschedule</Button> */}
            </Group>
          </Stack>
        )}
      </Modal>

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
              label="Patient"
              placeholder="Select patient"
              data={(Array.isArray(patients) ? patients : []).map(p => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName} - ${p.patientId}`
              }))}
              value={formData.patientId}
              onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
              searchable
              required
            />
            <Select
              label="Doctor"
              placeholder="Select doctor"
              data={(Array.isArray(doctors) ? doctors : []).map(d => ({
                value: d.userId || d.id,
                label: `Dr. ${d.user?.firstName || d.firstName || 'Unknown'} ${d.user?.lastName || d.lastName || ''} ${d.department?.name ? `- ${d.department.name}` : ''}`
              }))}
              value={formData.doctorId}
              onChange={(value) => setFormData({ ...formData, doctorId: value || '' })}
              searchable
              required
            />
          </SimpleGrid>

          <Select
            label="Department"
            placeholder="Select department"
            data={departments.map(d => ({ value: d, label: d }))}
            searchable
            clearable
          />

          <SimpleGrid cols={2}>
            <DatePickerInput
              label="Appointment Date"
              placeholder="Select date"
              required
              value={formData.appointmentDate}
              onChange={(value) => setFormData({ ...formData, appointmentDate: value as any })}
              minDate={new Date()}
            />
            <Select
              label="Time Slot"
              placeholder="Select time"
              value={formData.appointmentTime}
              onChange={(value) => setFormData({ ...formData, appointmentTime: value || '' })}
              data={[
                { value: '09:00', label: '09:00 AM' },
                { value: '09:30', label: '09:30 AM' },
                { value: '10:00', label: '10:00 AM' },
                { value: '10:30', label: '10:30 AM' },
                { value: '11:00', label: '11:00 AM' },
                { value: '11:30', label: '11:30 AM' },
                { value: '12:00', label: '12:00 PM' },
                { value: '12:30', label: '12:30 PM' },
                { value: '14:00', label: '02:00 PM' },
                { value: '14:30', label: '02:30 PM' },
                { value: '15:00', label: '03:00 PM' },
                { value: '15:30', label: '03:30 PM' },
                { value: '16:00', label: '04:00 PM' },
                { value: '16:30', label: '04:30 PM' },
                { value: '17:00', label: '05:00 PM' },
                { value: '17:30', label: '05:30 PM' },
              ]}
              required
              searchable
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Appointment Type"
              placeholder="Select type"
              data={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
                { value: 'routine_checkup', label: 'Routine Checkup' },
              ]}
              value={formData.appointmentType}
              onChange={(value) => setFormData({ ...formData, appointmentType: value || '' })}
              required
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'emergency', label: 'Emergency' },
              ]}
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value || '' })}
              required
            />
          </SimpleGrid>

          <Textarea
            label="Reason for Visit"
            placeholder="Describe the reason for the appointment"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />

          <NumberInput 
            label="Consultation Fee" 
            placeholder="Enter fee amount" 
            min={0} 
            prefix="₹" 
            value={formData.consultationFee}
            onChange={(value) => setFormData({ ...formData, consultationFee: Number(value) || 0 })}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeBookAppointment}>
              Cancel
            </Button>
            <Button onClick={handleBookAppointment}>
              Book Appointment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default AppointmentManagement;
