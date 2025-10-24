'use client';

import { Card, Title, Text, Stack, Badge, Group, Button, Table } from '@mantine/core';
import { IconCalendarEvent, IconClock, IconMapPin, IconUser } from '@tabler/icons-react';

export default function MyAppointmentsPage() {
  const upcomingAppointments = [
    {
      id: 1,
      date: '2024-03-20',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      speciality: 'General Physician',
      location: 'Building A, Room 203',
      status: 'Confirmed',
    },
    {
      id: 2,
      date: '2024-03-25',
      time: '2:30 PM',
      doctor: 'Dr. Michael Chen',
      speciality: 'Cardiologist',
      location: 'Building B, Room 105',
      status: 'Pending',
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      date: '2024-03-15',
      time: '11:00 AM',
      doctor: 'Dr. Sarah Johnson',
      speciality: 'General Physician',
      status: 'Completed',
    },
    {
      id: 4,
      date: '2024-02-28',
      time: '3:00 PM',
      doctor: 'Dr. Emily Rodriguez',
      speciality: 'Dermatologist',
      status: 'Completed',
    },
  ];

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">
          My Appointments
        </Title>
        <Text c="dimmed">Manage your upcoming and past appointments</Text>
      </div>

      {/* Quick Actions */}
      <Group>
        <Button
          leftSection={<IconCalendarEvent size={16} />}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Book New Appointment
        </Button>
        <Button variant="outline" color="gray">
          View Calendar
        </Button>
      </Group>

      {/* Stats */}
      <Group>
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Upcoming
              </Text>
              <Title order={3}>{upcomingAppointments.length}</Title>
            </div>
            <IconCalendarEvent size={32} color="#667eea" />
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Completed
              </Text>
              <Title order={3}>{pastAppointments.length}</Title>
            </div>
            <IconClock size={32} color="#10b981" />
          </Group>
        </Card>
      </Group>

      {/* Upcoming Appointments */}
      <div>
        <Title order={4} mb="md">
          Upcoming Appointments
        </Title>
        <Stack gap="md">
          {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="apart" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <IconCalendarEvent size={20} color="#667eea" />
                    <Text fw={600} size="lg">
                      {appointment.doctor}
                    </Text>
                    <Badge
                      color={appointment.status === 'Confirmed' ? 'green' : 'yellow'}
                      variant="light"
                    >
                      {appointment.status}
                    </Badge>
                  </Group>

                  <Group gap="xl">
                    <Group gap="xs">
                      <IconCalendarEvent size={16} color="#6b7280" />
                      <Text size="sm" c="dimmed">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconClock size={16} color="#6b7280" />
                      <Text size="sm" c="dimmed">
                        {appointment.time}
                      </Text>
                    </Group>
                  </Group>

                  <Group gap="xl">
                    <Group gap="xs">
                      <IconUser size={16} color="#6b7280" />
                      <Text size="sm" c="dimmed">
                        {appointment.speciality}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconMapPin size={16} color="#6b7280" />
                      <Text size="sm" c="dimmed">
                        {appointment.location}
                      </Text>
                    </Group>
                  </Group>
                </Stack>

                <Group gap="xs">
                  <Button size="sm" variant="light" color="blue">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="light" color="red">
                    Cancel
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </div>

      {/* Past Appointments */}
      <div>
        <Title order={4} mb="md">
          Past Appointments
        </Title>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Speciality</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pastAppointments.map((appointment) => (
                <Table.Tr key={appointment.id}>
                  <Table.Td>{new Date(appointment.date).toLocaleDateString()}</Table.Td>
                  <Table.Td>{appointment.time}</Table.Td>
                  <Table.Td>{appointment.doctor}</Table.Td>
                  <Table.Td>{appointment.speciality}</Table.Td>
                  <Table.Td>
                    <Badge color="green" variant="light">
                      {appointment.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="subtle">
                      View Details
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </div>
    </Stack>
  );
}
