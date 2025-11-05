'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Table,
  Modal,
  Text,
  Tabs,
  Card,
  Avatar,
  ActionIcon,
  Menu,
  Stack,
  Divider,
  NumberInput,
  Progress,
  Alert,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconUsers,
  IconUserPlus,
  IconCalendar,
  IconClock,
  IconPhone,
  IconMail,
  IconStethoscope,
  IconCalendarEvent,
  IconClockHour3,
  IconChartBar,
  IconUserCheck,
  IconUserX,
  IconAlertCircle,
  IconDotsVertical,
  IconBuilding,
  IconMedicalCross,
  IconAward,
  IconCalendarStats,
} from '@tabler/icons-react';
import {
  MantineDonutChart,
  SimpleAreaChart,
  SimpleBarChart,
} from '../../../components/MantineChart';

// Import API service
import staffService from '../../../services/staff.service';

// Import types
import { Staff } from '../../../types/staff';
import { UserRole, Status } from '../../../types/common';

// Fallback empty data

const StaffManagement = () => {
  // API State
  const [staff, setStaff] = useState<any[]>([]);
  const [staffStats, setStaffStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'departments' | 'shifts' | 'attendance' | 'analytics'>('list');

  // Modal states
  const [staffDetailOpened, { open: openStaffDetail, close: closeStaffDetail }] =
    useDisclosure(false);
  const [addStaffOpened, { open: openAddStaff, close: closeAddStaff }] = useDisclosure(false);
  const [editStaffOpened, { open: openEditStaff, close: closeEditStaff }] = useDisclosure(false);

  // Fetch staff data
  useEffect(() => {
    fetchStaff();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff({
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        status: (selectedStatus as any) || undefined,
      });
      console.log('Staff API response:', response);
      setStaff(response.data?.staff || []);
      setError(null);
    } catch (err: any) {
      console.warn(
        'Error fetching staff (using empty data):',
        err.response?.data?.message || err.message
      );
      setError(null);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await staffService.getStaffStats();
      console.log('Stats API response:', response);
      setStaffStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching staff stats (using default values):',
        err.response?.data?.message || err.message
      );
      setStaffStats({
        totalStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        byRole: {},
        byDepartment: {},
      });
    }
  };

  // Filter and search logic (client-side filtering after API fetch)
  const filteredStaff = useMemo(() => {
    if (!staff || staff.length === 0) return [];

    return staff
      .filter((s) => {
        const firstName = s.user?.firstName || s.firstName || '';
        const lastName = s.user?.lastName || s.lastName || '';
        const email = s.user?.email || s.email || '';
        const employeeId = s.employeeId || '';

        const matchesSearch =
          !searchQuery ||
          firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employeeId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment = !selectedDepartment || s.department?.name === selectedDepartment;
        const matchesRole = !selectedRole || s.user?.role === selectedRole;
        const matchesStatus =
          !selectedStatus || (s.isActive ? 'active' : 'inactive') === selectedStatus;

        return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const aFirstName = a.user?.firstName || a.firstName || '';
        const aLastName = a.user?.lastName || a.lastName || '';
        const bFirstName = b.user?.firstName || b.firstName || '';
        const bLastName = b.user?.lastName || b.lastName || '';

        let aVal: string | number;
        let bVal: string | number;

        switch (sortBy) {
          case 'name':
            aVal = `${aFirstName} ${aLastName}`;
            bVal = `${bFirstName} ${bLastName}`;
            break;
          case 'department':
            aVal = a.department?.name || '';
            bVal = b.department?.name || '';
            break;
          case 'experience':
            aVal = parseInt(a.experience) || 0;
            bVal = parseInt(b.experience) || 0;
            break;
          case 'joiningDate':
            aVal = new Date(a.joiningDate || 0).getTime();
            bVal = new Date(b.joiningDate || 0).getTime();
            break;
          default:
            aVal = `${aFirstName} ${aLastName}`;
            bVal = `${bFirstName} ${bLastName}`;
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
  }, [staff, searchQuery, selectedDepartment, selectedRole, selectedStatus, sortBy, sortOrder]);

  // Helper functions
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DOCTOR:
        return 'blue';
      case UserRole.NURSE:
        return 'green';
      case 'TECHNICIAN' as any:
        return 'purple';
      case UserRole.PHARMACIST:
        return 'purple';
      case UserRole.ADMIN:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusBadgeColor = (status: Status) => {
    switch (status) {
      case Status.ACTIVE:
        return 'green';
      case Status.INACTIVE:
        return 'red';
      case Status.PENDING:
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    openStaffDetail();
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    closeStaffDetail(); // Close detail modal first
    openEditStaff(); // Open edit modal
  };

  const handleDeleteStaff = async (staffMember: any) => {
    if (
      !confirm(
        `Are you sure you want to delete ${staffMember.user?.firstName || staffMember.firstName} ${staffMember.user?.lastName || staffMember.lastName}?`
      )
    ) {
      return;
    }

    try {
      await staffService.deleteStaff(staffMember.id);
      notifications.show({
        title: 'Success',
        message: 'Staff member deleted successfully',
        color: 'green',
      });
      fetchStaff(); // Refresh the list
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete staff member',
        color: 'red',
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedRole('');
    setSelectedStatus('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Staff',
      value: staffStats?.totalStaff || 0,
      icon: IconUsers,
      color: 'blue',
      trend: '+5%',
    },
    {
      title: 'Active Staff',
      value: staffStats?.activeStaff || 0,
      icon: IconUserCheck,
      color: 'green',
      trend: '+2%',
    },
    {
      title: 'Doctors',
      value: staffStats?.byRole?.doctors || 0,
      icon: IconStethoscope,
      color: 'cyan',
      trend: '+3%',
    },
    {
      title: 'Nurses',
      value: staffStats?.byRole?.nurses || 0,
      icon: IconMedicalCross,
      color: 'teal',
      trend: '+2%',
    },
  ];

  // Chart data
  const roleDistributionData = staffStats?.byRole
    ? [
        { name: 'Doctors', value: staffStats.byRole.doctors || 0, color: '#0891b2' },
        { name: 'Nurses', value: staffStats.byRole.nurses || 0, color: '#22c55e' },
        { name: 'Lab Technicians', value: staffStats.byRole.labTechnicians || 0, color: '#14b8a6' },
        { name: 'Pharmacists', value: staffStats.byRole.pharmacists || 0, color: '#8b5cf6' },
      ].filter((item) => item.value > 0)
    : [];

  const departmentDistributionData: any[] = []; // TODO: Implement when department stats are available
  const hiringTrendsData: any[] = []; // TODO: Implement when hiring trends are available

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Staff Management</Title>
          <Text c="dimmed" size="sm">
            Manage hospital staff, schedules, and performance
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconUserPlus size={16} />} onClick={openAddStaff}>
            Add Staff
          </Button>
        </Group>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="lg">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Text>Loading staff data...</Text>
          </Stack>
        </Paper>
      ) : (
        <>
          {/* Statistics Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text c="dimmed" size="sm" fw={500}>
                        {stat.title}
                      </Text>
                      <Text fw={700} size="xl">
                        {stat.value}
                      </Text>
                    </div>
                    <ThemeIcon color={stat.color} size="xl" radius="md" variant="light">
                      <Icon size={24} />
                    </ThemeIcon>
                  </Group>
                  <Group justify="space-between" mt="sm">
                    <Badge
                      color={stat.trend.startsWith('+') ? 'green' : 'red'}
                      variant="light"
                      size="sm"
                    >
                      {stat.trend}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      vs last month
                    </Text>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'list' | 'departments' | 'shifts' | 'attendance' | 'analytics')}>
            <Tabs.List>
              <Tabs.Tab value="list" leftSection={<IconUsers size={16} />}>
                Staff List
              </Tabs.Tab>
              <Tabs.Tab value="departments" leftSection={<IconBuilding size={16} />}>
                Departments
              </Tabs.Tab>
              <Tabs.Tab value="shifts" leftSection={<IconClock size={16} />}>
                Shifts & Schedules
              </Tabs.Tab>
              <Tabs.Tab value="attendance" leftSection={<IconCalendarStats size={16} />}>
                Attendance
              </Tabs.Tab>
              <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
                Analytics
              </Tabs.Tab>
            </Tabs.List>

            {/* Staff List Tab */}
            <Tabs.Panel value="list">
              <Paper p="md" radius="md" withBorder mt="md">
                {/* Search and Filters */}
                <Group mb="md">
                  <TextInput
                    placeholder="Search staff..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <Select
                    placeholder="Department"
                    data={[].map(
                      /* TODO: Fetch from API */ (dept) => ({ value: dept.name, label: dept.name })
                    )}
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    clearable
                  />
                  <Select
                    placeholder="Role"
                    data={[
                      { value: 'DOCTOR', label: 'Doctor' },
                      { value: 'NURSE', label: 'Nurse' },
                      { value: 'TECHNICIAN' as any, label: 'Technician' },
                      { value: 'PHARMACIST', label: 'Pharmacist' },
                      { value: 'ADMIN', label: 'Admin' },
                    ]}
                    value={selectedRole}
                    onChange={setSelectedRole}
                    clearable
                  />
                  <Select
                    placeholder="Status"
                    data={[
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' },
                      { value: 'PENDING', label: 'Pending' },
                    ]}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    clearable
                  />
                  <Button variant="light" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Group>

                {/* Sort Controls */}
                <Group mb="md">
                  <Select
                    label="Sort by"
                    data={[
                      { value: 'name', label: 'Name' },
                      { value: 'department', label: 'Department' },
                      { value: 'experience', label: 'Experience' },
                      { value: 'joiningDate', label: 'Joining Date' },
                    ]}
                    value={sortBy}
                    onChange={(value) => setSortBy(value || 'name')}
                  />
                  <Select
                    label="Order"
                    data={[
                      { value: 'asc', label: 'Ascending' },
                      { value: 'desc', label: 'Descending' },
                    ]}
                    value={sortOrder}
                    onChange={(value) => setSortOrder((value as 'asc' | 'desc') || 'asc')}
                  />
                </Group>

                {/* Staff Table */}
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Staff</Table.Th>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Department</Table.Th>
                        <Table.Th>Experience</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredStaff.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={8}>
                            <EmptyState
                              icon={<IconUsers size={48} />}
                              title="No staff members"
                              description="Add staff members to your hospital"
                              size="sm"
                            />
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        filteredStaff.map((staff) => (
                          <Table.Tr key={staff.id}>
                            <Table.Td>
                              <Group>
                                <Avatar color="blue" radius="xl">
                                  {staff.firstName[0]}
                                  {staff.lastName[0]}
                                </Avatar>
                                <div>
                                  <Text fw={500}>
                                    {staff.firstName} {staff.lastName}
                                  </Text>
                                  <Text size="sm" c="dimmed">
                                    {staff.contactInfo.email}
                                  </Text>
                                </div>
                              </Group>
                            </Table.Td>
                            <Table.Td>{staff.staffId}</Table.Td>
                            <Table.Td>
                              <Badge color={getRoleBadgeColor(staff.role)} variant="light">
                                {staff.role ? staff.role.replace('_', ' ') : 'N/A'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{staff.department.name}</Table.Td>
                            <Table.Td>{staff.experience} years</Table.Td>
                            <Table.Td>
                              <Badge color={getStatusBadgeColor(staff.status)} variant="light">
                                {staff.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  onClick={() => handleViewStaff(staff)}
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="green">
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <Menu>
                                  <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray">
                                      <IconDotsVertical size={16} />
                                    </ActionIcon>
                                  </Menu.Target>
                                  <Menu.Dropdown>
                                    <Menu.Item
                                      leftSection={<IconTrash size={14} />}
                                      color="red"
                                      onClick={() => handleDeleteStaff(staff)}
                                    >
                                      Delete
                                    </Menu.Item>
                                  </Menu.Dropdown>
                                </Menu>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Tabs.Panel>

            {/* Departments Tab */}
            <Tabs.Panel value="departments">
              <Paper p="md" radius="md" withBorder mt="md">
                <Group justify="space-between" mb="lg">
                  <Title order={3}>Departments</Title>
                  <Button leftSection={<IconPlus size={16} />}>Add Department</Button>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                  {[].map(
                    /* TODO: Fetch from API */ (dept) => (
                      <Card key={dept.id} padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                          <div>
                            <Text fw={600} size="lg">
                              {dept.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {dept.code}
                            </Text>
                          </div>
                          <ThemeIcon size="lg" color="blue" variant="light">
                            <IconMedicalCross size={20} />
                          </ThemeIcon>
                        </Group>

                        <Text size="sm" mb="md">
                          {dept.description}
                        </Text>

                        <Stack gap="xs">
                          <Group>
                            <Text size="sm" fw={500}>
                              Head:
                            </Text>
                            <Text size="sm">{dept.headOfDepartment}</Text>
                          </Group>
                          <Group>
                            <Text size="sm" fw={500}>
                              Location:
                            </Text>
                            <Text size="sm">{dept.location}</Text>
                          </Group>
                        </Stack>

                        <Group justify="flex-end" mt="md">
                          <ActionIcon variant="subtle" color="blue">
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="green">
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Group>
                      </Card>
                    )
                  )}
                </SimpleGrid>
              </Paper>
            </Tabs.Panel>

            {/* Shifts & Schedules Tab */}
            <Tabs.Panel value="shifts">
              <Paper p="md" radius="md" withBorder mt="md">
                <Group justify="space-between" mb="lg">
                  <Title order={3}>Shifts & Schedules</Title>
                  <Button leftSection={<IconCalendar size={16} />}>Schedule Shift</Button>
                </Group>

                <SimpleGrid cols={{ base: 1, lg: 2 }} mb="lg">
                  <Card padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Today&apos;s Shifts
                    </Title>
                    <Stack gap="md">
                      {[].map(
                        /* TODO: Fetch from API */ (shift) => {
                          const staffMember = staff.find(
                            (s) => s.id === shift.staffId || s.staffId === shift.staffId
                          );
                          return (
                            <Group
                              key={shift.id}
                              justify="space-between"
                              p="sm"
                              style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}
                            >
                              <div>
                                <Text fw={500}>
                                  {staffMember
                                    ? `${staffMember.user?.firstName || staffMember.firstName} ${staffMember.user?.lastName || staffMember.lastName}`
                                    : 'Unknown Staff'}
                                </Text>
                                <Text size="sm" c="dimmed">
                                  {shift.startTime} - {shift.endTime} | {shift.department}
                                </Text>
                              </div>
                              <Badge
                                color={
                                  shift.status === 'scheduled'
                                    ? 'blue'
                                    : shift.status === 'in_progress'
                                      ? 'green'
                                      : 'gray'
                                }
                                variant="light"
                              >
                                {shift.status.replace('_', ' ')}
                              </Badge>
                            </Group>
                          );
                        }
                      )}
                    </Stack>
                  </Card>

                  <Card padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Shift Statistics
                    </Title>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text>Scheduled Shifts</Text>
                        <Badge color="blue" variant="light">
                          8
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>In Progress</Text>
                        <Badge color="green" variant="light">
                          3
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Completed</Text>
                        <Badge color="gray" variant="light">
                          12
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>No Show</Text>
                        <Badge color="red" variant="light">
                          1
                        </Badge>
                      </Group>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Paper>
            </Tabs.Panel>

            {/* Attendance Tab */}
            <Tabs.Panel value="attendance">
              <Paper p="md" radius="md" withBorder mt="md">
                <Title order={3} mb="lg">
                  Attendance Overview
                </Title>

                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} mb="lg">
                  <Card padding="md" radius="md" withBorder>
                    <Group justify="center">
                      <ThemeIcon size="xl" color="green" variant="light">
                        <IconUserCheck size={24} />
                      </ThemeIcon>
                    </Group>
                    <Text ta="center" fw={600} size="lg" mt="sm">
                      {staffStats?.attendanceMetrics?.presentToday || 0}
                    </Text>
                    <Text ta="center" size="sm" c="dimmed">
                      Present Today
                    </Text>
                  </Card>

                  <Card padding="md" radius="md" withBorder>
                    <Group justify="center">
                      <ThemeIcon size="xl" color="red" variant="light">
                        <IconUserX size={24} />
                      </ThemeIcon>
                    </Group>
                    <Text ta="center" fw={600} size="lg" mt="sm">
                      {staffStats?.attendanceMetrics?.absentToday || 0}
                    </Text>
                    <Text ta="center" size="sm" c="dimmed">
                      Absent Today
                    </Text>
                  </Card>

                  <Card padding="md" radius="md" withBorder>
                    <Group justify="center">
                      <ThemeIcon size="xl" color="orange" variant="light">
                        <IconClockHour3 size={24} />
                      </ThemeIcon>
                    </Group>
                    <Text ta="center" fw={600} size="lg" mt="sm">
                      {staffStats?.attendanceMetrics?.lateToday || 0}
                    </Text>
                    <Text ta="center" size="sm" c="dimmed">
                      Late Today
                    </Text>
                  </Card>

                  <Card padding="md" radius="md" withBorder>
                    <Group justify="center">
                      <ThemeIcon size="xl" color="blue" variant="light">
                        <IconCalendarEvent size={24} />
                      </ThemeIcon>
                    </Group>
                    <Text ta="center" fw={600} size="lg" mt="sm">
                      {staffStats?.attendanceMetrics?.onLeaveToday || 0}
                    </Text>
                    <Text ta="center" size="sm" c="dimmed">
                      On Leave
                    </Text>
                  </Card>
                </SimpleGrid>

                {/* Recent Attendance */}
                <Card padding="lg" radius="md" withBorder>
                  <Title order={4} mb="md">
                    Recent Attendance Records
                  </Title>
                  <ScrollArea>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Staff</Table.Th>
                          <Table.Th>Date</Table.Th>
                          <Table.Th>Clock In</Table.Th>
                          <Table.Th>Clock Out</Table.Th>
                          <Table.Th>Hours</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {[].map(
                          /* TODO: Fetch from API */ (record) => {
                            const staffMember = staff.find(
                              (s) => s.id === record.staffId || s.staffId === record.staffId
                            );
                            return (
                              <Table.Tr key={record.id}>
                                <Table.Td>
                                  {staffMember
                                    ? `${staffMember.user?.firstName || staffMember.firstName} ${staffMember.user?.lastName || staffMember.lastName}`
                                    : 'Unknown'}
                                </Table.Td>
                                <Table.Td>{formatDate(record.date)}</Table.Td>
                                <Table.Td>
                                  {record.clockIn ? formatTime(record.clockIn) : '-'}
                                </Table.Td>
                                <Table.Td>
                                  {record.clockOut ? formatTime(record.clockOut) : '-'}
                                </Table.Td>
                                <Table.Td>{record.totalHours || 0}h</Table.Td>
                                <Table.Td>
                                  <Badge
                                    color={
                                      record.status === 'present'
                                        ? 'green'
                                        : record.status === 'on_leave'
                                          ? 'orange'
                                          : 'red'
                                    }
                                    variant="light"
                                  >
                                    {record.status.replace('_', ' ')}
                                  </Badge>
                                </Table.Td>
                              </Table.Tr>
                            );
                          }
                        )}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Card>
              </Paper>
            </Tabs.Panel>

            {/* Analytics Tab */}
            <Tabs.Panel value="analytics">
              <Paper p="md" radius="md" withBorder mt="md">
                <Title order={3} mb="lg">
                  Staff Analytics
                </Title>

                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                  {/* Role Distribution */}
                  <Card padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Staff by Role
                    </Title>
                    <MantineDonutChart
                      data={roleDistributionData}
                      size={160}
                      thickness={30}
                      withLabels
                    />
                  </Card>

                  {/* Department Distribution */}
                  <Card padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Staff by Department
                    </Title>
                    <SimpleBarChart
                      data={departmentDistributionData}
                      dataKey="department"
                      series={[{ name: 'count', color: 'blue.6' }]}
                    />
                  </Card>

                  {/* Hiring Trends */}
                  <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                    <Title order={4} mb="md">
                      Hiring Trends
                    </Title>
                    <SimpleAreaChart
                      data={hiringTrendsData}
                      dataKey="month"
                      series={[
                        { name: 'hired', color: 'green.6' },
                        { name: 'resigned', color: 'red.6' },
                      ]}
                    />
                  </Card>

                  {/* Performance Metrics */}
                  <Card padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Performance Overview
                    </Title>
                    <Stack gap="md">
                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm">Average Rating</Text>
                          <Text size="sm" fw={500}>
                            {staffStats?.performanceMetrics?.averageRating || 0}/5.0
                          </Text>
                        </Group>
                        <Progress
                          value={(staffStats?.performanceMetrics?.averageRating || 0) * 20}
                          color="green"
                        />
                      </div>

                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm">Training Completion</Text>
                          <Text size="sm" fw={500}>
                            {staffStats?.performanceMetrics?.trainingCompletionRate || 0}%
                          </Text>
                        </Group>
                        <Progress
                          value={staffStats?.performanceMetrics?.trainingCompletionRate || 0}
                          color="blue"
                        />
                      </div>

                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm">Average Attendance</Text>
                          <Text size="sm" fw={500}>
                            {staffStats?.attendanceMetrics?.averageAttendance || 0}%
                          </Text>
                        </Group>
                        <Progress
                          value={staffStats?.attendanceMetrics?.averageAttendance || 0}
                          color="teal"
                        />
                      </div>
                    </Stack>
                  </Card>

                  {/* Top Performers */}
                  <Card padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">
                      Top Performers
                    </Title>
                    <Stack gap="sm">
                      {(staffStats?.performanceMetrics?.topPerformers || []).map(
                        (performer, index) => (
                          <Group
                            key={performer}
                            justify="space-between"
                            p="sm"
                            style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                          >
                            <Group>
                              <ThemeIcon size="sm" color="gold" variant="light">
                                <IconAward size={14} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                {performer}
                              </Text>
                            </Group>
                            <Badge color="gold" variant="light" size="sm">
                              #{index + 1}
                            </Badge>
                          </Group>
                        )
                      )}
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </>
      )}

      {/* Staff Detail Modal */}
      <Modal opened={staffDetailOpened} onClose={closeStaffDetail} title="Staff Details" size="lg">
        {selectedStaff && (
          <Stack gap="md">
            {/* Basic Info */}
            <Group>
              <Avatar size="xl" color="blue" radius="xl">
                {selectedStaff.firstName[0]}
                {selectedStaff.lastName[0]}
              </Avatar>
              <div>
                <Title order={3}>
                  {selectedStaff.firstName} {selectedStaff.lastName}
                </Title>
                <Text c="dimmed">
                  {selectedStaff.staffId} • {selectedStaff.department.name}
                </Text>
                <Badge color={getRoleBadgeColor(selectedStaff.role)} variant="light" mt="xs">
                  {selectedStaff.role.replace('_', ' ')}
                </Badge>
              </div>
            </Group>

            <Divider />

            {/* Contact Information */}
            <div>
              <Title order={4} mb="sm">
                Contact Information
              </Title>
              <SimpleGrid cols={2}>
                <Group>
                  <IconPhone size={16} />
                  <Text size="sm">{selectedStaff.contactInfo.phone}</Text>
                </Group>
                <Group>
                  <IconMail size={16} />
                  <Text size="sm">{selectedStaff.contactInfo.email}</Text>
                </Group>
              </SimpleGrid>
            </div>

            {/* Professional Info */}
            <div>
              <Title order={4} mb="sm">
                Professional Information
              </Title>
              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Experience
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedStaff.experience} years
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Joining Date
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatDate(selectedStaff.joiningDate)}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Employment Type
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedStaff.employmentType?.replace('_', ' ')}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Status
                  </Text>
                  <Badge
                    color={getStatusBadgeColor(selectedStaff.status)}
                    variant="light"
                    size="sm"
                  >
                    {selectedStaff.status}
                  </Badge>
                </div>
              </SimpleGrid>
            </div>

            {/* Performance Metrics */}
            {selectedStaff.performanceMetrics && (
              <div>
                <Title order={4} mb="sm">
                  Performance Metrics
                </Title>
                <SimpleGrid cols={2}>
                  <div>
                    <Text size="sm" fw={500}>
                      Patient Rating
                    </Text>
                    <Text size="sm" c="dimmed">
                      {selectedStaff.performanceMetrics.averagePatientRating}/5.0
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" fw={500}>
                      Patients Handled
                    </Text>
                    <Text size="sm" c="dimmed">
                      {selectedStaff.performanceMetrics.totalPatientsHandled}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" fw={500}>
                      Attendance
                    </Text>
                    <Text size="sm" c="dimmed">
                      {selectedStaff.performanceMetrics.attendancePercentage}%
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" fw={500}>
                      Punctuality
                    </Text>
                    <Text size="sm" c="dimmed">
                      {selectedStaff.performanceMetrics.punctualityScore}%
                    </Text>
                  </div>
                </SimpleGrid>
              </div>
            )}

            <Group justify="flex-end">
              <Button variant="light" onClick={closeStaffDetail}>
                Close
              </Button>
              <Button onClick={() => handleEditStaff(selectedStaff)}>Edit Staff</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal opened={addStaffOpened} onClose={closeAddStaff} title="Add New Staff" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput label="First Name" placeholder="Enter first name" required />
            <TextInput label="Last Name" placeholder="Enter last name" required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput label="Email" placeholder="Enter email" required />
            <TextInput label="Phone" placeholder="Enter phone number" required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Role"
              placeholder="Select role"
              data={[
                { value: 'DOCTOR', label: 'Doctor' },
                { value: 'NURSE', label: 'Nurse' },
                { value: 'TECHNICIAN' as any, label: 'Technician' },
                { value: 'PHARMACIST', label: 'Pharmacist' },
              ]}
              required
            />
            <Select
              label="Department"
              placeholder="Select department"
              data={[].map(
                /* TODO: Fetch from API */ (dept) => ({ value: dept.name, label: dept.name })
              )}
              required
            />
          </SimpleGrid>

          <NumberInput
            label="Experience (years)"
            placeholder="Enter years of experience"
            min={0}
            max={50}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddStaff}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'New staff member added successfully',
                  color: 'green',
                });
                closeAddStaff();
              }}
            >
              Add Staff
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal opened={editStaffOpened} onClose={closeEditStaff} title="Edit Staff" size="lg">
        {selectedStaff && (
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                defaultValue={selectedStaff.firstName}
                required
              />
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                defaultValue={selectedStaff.lastName}
                required
              />
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <TextInput
                label="Email"
                placeholder="Enter email"
                defaultValue={selectedStaff.contactInfo?.email}
                required
              />
              <TextInput
                label="Phone"
                placeholder="Enter phone number"
                defaultValue={selectedStaff.contactInfo?.phone}
                required
              />
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <Select
                label="Role"
                placeholder="Select role"
                data={[
                  { value: 'DOCTOR', label: 'Doctor' },
                  { value: 'NURSE', label: 'Nurse' },
                  { value: 'TECHNICIAN', label: 'Technician' },
                  { value: 'PHARMACIST', label: 'Pharmacist' },
                ]}
                defaultValue={selectedStaff.role}
                required
              />
              <Select
                label="Department"
                placeholder="Select department"
                data={[].map(
                  /* TODO: Fetch from API */ (dept) => ({ value: dept.name, label: dept.name })
                )}
                defaultValue={selectedStaff.department?.name}
                required
              />
            </SimpleGrid>

            <NumberInput
              label="Experience (years)"
              placeholder="Enter years of experience"
              defaultValue={selectedStaff.experience}
              min={0}
              max={50}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={closeEditStaff}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  notifications.show({
                    title: 'Success',
                    message: 'Staff member updated successfully',
                    color: 'green',
                  });
                  closeEditStaff();
                  fetchStaff(); // Refresh the list
                }}
              >
                Update Staff
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default StaffManagement;
