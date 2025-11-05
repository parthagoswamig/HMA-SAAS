import React from 'react';
import {
  Modal,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Divider,
  Grid,
  Card,
  Avatar,
  Timeline,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconUser,
  IconClock,
  IconEdit,
  IconActivity,
  IconStethoscope,
  IconNotes,
} from '@tabler/icons-react';

interface EmergencyCaseDetailsProps {
  opened: boolean;
  onClose: () => void;
  emergencyCase: any;
  onEdit?: (emergencyCase: any) => void;
  onUpdateTriage?: (emergencyCase: any) => void;
}

export default function EmergencyCaseDetails({
  opened,
  onClose,
  emergencyCase,
  onEdit,
  onUpdateTriage,
}: EmergencyCaseDetailsProps) {
  if (!emergencyCase) return null;

  const getTriageColor = (level: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'red',
      URGENT: 'orange',
      SEMI_URGENT: 'yellow',
      NON_URGENT: 'green',
    };
    return colors[level] || 'gray';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      WAITING: 'blue',
      IN_TREATMENT: 'yellow',
      DISCHARGED: 'green',
      ADMITTED: 'cyan',
      TRANSFERRED: 'grape',
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const patient = emergencyCase.patient || {};
  const doctor = emergencyCase.assignedDoctor || {};
  const vitalSigns =
    typeof emergencyCase.vitalSigns === 'string'
      ? JSON.parse(emergencyCase.vitalSigns)
      : emergencyCase.vitalSigns || {};

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group>
            <IconAlertTriangle size={24} />
            <div>
              <Text size="lg" fw={600}>
                Emergency Case Details
              </Text>
              <Text size="xs" c="dimmed">
                Case ID: {emergencyCase.id?.substring(0, 8)}
              </Text>
            </div>
          </Group>
          <Group>
            <Badge color={getTriageColor(emergencyCase.triageLevel)} size="lg">
              {emergencyCase.triageLevel}
            </Badge>
            <Badge color={getStatusColor(emergencyCase.status)} size="lg">
              {emergencyCase.status}
            </Badge>
          </Group>
        </Group>
      }
      size="lg"
      padding="md"
    >
      <Stack gap="md">
        {/* Patient Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconUser size={20} />
            <Text fw={600}>Patient Information</Text>
          </Group>
          <Divider mb="sm" />
          <Grid>
            <Grid.Col span={6}>
              <Group>
                <Avatar color="blue" radius="xl">
                  {patient.firstName?.[0]}
                  {patient.lastName?.[0]}
                </Avatar>
                <div>
                  <Text fw={500}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text size="sm" c="dimmed">
                    MRN: {patient.medicalRecordNumber || 'N/A'}
                  </Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Gender:
                  </Text>
                  <Text fw={500}>{patient.gender || 'N/A'}</Text>
                </Group>
                {patient.phone && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Phone:
                    </Text>
                    <Text fw={500}>{patient.phone}</Text>
                  </Group>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Chief Complaint */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconAlertTriangle size={20} />
            <Text fw={600}>Chief Complaint</Text>
          </Group>
          <Divider mb="sm" />
          <Text>{emergencyCase.chiefComplaint}</Text>
        </Card>

        {/* Vital Signs */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconActivity size={20} />
            <Text fw={600}>Vital Signs</Text>
          </Group>
          <Divider mb="sm" />
          <Grid>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Blood Pressure:
                </Text>
                <Text fw={500}>{vitalSigns.bloodPressure || 'N/A'}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Heart Rate:
                </Text>
                <Text fw={500}>{vitalSigns.heartRate ? `${vitalSigns.heartRate} bpm` : 'N/A'}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Temperature:
                </Text>
                <Text fw={500}>
                  {vitalSigns.temperature ? `${vitalSigns.temperature}°F` : 'N/A'}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Respiratory Rate:
                </Text>
                <Text fw={500}>{vitalSigns.respiratoryRate || 'N/A'}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  O2 Saturation:
                </Text>
                <Text fw={500}>
                  {vitalSigns.oxygenSaturation ? `${vitalSigns.oxygenSaturation}%` : 'N/A'}
                </Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Timeline */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconClock size={20} />
            <Text fw={600}>Timeline</Text>
          </Group>
          <Divider mb="sm" />
          <Timeline active={1} bulletSize={24}>
            <Timeline.Item title="Arrival">
              <Text size="xs" c="dimmed">
                {formatDate(emergencyCase.arrivalTime)}
              </Text>
            </Timeline.Item>
            {emergencyCase.treatmentStartTime && (
              <Timeline.Item title="Treatment Started">
                <Text size="xs" c="dimmed">
                  {formatDate(emergencyCase.treatmentStartTime)}
                </Text>
              </Timeline.Item>
            )}
            {emergencyCase.dischargeTime && (
              <Timeline.Item title="Discharged">
                <Text size="xs" c="dimmed">
                  {formatDate(emergencyCase.dischargeTime)}
                </Text>
              </Timeline.Item>
            )}
          </Timeline>
        </Card>

        {/* Assigned Doctor */}
        {doctor.id && (
          <Card withBorder padding="md">
            <Group mb="xs">
              <IconStethoscope size={20} />
              <Text fw={600}>Assigned Doctor</Text>
            </Group>
            <Divider mb="sm" />
            <Group>
              <Avatar color="green" radius="xl">
                {doctor.firstName?.[0]}
                {doctor.lastName?.[0]}
              </Avatar>
              <div>
                <Text fw={500}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </Text>
                <Text size="sm" c="dimmed">
                  {doctor.specialization || 'Emergency Medicine'}
                </Text>
              </div>
            </Group>
          </Card>
        )}

        {/* Treatment Notes */}
        {emergencyCase.treatmentNotes && (
          <Card withBorder padding="md">
            <Group mb="xs">
              <IconNotes size={20} />
              <Text fw={600}>Treatment Notes</Text>
            </Group>
            <Divider mb="sm" />
            <Text style={{ whiteSpace: 'pre-wrap' }}>{emergencyCase.treatmentNotes}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Group>
            {onUpdateTriage && (
              <Button
                variant="light"
                color={getTriageColor(emergencyCase.triageLevel)}
                leftSection={<IconAlertTriangle size={16} />}
                onClick={() => {
                  onUpdateTriage(emergencyCase);
                  onClose();
                }}
              >
                Update Triage
              </Button>
            )}
          </Group>

          <Group>
            {onEdit && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  onEdit(emergencyCase);
                  onClose();
                }}
              >
                Edit Case
              </Button>
            )}
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
