'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Title,
  Grid,
  Badge,
  Switch,
  Alert,
  Tabs,
  Timeline,
  Table,
  Avatar,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUserCheck,
  IconUserX,
  IconKey,
  IconMail,
  IconPhone,
  IconCalendar,
  IconLogin,
  IconLogout,
  IconSettings,
  IconShield,
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconBell,
  IconActivity,
  IconHistory,
} from '@tabler/icons-react';
import { PatientPortalAccess as PatientPortalAccessType, PatientPortalPreferences, Patient } from '../../types/patient';
import { formatDate } from '../../lib/utils';

interface PatientPortalAccessProps {
  opened: boolean;
  onClose: () => void;
  patient: Patient | null;
  portalAccess?: PatientPortalAccessType;
  onEnableAccess: (patientId: string, preferences: PatientPortalPreferences) => Promise<void>;
  onDisableAccess: (patientId: string) => Promise<void>;
  onUpdatePreferences: (patientId: string, preferences: PatientPortalPreferences) => Promise<void>;
  onResetPassword: (patientId: string) => Promise<void>;
  onSendCredentials: (patientId: string, method: 'email' | 'sms') => Promise<void>;
}

const defaultPreferences: PatientPortalPreferences = {
  receiveEmailNotifications: true,
  receiveSmsNotifications: false,
  appointmentReminders: true,
  labResultNotifications: true,
  prescriptionRefillReminders: true,
  languagePreference: 'English',
  timeZone: 'Asia/Kolkata',
};

