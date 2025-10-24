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
  Avatar,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconDotsVertical,
  IconAlertCircle,
  IconFiles,
  IconClipboardList,
  IconActivity,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import MedicalRecordForm from '../../components/emr/MedicalRecordForm';
import MedicalRecordDetails from '../../components/emr/MedicalRecordDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import emrService from '../../services/emr.service';
import patientsService from '../../services/patients.service';
import type {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  EmrFilters,
} from '../../services/emr.service';

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

function EmrPage() {
  const { user, setUser } = useAppStore();
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('');

  const [recordFormOpened, { open: openRecordForm, close: closeRecordForm }] = useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchRecords();
    fetchPatients();
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const filters: EmrFilters = {};
      if (patientFilter) filters.patientId = patientFilter;
      if (recordTypeFilter) filters.recordType = recordTypeFilter;

      const response = await emrService.getRecords(filters);
      if (response.success && response.data) {
        setRecords(response.data.records || []);
      }
    } catch (error: any) {
      console.error('Error fetching records:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to fetch medical records',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await emrService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients();
      if (response.success && response.data) {
        setPatients(response.data.patients || []);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Mock doctors - in production, fetch from staff API
      setDoctors([
        { id: '1', firstName: 'John', lastName: 'Smith', specialization: 'General Medicine' },
        { id: '2', firstName: 'Sarah', lastName: 'Johnson', specialization: 'Cardiology' },
      ]);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleCreateRecord = async (data: CreateMedicalRecordDto) => {
    try {
      const response = await emrService.createRecord(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Medical record created successfully',
          color: 'green',
        });
        fetchRecords();
        fetchStats();
        closeRecordForm();
      }
    } catch (error: any) {
      console.error('Error creating record:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to create medical record',
        color: 'red',
      });
      throw error;
    }
  };

  const handleUpdateRecord = async (data: UpdateMedicalRecordDto) => {
    if (!selectedRecord) return;

    try {
      const response = await emrService.updateRecord(selectedRecord.id, data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Medical record updated successfully',
          color: 'green',
        });
        fetchRecords();
        fetchStats();
        closeRecordForm();
        setSelectedRecord(null);
      }
    } catch (error: any) {
      console.error('Error updating record:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to update medical record',
        color: 'red',
      });
      throw error;
    }
  };

  const handleDeleteRecord = async (record: any) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) {
      return;
    }

    try {
      const response = await emrService.deleteRecord(record.id);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Medical record deleted successfully',
          color: 'green',
        });
        fetchRecords();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting record:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to delete medical record',
        color: 'red',
      });
    }
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    openDetails();
  };

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    openRecordForm();
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    openRecordForm();
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CONSULTATION: 'blue',
      DIAGNOSIS: 'red',
      PRESCRIPTION: 'green',
      LAB_RESULT: 'cyan',
      IMAGING: 'grape',
      PROCEDURE: 'orange',
      VACCINATION: 'teal',
      ALLERGY: 'pink',
      OTHER: 'gray',
    };
    return colors[type] || 'gray';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const recordColumns: TableColumn[] = [
    {
      key: 'recordType',
      title: 'Type',
      sortable: true,
      render: (record: any) => (
        <Badge color={getRecordTypeColor(record.recordType)}>{record.recordType}</Badge>
      ),
    },
    {
      key: 'patient',
      title: 'Patient',
      sortable: true,
      render: (record: any) => (
        <Group gap="xs">
          <Avatar size="sm" radius="xl" color="blue">
            {record.patient?.firstName?.[0]}
            {record.patient?.lastName?.[0]}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {record.patient?.firstName} {record.patient?.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {record.patient?.medicalRecordNumber || record.patient?.id}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (record: any) => <Text fw={500}>{record.title}</Text>,
    },
    {
      key: 'description',
      title: 'Description',
      render: (record: any) => <Text lineClamp={2}>{record.description}</Text>,
    },
    {
      key: 'doctor',
      title: 'Doctor',
      render: (record: any) =>
        record.doctor ? (
          <Text size="sm">
            Dr. {record.doctor.firstName} {record.doctor.lastName}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            Not assigned
          </Text>
        ),
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (record: any) => <Text size="sm">{formatDate(record.date)}</Text>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (record: any) => (
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleViewRecord(record)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" onClick={() => handleEditRecord(record)}>
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
                onClick={() => handleViewRecord(record)}
              >
                View Details
              </Menu.Item>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => handleEditRecord(record)}
              >
                Edit Record
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => handleDeleteRecord(record)}
              >
                Delete Record
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  return (
    <Layout
      user={user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role } : { id: mockUser.id, name: `${mockUser.firstName} ${mockUser.lastName}`, email: mockUser.email, role: mockUser.role }}
      notifications={0}
      onLogout={() => {}}
    >
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Electronic Medical Records</Title>
              <Text c="dimmed" size="sm">
                Manage patient medical records and history
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewRecord}>
              Create Medical Record
            </Button>
          </Group>

          {/* Statistics Cards */}
          {stats && (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Total Records
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.total}
                    </Text>
                  </div>
                  <IconFiles size={32} color="#228be6" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Recent Records
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.recentRecords}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Last 30 days
                    </Text>
                  </div>
                  <IconActivity size={32} color="#40c057" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Record Types
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.byType?.length || 0}
                    </Text>
                  </div>
                  <IconClipboardList size={32} color="#fab005" />
                </Group>
              </Card>
            </SimpleGrid>
          )}

          {/* Filters */}
          <Paper withBorder p="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  placeholder="Search records..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                  placeholder="Filter by patient"
                  data={[
                    { value: '', label: 'All Patients' },
                    ...patients.map((p) => ({
                      value: p.id,
                      label: `${p.firstName} ${p.lastName}`,
                    })),
                  ]}
                  value={patientFilter}
                  onChange={(value) => setPatientFilter(value || '')}
                  searchable
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                  placeholder="Filter by type"
                  data={[
                    { value: '', label: 'All Types' },
                    { value: 'CONSULTATION', label: 'Consultation' },
                    { value: 'DIAGNOSIS', label: 'Diagnosis' },
                    { value: 'PRESCRIPTION', label: 'Prescription' },
                    { value: 'LAB_RESULT', label: 'Lab Result' },
                    { value: 'IMAGING', label: 'Imaging' },
                    { value: 'PROCEDURE', label: 'Procedure' },
                    { value: 'VACCINATION', label: 'Vaccination' },
                    { value: 'ALLERGY', label: 'Allergy' },
                  ]}
                  value={recordTypeFilter}
                  onChange={(value) => setRecordTypeFilter(value || '')}
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button onClick={fetchRecords}>Apply Filters</Button>
            </Group>
          </Paper>

          {/* Records Table */}
          <Paper withBorder>
            <LoadingOverlay visible={loading} />
            {records.length === 0 && !loading ? (
              <Alert icon={<IconAlertCircle size={16} />} title="No records found" color="blue">
                No medical records match your current filters.
              </Alert>
            ) : (
              <DataTable columns={recordColumns} data={records} loading={loading} />
            )}
          </Paper>
        </Stack>
      </Container>

      {/* Medical Record Form Modal */}
      <MedicalRecordForm
        opened={recordFormOpened}
        onClose={closeRecordForm}
        record={selectedRecord}
        onSubmit={selectedRecord ? handleUpdateRecord : handleCreateRecord}
        patients={patients}
        doctors={doctors}
      />

      {/* Medical Record Details Modal */}
      {selectedRecord && (
        <MedicalRecordDetails
          opened={detailsOpened}
          onClose={closeDetails}
          record={selectedRecord}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
        />
      )}
    </Layout>
  );
}

export default EmrPage;
