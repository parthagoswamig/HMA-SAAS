import React, { useState } from 'react';
import { Modal, Button, Group, Stack, Select, Text, LoadingOverlay, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { UpdateTriageDto } from '../../services/emergency.service';

interface TriageFormProps {
  opened: boolean;
  onClose: () => void;
  emergencyCase: any;
  onSubmit: (data: UpdateTriageDto) => Promise<void>;
  loading?: boolean;
}

export default function TriageForm({
  opened,
  onClose,
  emergencyCase,
  onSubmit,
  loading = false,
}: TriageFormProps) {
  const [triageLevel, setTriageLevel] = useState(emergencyCase?.triageLevel || 'NON_URGENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSubmit({ triageLevel: triageLevel as any });
      onClose();
    } catch (error) {
      console.error('Error updating triage:', error);
    }
  };

  const triageLevelOptions = [
    {
      value: 'CRITICAL',
      label: '🔴 Critical (Red) - Immediate',
      description: 'Life-threatening condition requiring immediate attention',
    },
    {
      value: 'URGENT',
      label: '🟠 Urgent (Orange) - 10-15 mins',
      description: 'Serious condition requiring prompt attention',
    },
    {
      value: 'SEMI_URGENT',
      label: '🟡 Semi-Urgent (Yellow) - 30-60 mins',
      description: 'Moderately serious condition',
    },
    {
      value: 'NON_URGENT',
      label: '🟢 Non-Urgent (Green) - 1-2 hours',
      description: 'Minor condition, stable patient',
    },
  ];

  const getTriageColor = (level: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'red',
      URGENT: 'orange',
      SEMI_URGENT: 'yellow',
      NON_URGENT: 'green',
    };
    return colors[level] || 'gray';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconAlertTriangle size={24} />
          <Text size="lg" fw={600}>
            Update Triage Level
          </Text>
        </Group>
      }
      size="md"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Alert color={getTriageColor(emergencyCase?.triageLevel)} title="Current Triage Level">
            <Text size="sm">
              {triageLevelOptions.find((opt) => opt.value === emergencyCase?.triageLevel)?.label ||
                'Not set'}
            </Text>
          </Alert>

          <Select
            label="New Triage Level"
            placeholder="Select triage level"
            data={triageLevelOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            value={triageLevel}
            onChange={(value) => setTriageLevel(value || 'NON_URGENT')}
            required
          />

          <Alert color="blue" title="Triage Guidelines">
            <Stack gap="xs">
              {triageLevelOptions.map((opt) => (
                <Text key={opt.value} size="xs">
                  <strong>{opt.label}:</strong> {opt.description}
                </Text>
              ))}
            </Stack>
          </Alert>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color={getTriageColor(triageLevel)}>
              Update Triage
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
