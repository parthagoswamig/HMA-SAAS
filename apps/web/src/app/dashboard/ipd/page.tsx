'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
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
  // Avatar,
  ActionIcon,
  SimpleGrid,
  ThemeIcon,
  // NumberInput,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import ipdService from '../../../services/ipd.service';
// import { LineChart, BarChart, DonutChart, AreaChart } from '@mantine/charts';
import {
  IconActivity,
  // IconArrowDown,
  // IconArrowUp,
  // IconSettings,
  IconBed,
  IconCalendar,
  IconChartBar,
  IconCheck,
  // IconUpload,
  IconEdit,
  IconEye,
  IconFileText,
  // IconHexagon,
  // IconMessage,
  // IconLink,
  // IconServerCog,
  // IconCloudComputing,
  // IconDeviceAnalytics,
  // IconChartPie,
  IconPlus,
  IconRefresh,
  IconSearch,
  // IconTrash,
  IconUsers,
  IconBedOff,
  IconAlertTriangle,
  IconCurrencyRupee,
  IconBuilding,
} from '@tabler/icons-react';

// Types
interface IPDPatient {
  id: string;
  admissionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  bedNumber: string;
  wardName: string;
  roomNumber: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  admissionType: 'emergency' | 'elective' | 'transfer';
  status: 'admitted' | 'critical' | 'stable' | 'discharged' | 'transferred';
  primaryDoctor: string;
  consultingDoctors: string[];
  assignedNurse: string;
  diagnosis: string;
  procedure?: string;
  insurance: {
    provider: string;
    policyNumber: string;
    approvalAmount: number;
  } | null;
  lengthOfStay: number;
  dailyCharges: number;
  totalCharges: number;
  pendingAmount: number;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    painScale: number;
    lastUpdated: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate: string;
    endDate?: string;
  }>;
  nursingNotes: Array<{
    timestamp: string;
    note: string;
    nurseName: string;
  }>;
}

interface Bed {
  id: string;
  bedNumber: string;
  wardName: string;
  roomNumber: string;
  bedType: 'general' | 'private' | 'icu' | 'hdu' | 'isolation';
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
  patientId?: string;
  patientName?: string;
  dailyRate: number;
  amenities: string[];
  lastCleaned?: string;
}

interface Ward {
  id: string;
  name: string;
  department: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  nursesOnDuty: number;
  headNurse: string;
}

// Mock data removed - using API data only
const mockIPDPatients: IPDPatient[] = [];
const mockBeds: Bed[] = [];
const mockWards: Ward[] = [];

const IPDManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<IPDPatient | null>(null);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  // API state
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [ipdStatsAPI, setIpdStatsAPI] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [admissionModalOpened, { open: openAdmissionModal, close: closeAdmissionModal }] = useDisclosure(false);

  const fetchAdmissions = useCallback(async () => {
    try {
      // TODO: Backend admissions API not implemented yet
      // For now, using empty array
      console.log('ℹ️ [INFO] Admissions API not available yet');
      setAdmissions([]);
    } catch (err: any) {
      console.warn('Error fetching admissions:', err.response?.data?.message || err.message);
      setAdmissions([]);
    }
  }, []);

  const fetchWards = useCallback(async () => {
    try {
      const response = await ipdService.getWards({});
      console.log('✅ [DEBUG] Wards API response:', response);
      const wardsList = response.data?.items || [];
      setWards(wardsList);
    } catch (err: any) {
      console.warn('Error fetching wards:', err.response?.data?.message || err.message);
      setWards([]);
    }
  }, []);

  const fetchBeds = useCallback(async () => {
    try {
      const response = await ipdService.getBeds({});
      console.log('✅ [DEBUG] Beds API response:', response);
      const bedsList = response.data?.items || [];
      setBeds(bedsList);
    } catch (err: any) {
      console.warn('Error fetching beds:', err.response?.data?.message || err.message);
      setBeds([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const stats = await ipdService.getStats();
      console.log('✅ [DEBUG] IPD Stats API response:', stats);
      setIpdStatsAPI(stats.data);
    } catch (err: any) {
      console.warn('Error fetching IPD stats:', err.response?.data?.message || err.message);
      setIpdStatsAPI(null);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchAdmissions(), fetchStats(), fetchWards(), fetchBeds()]);
    } catch (err: any) {
      console.error('Error loading IPD data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load IPD data');
    } finally {
      setLoading(false);
    }
  }, [fetchAdmissions, fetchStats, fetchWards, fetchBeds]);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Modal handlers
  const handleViewPatient = (patient: IPDPatient) => {
    setSelectedPatient(patient);
  };

  const handleViewBed = (bed: Bed) => {
    setSelectedBed(bed);
  };

  // Filter patients
  const filteredPatients = useMemo(() => {
    const patientsList = admissions.length > 0 ? admissions : [];
    return patientsList.filter((patient: any) => {
      const matchesSearch =
        patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWard = !selectedWard || patient.wardName === selectedWard;
      const matchesStatus = !selectedStatus || patient.status === selectedStatus;

      return matchesSearch && matchesWard && matchesStatus;
    });
  }, [admissions, searchQuery, selectedWard, selectedStatus]);

  // Quick stats from API
  const ipdStats = {
    totalPatients: admissions.length || 0,
    totalBeds: ipdStatsAPI?.beds?.total || 0,
    occupiedBeds: ipdStatsAPI?.beds?.occupied || 0,
    availableBeds: ipdStatsAPI?.beds?.available || 0,
    criticalPatients: admissions.filter((a: any) => a.status === 'critical').length || 0,
    averageLOS: 0, // TODO: Calculate from admissions
    occupancyRate: ipdStatsAPI?.occupancyRate || 0,
    totalRevenue: 0, // TODO: Calculate from admissions
  };

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <Title order={2} className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">IPD Management</Title>
          <Text c="dimmed" className="text-xs sm:text-sm">
            Inpatient department care and bed management system
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={fetchAllData}
            loading={loading}
            className="w-full sm:w-auto"
            size="sm"
          >
            Refresh Status
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAdmissionModal}
            className="w-full sm:w-auto"
            size="sm"
          >
            New Admission
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 8 }} spacing={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }} mb={{ base: 'md', sm: 'lg', md: 'xl' }}>
        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Patients
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.totalPatients}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconUsers size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Beds
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.totalBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconBed size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Occupied
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.occupiedBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="red">
              <IconBedOff size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Available
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.availableBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="teal">
              <IconCheck size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Critical
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.criticalPatients}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Avg LOS
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.averageLOS}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <IconCalendar size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Occupancy
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.occupancyRate}%
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
              <IconChartBar size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Revenue
              </Text>
              <Text size="xl" fw={700}>
                ₹{(ipdStats.totalRevenue / 100000).toFixed(2)}L
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconCurrencyRupee size={20} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab as any}>
        <Tabs.List mb="md">
          <Tabs.Tab value="patients" leftSection={<IconUsers size={16} />}>
            IPD Patients
          </Tabs.Tab>
          <Tabs.Tab value="beds" leftSection={<IconBed size={16} />}>
            Bed Status
          </Tabs.Tab>
          <Tabs.Tab value="wards" leftSection={<IconBuilding size={16} />}>
            Ward Management
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* IPD Patients Tab */}
        <Tabs.Panel value="patients">
          <Card padding="lg" radius="md" withBorder>
            {/* Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search patients..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Ward"
                data={[
                  { value: '', label: 'All Wards' },
                  { value: 'ICU', label: 'ICU' },
                  { value: 'General Ward', label: 'General Ward' },
                  { value: 'Private Ward', label: 'Private Ward' },
                ]}
                value={selectedWard}
                onChange={setSelectedWard as any}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: '', label: 'All Status' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'stable', label: 'Stable' },
                  { value: 'recovering', label: 'Recovering' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus as any}
                clearable
              />
            </Group>

            {/* Patients Table */}
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Admission #</Table.Th>
                  <Table.Th>Patient</Table.Th>
                  <Table.Th>Bed/Ward</Table.Th>
                  <Table.Th>Doctor</Table.Th>
                  <Table.Th>Admission Date</Table.Th>
                  <Table.Th>LOS</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Charges</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPatients.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={9}>
                      <EmptyState
                        icon={<IconBed size={48} />}
                        title="No IPD patients found"
                        description={
                          searchQuery || selectedWard || selectedStatus
                            ? 'No patients match your search criteria. Try adjusting your filters.'
                            : 'No patients admitted yet. Add your first IPD admission to get started.'
                        }
                        size="sm"
                      />
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredPatients.map((patient: any) => (
                    <Table.Tr key={patient.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconFileText size={16} />
                          <Text size="sm" fw={500}>
                            {patient.admissionNumber}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>
                            {patient.patientName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {patient.patientAge}y, {patient.patientGender}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm">{patient.bedNumber}</Text>
                          <Text size="xs" c="dimmed">
                            {patient.wardName}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{patient.primaryDoctor}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(patient.admissionDate).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{patient.lengthOfStay} days</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            patient.status === 'critical'
                              ? 'red'
                              : patient.status === 'stable'
                                ? 'green'
                                : patient.status === 'recovering'
                                  ? 'blue'
                                  : 'gray'
                          }
                          variant="light"
                        >
                          {patient.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>
                            ₹{patient.totalCharges.toLocaleString()}
                          </Text>
                          {patient.pendingAmount > 0 && (
                            <Text size="xs" c="red">
                              Pending: ₹{patient.pendingAmount.toLocaleString()}
                            </Text>
                          )}
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon variant="light" color="green">
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {/* Bed Status Tab */}
        <Tabs.Panel value="beds">
          <Card padding="lg" radius="md" withBorder>
            <Title order={3} mb="lg">
              Bed Status Overview
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
              {beds.length === 0 ? (
                <Text c="dimmed">No bed data available</Text>
              ) : (
                beds.map((bed) => (
                    <Card
                      key={bed.id}
                      padding="lg"
                      radius="md"
                      withBorder
                      onClick={() => handleViewBed(bed)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Group justify="space-between" mb="md">
                        <div>
                          <Text size="lg" fw={700}>
                            {bed.bedNumber}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {bed.wardName}
                          </Text>
                        </div>
                        <Badge
                          color={
                            bed.status === 'occupied'
                              ? 'red'
                              : bed.status === 'vacant'
                                ? 'green'
                                : 'yellow'
                          }
                          variant="filled"
                        >
                          {bed.status}
                        </Badge>
                      </Group>
                      {bed.patientName && (
                        <Text size="sm" mb="xs">
                          Patient: {bed.patientName}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        Rate: ₹{bed.dailyRate}/day
                      </Text>
                    </Card>
                  )
                )
              )}
            </SimpleGrid>
          </Card>
        </Tabs.Panel>

        {/* Ward Management Tab */}
        <Tabs.Panel value="wards">
          <Card padding="lg" radius="md" withBorder>
            <Title order={3} mb="lg">
              Ward Overview
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {wards.length === 0 ? (
                <Text c="dimmed">No ward data available</Text>
              ) : (
                wards.map((ward) => (
                    <Card key={ward.id} padding="lg" radius="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <div>
                          <Text size="lg" fw={700}>
                            {ward.name}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {ward.department}
                          </Text>
                        </div>
                      </Group>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm">Total Beds:</Text>
                          <Text size="sm" fw={500}>
                            {ward.totalBeds}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">Occupied:</Text>
                          <Text size="sm" fw={500} c="red">
                            {ward.occupiedBeds}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">Available:</Text>
                          <Text size="sm" fw={500} c="green">
                            {ward.availableBeds}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">Nurses on Duty:</Text>
                          <Text size="sm" fw={500}>
                            {ward.nursesOnDuty}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed" mt="xs">
                          Head Nurse: {ward.headNurse}
                        </Text>
                      </Stack>
                    </Card>
                  )
                )
              )}
            </SimpleGrid>
          </Card>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Bed Statistics */}
            <Card padding="md" radius="md" withBorder>
              <Title order={4} mb="md">Bed Statistics</Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">Total Beds</Text>
                  <Badge color="blue" size="lg">{ipdStats.totalBeds}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Occupied</Text>
                  <Badge color="red" size="lg">{ipdStats.occupiedBeds}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Available</Text>
                  <Badge color="green" size="lg">{ipdStats.availableBeds}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Maintenance</Text>
                  <Badge color="orange" size="lg">{ipdStatsAPI?.beds?.maintenance || 0}</Badge>
                </Group>
              </Stack>
            </Card>

            {/* Ward Statistics */}
            <Card padding="md" radius="md" withBorder>
              <Title order={4} mb="md">Ward Statistics</Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">Total Wards</Text>
                  <Badge color="blue" size="lg">{wards.length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Active Wards</Text>
                  <Badge color="green" size="lg">{wards.filter((w: any) => w.isActive).length}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Occupancy Rate</Text>
                  <Badge color="cyan" size="lg">{ipdStats.occupancyRate.toFixed(1)}%</Badge>
                </Group>
              </Stack>
            </Card>

            {/* Patient Statistics */}
            <Card padding="md" radius="md" withBorder>
              <Title order={4} mb="md">Patient Statistics</Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">Total Patients</Text>
                  <Badge color="blue" size="lg">{ipdStats.totalPatients}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Critical</Text>
                  <Badge color="red" size="lg">{ipdStats.criticalPatients}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Stable</Text>
                  <Badge color="green" size="lg">{admissions.filter((a: any) => a.status === 'stable').length}</Badge>
                </Group>
              </Stack>
            </Card>

            {/* Ward-wise Distribution */}
            <Card padding="md" radius="md" withBorder>
              <Title order={4} mb="md">Ward-wise Bed Distribution</Title>
              <Stack gap="md">
                {wards.map((ward: any) => {
                  const wardBeds = beds.filter((b: any) => b.wardId === ward.id);
                  const occupied = wardBeds.filter((b: any) => b.status === 'OCCUPIED').length;
                  return (
                    <Group key={ward.id} justify="space-between">
                      <Text size="sm">{ward.name}</Text>
                      <Badge color="blue" size="lg">{occupied}/{wardBeds.length}</Badge>
                    </Group>
                  );
                })}
                {wards.length === 0 && (
                  <Text c="dimmed" ta="center" size="sm">No ward data available</Text>
                )}
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Modal
          opened={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Details - ${selectedPatient.admissionNumber}`}
          size="xl"
        >
          <Stack gap="md">
            <div>
              <Text size="lg" fw={700}>
                {selectedPatient.patientName}
              </Text>
              <Text size="sm" c="dimmed">
                {selectedPatient.patientAge}y, {selectedPatient.patientGender}
              </Text>
            </div>
            <Group>
              <Text size="sm">
                <strong>Bed:</strong> {selectedPatient.bedNumber}
              </Text>
              <Text size="sm">
                <strong>Ward:</strong> {selectedPatient.wardName}
              </Text>
            </Group>
            <Text size="sm">
              <strong>Diagnosis:</strong> {selectedPatient.diagnosis}
            </Text>
            <Text size="sm">
              <strong>Doctor:</strong> {selectedPatient.primaryDoctor}
            </Text>
            <Group>
              <Button onClick={() => setSelectedPatient(null)}>Close</Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {/* New Admission Modal */}
      <Modal
        opened={admissionModalOpened}
        onClose={closeAdmissionModal}
        title="New IPD Admission"
        size="lg"
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            ℹ️ IPD Admissions API is not yet implemented in the backend. This form will be functional once the admissions module is added.
          </Text>
          <SimpleGrid cols={2} spacing="md">
            <TextInput label="Patient ID" placeholder="Enter patient ID" required />
            <Select
              label="Ward"
              placeholder="Select ward"
              data={wards.map(w => ({ value: w.id, label: w.name }))}
              searchable
              required
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Bed"
              placeholder="Select bed"
              data={beds.filter(b => b.status === 'AVAILABLE').map(b => ({ 
                value: b.id, 
                label: `${b.bedNumber} - ${b.ward?.name || 'Unknown Ward'}` 
              }))}
              searchable
              required
            />
            <Select
              label="Admission Type"
              placeholder="Select type"
              data={[
                { value: 'emergency', label: 'Emergency' },
                { value: 'elective', label: 'Elective' },
                { value: 'transfer', label: 'Transfer' },
              ]}
              required
            />
          </SimpleGrid>
          <TextInput label="Primary Doctor" placeholder="Enter doctor name" required />
          <TextInput label="Diagnosis" placeholder="Enter diagnosis" required />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeAdmissionModal}>Cancel</Button>
            <Button 
              onClick={() => {
                notifications.show({
                  title: 'Not Implemented',
                  message: 'IPD Admissions API will be available soon',
                  color: 'blue',
                });
                closeAdmissionModal();
              }}
            >
              Admit Patient
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default IPDManagement;


