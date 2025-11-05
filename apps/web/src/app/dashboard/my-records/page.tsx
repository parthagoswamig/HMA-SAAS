'use client';

import { Card, Title, Text, Stack, Badge, Group, Timeline, Accordion } from '@mantine/core';
import { IconFileText, IconPill, IconFlask, IconStethoscope } from '@tabler/icons-react';

export default function MyHealthRecordsPage() {
  const medicalRecords = [
    {
      date: '2024-03-15',
      type: 'Consultation',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Seasonal Allergies',
      prescription: 'Antihistamine, Nasal spray',
      notes: 'Follow up in 2 weeks if symptoms persist',
    },
    {
      date: '2024-02-28',
      type: 'Lab Test',
      test: 'Complete Blood Count',
      status: 'Normal',
      notes: 'All values within normal range',
    },
    {
      date: '2024-01-10',
      type: 'Vaccination',
      vaccine: 'Influenza',
      notes: 'Annual flu shot administered',
    },
  ];

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">
          My Health Records
        </Title>
        <Text c="dimmed">View your complete medical history and records</Text>
      </div>

      {/* Quick Stats */}
      <Group>
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Total Records
              </Text>
              <Title order={3}>{medicalRecords.length}</Title>
            </div>
            <IconFileText size={32} color="#667eea" />
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Active Prescriptions
              </Text>
              <Title order={3}>2</Title>
            </div>
            <IconPill size={32} color="#667eea" />
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Lab Tests
              </Text>
              <Title order={3}>5</Title>
            </div>
            <IconFlask size={32} color="#667eea" />
          </Group>
        </Card>
      </Group>

      {/* Medical Timeline */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Medical History Timeline
        </Title>
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {medicalRecords.map((record, index) => (
            <Timeline.Item
              key={index}
              bullet={
                record.type === 'Consultation' ? (
                  <IconStethoscope size={12} />
                ) : record.type === 'Lab Test' ? (
                  <IconFlask size={12} />
                ) : (
                  <IconPill size={12} />
                )
              }
              title={
                <Group gap="xs">
                  <Text fw={500}>{record.type}</Text>
                  <Badge size="sm" variant="light" color="blue">
                    {new Date(record.date).toLocaleDateString()}
                  </Badge>
                </Group>
              }
            >
              <Accordion variant="separated">
                <Accordion.Item value="details">
                  <Accordion.Control>View Details</Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {record.doctor && (
                        <Text size="sm">
                          <strong>Doctor:</strong> {record.doctor}
                        </Text>
                      )}
                      {record.diagnosis && (
                        <Text size="sm">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </Text>
                      )}
                      {record.prescription && (
                        <Text size="sm">
                          <strong>Prescription:</strong> {record.prescription}
                        </Text>
                      )}
                      {record.test && (
                        <Text size="sm">
                          <strong>Test:</strong> {record.test}
                        </Text>
                      )}
                      {record.status && (
                        <Badge color="green" variant="light">
                          {record.status}
                        </Badge>
                      )}
                      {record.vaccine && (
                        <Text size="sm">
                          <strong>Vaccine:</strong> {record.vaccine}
                        </Text>
                      )}
                      {record.notes && (
                        <Text size="sm" c="dimmed" mt="xs">
                          {record.notes}
                        </Text>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Note */}
      <Card shadow="sm" padding="md" radius="md" withBorder bg="blue.0">
        <Text size="sm" c="dimmed">
          <strong>Note:</strong> For any questions about your medical records, please contact your
          healthcare provider directly.
        </Text>
      </Card>
    </Stack>
  );
}
