'use client';

import React from 'react';
import {
  Modal,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Divider,
  Grid,
  Paper,
  Title,
  Select,
} from '@mantine/core';
import {
  IconFileText,
  IconUser,
  IconShieldCheck,
  IconCurrency,
  IconCalendar,
  IconEdit,
  IconNotes,
  IconStethoscope,
  IconClipboardList,
} from '@tabler/icons-react';

interface InsuranceClaimDetailsProps {
  opened: boolean;
  onClose: () => void;
  claim: any;
  onEdit: (claim: any) => void;
  onStatusChange: (claim: any, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAID', label: 'Paid' },
];

function InsuranceClaimDetails({
  opened,
  onClose,
  claim,
  onEdit,
  onStatusChange,
}: InsuranceClaimDetailsProps) {
  if (!claim) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatProvider = (provider: string) => {
    return provider.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'blue';
      case 'UNDER_REVIEW':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PAID':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const handleStatusChange = (newStatus: string | null) => {
    if (newStatus && newStatus !== claim.status) {
      onStatusChange(claim, newStatus);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconFileText size={24} />
          <Title order={3}>Insurance Claim Details</Title>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Status Badge and Claim Number */}
        <Group justify="space-between">
          <Badge size="lg" color={getStatusColor(claim.status)} variant="light">
            {claim.status.replace(/_/g, ' ')}
          </Badge>
          {claim.claimNumber && (
            <Text size="sm" c="dimmed">
              Claim #: <strong>{claim.claimNumber}</strong>
            </Text>
          )}
        </Group>

        <Divider />

        {/* Patient Information */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Patient Information
          </Title>
          <Group gap="xs">
            <IconUser size={16} color="gray" />
            <div>
              <Text size="xs" c="dimmed">
                Patient Name
              </Text>
              <Text fw={500}>
                {claim.patient?.firstName} {claim.patient?.lastName}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Insurance Information */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Insurance Information
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconShieldCheck size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Insurance Provider
                  </Text>
                  <Text fw={500}>{formatProvider(claim.insuranceProvider)}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconFileText size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Policy Number
                  </Text>
                  <Text fw={500}>{claim.policyNumber}</Text>
                </div>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Claim Details */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Claim Details
          </Title>
          <Grid>
            <Grid.Col span={12}>
              <Group gap="xs">
                <IconCurrency size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Claim Amount
                  </Text>
                  <Text fw={700} size="lg" c="blue">
                    {formatCurrency(claim.amount)}
                  </Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconCalendar size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Submitted Date
                  </Text>
                  <Text fw={500}>{formatDate(claim.submittedAt)}</Text>
                </div>
              </Group>
            </Grid.Col>
            {claim.approvedAt && (
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconCalendar size={16} color="gray" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Approved Date
                    </Text>
                    <Text fw={500}>{formatDate(claim.approvedAt)}</Text>
                  </div>
                </Group>
              </Grid.Col>
            )}
            {claim.paidAt && (
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconCalendar size={16} color="gray" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Paid Date
                    </Text>
                    <Text fw={500}>{formatDate(claim.paidAt)}</Text>
                  </div>
                </Group>
              </Grid.Col>
            )}
          </Grid>
        </Paper>

        {/* Medical Information */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Medical Information
          </Title>
          <Stack gap="md">
            <div>
              <Group gap="xs" mb="xs">
                <IconStethoscope size={16} color="gray" />
                <Text size="sm" fw={600}>
                  Diagnosis
                </Text>
              </Group>
              <Text size="sm" pl={24}>
                {claim.diagnosis}
              </Text>
            </div>
            <div>
              <Group gap="xs" mb="xs">
                <IconClipboardList size={16} color="gray" />
                <Text size="sm" fw={600}>
                  Treatment Details
                </Text>
              </Group>
              <Text size="sm" pl={24}>
                {claim.treatmentDetails}
              </Text>
            </div>
          </Stack>
        </Paper>

        {/* Additional Notes */}
        {claim.notes && (
          <Paper p="md" withBorder>
            <Group gap="xs" mb="xs">
              <IconNotes size={16} color="gray" />
              <Text size="sm" fw={600}>
                Additional Notes
              </Text>
            </Group>
            <Text size="sm" pl={24}>
              {claim.notes}
            </Text>
          </Paper>
        )}

        {/* Status Update */}
        <Paper p="md" withBorder bg="gray.0">
          <Title order={5} mb="sm">
            Update Status
          </Title>
          <Select
            label="Change Claim Status"
            placeholder="Select new status"
            data={STATUS_OPTIONS}
            value={claim.status}
            onChange={handleStatusChange}
          />
        </Paper>

        {/* Metadata */}
        <Paper p="md" withBorder bg="gray.0">
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Created At
              </Text>
              <Text size="sm">{formatDate(claim.createdAt)}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Last Updated
              </Text>
              <Text size="sm">{formatDate(claim.updatedAt)}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        <Divider />

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => {
              onEdit(claim);
              onClose();
            }}
          >
            Edit Claim
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default InsuranceClaimDetails;
