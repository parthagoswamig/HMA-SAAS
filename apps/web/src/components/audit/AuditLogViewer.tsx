'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  LoadingOverlay,
  Alert,
  Table,
  Badge,
  Text,
  TextInput,
  ScrollArea,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { 
  IconFileAnalytics, 
  IconAlertCircle, 
  IconSearch,
  IconRefresh,
  IconDownload,
  IconEye,
} from '@tabler/icons-react';

interface AuditLogViewerProps {
  opened: boolean;
  onClose: () => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  opened,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    module: '',
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
    },
    searchQuery: '',
  });

  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [detailsOpened, setDetailsOpened] = useState(false);

  useEffect(() => {
    if (opened) {
      fetchUsers();
      fetchLogs();
    }
  }, [opened]);

  const fetchUsers = async () => {
    // Mock users - would fetch from API
    const usersList = [
      { value: 'user1', label: 'John Doe' },
      { value: 'user2', label: 'Jane Smith' },
      { value: 'user3', label: 'Admin User' },
    ];
    setUsers(usersList);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock logs - would fetch from API
      const mockLogs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: 'user1',
          userName: 'John Doe',
          action: 'CREATE',
          module: 'patients',
          description: 'Created new patient record',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/96.0',
          status: 'success',
          metadata: { patientId: 'PAT001' },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user2',
          userName: 'Jane Smith',
          action: 'UPDATE',
          module: 'appointments',
          description: 'Updated appointment schedule',
          ipAddress: '192.168.1.2',
          userAgent: 'Firefox/95.0',
          status: 'success',
          metadata: { appointmentId: 'APT001' },
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userId: 'user3',
          userName: 'Admin User',
          action: 'DELETE',
          module: 'billing',
          description: 'Deleted invoice',
          ipAddress: '192.168.1.3',
          userAgent: 'Safari/15.0',
          status: 'failed',
          metadata: { invoiceId: 'INV001', error: 'Permission denied' },
        },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch audit logs',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsOpened(true);
  };

  const handleExport = () => {
    notifications.show({
      title: 'Export Started',
      message: 'Audit logs are being exported...',
      color: 'blue',
    });
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'LOGIN': return 'cyan';
      case 'LOGOUT': return 'gray';
      case 'VIEW': return 'indigo';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'green' : 'red';
  };

  const actions = [
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'VIEW', label: 'View' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'EXPORT', label: 'Export' },
    { value: 'IMPORT', label: 'Import' },
  ];

  const modules = [
    { value: 'patients', label: 'Patients' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'billing', label: 'Billing' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'users', label: 'Users' },
    { value: 'settings', label: 'Settings' },
    { value: 'reports', label: 'Reports' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesUser = !filters.userId || log.userId === filters.userId;
    const matchesAction = !filters.action || log.action === filters.action;
    const matchesModule = !filters.module || log.module === filters.module;
    const matchesSearch = !filters.searchQuery || 
      log.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const logDate = new Date(log.timestamp);
    const matchesDate = logDate >= filters.dateRange.startDate && 
                       logDate <= filters.dateRange.endDate;
    
    return matchesUser && matchesAction && matchesModule && matchesSearch && matchesDate;
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Audit Log Viewer"
        size="xl"
        closeOnClickOutside={false}
      >
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconFileAnalytics size={20} />} color="blue" variant="light">
            View and filter system audit logs for security and compliance monitoring.
          </Alert>

          {/* Filters */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Search"
                placeholder="Search logs..."
                leftSection={<IconSearch size={16} />}
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="User"
                placeholder="All users"
                data={users}
                value={filters.userId}
                onChange={(value) => setFilters({ ...filters, userId: value || '' })}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="Action"
                placeholder="All actions"
                data={actions}
                value={filters.action}
                onChange={(value) => setFilters({ ...filters, action: value || '' })}
                clearable
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Module"
                placeholder="All modules"
                data={modules}
                value={filters.module}
                onChange={(value) => setFilters({ ...filters, module: value || '' })}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="Start Date"
                placeholder="Select date"
                value={filters.dateRange.startDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFilters({ 
                    ...filters, 
                    dateRange: { 
                      ...filters.dateRange, 
                      startDate: dateValue 
                    } 
                  });
                }}
                maxDate={new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="End Date"
                placeholder="Select date"
                value={filters.dateRange.endDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFilters({ 
                    ...filters, 
                    dateRange: { 
                      ...filters.dateRange, 
                      endDate: dateValue 
                    } 
                  });
                }}
                minDate={filters.dateRange.startDate}
                maxDate={new Date()}
              />
            </Grid.Col>
          </Grid>

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchLogs}
            >
              Refresh
            </Button>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Group>

          {/* Logs Table */}
          <ScrollArea h={400}>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <Text ta="center" c="dimmed">No logs found</Text>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <Text size="sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </Text>
                      </td>
                      <td>{log.userName}</td>
                      <td>
                        <Badge color={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td>{log.module}</td>
                      <td>{log.description}</td>
                      <td>
                        <Badge color={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </td>
                      <td>
                        <Text size="sm" c="dimmed">{log.ipAddress}</Text>
                      </td>
                      <td>
                        <Tooltip label="View Details">
                          <ActionIcon
                            variant="subtle"
                            onClick={() => handleViewDetails(log)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </ScrollArea>

          {/* Summary Stats */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Text size="sm" c="dimmed">Total Logs</Text>
              <Text size="lg" fw={600}>{filteredLogs.length}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Text size="sm" c="dimmed">Success Rate</Text>
              <Text size="lg" fw={600} c="green">
                {filteredLogs.length > 0 
                  ? `${Math.round((filteredLogs.filter(l => l.status === 'success').length / filteredLogs.length) * 100)}%`
                  : '0%'
                }
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Text size="sm" c="dimmed">Failed Actions</Text>
              <Text size="lg" fw={600} c="red">
                {filteredLogs.filter(l => l.status === 'failed').length}
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Text size="sm" c="dimmed">Unique Users</Text>
              <Text size="lg" fw={600}>
                {new Set(filteredLogs.map(l => l.userId)).size}
              </Text>
            </Grid.Col>
          </Grid>
        </Stack>
      </Modal>

      {/* Details Modal */}
      <Modal
        opened={detailsOpened}
        onClose={() => setDetailsOpened(false)}
        title="Audit Log Details"
        size="md"
      >
        {selectedLog && (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Log ID</Text>
                <Text fw={500}>{selectedLog.id}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Timestamp</Text>
                <Text fw={500}>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </Text>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">User</Text>
                <Text fw={500}>{selectedLog.userName}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">User ID</Text>
                <Text fw={500}>{selectedLog.userId}</Text>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Action</Text>
                <Badge color={getActionColor(selectedLog.action)}>
                  {selectedLog.action}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Module</Text>
                <Text fw={500}>{selectedLog.module}</Text>
              </Grid.Col>
            </Grid>

            <div>
              <Text size="sm" c="dimmed">Description</Text>
              <Text fw={500}>{selectedLog.description}</Text>
            </div>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Status</Text>
                <Badge color={getStatusColor(selectedLog.status)}>
                  {selectedLog.status}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">IP Address</Text>
                <Text fw={500}>{selectedLog.ipAddress}</Text>
              </Grid.Col>
            </Grid>

            <div>
              <Text size="sm" c="dimmed">User Agent</Text>
              <Text fw={500}>{selectedLog.userAgent}</Text>
            </div>

            {selectedLog.metadata && (
              <div>
                <Text size="sm" c="dimmed">Metadata</Text>
                <Text fw={500} style={{ fontFamily: 'monospace' }}>
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </Text>
              </div>
            )}
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default AuditLogViewer;
