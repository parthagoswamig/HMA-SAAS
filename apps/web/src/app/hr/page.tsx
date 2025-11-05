'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Text,
  Group,
  Badge,
  SimpleGrid,
  Stack,
  Button,
  Title,
  Card,
  TextInput,
  Select,
  LoadingOverlay,
  Alert,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconBuilding,
  IconEdit,
  IconEye,
  IconTrash,
  IconDotsVertical,
  IconAlertCircle,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import StaffForm from '../../components/hr/StaffForm';
import StaffDetails from '../../components/hr/StaffDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import hrService from '../../services/hr.service';
import type { CreateStaffDto, UpdateStaffDto, HrFilters } from '../../services/hr.service';

const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@hospital.com',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.ADMIN,
  permissions: [],
  isActive: true,
  tenantInfo: {
    tenantId: 'T001',
    tenantName: 'Main Hospital',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function HrPage() {
  const { user, setUser } = useAppStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  const [staffFormOpened, { open: openStaffForm, close: closeStaffForm }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchStaff();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const filters: HrFilters = {
        page: 1,
        limit: 100,
      };
      if (departmentFilter) filters.departmentId = departmentFilter;
      if (designationFilter) filters.designation = designationFilter;
      if (statusFilter) filters.isActive = statusFilter;

      const response = await hrService.getStaff(filters);
      if (response.success && response.data) {
        let filteredStaff = response.data.items;

        // Apply search filter
        if (searchQuery) {
          filteredStaff = filteredStaff.filter(
            (s) =>
              `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.phone.includes(searchQuery) ||
              (s.employeeId && s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        setStaff(filteredStaff);
      }
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      notifications.show({
        title: 'Error Loading Staff',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch staff members. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await hrService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      notifications.show({
        title: 'Error Loading Statistics',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch HR statistics. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await hrService.getDepartments({ limit: 100 });
      if (response.success && response.data) {
        setDepartments(response.data.items);
      }
    } catch (error: any) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreateStaff = async (data: CreateStaffDto) => {
    try {
      const response = await hrService.createStaff(data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Staff member added successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeStaffForm();
        fetchStaff();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating staff:', error);
      notifications.show({
        title: 'Error Creating Staff',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create staff member. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleUpdateStaff = async (data: UpdateStaffDto) => {
    if (!selectedStaff) return;

    try {
      const response = await hrService.updateStaff(selectedStaff.id, data);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Staff member updated successfully',
          color: 'green',
          autoClose: 3000,
        });

        closeStaffForm();
        setSelectedStaff(null);
        fetchStaff();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating staff:', error);
      notifications.show({
        title: 'Error Updating Staff',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update staff member. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
      throw error;
    }
  };

  const handleDeleteStaff = async (staffMember: any) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate ${staffMember.firstName} ${staffMember.lastName}?`
      )
    ) {
      return;
    }

    try {
      const response = await hrService.deleteStaff(staffMember.id);

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Staff member deactivated successfully',
          color: 'green',
          autoClose: 3000,
        });

        fetchStaff();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      notifications.show({
        title: 'Error Deactivating Staff',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to deactivate staff member. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleViewStaff = (staffMember: any) => {
    setSelectedStaff(staffMember);
    openDetails();
  };

  const handleEditStaff = (staffMember: any) => {
    setSelectedStaff(staffMember);
    openStaffForm();
  };

  const handleNewStaff = () => {
    setSelectedStaff(null);
    openStaffForm();
  };

  const formatDesignation = (designation: string) => {
    return designation.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const staffColumns: TableColumn[] = [
    {
      key: 'employeeId',
      title: 'Employee ID',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return <Text fw={500}>{staffMember.employeeId || 'N/A'}</Text>;
      },
    },
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return (
          <div>
            <Text fw={600}>
              {staffMember.firstName} {staffMember.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {staffMember.email}
            </Text>
          </div>
        );
      },
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return <Text>{staffMember.department?.name || 'N/A'}</Text>;
      },
    },
    {
      key: 'designation',
      title: 'Designation',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return <Badge variant="light">{formatDesignation(staffMember.designation)}</Badge>;
      },
    },
    {
      key: 'phone',
      title: 'Contact',
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return <Text size="sm">{staffMember.phone}</Text>;
      },
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return (
          <Badge color={staffMember.isActive ? 'green' : 'red'}>
            {staffMember.isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, record: Record<string, unknown>) => {
        const staffMember = record as any;
        return (
          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => handleViewStaff(staffMember)}>
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => handleEditStaff(staffMember)}>
              <IconEdit size={16} />
            </ActionIcon>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={() => handleViewStaff(staffMember)}
                >
                  View Details
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleEditStaff(staffMember)}
                >
                  Edit Staff
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => handleDeleteStaff(staffMember)}
                >
                  Deactivate Staff
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        );
      },
    },
  ];

  return (
    <Layout
      user={
        user
          ? {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
            }
          : {
              id: mockUser.id,
              name: `${mockUser.firstName} ${mockUser.lastName}`,
              email: mockUser.email,
              role: mockUser.role,
            }
      }
      notifications={0}
      onLogout={() => {}}
    >
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Human Resources Management</Title>
              <Text c="dimmed" size="sm">
                Manage staff members, departments, and HR operations
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewStaff}>
              Add Staff Member
            </Button>
          </Group>

          {/* Statistics Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Total Staff
                  </Text>
                  <Text fw={700} size="xl">
                    {stats?.staff?.total || 0}
                  </Text>
                </div>
                <IconUsers size={32} color="#228be6" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Active Staff
                  </Text>
                  <Text fw={700} size="xl" c="green">
                    {stats?.staff?.active || 0}
                  </Text>
                </div>
                <IconUserCheck size={32} color="#40c057" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Inactive Staff
                  </Text>
                  <Text fw={700} size="xl" c="red">
                    {stats?.staff?.inactive || 0}
                  </Text>
                </div>
                <IconUserX size={32} color="#fa5252" />
              </Group>
            </Card>

            <Card withBorder padding="lg">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Departments
                  </Text>
                  <Text fw={700} size="xl">
                    {stats?.departments?.total || 0}
                  </Text>
                </div>
                <IconBuilding size={32} color="#fab005" />
              </Group>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Paper withBorder p="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <TextInput
                  placeholder="Search staff..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Filter by department"
                  data={[
                    { value: '', label: 'All Departments' },
                    ...departments.map((dept) => ({
                      value: dept.id,
                      label: dept.name,
                    })),
                  ]}
                  value={departmentFilter}
                  onChange={(value) => setDepartmentFilter(value || '')}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Filter by designation"
                  data={[
                    { value: '', label: 'All Designations' },
                    { value: 'DOCTOR', label: 'Doctor' },
                    { value: 'NURSE', label: 'Nurse' },
                    { value: 'RECEPTIONIST', label: 'Receptionist' },
                    { value: 'PHARMACIST', label: 'Pharmacist' },
                    { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
                    { value: 'RADIOLOGIST', label: 'Radiologist' },
                    { value: 'ACCOUNTANT', label: 'Accountant' },
                    { value: 'MANAGER', label: 'Manager' },
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  value={designationFilter}
                  onChange={(value) => setDesignationFilter(value || '')}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Filter by status"
                  data={[
                    { value: '', label: 'All Status' },
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || '')}
                  clearable
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button onClick={fetchStaff}>Apply Filters</Button>
            </Group>
          </Paper>

          {/* Staff Table */}
          <Paper withBorder>
            <LoadingOverlay visible={loading} />
            {staff.length === 0 && !loading ? (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="No staff members found"
                color="blue"
              >
                No staff members match your current filters. Try adjusting your search criteria.
              </Alert>
            ) : (
              <DataTable columns={staffColumns} data={staff} loading={loading} />
            )}
          </Paper>
        </Stack>
      </Container>

      {/* Staff Form Modal */}
      <StaffForm
        opened={staffFormOpened}
        onClose={closeStaffForm}
        staff={selectedStaff}
        onSubmit={selectedStaff ? handleUpdateStaff : handleCreateStaff}
      />

      {/* Staff Details Modal */}
      {selectedStaff && (
        <StaffDetails
          opened={detailsOpened}
          onClose={closeDetails}
          staff={selectedStaff}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
        />
      )}
    </Layout>
  );
}

export default HrPage;
