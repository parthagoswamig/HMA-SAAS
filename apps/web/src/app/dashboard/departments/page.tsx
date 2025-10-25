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
  Textarea,
  Card,
  SimpleGrid,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconUsers,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import EmptyState from '../../../components/EmptyState';
import hrService from '../../../services/hr.service';

interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    staff: number;
  };
}

const DepartmentsManagement = () => {
  // State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  // Modals
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await hrService.getDepartments({ limit: 100 });
      console.log('Departments response:', response);
      setDepartments((response.data?.items || []) as Department[]);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to fetch departments',
        color: 'red',
      });
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    if (!searchQuery) return departments;
    
    const query = searchQuery.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.code?.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => d.isActive).length;
    const totalStaff = departments.reduce((sum, d) => sum + (d._count?.staff || 0), 0);
    
    return { total, active, totalStaff };
  }, [departments]);

  // Handlers
  const handleAdd = () => {
    setFormData({ name: '', code: '', description: '' });
    openAdd();
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code || '',
      description: department.description || '',
    });
    openEdit();
  };

  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    openDelete();
  };

  const handleSubmitAdd = async () => {
    if (!formData.name.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Department name is required',
        color: 'red',
      });
      return;
    }

    try {
      await hrService.createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      notifications.show({
        title: 'Success',
        message: 'Department created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeAdd();
      fetchDepartments();
    } catch (err: any) {
      console.error('Error creating department:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to create department',
        color: 'red',
      });
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedDepartment || !formData.name.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Department name is required',
        color: 'red',
      });
      return;
    }

    try {
      await hrService.updateDepartment(selectedDepartment.id, {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      notifications.show({
        title: 'Success',
        message: 'Department updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeEdit();
      fetchDepartments();
    } catch (err: any) {
      console.error('Error updating department:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update department',
        color: 'red',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;

    try {
      await hrService.deleteDepartment(selectedDepartment.id);

      notifications.show({
        title: 'Success',
        message: 'Department deactivated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeDelete();
      fetchDepartments();
    } catch (err: any) {
      console.error('Error deleting department:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to deactivate department',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Department Management</Title>
            <Text c="dimmed" size="sm">
              Manage hospital departments and organizational structure
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
            Add Department
          </Button>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Card withBorder padding="lg">
            <Group>
              <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                <IconBuilding size={24} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Departments
                </Text>
                <Text size="xl" fw={700}>
                  {stats.total}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder padding="lg">
            <Group>
              <ThemeIcon size="xl" radius="md" variant="light" color="green">
                <IconCheck size={24} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Active Departments
                </Text>
                <Text size="xl" fw={700}>
                  {stats.active}
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
                  Total Staff
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStaff}
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Search */}
        <Paper p="md" withBorder>
          <TextInput
            placeholder="Search departments by name, code, or description..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </Paper>

        {/* Table */}
        <Paper withBorder>
          {loading ? (
            <Text p="xl" ta="center" c="dimmed">
              Loading departments...
            </Text>
          ) : filteredDepartments.length === 0 ? (
            <EmptyState
              title="No departments found"
              description={
                searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by creating your first department'
              }
            />
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Staff Count</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDepartments.map((dept) => (
                  <Table.Tr key={dept.id}>
                    <Table.Td>
                      <Text fw={500}>{dept.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {dept.code || 'N/A'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {dept.description || 'No description'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="violet">
                        {dept._count?.staff || 0} staff
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={dept.isActive ? 'green' : 'gray'} variant="light">
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEdit(dept)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteClick(dept)}
                          disabled={!dept.isActive}
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

      {/* Add Department Modal */}
      <Modal opened={addOpened} onClose={closeAdd} title="Add Department" size="md">
        <Stack gap="md">
          <TextInput
            label="Department Name"
            placeholder="e.g., Cardiology"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            required
          />
          <TextInput
            label="Department Code"
            placeholder="e.g., CARD"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value.toUpperCase() })}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the department"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
            minRows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeAdd}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd}>Create Department</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Department Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Department" size="md">
        <Stack gap="md">
          <TextInput
            label="Department Name"
            placeholder="e.g., Cardiology"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            required
          />
          <TextInput
            label="Department Code"
            placeholder="e.g., CARD"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value.toUpperCase() })}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the department"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
            minRows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit}>Update Department</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Deactivate Department"
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Are you sure you want to deactivate this department?
          </Alert>
          {selectedDepartment && (
            <Paper p="md" withBorder>
              <Text fw={500} size="lg">
                {selectedDepartment.name}
              </Text>
              <Text size="sm" c="dimmed">
                Code: {selectedDepartment.code || 'N/A'}
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Staff members: {selectedDepartment._count?.staff || 0}
              </Text>
            </Paper>
          )}
          <Text size="sm" c="dimmed">
            This will deactivate the department. Staff members will remain but won&apos;t be
            linked to an active department.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeDelete}>
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Deactivate
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default DepartmentsManagement;
