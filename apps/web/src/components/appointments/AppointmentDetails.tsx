import React from 'react';
import { Modal, Text, Group, Stack, Badge, Button, Divider, Grid, Card } from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconStethoscope,
  IconNotes,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconPhone,
  IconMail,
} from '@tabler/icons-react';

interface AppointmentDetailsProps {
  opened: boolean;
  onClose: () => void;
  appointment: any;
  onEdit?: (appointment: any) => void;
  onDelete?: (appointment: any) => void;
  onStatusChange?: (appointmentId: string, status: string) => void;
}

export default function AppointmentDetails({
  opened,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
}: AppointmentDetailsProps) {
  if (!appointment) return null;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const patient = appointment.patient || {};
  const doctor = appointment.doctor || {};

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group>
            <IconCalendar size={24} />
            <Text size="lg" fw={600}>
              Appointment Details
            </Text>
          </Group>
          <Badge color={getStatusColor(appointment.status)} size="lg">
            {appointment.status}
          </Badge>
        </Group>
      }
      size="lg"
      padding="md"
    >
      <Stack gap="md">
        {/* Date and Time */}
        <Card withBorder padding="md">
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconCalendar size={20} color="#228be6" />
                <div>
                  <Text size="xs" c="dimmed">
                    Date
                  </Text>
                  <Text fw={500}>{formatDate(appointment.startTime)}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconClock size={20} color="#228be6" />
                <div>
                  <Text size="xs" c="dimmed">
                    Time
                  </Text>
                  <Text fw={500}>
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </Text>
                </div>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Patient Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconUser size={20} />
            <Text fw={600}>Patient Information</Text>
          </Group>
          <Divider mb="sm" />
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Name:
              </Text>
              <Text fw={500}>
                {patient.firstName} {patient.lastName}
              </Text>
            </Group>
            {patient.medicalRecordNumber && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  MRN:
                </Text>
                <Text fw={500}>{patient.medicalRecordNumber}</Text>
              </Group>
            )}
            {patient.phone && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Phone:
                </Text>
                <Group gap="xs">
                  <IconPhone size={16} />
                  <Text fw={500}>{patient.phone}</Text>
                </Group>
              </Group>
            )}
            {patient.email && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Email:
                </Text>
                <Group gap="xs">
                  <IconMail size={16} />
                  <Text fw={500}>{patient.email}</Text>
                </Group>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Doctor Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconStethoscope size={20} />
            <Text fw={600}>Doctor Information</Text>
          </Group>
          <Divider mb="sm" />
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Name:
              </Text>
              <Text fw={500}>
                Dr. {doctor.firstName} {doctor.lastName}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Appointment Details */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconNotes size={20} />
            <Text fw={600}>Appointment Details</Text>
          </Group>
          <Divider mb="sm" />
          <Stack gap="xs">
            {appointment.reason && (
              <div>
                <Text size="sm" c="dimmed" mb={4}>
                  Reason for Visit:
                </Text>
                <Text>{appointment.reason}</Text>
              </div>
            )}
            {appointment.notes && (
              <div>
                <Text size="sm" c="dimmed" mb={4}>
                  Additional Notes:
                </Text>
                <Text>{appointment.notes}</Text>
              </div>
            )}
          </Stack>
        </Card>

        {/* Status Actions */}
        {onStatusChange && appointment.status === 'SCHEDULED' && (
          <Card withBorder padding="md" bg="blue.0">
            <Text size="sm" fw={600} mb="sm">
              Quick Actions
            </Text>
            <Group>
              <Button
                size="xs"
                leftSection={<IconCheck size={16} />}
                onClick={() => onStatusChange(appointment.id, 'ARRIVED')}
              >
                Mark as Arrived
              </Button>
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconClock size={16} />}
                onClick={() => onStatusChange(appointment.id, 'IN_PROGRESS')}
              >
                Start Consultation
              </Button>
              <Button
                size="xs"
                color="red"
                variant="light"
                leftSection={<IconX size={16} />}
                onClick={() => onStatusChange(appointment.id, 'CANCELLED')}
              >
                Cancel
              </Button>
            </Group>
          </Card>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          {onDelete && (
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this appointment?')) {
                  onDelete(appointment);
                  onClose();
                }
              }}
            >
              Delete
            </Button>
          )}
          {onEdit && (
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => {
                onEdit(appointment);
                onClose();
              }}
            >
              Edit Appointment
            </Button>
          )}
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
