'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Table,
  Modal,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Select,
  Textarea,
  Card,
  SimpleGrid,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import { DateTimePicker, DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconClock,
  IconUsers,
  IconCalendar,
  IconAlertCircle,
  IconCheck,
  IconClockHour3,
} from '@tabler/icons-react';
import EmptyState from '../../../components/EmptyState';
import shiftsService, { ShiftType, ShiftStatus, CreateShiftDto, UpdateShiftDto } from '../../../services/shifts.service';
import staffService from '../../../services/staff.service';
import hrService from '../../../services/hr.service';

const ShiftsManagement = () => {
  // State
  const [shifts, setShifts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  type ShiftFormState = {
    staffId: string;
    departmentId: string;
    shiftType: ShiftType | '';
    startTime: Date | null;
    endTime: Date | null;
    date: Date | null;
    notes: string;
    status: ShiftStatus;
  };

  const initialFormState: ShiftFormState = {
    staffId: '',
    departmentId: '',
    shiftType: '',
    startTime: null,
    endTime: null,
    date: null,
    notes: '',
    status: ShiftStatus.SCHEDULED,
  };

  // Form state
  const [formData, setFormData] = useState<ShiftFormState>(initialFormState);

  // Modals
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  // Fetch data
  useEffect(() => {
    fetchShifts();
    fetchStats();
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 100 };
      if (filterStatus) filters.status = filterStatus;
      if (filterDate) filters.date = filterDate.toISOString().split('T')[0];

      const response = await shiftsService.getShifts(filters);
      console.log('Shifts response:', response);
      setShifts(response.data?.items || []);
    } catch (err: any) {
      console.error('Error fetching shifts:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to fetch shifts',
        color: 'red',
      });
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await shiftsService.getShiftStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await staffService.getStaff({ limit: 100 });
      setStaff(response.data?.staff || []);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await hrService.getDepartments({ limit: 100 });
      setDepartments(response.data?.items || []);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
    }
  };

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    if (!searchQuery) return shifts;

    const query = searchQuery.toLowerCase();
    return shifts.filter(
      (shift) =>
        shift.staff?.user?.firstName?.toLowerCase().includes(query) ||
        shift.staff?.user?.lastName?.toLowerCase().includes(query) ||
        shift.staff?.employeeId?.toLowerCase().includes(query) ||
        shift.department?.name?.toLowerCase().includes(query)
    );
  }, [shifts, searchQuery]);

  // Handlers
  const handleAdd = () => {
    setFormData(initialFormState);
    openAdd();
  };

  const handleEdit = (shift: any) => {
    setSelectedShift(shift);
    setFormData({
      staffId: shift.staffId,
      departmentId: shift.departmentId || '',
      shiftType: shift.shiftType as ShiftType,
      startTime: shift.startTime ? new Date(shift.startTime) : null,
      endTime: shift.endTime ? new Date(shift.endTime) : null,
      date: shift.date ? new Date(shift.date) : null,
      notes: shift.notes || '',
      status: shift.status as ShiftStatus,
    });
    openEdit();
  };

  const handleDeleteClick = (shift: any) => {
    setSelectedShift(shift);
    openDelete();
  };

  const handleSubmitAdd = async () => {
    if (!formData.staffId || !formData.shiftType || !formData.startTime || !formData.endTime || !formData.date) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    try {
      const data: CreateShiftDto = {
        staffId: formData.staffId,
        departmentId: formData.departmentId || undefined,
        shiftType: formData.shiftType as ShiftType,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        date: formData.date.toISOString().split('T')[0],
        notes: formData.notes || undefined,
        status: formData.status,
      };

      await shiftsService.createShift(data);

      notifications.show({
        title: 'Success',
        message: 'Shift created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeAdd();
      fetchShifts();
      fetchStats();
    } catch (err: any) {
      console.error('Error creating shift:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to create shift',
        color: 'red',
      });
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedShift) return;

    try {
      const data: UpdateShiftDto = {
        staffId: formData.staffId,
        departmentId: formData.departmentId || undefined,
        shiftType: formData.shiftType as ShiftType,
        startTime: formData.startTime?.toISOString(),
        endTime: formData.endTime?.toISOString(),
        date: formData.date?.toISOString().split('T')[0],
        notes: formData.notes || undefined,
        status: formData.status,
      };

      await shiftsService.updateShift(selectedShift.id, data);

      notifications.show({
        title: 'Success',
        message: 'Shift updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeEdit();
      fetchShifts();
      fetchStats();
    } catch (err: any) {
      console.error('Error updating shift:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update shift',
        color: 'red',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedShift) return;

    try {
      await shiftsService.deleteShift(selectedShift.id);

      notifications.show({
        title: 'Success',
        message: 'Shift cancelled successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeDelete();
      fetchShifts();
      fetchStats();
    } catch (err: any) {
      console.error('Error deleting shift:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to cancel shift',
        color: 'red',
      });
    }
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'blue';
      case 'IN_PROGRESS':
        return 'yellow';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'NO_SHOW':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getShiftTypeLabel = (type: ShiftType) => {
    return type.replace('_', ' ');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Shift Management</Title>
            <Text c="dimmed" size="sm">
              Schedule and manage staff shifts
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
            Add Shift
          </Button>
        </Group>

        {/* Stats Cards */}
        {stats && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            <Card withBorder padding="lg">
              <Group>
                <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                  <IconClock size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Shifts
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.totalShifts}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group>
                <ThemeIcon size="xl" radius="md" variant="light" color="green">
                  <IconCalendar size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Today&apos;s Shifts
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.todayShifts}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group>
                <ThemeIcon size="xl" radius="md" variant="light" color="yellow">
                  <IconClockHour3 size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    In Progress
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.inProgressShifts}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group>
                <ThemeIcon size="xl" radius="md" variant="light" color="violet">
                  <IconUsers size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Scheduled
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.scheduledShifts}
                  </Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>
        )}

        {/* Filters */}
        <Paper p="md" withBorder>
          <Group>
            <TextInput
              placeholder="Search by staff name or employee ID..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: '', label: 'All Statuses' },
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value || '');
                fetchShifts();
              }}
              clearable
            />
            <DatePickerInput
              placeholder="Filter by date"
              value={filterDate}
              onChange={(value) => {
                setFilterDate(value as unknown as Date | null);
                fetchShifts();
              }}
              clearable
            />
          </Group>
        </Paper>

        {/* Table */}
        <Paper withBorder>
          {loading ? (
            <Text p="xl" ta="center" c="dimmed">
              Loading shifts...
            </Text>
          ) : filteredShifts.length === 0 ? (
            <EmptyState
              title="No shifts found"
              description={
                searchQuery || filterStatus || filterDate
                  ? 'Try adjusting your filters'
                  : 'Get started by scheduling your first shift'
              }
            />
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Staff Member</Table.Th>
                  <Table.Th>Department</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Shift Type</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredShifts.map((shift) => (
                  <Table.Tr key={shift.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>
                          {shift.staff?.user?.firstName} {shift.staff?.user?.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {shift.staff?.employeeId}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{shift.department?.name || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(shift.date)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {getShiftTypeLabel(shift.shiftType)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(shift.status)} variant="light">
                        {shift.status.replace('_', ' ')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEdit(shift)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteClick(shift)}
                          disabled={shift.status === 'COMPLETED' || shift.status === 'CANCELLED'}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      {/* Add Shift Modal */}
      <Modal opened={addOpened} onClose={closeAdd} title="Add Shift" size="lg">
        <Stack gap="md">
          <Select
            label="Staff Member"
            placeholder="Select staff member"
            data={staff.map((s) => ({
              value: s.id,
              label: `${s.user?.firstName} ${s.user?.lastName} (${s.employeeId})`,
            }))}
            value={formData.staffId}
            onChange={(value) => setFormData({ ...formData, staffId: value || '' })}
            searchable
            required
          />
          <Select
            label="Department"
            placeholder="Select department (optional)"
            data={departments.map((d) => ({
              value: d.id,
              label: d.name,
            }))}
            value={formData.departmentId}
            onChange={(value) => setFormData({ ...formData, departmentId: value || '' })}
            searchable
            clearable
          />
          <Select
            label="Shift Type"
            placeholder="Select shift type"
            data={[
              { value: 'MORNING', label: 'Morning' },
              { value: 'AFTERNOON', label: 'Afternoon' },
              { value: 'EVENING', label: 'Evening' },
              { value: 'NIGHT', label: 'Night' },
              { value: 'ON_CALL', label: 'On Call' },
            ]}
            value={formData.shiftType}
            onChange={(value) => setFormData({ ...formData, shiftType: value as ShiftType })}
            required
          />
          <DatePickerInput
            label="Shift Date"
            placeholder="Select date"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value as unknown as Date | null })}
            required
          />
          <Group grow>
            <DateTimePicker
              label="Start Time"
              placeholder="Select start time"
              value={formData.startTime}
              onChange={(value) => setFormData({ ...formData, startTime: value as unknown as Date | null })}
              required
            />
            <DateTimePicker
              label="End Time"
              placeholder="Select end time"
              value={formData.endTime}
              onChange={(value) => setFormData({ ...formData, endTime: value as unknown as Date | null })}
              required
            />
          </Group>
          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.currentTarget.value })}
            minRows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeAdd}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd}>Create Shift</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Shift Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Shift" size="lg">
        <Stack gap="md">
          <Select
            label="Staff Member"
            placeholder="Select staff member"
            data={staff.map((s) => ({
              value: s.id,
              label: `${s.user?.firstName} ${s.user?.lastName} (${s.employeeId})`,
            }))}
            value={formData.staffId}
            onChange={(value) => setFormData({ ...formData, staffId: value || '' })}
            searchable
            required
          />
          <Select
            label="Department"
            placeholder="Select department (optional)"
            data={departments.map((d) => ({
              value: d.id,
              label: d.name,
            }))}
            value={formData.departmentId}
            onChange={(value) => setFormData({ ...formData, departmentId: value || '' })}
            searchable
            clearable
          />
          <Select
            label="Shift Type"
            placeholder="Select shift type"
            data={[
              { value: 'MORNING', label: 'Morning' },
              { value: 'AFTERNOON', label: 'Afternoon' },
              { value: 'EVENING', label: 'Evening' },
              { value: 'NIGHT', label: 'Night' },
              { value: 'ON_CALL', label: 'On Call' },
            ]}
            value={formData.shiftType}
            onChange={(value) => setFormData({ ...formData, shiftType: value as ShiftType })}
            required
          />
          <DatePickerInput
            label="Shift Date"
            placeholder="Select date"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value as unknown as Date | null })}
            required
          />
          <Group grow>
            <DateTimePicker
              label="Start Time"
              placeholder="Select start time"
              value={formData.startTime}
              onChange={(value) => setFormData({ ...formData, startTime: value as unknown as Date | null })}
              required
            />
            <DateTimePicker
              label="End Time"
              placeholder="Select end time"
              value={formData.endTime}
              onChange={(value) => setFormData({ ...formData, endTime: value as unknown as Date | null })}
              required
            />
          </Group>
          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'NO_SHOW', label: 'No Show' },
            ]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as ShiftStatus })}
            required
          />
          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.currentTarget.value })}
            minRows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit}>Update Shift</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Cancel Shift"
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Are you sure you want to cancel this shift?
          </Alert>
          {selectedShift && (
            <Paper p="md" withBorder>
              <Text fw={500} size="lg">
                {selectedShift.staff?.user?.firstName} {selectedShift.staff?.user?.lastName}
              </Text>
              <Text size="sm" c="dimmed">
                {formatDate(selectedShift.date)} • {getShiftTypeLabel(selectedShift.shiftType)}
              </Text>
              <Text size="sm" c="dimmed">
                {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}
              </Text>
            </Paper>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Cancel Shift
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default ShiftsManagement;