export default function PatientPortalAccess({
  opened,
  onClose,
  patient,
  portalAccess,
  onEnableAccess,
  onDisableAccess,
  onUpdatePreferences,
  onResetPassword,
  onSendCredentials,
}: PatientPortalAccessProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const preferencesForm = useForm<PatientPortalPreferences>({
    initialValues: portalAccess?.preferences || defaultPreferences,
  });

  useEffect(() => {
    if (portalAccess?.preferences) {
      preferencesForm.setValues(portalAccess.preferences);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalAccess]);

  const handleEnableAccess = async () => {
    if (!patient) return;

    try {
      setActionLoading('enable');
      await onEnableAccess(patient.id, preferencesForm.values);

      notifications.show({
        title: 'Portal Access Enabled',
        message: 'Patient portal access has been enabled successfully.',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to enable portal access. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisableAccess = async () => {
    if (!patient) return;

    try {
      setActionLoading('disable');
      await onDisableAccess(patient.id);

      notifications.show({
        title: 'Portal Access Disabled',
        message: 'Patient portal access has been disabled.',
        color: 'orange',
        icon: <IconCheck size="1rem" />,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to disable portal access. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePreferences = async (values: PatientPortalPreferences) => {
    if (!patient) return;

    try {
      setLoading(true);
      await onUpdatePreferences(patient.id, values);

      notifications.show({
        title: 'Preferences Updated',
        message: 'Portal preferences have been updated successfully.',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update preferences. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!patient) return;

    try {
      setActionLoading('reset');
      await onResetPassword(patient.id);

      notifications.show({
        title: 'Password Reset',
        message: 'Password has been reset and new credentials sent to the patient.',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to reset password. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendCredentials = async (method: 'email' | 'sms') => {
    if (!patient) return;

    try {
      setActionLoading(`send-${method}`);
      await onSendCredentials(patient.id, method);

      notifications.show({
        title: 'Credentials Sent',
        message: `Login credentials have been sent via ${method.toUpperCase()}.`,
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: `Failed to send credentials via ${method.toUpperCase()}. Please try again.`,
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (!patient) return null;

  // Overview Tab
  const OverviewTab = () => (
    <Stack gap="lg">
      {/* Portal Status */}
      <Paper p="lg" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group mb="md">
              <Avatar size="lg" name={`${patient.firstName} ${patient.lastName}`} color="blue" />
              <div>
                <Title order={3}>
                  {patient.firstName} {patient.lastName}
                </Title>
                <Text c="dimmed">{patient.patientId}</Text>
              </div>
            </Group>

            <Group>
              <Badge
                size="lg"
                color={portalAccess?.isEnabled ? 'green' : 'red'}
                variant="light"
                leftSection={
                  portalAccess?.isEnabled ? (
                    <IconUserCheck size="0.8rem" />
                  ) : (
                    <IconUserX size="0.8rem" />
                  )
                }
              >
                {portalAccess?.isEnabled ? 'Portal Access Enabled' : 'Portal Access Disabled'}
              </Badge>
              {portalAccess?.accountLocked && (
                <Badge color="red" variant="filled">
                  Account Locked
                </Badge>
              )}
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack>
              {!portalAccess?.isEnabled ? (
                <Button
                  fullWidth
                  color="green"
                  onClick={handleEnableAccess}
                  loading={actionLoading === 'enable'}
                  leftSection={<IconUserCheck size="1rem" />}
                >
                  Enable Portal Access
                </Button>
              ) : (
                <Group grow>
                  <Button
                    color="red"
                    variant="outline"
                    onClick={handleDisableAccess}
                    loading={actionLoading === 'disable'}
                    leftSection={<IconUserX size="1rem" />}
                  >
                    Disable Access
                  </Button>
                </Group>
              )}

              {portalAccess?.isEnabled && (
                <Group grow>
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    loading={actionLoading === 'reset'}
                    leftSection={<IconKey size="1rem" />}
                    size="sm"
                  >
                    Reset Password
                  </Button>
                </Group>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {portalAccess?.isEnabled && (
        <>
          {/* Account Information */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder>
                <Group mb="md">
                  <IconActivity size="1.2rem" />
                  <Title order={4}>Account Activity</Title>
                </Group>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm">Last Login</Text>
                    <Text size="sm" c="dimmed">
                      {portalAccess.lastLogin ? formatDate(portalAccess.lastLogin) : 'Never'}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Login Attempts</Text>
                    <Text size="sm" c="dimmed">
                      {portalAccess.loginAttempts}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Two Factor Auth</Text>
                    <Badge color={portalAccess.twoFactorEnabled ? 'green' : 'gray'} size="sm">
                      {portalAccess.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder>
                <Group mb="md">
                  <IconBell size="1.2rem" />
                  <Title order={4}>Notification Preferences</Title>
                </Group>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm">Email Notifications</Text>
                    <Badge
                      color={portalAccess.preferences.receiveEmailNotifications ? 'green' : 'gray'}
                      size="sm"
                    >
                      {portalAccess.preferences.receiveEmailNotifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">SMS Notifications</Text>
                    <Badge
                      color={portalAccess.preferences.receiveSmsNotifications ? 'green' : 'gray'}
                      size="sm"
                    >
                      {portalAccess.preferences.receiveSmsNotifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Appointment Reminders</Text>
                    <Badge
                      color={portalAccess.preferences.appointmentReminders ? 'green' : 'gray'}
                      size="sm"
                    >
                      {portalAccess.preferences.appointmentReminders ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Send Credentials */}
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <div>
                <Title order={4}>Send Login Credentials</Title>
                <Text size="sm" c="dimmed">
                  Send new login credentials to the patient via email or SMS
                </Text>
              </div>
              <Group>
                <Button
                  variant="outline"
                  onClick={() => handleSendCredentials('email')}
                  loading={actionLoading === 'send-email'}
                  leftSection={<IconMail size="1rem" />}
                  disabled={!patient.contactInfo.email}
                >
                  Send via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendCredentials('sms')}
                  loading={actionLoading === 'send-sms'}
                  leftSection={<IconPhone size="1rem" />}
                >
                  Send via SMS
                </Button>
              </Group>
            </Group>
            <Alert color="blue" icon={<IconAlertCircle size="1rem" />}>
              New credentials will invalidate any existing login sessions for this patient.
            </Alert>
          </Paper>
        </>
      )}
    </Stack>
  );

  // Preferences Tab
  const PreferencesTab = () => (
    <form onSubmit={preferencesForm.onSubmit(handleUpdatePreferences)}>
      <Stack gap="lg">
        {!portalAccess?.isEnabled && (
          <Alert color="orange" icon={<IconAlertCircle size="1rem" />}>
            Portal access must be enabled before preferences can be configured.
          </Alert>
        )}

        {/* Notification Preferences */}
        <Paper p="md" withBorder>
          <Title order={4} mb="md">
            Notification Preferences
          </Title>
          <Stack gap="md">
            <Switch
              label="Email Notifications"
              description="Receive notifications via email"
              {...preferencesForm.getInputProps('receiveEmailNotifications', { type: 'checkbox' })}
              disabled={!portalAccess?.isEnabled || !patient.contactInfo.email}
            />
            <Switch
              label="SMS Notifications"
              description="Receive notifications via SMS"
              {...preferencesForm.getInputProps('receiveSmsNotifications', { type: 'checkbox' })}
              disabled={!portalAccess?.isEnabled}
            />
            <Switch
              label="Appointment Reminders"
              description="Receive reminders for upcoming appointments"
              {...preferencesForm.getInputProps('appointmentReminders', { type: 'checkbox' })}
              disabled={!portalAccess?.isEnabled}
            />
            <Switch
              label="Lab Result Notifications"
              description="Get notified when lab results are available"
              {...preferencesForm.getInputProps('labResultNotifications', { type: 'checkbox' })}
              disabled={!portalAccess?.isEnabled}
            />
            <Switch
              label="Prescription Refill Reminders"
              description="Receive reminders for prescription refills"
              {...preferencesForm.getInputProps('prescriptionRefillReminders', {
                type: 'checkbox',
              })}
              disabled={!portalAccess?.isEnabled}
            />
          </Stack>
        </Paper>

        {/* Language and Regional Settings */}
        <Paper p="md" withBorder>
          <Title order={4} mb="md">
            Language & Regional Settings
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Language Preference"
                data={[
                  { value: 'English', label: 'English' },
                  { value: 'Hindi', label: 'हिंदी (Hindi)' },
                  { value: 'Spanish', label: 'Español (Spanish)' },
                  { value: 'French', label: 'Français (French)' },
                ]}
                {...preferencesForm.getInputProps('languagePreference')}
                disabled={!portalAccess?.isEnabled}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Time Zone"
                data={[
                  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                  { value: 'America/New_York', label: 'Eastern Time (EST)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                ]}
                {...preferencesForm.getInputProps('timeZone')}
                disabled={!portalAccess?.isEnabled}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!portalAccess?.isEnabled}
            leftSection={<IconSettings size="1rem" />}
          >
            Update Preferences
          </Button>
        </Group>
      </Stack>
    </form>
  );

  // Access History Tab
  const AccessHistoryTab = () => (
    <Stack gap="lg">
      {!portalAccess?.isEnabled ? (
        <Alert color="gray" icon={<IconHistory size="1rem" />}>
          Portal access history will be available once the patient portal is enabled.
        </Alert>
      ) : (
        <>
          <Paper p="md" withBorder>
            <Title order={4} mb="md">
              Recent Access Activity
            </Title>
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              <Timeline.Item bullet={<IconLogin size="0.8rem" />} title="Successful Login">
                <Text c="dimmed" size="sm">
                  March 15, 2024 at 10:30 AM
                </Text>
                <Text size="sm" mt={4}>
                  Logged in from Chrome browser (IP: 192.168.1.100)
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconEye size="0.8rem" />} title="Viewed Lab Results">
                <Text c="dimmed" size="sm">
                  March 15, 2024 at 10:32 AM
                </Text>
                <Text size="sm" mt={4}>
                  Accessed recent blood test results
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconCalendar size="0.8rem" />} title="Appointment Scheduled">
                <Text c="dimmed" size="sm">
                  March 15, 2024 at 10:35 AM
                </Text>
                <Text size="sm" mt={4}>
                  Scheduled follow-up appointment for March 25th
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconLogout size="0.8rem" />} title="Logged Out">
                <Text c="dimmed" size="sm">
                  March 15, 2024 at 10:45 AM
                </Text>
                <Text size="sm" mt={4}>
                  Session ended normally
                </Text>
              </Timeline.Item>
            </Timeline>
          </Paper>

          <Paper p="md" withBorder>
            <Title order={4} mb="md">
              Security Events
            </Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Details</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Mar 15, 2024</Table.Td>
                  <Table.Td>Password Reset</Table.Td>
                  <Table.Td>
                    <Badge color="green" size="sm">
                      Success
                    </Badge>
                  </Table.Td>
                  <Table.Td>Admin initiated password reset</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Mar 10, 2024</Table.Td>
                  <Table.Td>Failed Login</Table.Td>
                  <Table.Td>
                    <Badge color="red" size="sm">
                      Failed
                    </Badge>
                  </Table.Td>
                  <Table.Td>Incorrect password (3 attempts)</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Mar 5, 2024</Table.Td>
                  <Table.Td>Account Created</Table.Td>
                  <Table.Td>
                    <Badge color="blue" size="sm">
                      Info
                    </Badge>
                  </Table.Td>
                  <Table.Td>Portal access enabled by admin</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>
        </>
      )}
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconUserCheck size="1.2rem" />
          <Text fw={600}>Patient Portal Access</Text>
        </Group>
      }
      size="xl"
    >
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconShield size="0.8rem" />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="preferences" leftSection={<IconSettings size="0.8rem" />}>
            Preferences
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size="0.8rem" />}>
            Access History
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <OverviewTab />
        </Tabs.Panel>

        <Tabs.Panel value="preferences" pt="md">
          <PreferencesTab />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <AccessHistoryTab />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
