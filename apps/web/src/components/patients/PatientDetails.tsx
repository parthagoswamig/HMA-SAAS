'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Paper,
  Title,
  Divider,
  Tabs,
  Avatar,
  Badge,
  Grid,
  Card,
  ActionIcon,
  Button,
  Timeline,
  Alert,
  ScrollArea,
  ThemeIcon,
  List,
} from '@mantine/core';
import {
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconHeart,
  IconShieldX,
  IconFileText,
  IconStethoscope,
  IconPill,
  IconAlertCircle,
  IconHistory,
  IconEdit,
  IconDownload,
  IconPrinter,
  IconEye,
  IconCloudUpload,
  IconActivity,
  IconMedicalCross,
} from '@tabler/icons-react';
import {
  Patient,
  PatientVisit,
  PatientDocument,
  MedicalHistory,
  PatientAppointment,
} from '../../types/patient';
import { formatDate, formatPhoneNumber } from '../../lib/utils';

interface PatientDetailsProps {
  opened: boolean;
  onClose: () => void;
  patient: Patient | null;
  visits?: PatientVisit[];
  documents?: PatientDocument[];
  medicalHistory?: MedicalHistory[];
  appointments?: PatientAppointment[];
  onEdit?: (patient: Patient) => void;
  onScheduleAppointment?: (patientId: string) => void;
}

