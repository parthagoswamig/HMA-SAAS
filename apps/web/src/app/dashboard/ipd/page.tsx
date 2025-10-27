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
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import ipdService from '../../../services/ipd.service';
// Forms are inline in modals - no separate form components needed
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
  const [ipdStatsAPI, setIpdStatsAPI] = useState<any>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [admissionOpened, { open: openAdmission, close: closeAdmission }] = useDisclosure(false);
  const [editPatientOpened, { open: openEditPatient, close: closeEditPatient }] = useDisclosure(false);
  const [dischargeOpened, { open: openDischarge, close: closeDischarge }] = useDisclosure(false);

  // Form states
  const [admissionForm, setAdmissionForm] = useState({
    patientId: '',
    wardId: '',
    bedId: '',
    admissionType: 'elective',
    diagnosis: '',
    notes: '',
  });

  const fetchBeds = useCallback(async () => {
    try {
      const response = await ipdService.getBeds();
      const bedsData = response.data?.items || [];
      
      // Map to Bed interface
      const mappedBeds: Bed[] = bedsData.map((bed: any) => ({
        id: bed.id,
        bedNumber: bed.bedNumber,
        wardName: bed.ward?.name || 'Unknown',
        roomNumber: bed.ward?.location || 'N/A',
        bedType: 'general',
        status: bed.status?.toLowerCase() || 'vacant',
        dailyRate: 1000,
        amenities: [],
        lastCleaned: bed.updatedAt,
      }));
      
      setBeds(mappedBeds);
    } catch (err: any) {
      console.warn('Error fetching beds:', err.response?.data?.message || err.message);
      setBeds([]);
    }
  }, []);

  const fetchWards = useCallback(async () => {
    try {
      const response = await ipdService.getWards();
      const wardsData = response.data?.items || [];
      
      // Map to Ward interface
      const mappedWards: Ward[] = wardsData.map((ward: any) => {
        const totalBeds = ward._count?.beds || 0;
        const occupiedBeds = ward.beds?.filter((b: any) => b.status === 'OCCUPIED').length || 0;
        
        return {
          id: ward.id,
          name: ward.name,
          department: ward.description || 'General',
          totalBeds,
          occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          maintenanceBeds: ward.beds?.filter((b: any) => b.status === 'MAINTENANCE').length || 0,
          nursesOnDuty: 0,
          headNurse: 'N/A',
        };
      });
      
      setWards(mappedWards);
    } catch (err: any) {
      console.warn('Error fetching wards:', err.response?.data?.message || err.message);
      setWards([]);
    }
  }, []);

  const fetchAdmissions = useCallback(async () => {
    try {
      const response = await ipdService.getAdmissions();
      const admissionsData = response.data?.items || [];
      setAdmissions(admissionsData);
    } catch (err: any) {
      console.warn('Error fetching admissions:', err.response?.data?.message || err.message);
      setAdmissions([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const stats = await ipdService.getStats();
      setIpdStatsAPI(stats);
    } catch (err: any) {
      console.warn('Error fetching IPD stats:', err.response?.data?.message || err.message);
      setIpdStatsAPI(null);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchAdmissions(), fetchStats(), fetchBeds(), fetchWards()]);
    } catch (err: any) {
      console.error('Error loading IPD data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load IPD data');
    } finally {
      setLoading(false);
    }
  }, [fetchAdmissions, fetchStats, fetchBeds, fetchWards]);

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

  const handleEditPatient = (patient: IPDPatient) => {
    setSelectedPatient(patient);
    openEditPatient();
  };

  const handleDischargePatient = (patient: IPDPatient) => {
    setSelectedPatient(patient);
    openDischarge();
  };

  const handleNewAdmission = () => {
    setAdmissionForm({
      patientId: '',
      wardId: '',
      bedId: '',
      admissionType: 'elective',
      diagnosis: '',
      notes: '',
    });
    openAdmission();
  };

  const handleSubmitAdmission = async () => {
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!admissionForm.patientId || !admissionForm.wardId || !admissionForm.bedId || !admissionForm.diagnosis) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please fill in all required fields',
          color: 'red',
        });
        return;
      }

      // Call admission API
      await ipdService.createAdmission({
        patientId: admissionForm.patientId,
        wardId: admissionForm.wardId,
        bedId: admissionForm.bedId,
        admissionType: admissionForm.admissionType.toUpperCase() as any,
        diagnosis: admissionForm.diagnosis,
        notes: admissionForm.notes,
      });
      
      notifications.show({
        title: 'Success',
        message: 'Patient admitted successfully',
        color: 'green',
      });
      
      closeAdmission();
      fetchAllData();
    } catch (err: any) {
      console.error('Error creating admission:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to create admission',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBedStatus = async (bedId: string, status: string) => {
    try {
      await ipdService.updateBedStatus(bedId, { status: status as any });
      
      notifications.show({
        title: 'Success',
        message: 'Bed status updated successfully',
        color: 'green',
      });
      
      fetchBeds();
      fetchStats();
    } catch (err: any) {
      console.error('Error updating bed status:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update bed status',
        color: 'red',
      });
    }
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

  // Quick stats - Fixed mapping to match backend response
  const ipdStats = {
    totalPatients: admissions.length || 0,
    totalBeds: ipdStatsAPI?.data?.beds?.total || 0,
    occupiedBeds: ipdStatsAPI?.data?.beds?.occupied || 0,
    availableBeds: ipdStatsAPI?.data?.beds?.available || 0,
    criticalPatients: admissions.filter((a: any) => a.status === 'CRITICAL').length || 0,
    averageLOS: Math.round(admissions.reduce((sum: number, a: any) => {
      if (a.admissionDate) {
        const days = Math.floor((new Date().getTime() - new Date(a.admissionDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0) / (admissions.length || 1)),
    occupancyRate: ipdStatsAPI?.data?.occupancyRate || 0,
    totalRevenue: admissions.reduce((sum: number, a: any) => sum + (a.totalCharges || 0), 0),
  };

  return (
    <Container fluid px={0} style={{ maxWidth: '100%' }}>
      <Stack gap="lg" px="md">
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
            onClick={handleNewAdmission}
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
                          <ActionIcon 
                            variant="light" 
                            color="green"
                            onClick={() => handleEditPatient(patient)}
                            title="Edit Patient"
                          >
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
                <Text c="dimmed">No bed data available. Create wards and beds to get started.</Text>
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
                <Text c="dimmed">No ward data available. Create wards to get started.</Text>
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
          <Card padding="lg" radius="md" withBorder>
            <Title order={3} mb="lg">
              IPD Analytics
            </Title>
            <Text c="dimmed">Analytics dashboard coming soon...</Text>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* New Admission Modal */}
      <Modal
        opened={admissionOpened}
        onClose={closeAdmission}
        title="New Patient Admission"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Patient ID"
            placeholder="Enter patient ID"
            required
            value={admissionForm.patientId}
            onChange={(e) => setAdmissionForm({ ...admissionForm, patientId: e.target.value })}
          />
          
          <Select
            label="Ward"
            placeholder="Select ward"
            data={wards.map(w => ({ value: w.id, label: w.name }))}
            value={admissionForm.wardId}
            onChange={(value) => setAdmissionForm({ ...admissionForm, wardId: value || '' })}
            required
          />

          <Select
            label="Bed"
            placeholder="Select bed"
            data={beds
              .filter(b => b.status === 'vacant' && (!admissionForm.wardId || b.wardName === wards.find(w => w.id === admissionForm.wardId)?.name))
              .map(b => ({ value: b.id, label: `${b.bedNumber} - ${b.wardName}` }))}
            value={admissionForm.bedId}
            onChange={(value) => setAdmissionForm({ ...admissionForm, bedId: value || '' })}
            required
            disabled={!admissionForm.wardId}
          />

          <Select
            label="Admission Type"
            placeholder="Select admission type"
            data={[
              { value: 'elective', label: 'Elective' },
              { value: 'emergency', label: 'Emergency' },
              { value: 'transfer', label: 'Transfer' },
            ]}
            value={admissionForm.admissionType}
            onChange={(value) => setAdmissionForm({ ...admissionForm, admissionType: value || 'elective' })}
            required
          />

          <Textarea
            label="Diagnosis"
            placeholder="Enter diagnosis"
            rows={3}
            value={admissionForm.diagnosis}
            onChange={(e) => setAdmissionForm({ ...admissionForm, diagnosis: e.target.value })}
            required
          />

          <Textarea
            label="Notes"
            placeholder="Enter additional notes"
            rows={3}
            value={admissionForm.notes}
            onChange={(e) => setAdmissionForm({ ...admissionForm, notes: e.target.value })}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAdmission} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdmission} loading={submitting}>
              Admit Patient
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        opened={editPatientOpened}
        onClose={closeEditPatient}
        title="Edit Patient Information"
        size="lg"
      >
        {selectedPatient && (
          <Stack gap="md">
            <TextInput
              label="Patient Name"
              value={selectedPatient.patientName}
              disabled
            />
            
            <Select
              label="Status"
              placeholder="Select status"
              data={[
                { value: 'admitted', label: 'Admitted' },
                { value: 'critical', label: 'Critical' },
                { value: 'stable', label: 'Stable' },
                { value: 'discharged', label: 'Discharged' },
              ]}
              value={selectedPatient.status}
              onChange={(value) => {
                // Status update - Backend endpoint available
                notifications.show({
                  title: 'Info',
                  message: 'Status update will be implemented with admission update API',
                  color: 'blue',
                });
              }}
            />

            <Textarea
              label="Diagnosis"
              placeholder="Update diagnosis"
              rows={3}
              defaultValue={selectedPatient.diagnosis}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={closeEditPatient}>
                Cancel
              </Button>
              <Button onClick={() => {
                notifications.show({
                  title: 'Info',
                  message: 'Update functionality pending',
                  color: 'blue',
                });
                closeEditPatient();
              }}>
                Update Patient
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Discharge Patient Modal */}
      <Modal
        opened={dischargeOpened}
        onClose={closeDischarge}
        title="Discharge Patient"
        size="lg"
      >
        {selectedPatient && (
          <Stack gap="md">
            <Text>
              Are you sure you want to discharge <strong>{selectedPatient.patientName}</strong>?
            </Text>

            <Textarea
              label="Discharge Summary"
              placeholder="Enter discharge summary"
              rows={4}
              required
            />

            <Textarea
              label="Follow-up Instructions"
              placeholder="Enter follow-up instructions"
              rows={3}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={closeDischarge}>
                Cancel
              </Button>
              <Button color="red" onClick={() => {
                notifications.show({
                  title: 'Info',
                  message: 'Discharge functionality pending',
                  color: 'blue',
                });
                closeDischarge();
              }}>
                Discharge Patient
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Patient Details Modal */}
      {selectedPatient && !editPatientOpened && !dischargeOpened && (
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
            <Text size="sm">
              <strong>Admission Date:</strong> {new Date(selectedPatient.admissionDate).toLocaleDateString()}
            </Text>
            <Text size="sm">
              <strong>Length of Stay:</strong> {selectedPatient.lengthOfStay} days
            </Text>
            <Group>
              <Button variant="light" onClick={() => setSelectedPatient(null)}>Close</Button>
              <Button variant="light" color="blue" onClick={() => handleEditPatient(selectedPatient)}>
                Edit
              </Button>
              <Button variant="light" color="red" onClick={() => handleDischargePatient(selectedPatient)}>
                Discharge
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
      </Stack>
    </Container>
  );
};

export default IPDManagement;


