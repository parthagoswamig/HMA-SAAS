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
  Table,
} from '@mantine/core';
import {
  IconBedFilled,
  IconHome,
  IconMapPin,
  IconArrowUp,
  IconEdit,
  IconUsers,
} from '@tabler/icons-react';

interface WardDetailsProps {
  opened: boolean;
  onClose: () => void;
  ward: any;
  onEdit: (ward: any) => void;
}

function WardDetails({ opened, onClose, ward, onEdit }: WardDetailsProps) {
  if (!ward) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'OCCUPIED':
        return 'red';
      case 'MAINTENANCE':
        return 'yellow';
      case 'RESERVED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const occupiedBeds = ward.beds?.filter((bed: any) => bed.status === 'OCCUPIED').length || 0;
  const availableBeds = ward.beds?.filter((bed: any) => bed.status === 'AVAILABLE').length || 0;
  const occupancyRate = ward.capacity > 0 ? ((occupiedBeds / ward.capacity) * 100).toFixed(1) : 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconHome size={24} />
          <Title order={3}>Ward Details</Title>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Ward Status */}
        <Group justify="space-between">
          <Badge size="lg" color={ward.isActive ? 'green' : 'red'} variant="light">
            {ward.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Text size="sm" c="dimmed">
            Occupancy: <strong>{occupancyRate}%</strong>
          </Text>
        </Group>

        <Divider />

        {/* Ward Information */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Ward Information
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconHome size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Ward Name
                  </Text>
                  <Text fw={500}>{ward.name}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconUsers size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Capacity
                  </Text>
                  <Text fw={500}>{ward.capacity} beds</Text>
                </div>
              </Group>
            </Grid.Col>
            {ward.location && (
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconMapPin size={16} color="gray" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Location
                    </Text>
                    <Text fw={500}>{ward.location}</Text>
                  </div>
                </Group>
              </Grid.Col>
            )}
            {ward.floor && (
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconArrowUp size={16} color="gray" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Floor
                    </Text>
                    <Text fw={500}>{ward.floor}</Text>
                  </div>
                </Group>
              </Grid.Col>
            )}
          </Grid>
        </Paper>

        {/* Description */}
        {ward.description && (
          <Paper p="md" withBorder>
            <Title order={5} mb="sm">
              Description
            </Title>
            <Text size="sm">{ward.description}</Text>
          </Paper>
        )}

        {/* Bed Statistics */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Bed Statistics
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Total Beds
              </Text>
              <Text fw={700} size="lg">
                {ward._count?.beds || 0}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Available
              </Text>
              <Text fw={700} size="lg" c="green">
                {availableBeds}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Occupied
              </Text>
              <Text fw={700} size="lg" c="red">
                {occupiedBeds}
              </Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Occupancy Rate
              </Text>
              <Text fw={700} size="lg" c="blue">
                {occupancyRate}%
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Beds List */}
        {ward.beds && ward.beds.length > 0 && (
          <Paper p="md" withBorder>
            <Title order={5} mb="sm">
              <Group>
                <IconBedFilled size={20} />
                <span>Beds in this Ward</span>
              </Group>
            </Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Bed Number</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Description</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {ward.beds.map((bed: any) => (
                  <Table.Tr key={bed.id}>
                    <Table.Td>
                      <Text fw={500}>{bed.bedNumber}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(bed.status)}>{bed.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{bed.description || '-'}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Metadata */}
        <Paper p="md" withBorder bg="gray.0">
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Created At
              </Text>
              <Text size="sm">{formatDate(ward.createdAt)}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Last Updated
              </Text>
              <Text size="sm">{formatDate(ward.updatedAt)}</Text>
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
              onEdit(ward);
              onClose();
            }}
          >
            Edit Ward
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default WardDetails;
