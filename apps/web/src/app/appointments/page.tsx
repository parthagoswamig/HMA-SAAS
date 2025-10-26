'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  TextInput, 
  Select, 
  Badge, 
  Table, 
  Group, 
  ActionIcon,
  Text,
  Modal,
  Stack,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash, IconEye, IconCheck, IconX, IconClock } from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import appointmentsService from '../../services/appointments.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';
import AppointmentForm from '../../components/appointments/AppointmentForm';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  startTime: string;
  endTime: string;
  status:
    | 'SCHEDULED'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW'
    | 'RESCHEDULED';
  reason: string;
  notes?: string;
  type: 'consultation' | 'follow_up' | 'surgery' | 'emergency' | 'telemedicine';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const AppointmentsPage = () => {
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    completed: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
    fetchStats();
  }, [selectedDate, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const filters: any = {
        startDate: selectedDate,
        endDate: selectedDate,
      };
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await appointmentsService.getAppointments(filters);
      if (response.success && response.data) {
        const mappedAppointments = response.data.map((apt: any) => ({
          id: apt.id,
          patientId: apt.patientId,
          patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
          doctorId: apt.doctorId,
          doctorName: apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown',
          department: apt.department?.name || 'General',
          startTime: apt.appointmentDateTime,
          endTime: new Date(new Date(apt.appointmentDateTime).getTime() + 30 * 60000).toISOString(),
          status: apt.status || 'SCHEDULED',
          reason: apt.reason || '',
          notes: apt.notes || '',
          type: 'consultation' as const,
          priority: 'medium' as const,
        }));
        setAppointments(mappedAppointments);
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to fetch appointments',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        setPatients(response.data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await staffService.getStaff({ role: 'DOCTOR', limit: 100 });
      if (response.success && response.data) {
        setDoctors(response.data.staff || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await appointmentsService.getAppointmentStats();
      if (response.success && response.data) {
        setAppointmentStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateAppointment = async (data: any) => {
    try {
      const response = await appointmentsService.createAppointment(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Appointment scheduled successfully',
          color: 'green',
        });
        fetchAppointments();
        fetchStats();
        closeForm();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to schedule appointment',
        color: 'red',
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await appointmentsService.updateAppointmentStatus(id, status);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: `Appointment ${status.toLowerCase()}`,
          color: 'green',
        });
        fetchAppointments();
        fetchStats();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update appointment',
        color: 'red',
      });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    await handleUpdateStatus(id, 'CANCELLED');
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openDetails();
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    openForm();
  };

  const departments = [
    'Cardiology',
    'Pediatrics',
    'Orthopedics',
    'Emergency',
    'Neurology',
    'Dermatology',
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDepartment =
      filterDepartment === 'all' || appointment.department === filterDepartment;
    const matchesDate = appointment.startTime.startsWith(selectedDate);

    return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return '#3b82f6';
      case 'ARRIVED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#f59e0b';
      case 'COMPLETED':
        return '#059669';
      case 'CANCELLED':
        return '#ef4444';
      case 'NO_SHOW':
        return '#dc2626';
      case 'RESCHEDULED':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#65a30d';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return '🩺';
      case 'follow_up':
        return '🔄';
      case 'surgery':
        return '⚕️';
      case 'emergency':
        return '🚨';
      case 'telemedicine':
        return '💻';
      default:
        return '📋';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card
      variant="elevated"
      style={{
        marginBottom: '1rem',
        borderLeft: `4px solid ${getStatusColor(appointment.status)}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
              {getTypeIcon(appointment.type)}
            </span>
            <h3
              style={{
                margin: '0 1rem 0 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
              }}
            >
              {appointment.patientName}
            </h3>
            <span
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: `${getPriorityColor(appointment.priority)}15`,
                color: getPriorityColor(appointment.priority),
              }}
            >
              {appointment.priority.toUpperCase()}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Doctor:</strong> {appointment.doctorName}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Department:</strong> {appointment.department}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Time:</strong>{' '}
                {new Date(appointment.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(appointment.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Reason:</strong> {appointment.reason}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Type:</strong> {appointment.type.replace('_', ' ')}
              </p>
              {appointment.notes && (
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Notes:</strong> {appointment.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: `${getStatusColor(appointment.status)}15`,
              color: getStatusColor(appointment.status),
            }}
          >
            {appointment.status.replace('_', ' ')}
          </span>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleViewDetails(appointment)}
              title="View Details"
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => handleEditAppointment(appointment)}
              title="Edit Appointment"
            >
              <IconEdit size={16} />
            </ActionIcon>
            {appointment.status === 'SCHEDULED' && (
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleCancelAppointment(appointment.id)}
                title="Cancel Appointment"
              >
                <IconX size={16} />
              </ActionIcon>
            )}
            {appointment.status === 'SCHEDULED' && (
              <ActionIcon
                variant="subtle"
                color="teal"
                onClick={() => handleUpdateStatus(appointment.id, 'IN_PROGRESS')}
                title="Start Appointment"
              >
                <IconCheck size={16} />
              </ActionIcon>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const CalendarView = () => {
    const today = new Date(selectedDate);
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

    return (
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
            Schedule for{' '}
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split('T')[0]);
              }}
            >
              ← Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split('T')[0]);
              }}
            >
              Next →
            </Button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: '0.5rem',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {hours.map((hour) => {
            const appointmentsInHour = filteredAppointments.filter((apt) => {
              const aptHour = new Date(apt.startTime).getHours();
              return aptHour === hour;
            });

            return (
              <React.Fragment key={hour}>
                <div
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontWeight: '500',
                    textAlign: 'center',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div
                  style={{
                    minHeight: '60px',
                    borderTop: '1px solid #f1f5f9',
                    padding: '0.5rem',
                    position: 'relative',
                  }}
                >
                  {appointmentsInHour.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      style={{
                        position: 'absolute',
                        left: `${index * 200 + 8}px`,
                        width: '190px',
                        background: `${getStatusColor(appointment.status)}15`,
                        border: `2px solid ${getStatusColor(appointment.status)}`,
                        borderRadius: '6px',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleViewDetails(appointment)}
                    >
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {appointment.patientName}
                      </div>
                      <div style={{ color: '#6b7280' }}>{appointment.doctorName}</div>
                      <div style={{ color: '#6b7280' }}>
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Appointment Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage patient appointments, scheduling, and medical consultations
            </p>
          </div>
          <Button onClick={() => { setSelectedAppointment(null); openForm(); }} leftIcon={<IconPlus size={16} />}>
            Schedule New Appointment
          </Button>
        </div>

        {/* Controls */}
        <Card style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'end',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                View Mode
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant={currentView === 'calendar' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('calendar')}
                >
                  📅 Calendar
                </Button>
                <Button
                  variant={currentView === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                >
                  📋 List
                </Button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                }}
              />
            </div>

            <TextInput
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="Search"
            />

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Status Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                }}
              >
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARRIVED">Arrived</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                }}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <Card variant="bordered">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {filteredAppointments.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Today&apos;s Appointments
              </div>
            </div>
          </Card>

          <Card variant="bordered">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {filteredAppointments.filter((a) => a.status === 'COMPLETED').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
            </div>
          </Card>

          <Card variant="bordered">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {filteredAppointments.filter((a) => a.status === 'IN_PROGRESS').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Progress</div>
            </div>
          </Card>

          <Card variant="bordered">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                {filteredAppointments.filter((a) => a.status === 'CANCELLED').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cancelled</div>
            </div>
          </Card>
        </div>

        {/* List View */}
        {currentView === 'list' ? (
          <div>
            <LoadingOverlay visible={loading} />
            <Table>
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient Name</th>
                  <th>Doctor Name</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.doctorName}</td>
                    <td>{appointment.department}</td>
                    <td>
                      <Badge color={getStatusColor(appointment.status).slice(1)} variant="filled">
                        {appointment.status}
                      </Badge>
                    </td>
                    <td>
                      <Group justify="flex-end">
                        <Button
                          variant="subtle"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            openDetails();
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="subtle"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            openForm();
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            handleCancelAppointment(appointment.id);
                          }}
                        >
                          Cancel
                        </Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <CalendarView />
        )}

        {/* Appointment Form Modal */}
        <AppointmentForm
          opened={formOpened}
          onClose={closeForm}
          appointment={selectedAppointment}
          onSubmit={selectedAppointment ? 
            (data) => appointmentsService.updateAppointment(selectedAppointment.id, data).then(() => {
              notifications.show({ title: 'Success', message: 'Appointment updated', color: 'green' });
              closeForm();
              fetchAppointments();
            }) :
            handleCreateAppointment
          }
          patients={patients}
          doctors={doctors}
        />

        {/* Appointment Details Modal */}
        <Modal
          opened={detailsOpened}
          onClose={closeDetails}
          title="Appointment Details"
          size="lg"
        >
          {selectedAppointment && (
            <Stack>
              <Alert icon={<IconClock size={20} />} color="blue" variant="light">
                <Text size="sm">Appointment scheduled for {new Date(selectedAppointment.startTime).toLocaleString()}</Text>
              </Alert>
              
              <Group justify="space-between">
                <div>
                  <Text size="sm" color="dimmed">Patient</Text>
                  <Text fw={500}>{selectedAppointment.patientName}</Text>
                </div>
                <div>
                  <Text size="sm" color="dimmed">Doctor</Text>
                  <Text fw={500}>{selectedAppointment.doctorName}</Text>
                </div>
              </Group>

              <Group justify="space-between">
                <div>
                  <Text size="sm" color="dimmed">Department</Text>
                  <Text fw={500}>{selectedAppointment.department}</Text>
                </div>
                <div>
                  <Text size="sm" color="dimmed">Status</Text>
                  <Badge color={getStatusColor(selectedAppointment.status).slice(1)} variant="filled">
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </Group>

              <div>
                <Text size="sm" color="dimmed">Reason for Visit</Text>
                <Text fw={500}>{selectedAppointment.reason}</Text>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <Text size="sm" color="dimmed">Notes</Text>
                  <Text>{selectedAppointment.notes}</Text>
                </div>
              )}

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={closeDetails}>Close</Button>
                {selectedAppointment.status === 'SCHEDULED' && (
                  <>
                    <Button 
                      color="green" 
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'IN_PROGRESS');
                        closeDetails();
                      }}
                    >
                      Start Appointment
                    </Button>
                    <Button 
                      color="red" 
                      variant="outline"
                      onClick={() => {
                        handleCancelAppointment(selectedAppointment.id);
                        closeDetails();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Group>
            </Stack>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
