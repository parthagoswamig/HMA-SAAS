import React from 'react';
import { Modal, Text, Group, Stack, Badge, Button, Divider, Card, Avatar } from '@mantine/core';
import { IconFileText, IconUser, IconEdit, IconTrash, IconStethoscope } from '@tabler/icons-react';

interface MedicalRecordDetailsProps {
  opened: boolean;
  onClose: () => void;
  record: any;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
}

export default function MedicalRecordDetails({
  opened,
  onClose,
  record,
  onEdit,
  onDelete,
}: MedicalRecordDetailsProps) {
  if (!record) return null;

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CONSULTATION: 'blue',
      DIAGNOSIS: 'red',
      PRESCRIPTION: 'green',
      LAB_RESULT: 'cyan',
      IMAGING: 'grape',
      PROCEDURE: 'orange',
      VACCINATION: 'teal',
      ALLERGY: 'pink',
      OTHER: 'gray',
    };
    return colors[type] || 'gray';
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

  const patient = record.patient || {};
  const doctor = record.doctor || {};

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group>
            <IconFileText size={24} />
            <div>
              <Text size="lg" fw={600}>
                Medical Record Details
              </Text>
              <Badge color={getRecordTypeColor(record.recordType)} size="sm" mt={4}>
                {record.recordType}
              </Badge>
            </div>
          </Group>
        </Group>
      }
      size="md"
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
              {patient.phone && (
                <Text size="sm" c="dimmed">
                  Phone: {patient.phone}
                </Text>
              )}
            </div>
          </Group>
        </Card>

        {/* Record Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconFileText size={20} />
            <Text fw={600}>Record Information</Text>
          </Group>
          <Divider mb="sm" />

          <Stack gap="sm">
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Title:
              </Text>
              <Text fw={600}>{record.title}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Description:
              </Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{record.description}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Date:
              </Text>
              <Text size="sm">{formatDate(record.date)}</Text>
            </div>
          </Stack>
        </Card>

        {/* Doctor Information */}
        {doctor.id && (
          <Card withBorder padding="md">
            <Group mb="xs">
              <IconStethoscope size={20} />
              <Text fw={600}>Doctor Information</Text>
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
                  {doctor.specialization || 'General Medicine'}
                </Text>
                {doctor.licenseNumber && (
                  <Text size="xs" c="dimmed">
                    License: {doctor.licenseNumber}
                  </Text>
                )}
              </div>
            </Group>
          </Card>
        )}

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Group>
            {onDelete && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this medical record?')) {
                    onDelete(record);
                    onClose();
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Group>

          <Group>
            {onEdit && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  onEdit(record);
                  onClose();
                }}
              >
                Edit Record
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
