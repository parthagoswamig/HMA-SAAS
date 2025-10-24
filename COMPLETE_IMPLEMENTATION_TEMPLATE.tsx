/**
 * COMPLETE IMPLEMENTATION TEMPLATE
 * Copy this pattern to implement API fetching and empty states in any module
 * 
 * Steps to use:
 * 1. Replace [ModuleName] with your module (e.g., Patients, Appointments)
 * 2. Replace [serviceName] with your service (e.g., patientsService)
 * 3. Replace [DataType] with your data type
 * 4. Customize empty state messages
 * 5. Add your specific UI components
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Table,
  Card,
  SimpleGrid,
  ThemeIcon,
  Stack,
  Alert,
  Loader,
  Center,
  Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUsers, // Change to appropriate icon
  IconAlertCircle
} from '@tabler/icons-react';
import { EmptyState } from '../../../components/EmptyState';
import [serviceName] from '../../../services/[module].service';

// Types
interface [DataType] {
  id: string;
  // Add your fields
}

interface [StatsType] {
  total: number;
  // Add your stats fields
}

export default function [ModuleName]Management() {
  // State Management
  const [data, setData] = useState<[DataType][]>([]);
  const [stats, setStats] = useState<[StatsType] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<[DataType] | null>(null);
  
  // Modal States
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);

  // Fetch Data
  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await [serviceName].getAll();
      setData(response.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errorMsg);
      console.error('Error fetching data:', err);
      notifications.show({
        title: 'Error',
        message: errorMsg,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await [serviceName].getStats();
      setStats(response.data);
    } catch (err: any) {
      console.warn('Error fetching stats:', err);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    await fetchStats();
    notifications.show({
      title: 'Refreshed',
      message: 'Data updated successfully',
      color: 'green'
    });
  };

  const handleAdd = async (formData: any) => {
    try {
      await [serviceName].create(formData);
      notifications.show({
        title: 'Success',
        message: 'Record created successfully',
        color: 'green'
      });
      closeAddModal();
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to create record',
        color: 'red'
      });
    }
  };

  const handleView = (item: [DataType]) => {
    setSelectedItem(item);
    openViewModal();
  };

  // Filter data based on search
  const filteredData = data.filter(item =>
    // Add your search logic
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading State
  if (loading) {
    return (
      <Container size="xl" py="md">
        <Center style={{ minHeight: '400px' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading data...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Error State
  if (error) {
    return (
      <Container size="xl" py="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error Loading Data"
          color="red"
        >
          <Stack gap="md">
            <Text>{error}</Text>
            <Group>
              <Button onClick={fetchData} variant="light">
                Retry
              </Button>
              <Button onClick={() => setError(null)} variant="subtle">
                Dismiss
              </Button>
            </Group>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>[Module Name] Management</Title>
          <Text c="dimmed" size="sm">
            Manage and track [module description]
          </Text>
        </div>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAddModal}
          >
            Add New
          </Button>
        </Group>
      </Group>

      {/* Stats Cards */}
      {stats && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
          <Card padding="lg" radius="md" withBorder>
            <Group justify="apart">
              <div>
                <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                  Total Records
                </Text>
                <Text size="xl" fw={700}>
                  {stats.total || 0}
                </Text>
              </div>
              <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                <IconUsers size={24} />
              </ThemeIcon>
            </Group>
          </Card>
          {/* Add more stat cards as needed */}
        </SimpleGrid>
      )}

      {/* Main Content */}
      <Card padding="lg" radius="md" withBorder>
        {/* Search and Filters */}
        <Group mb="md">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
        </Group>

        {/* Data Table or Empty State */}
        {filteredData.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={48} />}
            title="No records found"
            description={searchQuery ? 
              "No results match your search. Try different keywords." :
              "Get started by adding your first record"
            }
            action={!searchQuery ? {
              label: "Add New Record",
              onClick: openAddModal
            } : undefined}
          />
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredData.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.id}</Table.Td>
                  <Table.Td>{/* item.name */}</Table.Td>
                  <Table.Td>
                    <Badge color="green">Active</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => handleView(item)}
                      >
                        View
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Record"
        size="lg"
      >
        {/* Add your form here */}
        <Stack gap="md">
          <TextInput label="Name" required />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={() => handleAdd({})}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="Record Details"
        size="lg"
      >
        {selectedItem && (
          <Stack gap="md">
            <Text>ID: {selectedItem.id}</Text>
            {/* Add more details */}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
