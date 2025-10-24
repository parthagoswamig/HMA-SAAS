'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  MultiSelect,
  Switch,
  Stack,
  Text,
  Loader,
  Alert,
  Box,
  Grid,
  Card,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconUsers,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  _count: {
    users: number;
  };
  rolePermissions: {
    permission: Permission;
  }[];
}

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch roles');

      const data = await response.json();
      setRoles(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load roles',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch permissions');

      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissionIds: role.rolePermissions.map((rp) => rp.permission.id),
        isActive: role.isActive,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissionIds: [],
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingRole
        ? `${process.env.NEXT_PUBLIC_API_URL}/roles/${editingRole.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/roles`;

      const response = await fetch(url, {
        method: editingRole ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save role');
      }

      notifications.show({
        title: 'Success',
        message: `Role ${editingRole ? 'updated' : 'created'} successfully`,
        color: 'green',
        icon: <IconCheck />,
      });

      handleCloseModal();
      fetchRoles();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to save role',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/roles/${roleToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete role');
      }

      notifications.show({
        title: 'Success',
        message: 'Role deleted successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete role',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    }
  };

  const groupPermissionsByCategory = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      const category = permission.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  const permissionOptions = permissions.map((p) => ({
    value: p.id,
    label: `${p.name} - ${p.description}`,
    group: p.category || 'Other',
  }));

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Role Management</Title>
            <Text c="dimmed" size="sm">
              Manage roles and permissions for your organization
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
            Create Role
          </Button>
        </Group>

        {/* Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Roles
                  </Text>
                  <Text size="xl" fw={700}>
                    {roles.length}
                  </Text>
                </div>
                <IconShield size={32} style={{ opacity: 0.5 }} />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Active Roles
                  </Text>
                  <Text size="xl" fw={700}>
                    {roles.filter((r) => r.isActive).length}
                  </Text>
                </div>
                <IconCheck size={32} style={{ opacity: 0.5 }} />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Permissions
                  </Text>
                  <Text size="xl" fw={700}>
                    {permissions.length}
                  </Text>
                </div>
                <IconShield size={32} style={{ opacity: 0.5 }} />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Roles Table */}
        <Paper withBorder p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Role Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Permissions</Table.Th>
                <Table.Th>Users</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {roles.map((role) => (
                <Table.Tr key={role.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={500}>{role.name}</Text>
                      {role.isSystem && (
                        <Badge size="xs" color="blue">
                          System
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {role.description || 'No description'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{role.rolePermissions.length}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconUsers size={16} />
                      <Text size="sm">{role._count.users}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={role.isActive ? 'green' : 'gray'}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleOpenModal(role)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      {!role.isSystem && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            setRoleToDelete(role);
                            setDeleteModalOpen(true);
                          }}
                          disabled={role._count.users > 0}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {roles.length === 0 && (
            <Box p="xl">
              <Text ta="center" c="dimmed">
                No roles found. Create your first role to get started.
              </Text>
            </Box>
          )}
        </Paper>
      </Stack>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={handleCloseModal}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Role Name"
            placeholder="e.g., Doctor, Nurse, Receptionist"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={editingRole?.isSystem}
          />

          <Textarea
            label="Description"
            placeholder="Describe the role and its responsibilities"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <MultiSelect
            label="Permissions"
            placeholder="Select permissions for this role"
            data={permissionOptions}
            value={formData.permissionIds}
            onChange={(value) => setFormData({ ...formData, permissionIds: value })}
            searchable
            clearable
            maxDropdownHeight={300}
          />

          <Switch
            label="Active"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingRole ? 'Update' : 'Create'} Role</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        title="Delete Role"
        size="sm"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle />} color="red">
            Are you sure you want to delete the role &quot;{roleToDelete?.name}&quot;? This action
            cannot be undone.
          </Alert>

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => {
                setDeleteModalOpen(false);
                setRoleToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete Role
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