function PatientDetails({
  opened,
  onClose,
  patient,
  visits = [],
  documents = [],
  medicalHistory = [],
  appointments = [],
  onEdit,
  onScheduleAppointment,
}: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!patient) return null;

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Overview Tab
  const OverviewTab = () => (
    <Stack gap="lg">
      {/* Patient Summary */}
      <Paper p="lg" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group>
              <Avatar
                size="xl"
                name={`${patient.firstName} ${patient.lastName}`}
                color="blue"
                styles={{
                  root: { fontSize: '1.5rem' },
                }}
              />
              <div>
                <Title order={2}>
                  {patient.firstName} {patient.lastName}
                </Title>
                <Group gap="xs" mt="xs">
                  <Badge color="blue" variant="light">
                    {patient.patientId}
                  </Badge>
                  <Badge color={patient.status === 'active' ? 'green' : 'red'} variant="light">
                    {patient.status}
                  </Badge>
                  {patient.insuranceInfo?.isActive && (
                    <Badge
                      color="green"
                      variant="light"
                      leftSection={<IconShieldX size="0.8rem" />}
                    >
                      Insured
                    </Badge>
                  )}
                </Group>
                <Group gap="md" mt="sm">
                  <Text size="sm" c="dimmed">
                    <IconCalendar size="0.9rem" style={{ marginRight: 4 }} />
                    {calculateAge(patient.dateOfBirth)} years old
                  </Text>
                  <Text size="sm" c="dimmed">
                    <IconUser size="0.9rem" style={{ marginRight: 4 }} />
                    {patient.gender}
                  </Text>
                  {patient.bloodGroup && (
                    <Text size="sm" c="dimmed">
                      <IconHeart size="0.9rem" style={{ marginRight: 4 }} />
                      {patient.bloodGroup}
                    </Text>
                  )}
                </Group>
              </div>
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs">
              <Button
                fullWidth
                onClick={() => onEdit?.(patient)}
                leftSection={<IconEdit size="1rem" />}
              >
                Edit Patient
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => onScheduleAppointment?.(patient.id)}
                leftSection={<IconCalendar size="1rem" />}
              >
                Schedule Appointment
              </Button>
              <Group grow>
                <Button variant="subtle" size="sm" leftSection={<IconDownload size="0.8rem" />}>
                  Export
                </Button>
                <Button variant="subtle" size="sm" leftSection={<IconPrinter size="0.8rem" />}>
                  Print
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid>
        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <ThemeIcon size="xl" variant="light" color="blue" mb="sm" mx="auto">
              <IconActivity size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700}>
              {patient.totalVisits}
            </Text>
            <Text size="sm" c="dimmed">
              Total Visits
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <ThemeIcon size="xl" variant="light" color="red" mb="sm" mx="auto">
              <IconAlertCircle size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700}>
              {patient.allergies.length}
            </Text>
            <Text size="sm" c="dimmed">
              Allergies
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <ThemeIcon size="xl" variant="light" color="orange" mb="sm" mx="auto">
              <IconMedicalCross size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700}>
              {patient.chronicDiseases.length}
            </Text>
            <Text size="sm" c="dimmed">
              Chronic Conditions
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <ThemeIcon size="xl" variant="light" color="green" mb="sm" mx="auto">
              <IconPill size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700}>
              {patient.currentMedications.length}
            </Text>
            <Text size="sm" c="dimmed">
              Current Medications
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Contact & Address */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group mb="md">
              <IconPhone size="1.2rem" />
              <Title order={4}>Contact Information</Title>
            </Group>
            <Stack gap="xs">
              <Group>
                <IconPhone size="1rem" />
                <Text>{formatPhoneNumber(patient.contactInfo.phone)}</Text>
              </Group>
              {patient.contactInfo.email && (
                <Group>
                  <IconMail size="1rem" />
                  <Text>{patient.contactInfo.email}</Text>
                </Group>
              )}
              {patient.contactInfo.alternatePhone && (
                <Group>
                  <IconPhone size="1rem" />
                  <Text size="sm" c="dimmed">
                    Alt: {formatPhoneNumber(patient.contactInfo.alternatePhone)}
                  </Text>
                </Group>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group mb="md">
              <IconMapPin size="1.2rem" />
              <Title order={4}>Address</Title>
            </Group>
            <Text size="sm">
              {patient.address.street}
              <br />
              {patient.address.city}, {patient.address.state}
              <br />
              {patient.address.postalCode}, {patient.address.country}
              {patient.address.landmark && (
                <>
                  <br />
                  <Text span c="dimmed">
                    Near: {patient.address.landmark}
                  </Text>
                </>
              )}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Medical Alerts */}
      {(patient.allergies.length > 0 || patient.chronicDiseases.length > 0) && (
        <Paper p="md" withBorder>
          <Title order={4} mb="md" c="red">
            Medical Alerts
          </Title>
          {patient.allergies.length > 0 && (
            <Alert color="red" mb="sm" icon={<IconAlertCircle size="1rem" />}>
              <Text fw={500} size="sm">
                Allergies:
              </Text>
              <Group gap="xs" mt="xs">
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} color="red" variant="light">
                    {allergy}
                  </Badge>
                ))}
              </Group>
            </Alert>
          )}
          {patient.chronicDiseases.length > 0 && (
            <Alert color="orange" icon={<IconMedicalCross size="1rem" />}>
              <Text fw={500} size="sm">
                Chronic Conditions:
              </Text>
              <Group gap="xs" mt="xs">
                {patient.chronicDiseases.map((condition, index) => (
                  <Badge key={index} color="orange" variant="light">
                    {condition}
                  </Badge>
                ))}
              </Group>
            </Alert>
          )}
        </Paper>
      )}
    </Stack>
  );

  // Visits Tab
  const VisitsTab = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>Visit History</Title>
        <Text size="sm" c="dimmed">
          {visits.length} visits
        </Text>
      </Group>

      {visits.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
          <IconHistory size="3rem" color="var(--mantine-color-gray-5)" />
          <Text mt="md" c="dimmed">
            No visits recorded yet
          </Text>
        </Paper>
      ) : (
        <Timeline active={visits.length} bulletSize={24} lineWidth={2}>
          {visits.map((visit) => (
            <Timeline.Item
              key={visit.id}
              bullet={<IconStethoscope size="1rem" />}
              title={
                <Group justify="space-between">
                  <Text fw={500}>{visit.chiefComplaint}</Text>
                  <Badge
                    color={
                      visit.status === 'completed'
                        ? 'green'
                        : visit.status === 'in_progress'
                          ? 'blue'
                          : visit.status === 'cancelled'
                            ? 'red'
                            : 'gray'
                    }
                  >
                    {visit.status}
                  </Badge>
                </Group>
              }
            >
              <Paper p="md" mt="xs" withBorder>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="xs">
                      <Group>
                        <IconCalendar size="0.9rem" />
                        <Text size="sm">{formatDate(visit.visitDate)}</Text>
                      </Group>
                      <Group>
                        <IconUser size="0.9rem" />
                        <Text size="sm">{visit.doctorName}</Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {visit.departmentName}
                      </Text>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    {visit.diagnosis.length > 0 && (
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Diagnosis:
                        </Text>
                        <List size="sm">
                          {visit.diagnosis.map((diag, idx) => (
                            <List.Item key={idx}>{diag}</List.Item>
                          ))}
                        </List>
                      </div>
                    )}
                  </Grid.Col>
                </Grid>

                {visit.vitals && (
                  <div>
                    <Divider my="sm" />
                    <Text size="sm" fw={500} mb="xs">
                      Vitals:
                    </Text>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">
                          BP: {visit.vitals.bloodPressureSystolic}/
                          {visit.vitals.bloodPressureDiastolic} mmHg
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">
                          HR: {visit.vitals.heartRate} bpm
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">
                          Temp: {visit.vitals.temperature}Â°F
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" c="dimmed">
                          SpO2: {visit.vitals.oxygenSaturation}%
                        </Text>
                      </Grid.Col>
                    </Grid>
                  </div>
                )}

                {visit.prescriptions.length > 0 && (
                  <div>
                    <Divider my="sm" />
                    <Text size="sm" fw={500} mb="xs">
                      Prescriptions:
                    </Text>
                    <List size="sm">
                      {visit.prescriptions.map((rx, idx) => (
                        <List.Item key={idx}>
                          {rx.medicationName} - {rx.dosage} ({rx.frequency})
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}

                {visit.notes && (
                  <div>
                    <Divider my="sm" />
                    <Text size="sm" fw={500} mb="xs">
                      Notes:
                    </Text>
                    <Text size="sm" c="dimmed">
                      {visit.notes}
                    </Text>
                  </div>
                )}
              </Paper>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Stack>
  );

  // Documents Tab
  const DocumentsTab = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>Documents</Title>
        <Button size="sm" leftSection={<IconCloudUpload size="0.9rem" />}>
          Upload Document
        </Button>
      </Group>

      {documents.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
          <IconFileText size="3rem" color="var(--mantine-color-gray-5)" />
          <Text mt="md" c="dimmed">
            No documents uploaded yet
          </Text>
        </Paper>
      ) : (
        <Grid>
          {documents.map((doc) => (
            <Grid.Col key={doc.id} span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder>
                <Group justify="space-between" mb="sm">
                  <Group>
                    <IconFileText size="1.2rem" />
                    <div>
                      <Text fw={500} size="sm">
                        {doc.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {doc.documentType.replace('_', ' ')}
                      </Text>
                    </div>
                  </Group>
                  <Badge color={doc.accessLevel === 'confidential' ? 'red' : 'blue'} size="sm">
                    {doc.accessLevel}
                  </Badge>
                </Group>

                {doc.description && (
                  <Text size="sm" c="dimmed" mb="sm">
                    {doc.description}
                  </Text>
                )}

                <Group justify="space-between" align="center">
                  <Group>
                    <Text size="xs" c="dimmed">
                      {formatDate(doc.uploadedAt)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      â€¢
                    </Text>
                    <Text size="xs" c="dimmed">
                      {(doc.fileSize / 1024).toFixed(1)} KB
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <ActionIcon size="sm" variant="subtle">
                      <IconEye size="0.8rem" />
                    </ActionIcon>
                    <ActionIcon size="sm" variant="subtle">
                      <IconDownload size="0.8rem" />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Stack>
  );

  // Medical History Tab
  const MedicalHistoryTab = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>Medical History</Title>
        <Button size="sm" leftSection={<IconFileText size="0.9rem" />}>
          Add History
        </Button>
      </Group>

      {medicalHistory.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
          <IconMedicalCross size="3rem" color="var(--mantine-color-gray-5)" />
          <Text mt="md" c="dimmed">
            No medical history recorded yet
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {medicalHistory.map((history) => (
            <Paper key={history.id} p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Group>
                  <Badge
                    color={
                      history.historyType === 'allergy'
                        ? 'red'
                        : history.historyType === 'medical'
                          ? 'blue'
                          : history.historyType === 'surgical'
                            ? 'orange'
                            : history.historyType === 'family'
                              ? 'purple'
                              : 'gray'
                    }
                  >
                    {history.historyType}
                  </Badge>
                  <Text fw={500}>{history.title}</Text>
                </Group>
                {history.severity && (
                  <Badge
                    color={
                      history.severity === 'severe'
                        ? 'red'
                        : history.severity === 'moderate'
                          ? 'orange'
                          : 'yellow'
                    }
                    variant="light"
                  >
                    {history.severity}
                  </Badge>
                )}
              </Group>

              <Text size="sm" mb="sm">
                {history.description}
              </Text>

              <Group>
                {history.date && (
                  <Text size="xs" c="dimmed">
                    <IconCalendar size="0.8rem" style={{ marginRight: 4 }} />
                    {formatDate(history.date)}
                  </Text>
                )}
                {history.doctorName && (
                  <Text size="xs" c="dimmed">
                    Dr. {history.doctorName}
                  </Text>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );

  // Appointments Tab
  const AppointmentsTab = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>Appointments</Title>
        <Button
          size="sm"
          leftSection={<IconCalendar size="0.9rem" />}
          onClick={() => onScheduleAppointment?.(patient.id)}
        >
          Schedule New
        </Button>
      </Group>

      {appointments.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
          <IconCalendar size="3rem" color="var(--mantine-color-gray-5)" />
          <Text mt="md" c="dimmed">
            No appointments scheduled
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {appointments.map((appointment) => (
            <Paper key={appointment.id} p="md" withBorder>
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Group mb="sm">
                    <Badge
                      color={
                        appointment.status === 'completed'
                          ? 'green'
                          : appointment.status === 'cancelled'
                            ? 'red'
                            : 'gray'
                      }
                    >
                      {appointment.status}
                    </Badge>
                    <Text fw={500}>{appointment.appointmentType.replace('_', ' ')}</Text>
                  </Group>

                  <Group>
                    <IconCalendar size="1rem" />
                    <Text>
                      {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                    </Text>
                  </Group>

                  {appointment.chiefComplaint && (
                    <Text size="sm" mt="xs">
                      {appointment.chiefComplaint}
                    </Text>
                  )}
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Text size="sm" c="dimmed">
                    Duration: {appointment.duration} min
                  </Text>
                  {appointment.reminderSent && (
                    <Text size="xs" c="green">
                      âœ“ Reminder sent
                    </Text>
                  )}
                </Grid.Col>
              </Grid>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconUser size="1.2rem" />
          <Text fw={600}>Patient Details</Text>
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size="0.8rem" />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="visits" leftSection={<IconStethoscope size="0.8rem" />}>
            Visits ({visits.length})
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFileText size="0.8rem" />}>
            Documents ({documents.length})
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size="0.8rem" />}>
            History ({medicalHistory.length})
          </Tabs.Tab>
          <Tabs.Tab value="appointments" leftSection={<IconCalendar size="0.8rem" />}>
            Appointments ({appointments.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <OverviewTab />
        </Tabs.Panel>

        <Tabs.Panel value="visits" pt="md">
          <VisitsTab />
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <DocumentsTab />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <MedicalHistoryTab />
        </Tabs.Panel>

        <Tabs.Panel value="appointments" pt="md">
          <AppointmentsTab />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

export default PatientDetails;
