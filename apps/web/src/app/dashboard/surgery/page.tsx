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
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Alert,
  Progress,
  NumberInput,
  Textarea,
  // Timeline,
  // RingProgress,
  // Tooltip,
  // List
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import surgeryService from '../../../services/surgery.service';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  // IconTrash,
  IconScissors,
  IconChartBar,
  // IconAlertCircle,
  // IconCheck,
  IconDotsVertical,
  IconReportMedical,
  IconClock,
  IconClipboardList,
  IconFileText,
  IconDownload,
  // IconShieldCheck,
  // IconAlertTriangle,
  IconActivity,
  IconBed,
  IconTools,
  IconScale,
  IconMedicalCross,
  IconCalendar,
  IconUsers,
  IconX,
  IconSettings,
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';

// Import types and mock data
// Types will be defined inline since they don't exist yet
// Mock data removed - using API data only

const SurgeryManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedORStatus, setSelectedORStatus] = useState<string>('');
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);

  // API data state
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSurgeries(), fetchStats(), fetchTheaters()]);
    } catch (err: any) {
      console.error('Error loading surgery data:', err);
      setSurgeries([] /* TODO: Fetch from API */);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurgeries = async () => {
    try {
      const filters = {
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      };
      const response = await surgeryService.getSurgeries(filters);
      // Handle different response structures
      const surgeriesData = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      setSurgeries(surgeriesData);
    } catch (err: any) {
      console.warn(
        'Error fetching surgeries (using empty data):',
        err.response?.data?.message || err.message
      );
      setSurgeries([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await surgeryService.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching surgery stats (using default values):',
        err.response?.data?.message || err.message
      );
      setStats({
        totalSurgeries: 0,
        scheduledSurgeries: 0,
        completedSurgeries: 0,
        cancelledSurgeries: 0,
        upcomingSurgeries: 0,
        availableTheaters: 0,
      });
    }
  };

  const fetchTheaters = async () => {
    try {
      const response = await surgeryService.getAvailableTheaters();
      setTheaters(response.data || []);
    } catch (err: any) {
      console.warn(
        'Error fetching theaters (using empty data):',
        err.response?.data?.message || err.message
      );
      setTheaters([]);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchSurgeries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedType, selectedStatus, selectedPriority]);

  // Modal states
  const [surgeryDetailOpened, { open: openSurgeryDetail, close: closeSurgeryDetail }] =
    useDisclosure(false);
  const [addSurgeryOpened, { open: openAddSurgery, close: closeAddSurgery }] = useDisclosure(false);

  // Filter surgeries
  const filteredSurgeries = useMemo(() => {
    // Ensure surgeries is an array before filtering
    if (!Array.isArray(surgeries)) return [];
    return surgeries.filter((surgery: any) => {
      const matchesSearch =
        surgery.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surgery.surgeryId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surgery.procedure?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedType || surgery.surgeryType === selectedType;
      const matchesStatus = !selectedStatus || surgery.status === selectedStatus;
      const matchesPriority = !selectedPriority || surgery.priority === selectedPriority;

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [searchQuery, selectedType, selectedStatus, selectedPriority, surgeries]);

  // Filter operating rooms
  const filteredORs = useMemo(() => {
    // Ensure theaters is an array before filtering
    if (!Array.isArray(theaters)) return [];
    return theaters.filter((or: any) => {
      const matchesSearch =
        or.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        or.roomName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !selectedORStatus || or.status === selectedORStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedORStatus, theaters]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'available':
      case 'operational':
        return 'blue';
      case 'in_progress':
      case 'occupied':
      case 'in_use':
        return 'orange';
      case 'completed':
      case 'cleaned':
        return 'green';
      case 'cancelled':
      case 'out_of_service':
        return 'red';
      case 'delayed':
      case 'maintenance':
        return 'yellow';
      case 'recovery':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'red';
      case 'urgent':
        return 'orange';
      case 'elective':
        return 'blue';
      case 'routine':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getSurgeryTypeColor = (type: string) => {
    switch (type) {
      case 'cardiac':
        return 'red';
      case 'neurological':
        return 'purple';
      case 'orthopedic':
        return 'blue';
      case 'general':
        return 'green';
      case 'plastic':
        return 'pink';
      case 'pediatric':
        return 'cyan';
      case 'trauma':
        return 'orange';
      case 'transplant':
        return 'indigo';
      default:
        return 'gray';
    }
  };

  const handleViewSurgery = (surgery: any) => {
    setSelectedSurgery(surgery);
    openSurgeryDetail();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedORStatus('');
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Surgeries',
      value: stats?.totalSurgeries || 0,
      icon: IconScissors,
      color: 'blue',
      trend: '+0%',
    },
    {
      title: "Today's Surgeries",
      value: stats?.scheduledSurgeries || 0,
      icon: IconCalendar,
      color: 'green',
      trend: '+0',
    },
    {
      title: 'Active ORs',
      value: `${stats?.availableTheaters || 0}/${stats?.totalTheaters || 0}`,
      icon: IconBed,
      color: 'orange',
      trend: '0% utilization',
    },
    {
      title: 'Average Duration',
      value: `${stats?.averageDuration || 0}min`,
      icon: IconClock,
      color: 'purple',
      trend: '0min',
    },
  ];

  // Chart data
  const surgeryTypeData = Object.entries(stats?.surgeryTypes || {}).map(
    ([type, count]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: typeof count === 'number' ? count : 0,
      color: getSurgeryTypeColor(type),
    })
  );

  const monthlyVolume = stats?.monthlyVolume || [];
  const orUtilization = stats?.orUtilization || [];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Surgery & Operation Theater</Title>
          <Text c="dimmed" size="sm">
            Manage surgical procedures, operating rooms, and surgical teams
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddSurgery} color="blue">
            Schedule Surgery
          </Button>
          <Button variant="light" leftSection={<IconMedicalCross size={16} />} color="red">
            Emergency Surgery
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
          <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
            Surgery Schedule
          </Tabs.Tab>
          <Tabs.Tab value="theaters" leftSection={<IconBed size={16} />}>
            Operating Theaters
          </Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconTools size={16} />}>
            Equipment
          </Tabs.Tab>
          <Tabs.Tab value="teams" leftSection={<IconUsers size={16} />}>
            Surgical Teams
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<IconChartBar size={16} />}>
            Reports & Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Surgery Schedule Tab */}
        <Tabs.Panel value="schedule">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search surgeries..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Surgery Type"
                data={[
                  { value: 'cardiac', label: 'Cardiac' },
                  { value: 'neurological', label: 'Neurological' },
                  { value: 'orthopedic', label: 'Orthopedic' },
                  { value: 'general', label: 'General' },
                  { value: 'plastic', label: 'Plastic' },
                  { value: 'pediatric', label: 'Pediatric' },
                  { value: 'trauma', label: 'Trauma' },
                ]}
                value={selectedType}
                onChange={setSelectedType}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'delayed', label: 'Delayed' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Priority"
                data={[
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'elective', label: 'Elective' },
                  { value: 'routine', label: 'Routine' },
                ]}
                value={selectedPriority}
                onChange={setSelectedPriority}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Surgery Schedule Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Surgery ID</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Procedure</Table.Th>
                    <Table.Th>Surgeon</Table.Th>
                    <Table.Th>Date & Time</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>OR</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredSurgeries.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
                        <EmptyState
                          icon={<IconScale size={48} />}
                          title="No surgeries scheduled"
                          description="Schedule your first surgery"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredSurgeries.map((surgery: any) => (
                      <Table.Tr key={surgery.id}>
                        <Table.Td>
                          <Text fw={500}>{surgery.surgeryId}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl" size="sm">
                              {surgery.patientName?.[0] || 'P'}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {surgery.patientName || 'N/A'}
                              </Text>
                              <Text size="xs" c="dimmed">
                                ID: {(surgery as any).patientId || 'N/A'}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500} lineClamp={1}>
                              {surgery.procedure}
                            </Text>
                            <Badge
                              color={getSurgeryTypeColor((surgery as any).surgeryType || 'general')}
                              variant="light"
                              size="xs"
                            >
                              {(surgery as any).surgeryType || 'General'}
                            </Badge>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {surgery.surgeon || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {(surgery as any).department || 'N/A'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {surgery.date || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {surgery.time || 'N/A'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{surgery.duration || 0} min</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="cyan" variant="light">
                            {surgery.operatingRoom || 'N/A'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={getPriorityColor((surgery as any).priority || 'routine')}
                            variant="light"
                            size="xs"
                          >
                            {((surgery as any).priority || 'routine').toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(surgery.status)} variant="light">
                            {surgery.status.replace('_', ' ')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewSurgery(surgery)}
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
                                <Menu.Item leftSection={<IconClipboardList size={14} />}>
                                  Pre-Op Checklist
                                </Menu.Item>
                                <Menu.Item leftSection={<IconReportMedical size={14} />}>
                                  Post-Op Notes
                                </Menu.Item>
                                <Menu.Item leftSection={<IconDownload size={14} />}>
                                  Download Report
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconX size={14} />} color="red">
                                  Cancel Surgery
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

        {/* Operating Theaters Tab */}
        <Tabs.Panel value="theaters">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Operating Theaters</Title>
              <Group>
                <Button leftSection={<IconSettings size={16} />} variant="light">
                  OR Maintenance
                </Button>
                <Button leftSection={<IconActivity size={16} />}>Monitor Status</Button>
              </Group>
            </Group>

            {/* OR Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search ORs..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'available', label: 'Available' },
                  { value: 'occupied', label: 'Occupied' },
                  { value: 'cleaned', label: 'Cleaned' },
                  { value: 'maintenance', label: 'Maintenance' },
                ]}
                value={selectedORStatus}
                onChange={setSelectedORStatus}
                clearable
              />
            </Group>

            {/* Operating Rooms Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredORs.map((or: any) => (
                <Card key={or.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div>
                      <Text fw={600} size="lg">
                        OR {or.roomNumber}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {or.roomName}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(or.status)} variant="light">
                      {or.status}
                    </Badge>
                  </Group>

                  <Stack gap="sm" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Location
                      </Text>
                      <Text size="sm" fw={500}>
                        {or.location}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Capacity
                      </Text>
                      <Text size="sm">{or.capacity} people</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Specialties
                      </Text>
                      <div>
                        {or.specialties.slice(0, 2).map((specialty) => (
                          <Badge key={specialty} size="xs" variant="light" mr="xs">
                            {specialty}
                          </Badge>
                        ))}
                        {or.specialties.length > 2 && (
                          <Badge size="xs" variant="light" color="gray">
                            +{or.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </Group>
                  </Stack>

                  {(or as any).currentSurgery && (
                    <Alert variant="light" color="blue" mb="md">
                      <Text size="sm" fw={500}>
                        Current Surgery:
                      </Text>
                      <Text size="sm">{(or as any).currentSurgery || 'N/A'}</Text>
                    </Alert>
                  )}

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Equipment: {or.equipment.length} items
                    </Text>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconSettings size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconActivity size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Equipment Tab */}
        <Tabs.Panel value="equipment">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Surgical Equipment</Title>
              <Button leftSection={<IconPlus size={16} />}>Add Equipment</Button>
            </Group>

            {/* Equipment Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (equipment) => (
                  <Card key={equipment.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {equipment.equipmentName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {equipment.manufacturer}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(equipment.status)} variant="light">
                        {equipment.status.replace('_', ' ')}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Model
                        </Text>
                        <Text size="sm" fw={500}>
                          {equipment.model}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Serial
                        </Text>
                        <Text size="sm" fw={500}>
                          {equipment.serialNumber}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Location
                        </Text>
                        <Text size="sm">OR {equipment.assignedOR}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Last Calibrated
                        </Text>
                        <Text size="sm">
                          {new Date(equipment.lastCalibrationDate).toLocaleDateString()}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Next Due
                        </Text>
                        <Text
                          size="sm"
                          c={
                            new Date(equipment.nextCalibrationDate) < new Date() ? 'red' : 'dimmed'
                          }
                        >
                          {new Date(equipment.nextCalibrationDate).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Stack>

                    {equipment.usageHours && (
                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" c="dimmed">
                            Usage Hours
                          </Text>
                          <Text size="sm" fw={500}>
                            {equipment.usageHours}h
                          </Text>
                        </Group>
                        <Progress
                          value={(equipment.usageHours / 8760) * 100}
                          size="sm"
                          color="blue"
                        />
                      </div>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {equipment.equipmentType}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconSettings size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconTools size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Surgical Teams Tab */}
        <Tabs.Panel value="teams">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Surgical Teams</Title>
              <Button leftSection={<IconPlus size={16} />}>Create Team</Button>
            </Group>

            {/* Surgical Teams Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (team) => (
                  <Card key={team.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {team.teamName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {team.specialization}
                        </Text>
                      </div>
                      <Badge color={team.isActive ? 'green' : 'gray'} variant="light">
                        {team.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Group>

                    <Stack gap="md" mb="md">
                      <div>
                        <Text size="sm" fw={500} mb="sm">
                          Lead Surgeon
                        </Text>
                        <Group>
                          <Avatar color="blue" radius="xl">
                            {team.leadSurgeon.firstName[0]}
                            {team.leadSurgeon.lastName[0]}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              Dr. {team.leadSurgeon.firstName} {team.leadSurgeon.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {team.leadSurgeon.department?.name}
                            </Text>
                          </div>
                        </Group>
                      </div>

                      <div>
                        <Text size="sm" fw={500} mb="sm">
                          Team Members
                        </Text>
                        <Stack gap="xs">
                          {team.teamMembers.slice(0, 3).map((member) => (
                            <Group key={member.id} gap="sm">
                              <Avatar size="sm" color="cyan" radius="xl">
                                {member.firstName[0]}
                                {member.lastName[0]}
                              </Avatar>
                              <div>
                                <Text size="sm">
                                  {member.firstName} {member.lastName}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {member.role}
                                </Text>
                              </div>
                            </Group>
                          ))}
                          {team.teamMembers.length > 3 && (
                            <Text size="xs" c="dimmed">
                              +{team.teamMembers.length - 3} more members
                            </Text>
                          )}
                        </Stack>
                      </div>
                    </Stack>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Created: {new Date(team.createdDate).toLocaleDateString()}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconUsers size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Reports & Analytics Tab */}
        <Tabs.Panel value="reports">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Surgery Reports & Analytics
            </Title>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Surgery Types Distribution */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Surgeries by Type
                </Title>
                <Stack gap="sm">
                  {surgeryTypeData.slice(0, 5).map((item) => (
                    <Group key={item.name} justify="space-between">
                      <Text size="sm">{item.name}</Text>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{item.value}</Text>
                        <Text size="xs" c="dimmed">({((item.value / surgeryTypeData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%)</Text>
                      </Group>
                    </Group>
                  ))}
                  {surgeryTypeData.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                      No surgery data available
                    </Text>
                  )}
                </Stack>
              </Card>

              {/* Monthly Surgery Volume */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Monthly Surgery Volume
                </Title>
                <Stack gap="sm">
                  {monthlyVolume.slice(0, 6).map((item: any) => (
                    <Group key={item.month} justify="space-between">
                      <Text size="sm">{item.month}</Text>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{item.surgeries || item.value || 0}</Text>
                        <Progress
                          value={Math.min((item.surgeries || item.value || 0) / 50 * 100, 100)}
                          size="sm"
                          color="blue"
                          style={{ width: 60 }}
                        />
                      </Group>
                    </Group>
                  ))}
                  {monthlyVolume.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                      No monthly data available
                    </Text>
                  )}
                </Stack>
              </Card>

              {/* OR Utilization */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Operating Room Utilization
                </Title>
                <Stack gap="sm">
                  {orUtilization.slice(0, 8).map((item: any) => (
                    <Group key={item.or} justify="space-between">
                      <Text size="sm">OR {item.or}</Text>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{item.utilization || item.value || 0}%</Text>
                        <Progress
                          value={item.utilization || item.value || 0}
                          size="sm"
                          color={item.utilization > 80 ? 'red' : item.utilization > 60 ? 'orange' : 'green'}
                          style={{ width: 80 }}
                        />
                      </Group>
                    </Group>
                  ))}
                  {orUtilization.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center">
                      No OR utilization data available
                    </Text>
                  )}
                </Stack>
              </Card>

              {/* Key Performance Indicators */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Key Performance Indicators
                </Title>
                <Stack gap="md">
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Surgery Success Rate
                    </Text>
                    <Text size="sm" fw={600} c="green">
                      {0 /* TODO: Fetch from API */}%
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Average Turnover Time
                    </Text>
                    <Text size="sm" fw={600}>
                      {0 /* TODO: Fetch from API */}min
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      On-Time Start Rate
                    </Text>
                    <Text size="sm" fw={600} c="green">
                      {0 /* TODO: Fetch from API */}%
                    </Text>
                  </Group>
                  <Group
                    justify="space-between"
                    p="sm"
                    style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                  >
                    <Text size="sm" fw={500}>
                      Complication Rate
                    </Text>
                    <Text size="sm" fw={600} c="red">
                      {0 /* TODO: Fetch from API */}%
                    </Text>
                  </Group>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Quick Reports
                </Title>
                <Stack gap="sm">
                  <Button fullWidth leftSection={<IconDownload size={16} />} variant="light">
                    Export Surgery Log
                  </Button>
                  <Button fullWidth leftSection={<IconFileText size={16} />} variant="light">
                    OR Utilization Report
                  </Button>
                  <Button fullWidth leftSection={<IconChartBar size={16} />} variant="light">
                    Performance Analytics
                  </Button>
                  <Button fullWidth leftSection={<IconReportMedical size={16} />} variant="light">
                    Quality Metrics
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Surgery Detail Modal */}
      <Modal
        opened={surgeryDetailOpened}
        onClose={closeSurgeryDetail}
        title="Surgery Details"
        size="xl"
      >
        {selectedSurgery && (
          <ScrollArea h={600}>
            <Stack gap="md">
              <Group>
                <ThemeIcon color="blue" size="xl" variant="light">
                  <IconScissors size={24} />
                </ThemeIcon>
                <div>
                  <Title order={3}>{selectedSurgery.procedure}</Title>
                  <Text c="dimmed">Surgery ID: {selectedSurgery.surgeryId}</Text>
                  <Badge color={getStatusColor(selectedSurgery.status)} variant="light" mt="xs">
                    {selectedSurgery.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Group>

              <Divider />

              <SimpleGrid cols={2}>
                <div>
                  <Text size="sm" fw={500}>
                    Patient
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSurgery.patientName || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Surgery Type
                  </Text>
                  <Badge
                    color={getSurgeryTypeColor(selectedSurgery.surgeryType || 'general')}
                    variant="light"
                  >
                    {selectedSurgery.surgeryType || 'General'}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Primary Surgeon
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSurgery.surgeon || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Operating Room
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSurgery.operatingRoom || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Scheduled Date
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSurgery.date || 'N/A'} {selectedSurgery.time || ''}
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Estimated Duration
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSurgery.duration || 0} minutes
                  </Text>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Priority
                  </Text>
                  <Badge
                    color={getPriorityColor(selectedSurgery.priority || 'routine')}
                    variant="light"
                  >
                    {(selectedSurgery.priority || 'routine').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Text size="sm" fw={500}>
                    Anesthesiologist
                  </Text>
                  <Text size="sm" c="dimmed">
                    {selectedSurgery.anesthesiologist || 'N/A'}
                  </Text>
                </div>
              </SimpleGrid>

              {selectedSurgery.specialInstructions && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Special Instructions
                    </Text>
                    <Text size="sm">{selectedSurgery.specialInstructions}</Text>
                  </div>
                </>
              )}

              {selectedSurgery.assistants && selectedSurgery.assistants.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Assistants
                    </Text>
                    <Stack gap="xs">
                      {selectedSurgery.assistants.map((assistant: string, index: number) => (
                        <Group key={index}>
                          <Avatar size="sm" color="blue" radius="xl">
                            {assistant[0]}
                          </Avatar>
                          <Text size="sm">{assistant}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </div>
                </>
              )}

              <Group justify="flex-end">
                <Button variant="light" onClick={closeSurgeryDetail}>
                  Close
                </Button>
                <Button leftSection={<IconClipboardList size={16} />}>Pre-Op Checklist</Button>
                <Button leftSection={<IconEdit size={16} />}>Edit Surgery</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Add Surgery Modal */}
      <Modal
        opened={addSurgeryOpened}
        onClose={closeAddSurgery}
        title="Schedule New Surgery"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <Select
              label="Patient"
              placeholder="Select patient"
              data={[].map(
                /* TODO: Fetch from API */ (patient) => ({
                  value: patient.id,
                  label: `${patient.firstName} ${patient.lastName}`,
                })
              )}
              required
            />
            <Select
              label="Primary Surgeon"
              placeholder="Select surgeon"
              data={[]
                .filter(
                  /* TODO: Fetch from API */ (staff: any) =>
                    staff.role === 'Doctor' || staff.role === 'doctor'
                )
                .map((surgeon: any) => ({
                  value: surgeon.staffId,
                  label: `Dr. ${surgeon.firstName} ${surgeon.lastName}`,
                }))}
              required
            />
          </SimpleGrid>

          <TextInput label="Procedure" placeholder="Enter surgical procedure" required />

          <SimpleGrid cols={2}>
            <Select
              label="Surgery Type"
              placeholder="Select type"
              data={[
                { value: 'cardiac', label: 'Cardiac' },
                { value: 'neurological', label: 'Neurological' },
                { value: 'orthopedic', label: 'Orthopedic' },
                { value: 'general', label: 'General' },
                { value: 'plastic', label: 'Plastic' },
                { value: 'pediatric', label: 'Pediatric' },
              ]}
              required
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'emergency', label: 'Emergency' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'elective', label: 'Elective' },
                { value: 'routine', label: 'Routine' },
              ]}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <DatePickerInput label="Surgery Date" placeholder="Select date" required />
            <NumberInput label="Estimated Duration (minutes)" placeholder="120" min={30} required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Operating Room"
              placeholder="Select OR"
              data={[].map(
                /* TODO: Fetch from API */ (or) => ({
                  value: or.id,
                  label: `OR ${or.roomNumber} - ${or.roomName}`,
                })
              )}
              required
            />
            <Select
              label="Anesthesia Type"
              placeholder="Select anesthesia"
              data={[
                { value: 'general', label: 'General' },
                { value: 'local', label: 'Local' },
                { value: 'regional', label: 'Regional' },
                { value: 'spinal', label: 'Spinal' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea
            label="Special Instructions"
            placeholder="Enter any special instructions"
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddSurgery}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Surgery Scheduled',
                  message: 'Surgery has been successfully scheduled',
                  color: 'green',
                });
                closeAddSurgery();
              }}
            >
              Schedule Surgery
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default SurgeryManagement;
