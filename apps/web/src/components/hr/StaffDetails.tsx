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
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconCalendar,
  IconCurrencyRupee,
  IconMapPin,
  IconSchool,
  IconStethoscope,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';

interface StaffDetailsProps {
  opened: boolean;
  onClose: () => void;
  staff: any;
  onEdit: (staff: any) => void;
  onDelete: (staff: any) => void;
}

function StaffDetails({ opened, onClose, staff, onEdit, onDelete }: StaffDetailsProps) {
  if (!staff) return null;

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

  const formatDesignation = (designation: string) => {
    return designation.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconUser size={24} />
          <Title order={3}>Staff Details</Title>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Status Badge */}
        <Group justify="space-between">
          <Badge size="lg" color={staff.isActive ? 'green' : 'red'} variant="light">
            {staff.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {staff.employeeId && (
            <Text size="sm" c="dimmed">
              Employee ID: <strong>{staff.employeeId}</strong>
            </Text>
          )}
        </Group>

        <Divider />

        {/* Personal Information */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Personal Information
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconUser size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Full Name
                  </Text>
                  <Text fw={500}>
                    {staff.firstName} {staff.lastName}
                  </Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconMail size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Email
                  </Text>
                  <Text fw={500}>{staff.email}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconPhone size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Phone
                  </Text>
                  <Text fw={500}>{staff.phone}</Text>
                </div>
              </Group>
            </Grid.Col>
            {staff.emergencyContact && (
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconAlertCircle size={16} color="gray" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Emergency Contact
                    </Text>
                    <Text fw={500}>{staff.emergencyContact}</Text>
                  </div>
                </Group>
              </Grid.Col>
            )}
          </Grid>
        </Paper>

        {/* Employment Information */}
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">
            Employment Information
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconBriefcase size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Department
                  </Text>
                  <Text fw={500}>{staff.department?.name || 'N/A'}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconBriefcase size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Designation
                  </Text>
                  <Text fw={500}>{formatDesignation(staff.designation)}</Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconCalendar size={16} color="gray" />
                <div>
                  <Text size="xs" c="dimmed">
                    Date of Joining
                  </Text>
                  <Text fw={500}>{formatDate(staff.dateOfJoining)}</Text>
                </div>
              </Group>
            </Grid.Col>
            {staff.salary && (
              <Grid.Col span={6}>
                <Group gap="xs">
                  <IconCurrencyRupee size={16} color="gray" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Salary
                    </Text>
                    <Text fw={500}>{formatCurrency(staff.salary)}</Text>
                  </div>
                </Group>
              </Grid.Col>
            )}
          </Grid>
        </Paper>

        {/* Professional Information */}
        {(staff.qualifications || staff.specialization) && (
          <Paper p="md" withBorder>
            <Title order={5} mb="sm">
              Professional Information
            </Title>
            <Grid>
              {staff.qualifications && (
                <Grid.Col span={12}>
                  <Group gap="xs">
                    <IconSchool size={16} color="gray" />
                    <div>
                      <Text size="xs" c="dimmed">
                        Qualifications
                      </Text>
                      <Text fw={500}>{staff.qualifications}</Text>
                    </div>
                  </Group>
                </Grid.Col>
              )}
              {staff.specialization && (
                <Grid.Col span={12}>
                  <Group gap="xs">
                    <IconStethoscope size={16} color="gray" />
                    <div>
                      <Text size="xs" c="dimmed">
                        Specialization
                      </Text>
                      <Text fw={500}>{staff.specialization}</Text>
                    </div>
                  </Group>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* Address */}
        {staff.address && (
          <Paper p="md" withBorder>
            <Title order={5} mb="sm">
              Address
            </Title>
            <Group gap="xs">
              <IconMapPin size={16} color="gray" />
              <Text>{staff.address}</Text>
            </Group>
          </Paper>
        )}

        {/* Metadata */}
        <Paper p="md" withBorder bg="gray.0">
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Created At
              </Text>
              <Text size="sm">{formatDate(staff.createdAt)}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Last Updated
              </Text>
              <Text size="sm">{formatDate(staff.updatedAt)}</Text>
            </Grid.Col>
          </Grid>
        </Paper>

        <Divider />

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => {
              onDelete(staff);
              onClose();
            }}
          >
            Deactivate Staff
          </Button>
          <Group>
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => {
                onEdit(staff);
                onClose();
              }}
            >
              Edit Staff
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

export default StaffDetails;
