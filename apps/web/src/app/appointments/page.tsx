'use client';

import React, { useState } from 'react';
import { Button, Card, TextInput } from '@mantine/core';
import Layout from '../../components/shared/Layout';

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
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Doe',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Wilson',
      department: 'Cardiology',
      startTime: '2024-12-05T09:00:00',
      endTime: '2024-12-05T09:30:00',
      status: 'SCHEDULED',
      reason: 'Regular checkup',
      type: 'consultation',
      priority: 'medium',
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Emily Johnson',
      doctorId: 'd2',
      doctorName: 'Dr. Michael Chen',
      department: 'Pediatrics',
      startTime: '2024-12-05T10:30:00',
      endTime: '2024-12-05T11:00:00',
      status: 'IN_PROGRESS',
      reason: 'Vaccination',
      type: 'consultation',
      priority: 'low',
    },
    {
      id: '3',
      patientId: 'p3',
      patientName: 'Robert Smith',
      doctorId: 'd3',
      doctorName: 'Dr. Lisa Rodriguez',
      department: 'Orthopedics',
      startTime: '2024-12-05T14:00:00',
      endTime: '2024-12-05T14:45:00',
      status: 'SCHEDULED',
      reason: 'Knee pain assessment',
      type: 'consultation',
      priority: 'high',
    },
    {
      id: '4',
      patientId: 'p4',
      patientName: 'Maria Garcia',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Wilson',
      department: 'Cardiology',
      startTime: '2024-12-05T16:30:00',
      endTime: '2024-12-05T17:15:00',
      status: 'COMPLETED',
      reason: 'Post-surgery follow-up',
      type: 'follow_up',
      priority: 'high',
    },
    {
      id: '5',
      patientId: 'p5',
      patientName: 'David Wilson',
      doctorId: 'd4',
      doctorName: 'Dr. James Kumar',
      department: 'Emergency',
      startTime: '2024-12-05T08:15:00',
      endTime: '2024-12-05T09:00:00',
      status: 'COMPLETED',
      reason: 'Chest pain',
      type: 'emergency',
      priority: 'urgent',
    },
  ]);

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
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = `/appointments/${appointment.id}`)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => (window.location.href = `/appointments/${appointment.id}/edit`)}
            >
              Edit
            </Button>
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
                      onClick={() => (window.location.href = `/appointments/${appointment.id}`)}
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
          <Button onClick={() => (window.location.href = '/appointments/new')}>
            + Schedule New Appointment
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

        {/* Main Content */}
        {currentView === 'calendar' ? (
          <CalendarView />
        ) : (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                Appointments ({filteredAppointments.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" size="sm">
                  Export
                </Button>
                <Button variant="secondary" size="sm">
                  Print Schedule
                </Button>
              </div>
            </div>

            {filteredAppointments.length > 0 ? (
              filteredAppointments
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                    }}
                  >
                    No appointments found
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    No appointments match your current search criteria for the selected date.
                  </p>
                  <Button onClick={() => (window.location.href = '/appointments/new')}>
                    Schedule New Appointment
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
