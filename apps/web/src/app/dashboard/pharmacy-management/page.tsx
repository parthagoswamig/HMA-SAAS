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
  ActionIcon,
  Menu,
  Stack,
  Divider,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import {
  MantineDonutChart,
  SimpleBarChart,
  SimpleLineChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconPill,
  IconAlertTriangle,
  IconX,
  IconDotsVertical,
  IconChartBar,
  IconDownload,
  IconBarcode,
  IconBottle,
  IconShieldCheck,
  IconFileText,
  IconPackage,
  IconCash,
  IconActivity,
} from '@tabler/icons-react';

// Import types (simplified for now)
interface Medication {
  id: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  status: string;
  batchNumber?: string;
  expiryDate?: string;
  location?: string;
}

interface Prescription {
  id: string;
  prescriptionId: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: string;
  totalAmount: number;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }>;
}

// Mock data (simplified for now)

const PharmacyManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'medications'
    | 'prescriptions'
    | 'inventory'
    | 'dispensing'
    | 'interactions'
    | 'analytics'
  >('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  // Modal states
  const [medicationDetailOpened, { open: openMedicationDetail, close: closeMedicationDetail }] =
    useDisclosure(false);
  const [
    prescriptionDetailOpened,
    { open: openPrescriptionDetail, close: closePrescriptionDetail },
  ] = useDisclosure(false);
  const [addMedicationOpened, { open: openAddMedication, close: closeAddMedication }] =
    useDisclosure(false);
  const [newPrescriptionOpened, { open: openNewPrescription, close: closeNewPrescription }] =
    useDisclosure(false);

  // Filter medications
  const filteredMedications = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (med) => {
        const matchesSearch =
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || med.category === selectedCategory;
        const matchesStatus = !selectedStatus || med.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      }
    );
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (prescription) => {
        const matchesSearch =
          prescription.prescriptionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !selectedStatus || prescription.status === selectedStatus;
        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, selectedStatus]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
      case 'dispensed':
      case 'completed':
      case 'paid':
        return 'green';
      case 'low_stock':
      case 'pending':
      case 'verified':
        return 'orange';
      case 'out_of_stock':
      case 'cancelled':
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Analgesic: 'blue',
      Antibiotic: 'green',
      Cardiovascular: 'red',
      Antidiabetic: 'purple',
      Respiratory: 'cyan',
      Neurological: 'pink',
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  const handleViewMedication = (medication: any) => {
    setSelectedMedication(medication);
    openMedicationDetail();
  };

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    openPrescriptionDetail();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Medications',
      value: 0 /* TODO: Fetch from API */,
      icon: IconPill,
      color: 'blue',
      trend: '+5.2%',
    },
    {
      title: 'In Stock Items',
      value: 0 /* TODO: Fetch from API */,
      icon: IconPackage,
      color: 'green',
      trend: '+2.1%',
    },
    {
      title: 'Low Stock Alerts',
      value: 0 /* TODO: Fetch from API */,
      icon: IconAlertTriangle,
      color: 'orange',
      trend: '-8.5%',
    },
    {
      title: 'Out of Stock',
      value: 0 /* TODO: Fetch from API */,
      icon: IconX,
      color: 'red',
      trend: '-15.3%',
    },
    {
      title: 'Total Prescriptions',
      value: 0 /* TODO: Fetch from API */,
      icon: IconFileText,
      color: 'indigo',
      trend: '+7.8%',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(0 /* TODO: Fetch from API */ / 100000).toFixed(1)}L`,
      icon: IconCash,
      color: 'teal',
      trend: '+12.4%',
    },
  ];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Pharmacy Management</Title>
          <Text c="dimmed" size="sm">
            Manage medications, prescriptions, inventory, and dispensing operations
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddMedication}>
            Add Medication
          </Button>
          <Button
            variant="light"
            leftSection={<IconFileText size={16} />}
            onClick={openNewPrescription}
          >
            New Prescription
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} mb="lg">
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

      {/* Main Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as typeof activeTab)}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="medications" leftSection={<IconPill size={16} />}>
            Medications
          </Tabs.Tab>
          <Tabs.Tab value="prescriptions" leftSection={<IconFileText size={16} />}>
            Prescriptions
          </Tabs.Tab>
          <Tabs.Tab value="inventory" leftSection={<IconPackage size={16} />}>
            Inventory
          </Tabs.Tab>
          <Tabs.Tab value="dispensing" leftSection={<IconBottle size={16} />}>
            Dispensing
          </Tabs.Tab>
          <Tabs.Tab value="interactions" leftSection={<IconShieldCheck size={16} />}>
            Drug Interactions
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconActivity size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Pharmacy Dashboard
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Medications by Category
                </Title>
                <MantineDonutChart
                  data={[]}
                  size={160}
                  thickness={30}
                  withLabels
                />
              </Card>
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Expiring Medications
                </Title>
                <Stack gap="sm">
                  {/* TODO: Display expiring medications when data is available */}
                </Stack>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Medications Tab */}
        <Tabs.Panel value="medications">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group mb="md">
              <TextInput
                placeholder="Search medications..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Category"
                data={[
                  { value: 'Analgesic', label: 'Analgesic' },
                  { value: 'Antibiotic', label: 'Antibiotic' },
                  { value: 'Cardiovascular', label: 'Cardiovascular' },
                  { value: 'Antidiabetic', label: 'Antidiabetic' },
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'in_stock', label: 'In Stock' },
                  { value: 'low_stock', label: 'Low Stock' },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Medication</Table.Th>
                    <Table.Th>Generic Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Stock</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredMedications.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <EmptyState
                          icon={<IconPill size={48} />}
                          title="No pharmacy records"
                          description="Manage pharmacy operations"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredMedications.map((medication) => (
                      <Table.Tr key={medication.id}>
                        <Table.Td>
                          <Group>
                            <ThemeIcon
                              color={getCategoryColor(medication.category)}
                              variant="light"
                            >
                              <IconPill size={16} />
                            </ThemeIcon>
                            <div>
                              <Text fw={500}>{medication.name}</Text>
                              <Text size="xs" c="dimmed">
                                {medication.manufacturer}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>{medication.genericName || 'N/A'}</Table.Td>
                        <Table.Td>
                          <Badge color={getCategoryColor(medication.category)} variant="light">
                            {medication.category}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            fw={medication.currentStock <= medication.minimumStock ? 700 : 500}
                            c={
                              medication.currentStock <= medication.minimumStock ? 'red' : undefined
                            }
                          >
                            {medication.currentStock}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Min: {medication.minimumStock}
                          </Text>
                        </Table.Td>
                        <Table.Td>₹{medication.unitPrice}</Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(medication.status)} variant="light">
                            {medication.status.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              color="blue"
                              variant="subtle"
                              onClick={() => handleViewMedication(medication)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon color="green" variant="subtle">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <Menu>
                              <Menu.Target>
                                <ActionIcon color="gray" variant="subtle">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconBarcode size={14} />}>
                                  Print Barcode
                                </Menu.Item>
                                <Menu.Item leftSection={<IconDownload size={14} />}>
                                  Export Details
                                </Menu.Item>
                                <Menu.Divider />
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

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Pharmacy Analytics
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Revenue Trend
                </Title>
                <SimpleLineChart
                  data={[
                    { month: 'Jan', revenue: 280000 },
                    { month: 'Feb', revenue: 295000 },
                    { month: 'Mar', revenue: 320000 },
                    { month: 'Apr', revenue: 315000 },
                    { month: 'May', revenue: 340000 },
                    { month: 'Jun', revenue: 325000 },
                  ]}
                  dataKey="month"
                  series={[{ name: 'revenue', color: 'blue.6', label: 'Revenue' }]}
                />
              </Card>
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Top Selling Medications
                </Title>
                <SimpleBarChart
                  data={[
                    { medication: 'Paracetamol', sales: 1500 },
                    { medication: 'Amoxicillin', sales: 1200 },
                    { medication: 'Metformin', sales: 800 },
                    { medication: 'Amlodipine', sales: 600 },
                    { medication: 'Omeprazole', sales: 500 },
                  ]}
                  dataKey="medication"
                  series={[{ name: 'sales', color: 'teal.6' }]}
                />
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Prescriptions Tab */}
        <Tabs.Panel value="prescriptions">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Prescriptions</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openNewPrescription}>
                New Prescription
              </Button>
            </Group>
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Prescription ID</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Doctor</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Medications</Table.Th>
                    <Table.Th>Total</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredPrescriptions.map((prescription) => (
                    <Table.Tr key={prescription.id}>
                      <Table.Td>
                        <Text fw={500}>{prescription.prescriptionId}</Text>
                      </Table.Td>
                      <Table.Td>{prescription.patientName}</Table.Td>
                      <Table.Td>{prescription.doctorName}</Table.Td>
                      <Table.Td>{prescription.date}</Table.Td>
                      <Table.Td>{prescription.medications.length} items</Table.Td>
                      <Table.Td>₹{prescription.totalAmount}</Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(prescription.status)} variant="light">
                          {prescription.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            color="blue"
                            variant="subtle"
                            onClick={() => handleViewPrescription(prescription)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon color="green" variant="subtle">
                            <IconEdit size={16} />
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

        {/* Inventory Tab */}
        <Tabs.Panel value="inventory">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Inventory Management
            </Title>
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredMedications.map((medication) => (
                <Card key={medication.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <ThemeIcon color={getCategoryColor(medication.category)} variant="light">
                      <IconPill size={20} />
                    </ThemeIcon>
                    <Badge color={getStatusColor(medication.status)} variant="light">
                      {medication.status.replace('_', ' ')}
                    </Badge>
                  </Group>
                  <Title order={5} mb="xs">
                    {medication.name}
                  </Title>
                  <Text size="sm" c="dimmed" mb="md">
                    {medication.genericName}
                  </Text>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Current Stock
                      </Text>
                      <Text size="sm" fw={600}>
                        {medication.currentStock}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Min Stock
                      </Text>
                      <Text size="sm" c="orange">
                        {medication.minimumStock}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Location
                      </Text>
                      <Text size="sm">{medication.location}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Expiry
                      </Text>
                      <Text size="sm">{medication.expiryDate}</Text>
                    </Group>
                  </Stack>
                  <Group justify="space-between" mt="md">
                    <Button variant="light" size="xs" fullWidth>
                      Adjust Stock
                    </Button>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Dispensing Tab */}
        <Tabs.Panel value="dispensing">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Medication Dispensing
            </Title>
            <Stack gap="lg">
              {filteredPrescriptions
                .filter((p) => p.status === 'pending')
                .map((prescription) => (
                  <Card key={prescription.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {prescription.prescriptionId}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Patient: {prescription.patientName}
                        </Text>
                      </div>
                      <Badge color="orange" variant="light">
                        Pending
                      </Badge>
                    </Group>
                    <Stack gap="sm">
                      {prescription.medications.map((med, index) => (
                        <Group
                          key={index}
                          justify="space-between"
                          p="sm"
                          style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                        >
                          <div>
                            <Text size="sm" fw={500}>
                              {med.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {med.dosage} - {med.frequency}
                            </Text>
                          </div>
                          <Text size="sm" fw={600}>
                            Qty: {med.quantity}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                    <Group justify="flex-end" mt="md">
                      <Button variant="light">View Details</Button>
                      <Button>Dispense</Button>
                    </Group>
                  </Card>
                ))}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Drug Interactions Tab */}
        <Tabs.Panel value="interactions">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Drug Interaction Checker
            </Title>
            <Card padding="lg" radius="md" withBorder mb="lg">
              <Stack gap="md">
                <Select
                  label="First Medication"
                  placeholder="Select medication"
                  data={[].map(
                    /* TODO: Fetch from API */ (med) => ({
                      value: med.id,
                      label: `${med.name} (${med.genericName || 'N/A'})`,
                    })
                  )}
                  searchable
                />
                <Select
                  label="Second Medication"
                  placeholder="Select medication"
                  data={[].map(
                    /* TODO: Fetch from API */ (med) => ({
                      value: med.id,
                      label: `${med.name} (${med.genericName || 'N/A'})`,
                    })
                  )}
                  searchable
                />
                <Button fullWidth leftSection={<IconShieldCheck size={16} />}>
                  Check Interactions
                </Button>
              </Stack>
            </Card>
            <Text c="dimmed" ta="center">
              Select two medications to check for potential drug interactions
            </Text>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Modals */}
      {/* Medication Detail Modal */}
      <Modal
        opened={medicationDetailOpened}
        onClose={closeMedicationDetail}
        title="Medication Details"
        size="lg"
      >
        {selectedMedication && (
          <Stack gap="md">
            <Group>
              <ThemeIcon
                color={getCategoryColor(selectedMedication.category)}
                size="xl"
                variant="light"
              >
                <IconPill size={24} />
              </ThemeIcon>
              <div>
                <Title order={3}>{selectedMedication.name}</Title>
                <Text c="dimmed">{selectedMedication.genericName}</Text>
                <Badge color={getStatusColor(selectedMedication.status)} variant="light" mt="xs">
                  {selectedMedication.status.replace('_', ' ')}
                </Badge>
              </div>
            </Group>
            <Divider />
            <SimpleGrid cols={2}>
              <Text size="sm">
                <strong>Manufacturer:</strong> {selectedMedication.manufacturer}
              </Text>
              <Text size="sm">
                <strong>Category:</strong> {selectedMedication.category}
              </Text>
              <Text size="sm">
                <strong>Unit Price:</strong> ₹{selectedMedication.unitPrice}
              </Text>
              <Text size="sm">
                <strong>Current Stock:</strong> {selectedMedication.currentStock}
              </Text>
              <Text size="sm">
                <strong>Min Stock:</strong> {selectedMedication.minimumStock}
              </Text>
              <Text size="sm">
                <strong>Batch:</strong> {selectedMedication.batchNumber}
              </Text>
              <Text size="sm">
                <strong>Expiry:</strong> {selectedMedication.expiryDate}
              </Text>
              <Text size="sm">
                <strong>Location:</strong> {selectedMedication.location}
              </Text>
            </SimpleGrid>
            <Group justify="flex-end">
              <Button variant="light" onClick={closeMedicationDetail}>
                Close
              </Button>
              <Button>Edit Medication</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Add Medication Modal */}
      <Modal
        opened={addMedicationOpened}
        onClose={closeAddMedication}
        title="Add New Medication"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput label="Medication Name" placeholder="Enter medication name" required />
            <TextInput label="Generic Name" placeholder="Enter generic name" />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <TextInput label="Manufacturer" placeholder="Enter manufacturer" />
            <Select
              label="Category"
              placeholder="Select category"
              data={[
                { value: 'Analgesic', label: 'Analgesic' },
                { value: 'Antibiotic', label: 'Antibiotic' },
                { value: 'Cardiovascular', label: 'Cardiovascular' },
                { value: 'Antidiabetic', label: 'Antidiabetic' },
                { value: 'Respiratory', label: 'Respiratory' },
                { value: 'Neurological', label: 'Neurological' },
              ]}
              required
            />
          </SimpleGrid>
          <SimpleGrid cols={3}>
            <TextInput label="Unit Price (₹)" placeholder="0.00" type="number" required />
            <TextInput label="Current Stock" placeholder="0" type="number" required />
            <TextInput label="Minimum Stock" placeholder="0" type="number" required />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <TextInput label="Batch Number" placeholder="Enter batch number" />
            <TextInput label="Expiry Date" placeholder="YYYY-MM-DD" type="date" />
          </SimpleGrid>
          <TextInput label="Storage Location" placeholder="e.g., A1-B2" />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddMedication}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Add medication logic here
                closeAddMedication();
              }}
            >
              Add Medication
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* New Prescription Modal */}
      <Modal
        opened={newPrescriptionOpened}
        onClose={closeNewPrescription}
        title="Create New Prescription"
        size="xl"
      >
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput label="Patient Name" placeholder="Search or enter patient name" required />
            <TextInput label="Doctor Name" placeholder="Search or enter doctor name" required />
          </SimpleGrid>
          <TextInput label="Prescription ID" placeholder="Auto-generated" disabled />
          <Divider label="Medications" labelPosition="center" />
          <Stack gap="sm">
            <Group>
              <Select
                label="Medication"
                placeholder="Select medication"
                data={[].map(
                  /* TODO: Fetch from API */ (med) => ({
                    value: med.id,
                    label: `${med.name} (${med.genericName || 'N/A'})`,
                  })
                )}
                style={{ flex: 1 }}
              />
              <Button variant="light" leftSection={<IconPlus size={16} />} mt="xl">
                Add
              </Button>
            </Group>
          </Stack>
          <SimpleGrid cols={4}>
            <TextInput label="Dosage" placeholder="e.g., 500mg" />
            <TextInput label="Frequency" placeholder="e.g., Twice daily" />
            <TextInput label="Duration" placeholder="e.g., 5 days" />
            <TextInput label="Quantity" placeholder="0" type="number" />
          </SimpleGrid>
          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewPrescription}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Create prescription logic here
                closeNewPrescription();
              }}
            >
              Create Prescription
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Prescription Detail Modal */}
      <Modal
        opened={prescriptionDetailOpened}
        onClose={closePrescriptionDetail}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={600} size="lg">
                  {selectedPrescription.prescriptionId}
                </Text>
                <Text size="sm" c="dimmed">
                  Date: {selectedPrescription.date}
                </Text>
              </div>
              <Badge color={getStatusColor(selectedPrescription.status)} variant="light" size="lg">
                {selectedPrescription.status}
              </Badge>
            </Group>
            <Divider />
            <SimpleGrid cols={2}>
              <div>
                <Text size="sm" fw={500}>
                  Patient
                </Text>
                <Text size="sm">{selectedPrescription.patientName}</Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Doctor
                </Text>
                <Text size="sm">{selectedPrescription.doctorName}</Text>
              </div>
            </SimpleGrid>
            <Divider label="Medications" labelPosition="center" />
            <Stack gap="sm">
              {selectedPrescription.medications.map((med: any, index: number) => (
                <Card key={index} padding="sm" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{med.name}</Text>
                      <Text size="xs" c="dimmed">
                        {med.dosage} • {med.frequency} • {med.duration}
                      </Text>
                    </div>
                    <Text fw={600}>Qty: {med.quantity}</Text>
                  </Group>
                </Card>
              ))}
            </Stack>
            <Group justify="space-between">
              <Text fw={600}>Total Amount:</Text>
              <Text fw={700} size="xl">
                ₹{selectedPrescription.totalAmount}
              </Text>
            </Group>
            <Group justify="flex-end">
              <Button variant="light" onClick={closePrescriptionDetail}>
                Close
              </Button>
              <Button>Print Prescription</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default PharmacyManagement;
