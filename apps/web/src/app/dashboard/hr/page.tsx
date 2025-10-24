'use client';

import React, { useState, useMemo } from 'react';
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
  ScrollArea,
  ThemeIcon,
  Progress,
  Textarea,
  RingProgress,
  List,
  // Image,
  // Loader,
  // Highlight,
  Accordion,
  // FileButton,
  // ColorSwatch,
  // Code,
  // Spoiler,
  // Mark,
  Rating,
  // Switch,
  // Checkbox,
  // Radio,
  // PasswordInput,
  MultiSelect,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  MantineDonutChart,
  SimpleAreaChart,
  SimpleBarChart,
  SimpleLineChart,
} from '../../../components/MantineChart';
// import { Calendar, DatePickerInput } from '@mantine/dates';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconCalendar,
  IconUsers,
  IconChartBar,
  // IconPhone,
  // IconAlertCircle,
  IconCheck,
  IconX,
  IconDotsVertical,
  IconDownload,
  IconCalculator,
  // IconFilter,
  IconUserPlus,
  IconUserCheck,
  IconUserX,
  IconSchool,
  IconStar,
  IconCalendarEvent,
  IconCalendarTime,
  IconCurrencyDollar,
  // IconWallet,
  // IconCreditCard,
  // IconBuildingBank,
  IconTrophy,
  // IconLock,
  // IconClipboardCheck,
  // IconUserCircle,
  // IconBuilding,
  IconCertificate,
  IconSend,
  IconBriefcase,
} from '@tabler/icons-react';

// Import types and mock data
import {
  Employee,
  EmployeeStatus,
  // Department,
  // Role,
  Shift,
  ShiftStatus,
  // Payroll,
  PayrollStatus,
  PerformanceReview,
  ReviewStatus,
  LeaveRequest,
  LeaveStatus,
  // Training,
  TrainingStatus,
  // Attendance,
  AttendanceStatus,
  // HRStats,
  // HRFilters
} from '../../../types/hr';
// Mock data imports removed

const HRManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedShiftStatus, setSelectedShiftStatus] = useState<string>('');
  const [selectedLeaveStatus, setSelectedLeaveStatus] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Modal states
  const [employeeDetailOpened, { open: openEmployeeDetail, close: closeEmployeeDetail }] =
    useDisclosure(false);
  const [addEmployeeOpened, { open: openAddEmployee, close: closeAddEmployee }] =
    useDisclosure(false);
  const [shiftDetailOpened, { open: openShiftDetail, close: closeShiftDetail }] =
    useDisclosure(false);
  const [addShiftOpened, { open: openAddShift, close: closeAddShift }] = useDisclosure(false);
  const [createReviewOpened, { open: openCreateReview, close: closeCreateReview }] =
    useDisclosure(false);
  const [reviewDetailOpened, { open: openReviewDetail, close: closeReviewDetail }] =
    useDisclosure(false);
  const [leaveDetailOpened, { open: openLeaveDetail, close: closeLeaveDetail }] =
    useDisclosure(false);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (employee) => {
        const matchesSearch =
          employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment =
          !selectedDepartment || (employee.department as any)?.name === selectedDepartment;
        const matchesRole = !selectedRole || (employee as any).role === selectedRole;
        const matchesStatus = !selectedStatus || employee.status === selectedStatus;

        return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
      }
    );
  }, [searchQuery, selectedDepartment, selectedRole, selectedStatus]);

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (shift) => {
        const matchesSearch =
          shift.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shift.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shift.shiftId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedShiftStatus || shift.status === selectedShiftStatus;

        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, selectedShiftStatus]);

  // Filter leave requests
  const filteredLeaveRequests = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (leave) => {
        const matchesSearch =
          (leave as any).employee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (leave as any).employee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedLeaveStatus || leave.status === selectedLeaveStatus;

        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, selectedLeaveStatus]);

  // Helper functions
  const getStatusColor = (
    status:
      | EmployeeStatus
      | ShiftStatus
      | PayrollStatus
      | ReviewStatus
      | LeaveStatus
      | TrainingStatus
      | AttendanceStatus
  ) => {
    switch (status) {
      case 'active':
      case 'scheduled':
      case 'processed':
      case 'completed':
      case 'approved':
      case 'present':
        return 'green';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
      case 'absent':
        return 'red';
      case 'on_leave':
      case 'pending':
      case 'draft':
      case 'in_progress':
      case 'late':
        return 'orange';
      case 'terminated':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Doctor':
        return 'blue';
      case 'Nurse':
        return 'green';
      case 'Technician':
        return 'orange';
      case 'Administrator':
        return 'purple';
      case 'Receptionist':
        return 'cyan';
      case 'Pharmacist':
        return 'pink';
      case 'Therapist':
        return 'indigo';
      case 'Support Staff':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'sick':
        return 'red';
      case 'vacation':
        return 'blue';
      case 'personal':
        return 'green';
      case 'emergency':
        return 'orange';
      case 'maternity':
        return 'pink';
      case 'paternity':
        return 'cyan';
      case 'study':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    openEmployeeDetail();
  };

  const _handleDeleteEmployee = (_id: string) => {
    // TODO: Implement delete employee functionality
    console.log('Delete employee:', _id);
  };

  const handleViewShift = (shift: Shift) => {
    // TODO: Implement shift detail view
    console.log('View shift:', shift);
    openShiftDetail();
  };

  const handleViewReview = (review: PerformanceReview) => {
    // TODO: Implement review detail view
    console.log('View review:', review);
    openReviewDetail();
  };

  const handleViewLeave = (leave: LeaveRequest) => {
    // TODO: Implement leave detail view
    console.log('View leave:', leave);
    openLeaveDetail();
  };

  const _openAddShift = () => {
    openAddShift();
  };

  const _openCreateReview = () => {
    openCreateReview();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedShiftStatus('');
    setSelectedLeaveStatus('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Employees',
      value: 0 /* TODO: Fetch from API */,
      icon: IconUsers,
      color: 'blue',
      trend: '+5.2%',
    },
    {
      title: 'Active Staff',
      value: 0 /* TODO: Fetch from API */,
      icon: IconUserCheck,
      color: 'green',
      trend: `${((0 /* TODO: Fetch from API */ / 0) /* TODO: Fetch from API */ * 100).toFixed(1)}%`,
    },
    {
      title: 'Open Positions',
      value: 0,
      icon: IconUserPlus,
      color: 'orange',
      trend: '+3',
    },
    {
      title: 'Avg Satisfaction',
      value: `0/10`,
      icon: IconStar,
      color: 'purple',
      trend: '+0.3',
    },
  ];

  // Chart data
  const departmentData = [].map(
    /* TODO: Fetch from API */ (dept) => ({
      name: dept.name,
      value: (dept as any).employeeCount || 0,
      color: getRoleColor(dept.name),
    })
  );

  const monthlyHiring = [];
  const attendanceData = [];
  const payrollData = [];

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Human Resources & Staff Management</Title>
          <Text c="dimmed" size="sm">
            Manage employees, schedules, payroll, and HR operations
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconUserPlus size={16} />} onClick={openAddEmployee} color="blue">
            Add Employee
          </Button>
          <Button variant="light" leftSection={<IconCalendarTime size={16} />} color="green">
            Schedule Shift
          </Button>
        </Group>
      </Group>

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
                  color={
                    stat.trend.includes('+') ? 'green' : stat.trend.includes('-') ? 'red' : 'blue'
                  }
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
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="employees" leftSection={<IconUsers size={16} />}>
            Employees
          </Tabs.Tab>
          <Tabs.Tab value="scheduling" leftSection={<IconCalendarTime size={16} />}>
            Scheduling
          </Tabs.Tab>
          <Tabs.Tab value="payroll" leftSection={<IconCurrencyDollar size={16} />}>
            Payroll
          </Tabs.Tab>
          <Tabs.Tab value="performance" leftSection={<IconTrophy size={16} />}>
            Performance
          </Tabs.Tab>
          <Tabs.Tab value="leave" leftSection={<IconCalendarEvent size={16} />}>
            Leave Management
          </Tabs.Tab>
          <Tabs.Tab value="training" leftSection={<IconSchool size={16} />}>
            Training
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Employees Tab */}
        <Tabs.Panel value="employees">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search employees..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Department"
                data={[].map(
                  /* TODO: Fetch from API */ (dept) => ({
                    value: dept.name,
                    label: dept.name,
                  })
                )}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                clearable
              />
              <Select
                placeholder="Role"
                data={[
                  { value: 'Doctor', label: 'Doctor' },
                  { value: 'Nurse', label: 'Nurse' },
                  { value: 'Technician', label: 'Technician' },
                  { value: 'Administrator', label: 'Administrator' },
                  { value: 'Receptionist', label: 'Receptionist' },
                  { value: 'Pharmacist', label: 'Pharmacist' },
                ]}
                value={selectedRole}
                onChange={setSelectedRole}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'on_leave', label: 'On Leave' },
                  { value: 'terminated', label: 'Terminated' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Employees Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Employee</Table.Th>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Join Date</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Salary</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredEmployees.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <EmptyState
                          icon={<IconBriefcase size={48} />}
                          title="No HR records"
                          description="Add employee records to get started"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <Table.Tr key={employee.id}>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl">
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {employee.firstName} {employee.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {employee.email}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>{employee.employeeId}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getRoleColor((employee as any).role)} variant="light">
                            {(employee as any).role}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {(employee.department as any).name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Head: Dr. {(employee.department as any).head}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate((employee as any).joinDate)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(employee.status)} variant="light">
                            {employee.status.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {formatCurrency((employee as any).salary)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewEmployee(employee)}
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
                                <Menu.Item leftSection={<IconTrophy size={14} />}>
                                  Performance Review
                                </Menu.Item>
                                <Menu.Item leftSection={<IconCalendarEvent size={14} />}>
                                  Leave Request
                                </Menu.Item>
                                <Menu.Item leftSection={<IconCurrencyDollar size={14} />}>
                                  Payroll Details
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconUserX size={14} />} color="red">
                                  Terminate
                                </Menu.Item>
                                <Menu.Item leftSection={<IconTrash size={14} />} color="red">
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

        {/* Scheduling Tab */}
        <Tabs.Panel value="scheduling">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Staff Scheduling</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />} onClick={openAddShift}>
                  Add Shift
                </Button>
                <Button variant="light" leftSection={<IconCalendar size={16} />}>
                  View Calendar
                </Button>
              </Group>
            </Group>

            {/* Shift Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search shifts..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={selectedShiftStatus}
                onChange={setSelectedShiftStatus}
                clearable
              />
            </Group>

            {/* Shifts Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Shift ID</Table.Th>
                    <Table.Th>Employee</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredShifts.map((shift) => (
                    <Table.Tr key={shift.id}>
                      <Table.Td>
                        <Text fw={500}>{shift.shiftId}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group>
                          <Avatar color="blue" radius="xl" size="sm">
                            {shift.employee.firstName[0]}
                            {shift.employee.lastName[0]}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              {shift.employee.firstName} {shift.employee.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {(shift.employee as any).role}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(shift.date)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>
                            {shift.startTime} - {shift.endTime}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {shift.shiftType}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{shift.duration}h</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{shift.department}</Text>
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
                            onClick={() => handleViewShift(shift)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="green">
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red">
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        {/* Payroll Tab */}
        <Tabs.Panel value="payroll">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Payroll Management</Title>
              <Group>
                <Button leftSection={<IconCalculator size={16} />}>Calculate Payroll</Button>
                <Button variant="light" leftSection={<IconDownload size={16} />}>
                  Export Payroll
                </Button>
              </Group>
            </Group>

            {/* Payroll Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (payroll) => (
                  <Card key={payroll.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {(payroll as any).employee.firstName} {(payroll as any).employee.lastName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {(payroll as any).employee.employeeId} - {(payroll as any).employee.role}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(payroll.status)} variant="light">
                        {payroll.status}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Pay Period
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate((payroll as any).payPeriodStart)} -{' '}
                          {formatDate((payroll as any).payPeriodEnd)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Base Salary
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatCurrency((payroll as any).baseSalary)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Overtime
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatCurrency((payroll as any).overtimePay)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Bonuses
                        </Text>
                        <Text size="sm" fw={500} c="green">
                          +{formatCurrency((payroll as any).bonuses)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Deductions
                        </Text>
                        <Text size="sm" fw={500} c="red">
                          -{formatCurrency(payroll.deductions)}
                        </Text>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="sm" fw={600}>
                          Net Pay
                        </Text>
                        <Text size="lg" fw={700} c="blue">
                          {formatCurrency((payroll as any).netPay)}
                        </Text>
                      </Group>
                    </Stack>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Hours: {(payroll as any).hoursWorked}h
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconDownload size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconSend size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Performance Tab */}
        <Tabs.Panel value="performance">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Performance Reviews</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreateReview}>
                  Create Review
                </Button>
                <Button variant="light" leftSection={<IconTrophy size={16} />}>
                  Performance Report
                </Button>
              </Group>
            </Group>

            {/* Performance Reviews Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (review) => (
                  <Card key={review.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {review.employee.firstName} {review.employee.lastName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {review.reviewType} Review - {review.reviewPeriod}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(review.status)} variant="light">
                        {review.status}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Overall Rating
                        </Text>
                        <div>
                          <Rating value={review.overallRating} readOnly size="sm" />
                          <Text size="sm" fw={500} ta="center">
                            {review.overallRating}/5
                          </Text>
                        </div>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Reviewer
                        </Text>
                        <Text size="sm" fw={500}>
                          {review.reviewer}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Review Date
                        </Text>
                        <Text size="sm">{formatDate(review.reviewDate)}</Text>
                      </Group>
                    </Stack>

                    <Accordion variant="contained" mb="md">
                      <Accordion.Item value="details">
                        <Accordion.Control>Performance Areas</Accordion.Control>
                        <Accordion.Panel>
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm">Communication</Text>
                              <Rating value={review.ratings.communication} readOnly size="xs" />
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm">Teamwork</Text>
                              <Rating value={review.ratings.teamwork} readOnly size="xs" />
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm">Technical Skills</Text>
                              <Rating value={review.ratings.technicalSkills} readOnly size="xs" />
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm">Leadership</Text>
                              <Rating value={review.ratings.leadership} readOnly size="xs" />
                            </Group>
                          </Stack>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Next Review: {formatDate(review.nextReviewDate)}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewReview(review)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Leave Management Tab */}
        <Tabs.Panel value="leave">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Leave Management</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />}>Submit Leave Request</Button>
                <Button variant="light" leftSection={<IconCalendarEvent size={16} />}>
                  Leave Calendar
                </Button>
              </Group>
            </Group>

            {/* Leave Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search leave requests..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={selectedLeaveStatus}
                onChange={setSelectedLeaveStatus}
                clearable
              />
            </Group>

            {/* Leave Requests Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {filteredLeaveRequests.map((leave) => (
                <Card key={leave.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        {(leave as any).employee.firstName} {(leave as any).employee.lastName}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {(leave as any).employee.role} - {(leave as any).employee.department.name}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(leave.status)} variant="light">
                      {leave.status}
                    </Badge>
                  </Group>

                  <Stack gap="sm" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Leave Type
                      </Text>
                      <Badge color={getLeaveTypeColor(leave.leaveType)} variant="light">
                        {leave.leaveType.toUpperCase()}
                      </Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Duration
                      </Text>
                      <Text size="sm" fw={500}>
                        {(leave as any).duration} days
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Start Date
                      </Text>
                      <Text size="sm">{formatDate(leave.startDate)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        End Date
                      </Text>
                      <Text size="sm">{formatDate(leave.endDate)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Applied On
                      </Text>
                      <Text size="sm">{formatDate((leave as any).appliedDate)}</Text>
                    </Group>
                  </Stack>

                  {leave.reason && (
                    <div style={{ marginBottom: '1rem' }}>
                      <Text size="sm" fw={500} mb="xs">
                        Reason
                      </Text>
                      <Text size="sm" lineClamp={2} c="dimmed">
                        {leave.reason}
                      </Text>
                    </div>
                  )}

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {(leave as any).approvedBy && `Approved by: ${(leave as any).approvedBy}`}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleViewLeave(leave)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      {leave.status === 'pending' && (
                        <>
                          <ActionIcon variant="subtle" color="green">
                            <IconCheck size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red">
                            <IconX size={16} />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Training Tab */}
        <Tabs.Panel value="training">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Training & Development</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />}>Schedule Training</Button>
                <Button variant="light" leftSection={<IconCertificate size={16} />}>
                  Certifications
                </Button>
              </Group>
            </Group>

            {/* Training Programs Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (training) => (
                  <Card key={training.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {(training as any).trainingName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {(training as any).trainingType}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(training.status)} variant="light">
                        {training.status}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Instructor
                        </Text>
                        <Text size="sm" fw={500}>
                          {(training as any).instructor}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Duration
                        </Text>
                        <Text size="sm">{(training as any).duration}h</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Start Date
                        </Text>
                        <Text size="sm">{formatDate(training.startDate)}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Participants
                        </Text>
                        <Text size="sm" fw={500}>
                          {(training as any).participants?.length || 0}/
                          {(training as any).maxParticipants}
                        </Text>
                      </Group>
                    </Stack>

                    <Progress
                      value={
                        (((training as any).participants?.length || 0) /
                          ((training as any).maxParticipants || 1)) *
                        100
                      }
                      size="sm"
                      mb="md"
                      color={
                        ((training as any).participants?.length || 0) ===
                        (training as any).maxParticipants
                          ? 'red'
                          : 'blue'
                      }
                    />

                    {training.description && (
                      <Text size="sm" lineClamp={2} mb="md" c="dimmed">
                        {training.description}
                      </Text>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {(training as any).certificateAwarded
                          ? 'Certificate Awarded'
                          : 'No Certificate'}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconUserPlus size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconCertificate size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              HR Analytics
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Department Distribution */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Employees by Department
                </Title>
                <MantineDonutChart data={departmentData} size={160} thickness={30} withLabels />
              </Card>

              {/* Monthly Hiring */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Monthly Hiring Trends
                </Title>
                <SimpleAreaChart
                  data={monthlyHiring}
                  dataKey="month"
                  series={[{ name: 'hired', color: 'blue.6' }]}
                />
              </Card>

              {/* Attendance Rates */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Department Attendance Rates
                </Title>
                <SimpleBarChart
                  data={attendanceData}
                  dataKey="department"
                  series={[{ name: 'rate', color: 'green.6' }]}
                />
              </Card>

              {/* Payroll Summary */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Monthly Payroll Costs
                </Title>
                <SimpleLineChart
                  data={payrollData}
                  dataKey="month"
                  series={[{ name: 'amount', color: 'orange.6', label: 'Amount' }]}
                />
              </Card>

              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Key Performance Indicators
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'green' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0%
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Employee Retention
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'blue' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0%
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Average Attendance
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'purple' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0%
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Training Completion
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: 0, color: 'orange' }]}
                      label={
                        <Text size="lg" fw={700} ta="center">
                          0/10
                        </Text>
                      }
                    />
                    <Text size="sm" c="dimmed" mt="xs">
                      Employee Satisfaction
                    </Text>
                  </div>
                </SimpleGrid>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Employee Detail Modal */}
      <Modal
        opened={employeeDetailOpened}
        onClose={closeEmployeeDetail}
        title="Employee Details"
        size="xl"
      >
        {selectedEmployee && (
          <ScrollArea h={600}>
            <Stack gap="md">
              <Group>
                <Avatar size="xl" color="blue" radius="xl">
                  {selectedEmployee.firstName[0]}
                  {selectedEmployee.lastName[0]}
                </Avatar>
                <div>
                  <Title order={3}>
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </Title>
                  <Text c="dimmed">{selectedEmployee.employeeId}</Text>
                  <Badge color={getStatusColor(selectedEmployee.status)} variant="light" mt="xs">
                    {selectedEmployee.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Group>

              <Divider />

              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Email
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedEmployee.email}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Phone
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedEmployee.phone}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Role
                  </Text>
                  <Badge color={getRoleColor((selectedEmployee as any).role)} variant="light">
                    {(selectedEmployee as any).role}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Department
                  </Text>
                  <Text size="sm" c="dimmed">
                    {(selectedEmployee.department as any).name}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Join Date
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatDate((selectedEmployee as any).joinDate)}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Salary
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency((selectedEmployee as any).salary)}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Address
                  </Text>
                  <Text size="sm" c="dimmed">
                    {(selectedEmployee as any).address}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Emergency Contact
                  </Text>
                  <Text size="sm" c="dimmed">
                    {(selectedEmployee as any).emergencyContact}
                  </Text>
                </div>
              </SimpleGrid>

              {(selectedEmployee as any).qualifications &&
                (selectedEmployee as any).qualifications.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <Text size="sm" fw={500} mb="sm">
                        Qualifications
                      </Text>
                      <List spacing="xs">
                        {(selectedEmployee as any).qualifications.map(
                          (qualification: any, index: number) => (
                            <List.Item key={index}>
                              <Text size="sm">{qualification}</Text>
                            </List.Item>
                          )
                        )}
                      </List>
                    </div>
                  </>
                )}

              {(selectedEmployee as any).certifications &&
                (selectedEmployee as any).certifications.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <Text size="sm" fw={500} mb="sm">
                        Certifications
                      </Text>
                      <Group gap="xs">
                        {(selectedEmployee as any).certifications.map(
                          (certification: any, index: number) => (
                            <Badge key={index} variant="light" color="green">
                              {certification}
                            </Badge>
                          )
                        )}
                      </Group>
                    </div>
                  </>
                )}

              <Group justify="flex-end">
                <Button variant="light" onClick={closeEmployeeDetail}>
                  Close
                </Button>
                <Button leftSection={<IconTrophy size={16} />}>Performance Review</Button>
                <Button leftSection={<IconEdit size={16} />}>Edit Employee</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        opened={addEmployeeOpened}
        onClose={closeAddEmployee}
        title="Add New Employee"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput label="First Name" placeholder="Enter first name" required />
            <TextInput label="Last Name" placeholder="Enter last name" required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput label="Email" placeholder="Enter email address" type="email" required />
            <TextInput label="Phone" placeholder="Enter phone number" required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Role"
              placeholder="Select role"
              data={[
                { value: 'Doctor', label: 'Doctor' },
                { value: 'Nurse', label: 'Nurse' },
                { value: 'Technician', label: 'Technician' },
                { value: 'Administrator', label: 'Administrator' },
                { value: 'Receptionist', label: 'Receptionist' },
                { value: 'Pharmacist', label: 'Pharmacist' },
              ]}
              required
            />
            <Select
              label="Department"
              placeholder="Select department"
              data={[].map(
                /* TODO: Fetch from API */ (dept) => ({
                  value: dept.name,
                  label: dept.name,
                })
              )}
            />
          </SimpleGrid>

          <Textarea label="Address" placeholder="Enter address" rows={2} required />

          <MultiSelect
            label="Qualifications"
            placeholder="Select qualifications"
            data={[
              { value: 'MBBS', label: 'MBBS' },
              { value: 'MD', label: 'MD' },
              { value: 'MS', label: 'MS' },
              { value: 'BSc Nursing', label: 'BSc Nursing' },
              { value: 'MSc Nursing', label: 'MSc Nursing' },
              { value: 'Diploma', label: 'Diploma' },
            ]}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddEmployee}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Employee Added',
                  message: 'New employee has been successfully added to the system',
                  color: 'green',
                });
                closeAddEmployee();
              }}
            >
              Add Employee
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default HRManagement;
