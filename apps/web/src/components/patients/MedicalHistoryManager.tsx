'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Paper,
  Badge,
  ActionIcon,
  Grid,
  Alert,
  Tabs,
  Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import {
  IconMedicalCross,
  IconAlertCircle,
  IconPill,
  IconHeartbeat,
  IconUser,
  IconStethoscope,
  IconCalendar,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconVaccine,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { MedicalHistory } from '../../types/patient';
import { formatDate } from '../../lib/utils';

interface MedicalHistoryManagerProps {
  opened: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  medicalHistory: MedicalHistory[];
  onSave: (history: Partial<MedicalHistory>) => Promise<void>;
  onUpdate: (id: string, history: Partial<MedicalHistory>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface HistoryFormData {
  historyType:
    | 'medical'
    | 'surgical'
    | 'family'
    | 'social'
    | 'allergy'
    | 'medication'
    | 'immunization';
  title: string;
  description: string;
  date?: Date;
  severity?: 'mild' | 'moderate' | 'severe';
  outcome?: string;
  complications?: string;
  treatmentReceived?: string;
  doctorName?: string;
  hospitalName?: string;
  notes?: string;
  isActive: boolean;
}

export default function MedicalHistoryManager({
  opened,
  onClose,
  patientId: _patientId,
  patientName,
  medicalHistory,
  onSave,
  onUpdate,
  onDelete,
}: MedicalHistoryManagerProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [formOpened, setFormOpened] = useState(false);
  const [editingHistory, setEditingHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<HistoryFormData>({
    initialValues: {
      historyType: 'medical',
      title: '',
      description: '',
      date: undefined,
      severity: undefined,
      outcome: '',
      complications: '',
      treatmentReceived: '',
      doctorName: '',
      hospitalName: '',
      notes: '',
      isActive: true,
    },
    validate: {
      title: (value) => (value.trim().length < 2 ? 'Title must be at least 2 characters' : null),
      description: (value) =>
        value.trim().length < 5 ? 'Description must be at least 5 characters' : null,
    },
  });

  const handleSubmit = async (values: HistoryFormData) => {
    try {
      setLoading(true);

      if (editingHistory) {
        await onUpdate(editingHistory.id, values);
        notifications.show({
          title: 'History Updated',
          message: 'Medical history entry has been updated successfully.',
          color: 'green',
        });
      } else {
        await onSave(values);
        notifications.show({
          title: 'History Added',
          message: 'New medical history entry has been added successfully.',
          color: 'green',
        });
      }

      handleFormClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${editingHistory ? 'update' : 'save'} medical history. Please try again.`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (history: MedicalHistory) => {
    setEditingHistory(history);
    form.setValues({
      historyType: history.historyType,
      title: history.title,
      description: history.description,
      date: history.date ? new Date(history.date) : undefined,
      severity: history.severity,
      outcome: history.outcome || '',
      complications: history.complications || '',
      treatmentReceived: history.treatmentReceived || '',
      doctorName: history.doctorName || '',
      hospitalName: history.hospitalName || '',
      notes: history.notes || '',
      isActive: history.isActive,
    });
    setFormOpened(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      notifications.show({
        title: 'History Deleted',
        message: 'Medical history entry has been deleted successfully.',
        color: 'green',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete medical history. Please try again.',
        color: 'red',
      });
    }
  };

  const handleFormClose = () => {
    form.reset();
    setEditingHistory(null);
    setFormOpened(false);
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <IconMedicalCross size="1rem" />;
      case 'surgical':
        return <IconStethoscope size="1rem" />;
      case 'family':
        return <IconStethoscope size="1rem" />;
      case 'social':
        return <IconUser size="1rem" />;
      case 'allergy':
        return <IconAlertCircle size="1rem" />;
      case 'medication':
        return <IconPill size="1rem" />;
      case 'immunization':
        return <IconVaccine size="1rem" />;
      default:
        return <IconHeartbeat size="1rem" />;
    }
  };

  const getHistoryTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'blue';
      case 'surgical':
        return 'orange';
      case 'family':
        return 'purple';
      case 'social':
        return 'teal';
      case 'allergy':
        return 'red';
      case 'medication':
        return 'green';
      case 'immunization':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'severe':
        return 'red';
      case 'moderate':
        return 'orange';
      case 'mild':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const filterHistoryByType = (type: string) => {
    if (type === 'all') return medicalHistory;
    return medicalHistory.filter((history) => history.historyType === type);
  };

  const historyTabs = [
    { value: 'all', label: 'All History', count: medicalHistory.length },
    {
      value: 'medical',
      label: 'Medical',
      count: medicalHistory.filter((h) => h.historyType === 'medical').length,
    },
    {
      value: 'surgical',
      label: 'Surgical',
      count: medicalHistory.filter((h) => h.historyType === 'surgical').length,
    },
    {
      value: 'allergy',
      label: 'Allergies',
      count: medicalHistory.filter((h) => h.historyType === 'allergy').length,
    },
    {
      value: 'family',
      label: 'Family',
      count: medicalHistory.filter((h) => h.historyType === 'family').length,
    },
    {
      value: 'medication',
      label: 'Medications',
      count: medicalHistory.filter((h) => h.historyType === 'medication').length,
    },
  ];

  const HistoryList = ({ histories }: { histories: MedicalHistory[] }) => (
    <>
      {histories.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
          <IconMedicalCross size="3rem" color="var(--mantine-color-gray-5)" />
          <Text mt="md" c="dimmed">
            No medical history found for this category
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          {histories.map((history) => (
            <Paper key={history.id} p="md" withBorder>
              <Group justify="space-between" align="flex-start" mb="sm">
                <Group>
                  <Badge
                    color={getHistoryTypeColor(history.historyType)}
                    variant="light"
                    leftSection={getHistoryIcon(history.historyType)}
                  >
                    {history.historyType}
                  </Badge>
                  <Text fw={500}>{history.title}</Text>
                </Group>

                <Group gap="xs">
                  {history.severity && (
                    <Badge color={getSeverityColor(history.severity)} variant="light" size="sm">
                      {history.severity}
                    </Badge>
                  )}
                  <ActionIcon variant="subtle" size="sm" onClick={() => handleEdit(history)}>
                    <IconEdit size="0.8rem" />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="red"
                    onClick={() => handleDelete(history.id)}
                  >
                    <IconTrash size="0.8rem" />
                  </ActionIcon>
                </Group>
              </Group>

              <Text size="sm" mb="sm">
                {history.description}
              </Text>

              <Grid>
                {history.date && (
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">
                      <IconCalendar size="0.8rem" style={{ marginRight: 4 }} />
                      {formatDate(history.date)}
                    </Text>
                  </Grid.Col>
                )}

                {history.doctorName && (
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">
                      Doctor: {history.doctorName}
                    </Text>
                  </Grid.Col>
                )}

                {history.hospitalName && (
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">
                      Hospital: {history.hospitalName}
                    </Text>
                  </Grid.Col>
                )}

                {history.outcome && (
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">
                      Outcome: {history.outcome}
                    </Text>
                  </Grid.Col>
                )}
              </Grid>

              {history.treatmentReceived && (
                <div>
                  <Text size="xs" fw={500} mt="sm" mb="xs">
                    Treatment Received:
                  </Text>
                  <Text size="xs" c="dimmed">
                    {history.treatmentReceived}
                  </Text>
                </div>
              )}

              {history.complications && (
                <Alert color="orange" mt="sm" p="xs">
                  <Text size="xs" fw={500}>
                    Complications:
                  </Text>
                  <Text size="xs">{history.complications}</Text>
                </Alert>
              )}

              {history.notes && (
                <div>
                  <Text size="xs" fw={500} mt="sm" mb="xs">
                    Notes:
                  </Text>
                  <Text size="xs" c="dimmed">
                    {history.notes}
                  </Text>
                </div>
              )}

              {!history.isActive && (
                <Badge color="gray" size="sm" mt="sm">
                  Inactive
                </Badge>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <IconMedicalCross size="1.2rem" />
            <div>
              <Text fw={600}>Medical History</Text>
              <Text size="sm" c="dimmed">
                {patientName}
              </Text>
            </div>
          </Group>
        }
        size="xl"
      >
        <Stack gap="lg">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Total entries: {medicalHistory.length}
            </Text>
            <Button leftSection={<IconPlus size="1rem" />} onClick={() => setFormOpened(true)}>
              Add History
            </Button>
          </Group>

          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
            <Tabs.List>
              {historyTabs.map((tab) => (
                <Tabs.Tab key={tab.value} value={tab.value}>
                  {tab.label} ({tab.count})
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {historyTabs.map((tab) => (
              <Tabs.Panel key={tab.value} value={tab.value} pt="md">
                <HistoryList histories={filterHistoryByType(tab.value)} />
              </Tabs.Panel>
            ))}
          </Tabs>
        </Stack>
      </Modal>

      {/* Add/Edit History Form */}
      <Modal
        opened={formOpened}
        onClose={handleFormClose}
        title={
          <Group>
            <IconMedicalCross size="1.2rem" />
            <Text fw={600}>{editingHistory ? 'Edit' : 'Add'} Medical History</Text>
          </Group>
        }
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="History Type"
                  placeholder="Select history type"
                  required
                  data={[
                    { value: 'medical', label: 'Medical Condition' },
                    { value: 'surgical', label: 'Surgical History' },
                    { value: 'family', label: 'Family History' },
                    { value: 'social', label: 'Social History' },
                    { value: 'allergy', label: 'Allergy' },
                    { value: 'medication', label: 'Medication History' },
                    { value: 'immunization', label: 'Immunization' },
                  ]}
                  {...form.getInputProps('historyType')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <DatePickerInput
                  label="Date"
                  placeholder="Select date"
                  maxDate={new Date()}
                  {...form.getInputProps('date')}
                  leftSection={<IconCalendar size="1rem" />}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Title"
              placeholder="Enter condition/procedure title"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Enter detailed description"
              required
              minRows={3}
              {...form.getInputProps('description')}
            />

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Severity"
                  placeholder="Select severity level"
                  data={[
                    { value: 'mild', label: 'Mild' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'severe', label: 'Severe' },
                  ]}
                  {...form.getInputProps('severity')}
                  clearable
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Outcome"
                  placeholder="Enter outcome/result"
                  {...form.getInputProps('outcome')}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Treatment Received"
              placeholder="Describe treatment received"
              minRows={2}
              {...form.getInputProps('treatmentReceived')}
            />

            <Textarea
              label="Complications"
              placeholder="Any complications experienced"
              minRows={2}
              {...form.getInputProps('complications')}
            />

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Doctor Name"
                  placeholder="Enter treating doctor's name"
                  {...form.getInputProps('doctorName')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Hospital/Clinic Name"
                  placeholder="Enter hospital/clinic name"
                  {...form.getInputProps('hospitalName')}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Additional Notes"
              placeholder="Any additional notes"
              minRows={2}
              {...form.getInputProps('notes')}
            />

            <Switch
              label="Active"
              description="Is this medical history item currently active/relevant?"
              {...form.getInputProps('isActive', { type: 'checkbox' })}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={handleFormClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} leftSection={<IconCheck size="1rem" />}>
                {editingHistory ? 'Update' : 'Save'} History
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
