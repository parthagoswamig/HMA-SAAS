'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Text,
  Group,
  Badge,
  SimpleGrid,
  Stack,
  Button,
  Title,
  Card,
  TextInput,
  Select,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import {
  IconPlus,
  IconSearch,
  IconCalendar,
  IconClock,
  IconEdit,
  IconTrash,
  IconEye,
  IconCalendarEvent,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import AppointmentDetails from '../../components/appointments/AppointmentDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import appointmentsService from '../../services/appointments.service';
import patientsService from '../../services/patients.service';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilters,
} from '../../services/appointments.service';

const mockUser: User = {
  id: '1',
  username: 'sjohnson',
  email: 'sarah.johnson@hospital.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: UserRole.DOCTOR,
  permissions: [],
  isActive: true,
  tenantInfo: {
    tenantId: 'T001',
    tenantName: 'Main Hospital',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function AppointmentsPage() {
  const { user, setUser } = useAppStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchAppointments();
    fetchStats();
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const filters: AppointmentFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter) filters.status = statusFilter;
      if (dateFilter) {
        filters.startDate = dateFilter.toISOString();
        filters.endDate = dateFilter.toISOString();
      }

      const response = await appointmentsService.getAppointments(filters);
      if (response.success && response.data) {
        setAppointments(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to fetch appointments',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await appointmentsService.getAppointmentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients();
      if (response.success && response.data) {
        setPatients(response.data.patients || []);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreateAppointment = async (data: CreateAppointmentDto) => {
    try {
      const response = await appointmentsService.createAppointment(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Appointment created successfully',
          color: 'green',
        });
        fetchAppointments();
        fetchStats();
        closeForm();
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to create appointment',
        color: 'red',
      });
      throw error;
    }
  };

  const handleUpdateAppointment = async (data: UpdateAppointmentDto) => {
    if (!selectedAppointment) return;

    try {
      const response = await appointmentsService.updateAppointment(selectedAppointment.id, data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Appointment updated successfully',
          color: 'green',
        });
        fetchAppointments();
        fetchStats();
        closeForm();
        setSelectedAppointment(null);
      }
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to update appointment',
        color: 'red',
      });
      throw error;
    }
  };

  const handleDeleteAppointment = async (appointment: any) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      const response = await appointmentsService.deleteAppointment(appointment.id);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Appointment deleted successfully',
          color: 'green',
        });
        fetchAppointments();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to delete appointment',
        color: 'red',
      });
    }
  };

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      const response = await appointmentsService.updateAppointmentStatus(appointmentId, status);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: `Appointment status updated to ${status}`,
          color: 'green',
        });
        fetchAppointments();
        fetchStats();
        closeDetails();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to update status',
        color: 'red',
      });
    }
  };

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    openDetails();
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    openForm();
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    openForm();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'blue',
      ARRIVED: 'teal',
      IN_PROGRESS: 'yellow',
      COMPLETED: 'green',
      CANCELLED: 'red',
      NO_SHOW: 'gray',
      RESCHEDULED: 'orange',
    };
    return colors[status] || 'gray';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const columns: TableColumn[] = [
    {
      key: 'patient',
      title: 'Patient',
      sortable: true,
      render: (appointment: any) => (
        <div>
          <Text fw={500}>
            {appointment.patient?.firstName} {appointment.patient?.lastName}
          </Text>
          <Text size="xs" c="dimmed">
            {appointment.patient?.medicalRecordNumber || appointment.patient?.id}
          </Text>
        </div>
      ),
    },
    {
      key: 'doctor',
      title: 'Doctor',
      sortable: true,
      render: (appointment: any) => (
        <Text>
          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
        </Text>
      ),
    },
    {
      key: 'dateTime',
      title: 'Date & Time',
      sortable: true,
      render: (appointment: any) => {
        const { date, time } = formatDateTime(appointment.startTime);
        return (
          <div>
            <Text fw={500}>{date}</Text>
            <Text size="xs" c="dimmed">
              {time}
            </Text>
          </div>
        );
      },
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (appointment: any) => <Text lineClamp={2}>{appointment.reason}</Text>,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (appointment: any) => (
        <Badge color={getStatusColor(appointment.status)}>{appointment.status}</Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (appointment: any) => (
        <Group gap="xs">
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconEye size={14} />}
            onClick={() => handleViewAppointment(appointment)}
          >
            View
          </Button>
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconEdit size={14} />}
            onClick={() => handleEditAppointment(appointment)}
          >
            Edit
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => handleDeleteAppointment(appointment)}
          >
            Delete
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Layout
      user={
        user
          ? {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
              avatar: undefined,
            }
          : mockUser
            ? {
                id: mockUser.id,
                name: `${mockUser.firstName} ${mockUser.lastName}`,
                email: mockUser.email,
                role: mockUser.role,
                avatar: undefined,
              }
            : undefined
      }
      notifications={0}
      onLogout={() => {}}
    >
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Appointment Management</Title>
              <Text c="dimmed" size="sm">
                Manage and schedule patient appointments
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewAppointment}>
              Book Appointment
            </Button>
          </Group>

          {/* Statistics Cards */}
          {stats && (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Total
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.total}
                    </Text>
                  </div>
                  <IconCalendarEvent size={32} color="#228be6" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Today
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.today}
                    </Text>
                  </div>
                  <IconClock size={32} color="#12b886" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Pending
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.pending}
                    </Text>
                  </div>
                  <IconAlertCircle size={32} color="#fab005" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Completed
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.completed}
                    </Text>
                  </div>
                  <IconCheck size={32} color="#40c057" />
                </Group>
              </Card>
            </SimpleGrid>
          )}

          {/* Filters */}
          <Paper withBorder p="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <TextInput
                  placeholder="Search appointments..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Filter by status"
                  data={[
                    { value: '', label: 'All Statuses' },
                    { value: 'SCHEDULED', label: 'Scheduled' },
                    { value: 'ARRIVED', label: 'Arrived' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || '')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <DatePickerInput
                  placeholder="Filter by date"
                  leftSection={<IconCalendar size={16} />}
                  value={dateFilter}
                  onChange={(value) => setDateFilter(value as unknown as Date | null)}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Button fullWidth onClick={fetchAppointments}>
                  Apply Filters
                </Button>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Appointments Table */}
          <Paper withBorder>
            <LoadingOverlay visible={loading} />
            {appointments.length === 0 && !loading ? (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="No appointments found"
                color="blue"
              >
                No appointments match your current filters. Try adjusting your search criteria or
                book a new appointment.
              </Alert>
            ) : (
              <DataTable columns={columns} data={appointments} loading={loading} />
            )}
          </Paper>
        </Stack>
      </Container>

      {/* Appointment Form Modal */}
      <AppointmentForm
        opened={formOpened}
        onClose={closeForm}
        appointment={selectedAppointment}
        onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
        patients={patients}
        doctors={doctors}
      />

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetails
          opened={detailsOpened}
          onClose={closeDetails}
          appointment={selectedAppointment}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatusChange}
        />
      )}
    </Layout>
  );
}

export default AppointmentsPage;
