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
  Modal,
  Text,
  Tabs,
  Card,
  ActionIcon,
  Stack,
  SimpleGrid,
  // ScrollArea,
  ThemeIcon,
  // Progress,
  Textarea,
  Avatar,
  Divider,
  Alert,
  NumberInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import { MantineDonutChart /* SimpleBarChart */ } from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconChartBar,
  IconDownload,
  IconShare,
  IconActivity,
  IconSettings,
  IconAlertTriangle,
  IconLungs,
  IconHeart,
  IconStethoscope,
  IconVideo,
  IconCalendarEvent,
  IconChartLine,
  IconThermometer,
  IconBrandZoom,
  IconPrescription,
  IconDeviceHeartMonitor,
  IconMessage,
  IconPhoneOff,
  IconVideoOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconScreenShare,
  IconScreenShareOff,
  IconX,
  IconCircleCheck,
  IconUser,
} from '@tabler/icons-react';

// Import types and mock data
import {
  TelemedicineSession,
  SessionStatus,
  SessionType,
  // RemoteMonitoringData,
  ConsultationStatus,
} from '../../../types/telemedicine';
import telemedicineService from '../../../services/telemedicine.service';

const Telemedicine = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // API state
  const [consultations, setConsultations] = useState<any[]>([]);
  const [telemedicineStats, setTelemedicineStats] = useState<any>(null);

  // Fetch data
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchConsultations(), fetchStats()]);
    } catch (err: any) {
      console.error('Error loading telemedicine data:', err);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await telemedicineService.getConsultations({ limit: 100 });
      const consultationsData = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];
      setConsultations(consultationsData);
    } catch (err: any) {
      console.warn(
        'Error fetching consultations (using empty data):',
        err.response?.data?.message || err.message
      );
      setConsultations([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await telemedicineService.getStats();
      setTelemedicineStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching telemedicine stats (using default values):',
        err.response?.data?.message || err.message
      );
      setTelemedicineStats({
        totalSessions: 0,
        activeSessions: 0,
        completedSessions: 0,
        scheduledSessions: 0,
        cancelledSessions: 0,
        totalPatients: 0,
        averageSessionDuration: 0,
        patientSatisfaction: 0,
      });
    }
  };

  // Modal states
  const [startSessionOpened, { open: openStartSession, close: closeStartSession }] =
    useDisclosure(false);
  const [videoCallOpened, { open: openVideoCall, close: closeVideoCall }] = useDisclosure(false);
  const [createPrescriptionOpened, { open: openCreatePrescription, close: closeCreatePrescription }] =
    useDisclosure(false);
  const [viewSessionOpened, { open: openViewSession, close: closeViewSession }] =
    useDisclosure(false);
  const [viewMonitoringOpened, { open: openViewMonitoring, close: closeViewMonitoring }] =
    useDisclosure(false);
  const [viewPrescriptionOpened, { open: openViewPrescription, close: closePrescription }] =
    useDisclosure(false);
  
  // Selected items for viewing
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedMonitoring, setSelectedMonitoring] = useState<any>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  // Timer effect for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const sessionsList = consultations.length > 0 ? consultations : [];
    return sessionsList.filter((session: any) => {
      const matchesSearch =
        session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (session as any).sessionId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedSessionType || session.type === selectedSessionType;
      const matchesStatus = !selectedStatus || session.status === selectedStatus;
      const matchesDoctor = !selectedDoctor || (session as any).doctorId === selectedDoctor;

      return matchesSearch && matchesType && matchesStatus && matchesDoctor;
    });
  }, [searchQuery, selectedSessionType, selectedStatus, selectedDoctor, consultations]);

  // Helper functions
  const getStatusColor = (status: SessionStatus | ConsultationStatus) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'in_progress':
      case 'active':
        return 'green';
      case 'completed':
        return 'teal';
      case 'cancelled':
        return 'red';
      case 'no_show':
        return 'gray';
      case 'waiting':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case 'consultation':
        return 'blue';
      case 'follow_up':
        return 'green';
      case 'emergency':
        return 'red';
      case 'therapy':
        return 'purple';
      case 'monitoring':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handleStartVideoCall = (_session?: TelemedicineSession) => {
    setIsInCall(true);
    setCallDuration(0);
    openVideoCall();
    notifications.show({
      title: 'Call Started',
      message: 'Video consultation session has begun',
      color: 'green',
    });
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallDuration(0);
    closeVideoCall();
    notifications.show({
      title: 'Call Ended',
      message: 'Video consultation session has ended',
      color: 'blue',
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    notifications.show({
      title: isVideoEnabled ? 'Video Off' : 'Video On',
      message: `Camera has been turned ${isVideoEnabled ? 'off' : 'on'}`,
      color: 'blue',
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    notifications.show({
      title: isAudioEnabled ? 'Audio Off' : 'Audio On',
      message: `Microphone has been turned ${isAudioEnabled ? 'off' : 'on'}`,
      color: 'blue',
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    notifications.show({
      title: isScreenSharing ? 'Screen Share Stopped' : 'Screen Share Started',
      message: `Screen sharing has been ${isScreenSharing ? 'stopped' : 'started'}`,
      color: 'blue',
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    notifications.show({
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      message: `Session recording has been ${isRecording ? 'stopped' : 'started'}`,
      color: isRecording ? 'red' : 'green',
    });
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    openViewSession();
  };

  const handleViewMonitoring = (monitoring: any) => {
    setSelectedMonitoring(monitoring);
    openViewMonitoring();
  };

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    openViewPrescription();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Quick stats for overview
  const quickStats = [
    {
      title: 'Active Sessions',
      value: (telemedicineStats as any)?.activeSessions || 0,
      icon: IconVideo,
      color: 'green',
    },
    {
      title: 'Scheduled Sessions',
      value: (telemedicineStats as any)?.scheduledSessions || 0,
      icon: IconCalendarEvent,
      color: 'blue',
    },
    {
      title: 'Monitored Patients',
      value: (telemedicineStats as any)?.monitoredPatients || 0,
      icon: IconDeviceHeartMonitor,
      color: 'purple',
    },
    {
      title: 'Digital Prescriptions',
      value: (telemedicineStats as any)?.digitalPrescriptions || 0,
      icon: IconPrescription,
      color: 'orange',
    },
  ];

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Telemedicine & Virtual Care</Title>
          <Text c="dimmed" size="sm">
            Manage virtual consultations, remote monitoring, and digital healthcare delivery
          </Text>
        </div>
        <Group>
          <Button
            leftSection={<IconVideo size={16} />}
            onClick={() => handleStartVideoCall()}
            color="green"
          >
            Start Session
          </Button>
          <Button
            variant="light"
            leftSection={<IconCalendarEvent size={16} />}
            onClick={openStartSession}
          >
            Schedule Session
          </Button>
          <Button
            variant="light"
            leftSection={<IconPrescription size={16} />}
            onClick={openCreatePrescription}
          >
            Digital Prescription
          </Button>
        </Group>
      </Group>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        {quickStats.map((stat) => {
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
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="sessions" leftSection={<IconVideo size={16} />}>
            Sessions
          </Tabs.Tab>
          <Tabs.Tab value="monitoring" leftSection={<IconDeviceHeartMonitor size={16} />}>
            Remote Monitoring
          </Tabs.Tab>
          <Tabs.Tab value="prescriptions" leftSection={<IconPrescription size={16} />}>
            Digital Prescriptions
          </Tabs.Tab>
          <Tabs.Tab value="consultations" leftSection={<IconStethoscope size={16} />}>
            Virtual Consultations
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Session Analytics */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Session Statistics
              </Title>
              <MantineDonutChart data={[]} size={200} thickness={40} withLabels />
            </Card>

            {/* Active Monitoring Alerts */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Monitoring Alerts
              </Title>
              <Stack gap="sm">
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No active alerts
                </Text>
              </Stack>
            </Card>

            {/* Today's Sessions */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Today&apos;s Sessions
              </Title>
              <Stack gap="sm">
                {[].map((session) => (
                  <Card key={session.id} padding="sm" withBorder>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} size="sm">
                          {session.patientName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Dr. {session.doctorName}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Badge color={getStatusColor((session as any).status)} size="sm">
                          {session.status}
                        </Badge>
                        <Text size="xs" c="dimmed" mt="xs">
                          {session.scheduledTime}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>

            {/* Equipment Status */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                System Status
              </Title>
              <Stack gap="sm">
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  System status unavailable
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        {/* Sessions Tab */}
        <Tabs.Panel value="sessions">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search sessions..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'therapy', label: 'Therapy' },
                  { value: 'monitoring', label: 'Monitoring' },
                ]}
                value={selectedSessionType}
                onChange={setSelectedSessionType}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'no_show', label: 'No Show' },
                  { value: 'waiting', label: 'Waiting' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Doctor"
                data={[].map(
                  /* TODO: Fetch from API */ (doctor) => ({
                    value: doctor.id,
                    label: `Dr. ${(doctor as any).firstName || doctor.name.split(' ')[0]} ${(doctor as any).lastName || doctor.name.split(' ')[1] || ''}`,
                  })
                )}
                value={selectedDoctor}
                onChange={setSelectedDoctor}
                clearable
              />
            </Group>

            {/* Sessions Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {filteredSessions.length === 0 ? (
                <div style={{ gridColumn: '1 / -1' }}>
                  <EmptyState
                    icon={<IconVideo size={48} />}
                    title="No telemedicine sessions"
                    description="Schedule your first virtual consultation"
                    size="sm"
                  />
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {session.patientName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Dr. {session.doctorName}
                        </Text>
                      </div>
                      <Badge color={getStatusColor((session as any).status)} variant="light">
                        {session.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Session ID
                        </Text>
                        <Text size="sm" fw={500}>
                          {(session as any).sessionId || (session as any).consultationId}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Type
                        </Text>
                        <Badge
                          color={getSessionTypeColor((session as any).type)}
                          variant="light"
                          size="sm"
                        >
                          {session.type}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Scheduled
                        </Text>
                        <Text size="sm">
                          {formatDateTime(
                            (session as any).scheduledDate || new Date().toISOString()
                          )}{' '}
                          at {session.scheduledTime}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Duration
                        </Text>
                        <Text size="sm">{session.duration} minutes</Text>
                      </Group>
                      {(session as any).actualDuration && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Actual Duration
                          </Text>
                          <Text size="sm">{(session as any).actualDuration} minutes</Text>
                        </Group>
                      )}
                    </Stack>

                    {(session as any).notes && (
                      <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                        Notes: {(session as any).notes}
                      </Text>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Platform: {(session as any).platform || 'Web'}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewSession(session as any)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        {(session as any).status === 'scheduled' && (
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => handleStartVideoCall(session as any)}
                          >
                            <IconVideo size={16} />
                          </ActionIcon>
                        )}
                        {(session as any).status === 'in_progress' && (
                          <ActionIcon
                            variant="subtle"
                            color="orange"
                            onClick={() => openVideoCall()}
                          >
                            <IconBrandZoom size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon variant="subtle" color="teal">
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                ))
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Remote Monitoring Tab */}
        <Tabs.Panel value="monitoring">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Remote Patient Monitoring</Title>
              <Button leftSection={<IconPlus size={16} />} variant="light">
                Add Patient
              </Button>
            </Group>

            {/* Monitoring Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (monitoring) => (
                  <Card key={monitoring.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Group>
                          <Avatar color="blue" size="md">
                            {monitoring.patientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                          <div>
                            <Text fw={600} size="lg">
                              {monitoring.patientName}
                            </Text>
                            <Text size="sm" c="dimmed">
                              ID: {(monitoring as any).patientId || monitoring.id}
                            </Text>
                          </div>
                        </Group>
                      </div>
                      <Badge
                        color={(monitoring as any).isActive ? 'green' : 'gray'}
                        variant={(monitoring as any).isActive ? 'filled' : 'light'}
                      >
                        {(monitoring as any).isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Device
                        </Text>
                        <Group gap="xs">
                          <Text size="sm">{(monitoring as any).deviceType || 'N/A'}</Text>
                          <Badge
                            color={
                              (monitoring as any).deviceStatus === 'connected' ? 'green' : 'red'
                            }
                            variant="light"
                            size="xs"
                          >
                            {(monitoring as any).deviceStatus || 'Unknown'}
                          </Badge>
                        </Group>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Last Reading
                        </Text>
                        <Text size="sm">
                          {formatDateTime(
                            (monitoring as any).lastReading || new Date().toISOString()
                          )}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Monitoring Since
                        </Text>
                        <Text size="sm">
                          {formatDate((monitoring as any).startDate || new Date().toISOString())}
                        </Text>
                      </Group>
                    </Stack>

                    {/* Vital Signs */}
                    <Divider label="Current Vitals" labelPosition="center" mb="md" />
                    <SimpleGrid cols={2} spacing="sm" mb="md">
                      <div style={{ textAlign: 'center' }}>
                        <ThemeIcon color="red" variant="light" size="lg" mx="auto" mb="xs">
                          <IconHeart size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600} c="red">
                          {(monitoring as any).vitals?.heartRate || 'N/A'} bpm
                        </Text>
                        <Text size="xs" c="dimmed">
                          Heart Rate
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <ThemeIcon color="blue" variant="light" size="lg" mx="auto" mb="xs">
                          <IconActivity size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600} c="blue">
                          {(monitoring as any).vitals?.bloodPressure || 'N/A'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Blood Pressure
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <ThemeIcon color="orange" variant="light" size="lg" mx="auto" mb="xs">
                          <IconThermometer size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600} c="orange">
                          {(monitoring as any).vitals?.temperature || 'N/A'}°F
                        </Text>
                        <Text size="xs" c="dimmed">
                          Temperature
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <ThemeIcon color="cyan" variant="light" size="lg" mx="auto" mb="xs">
                          <IconLungs size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600} c="cyan">
                          {(monitoring as any).vitals?.oxygenSaturation || 'N/A'}%
                        </Text>
                        <Text size="xs" c="dimmed">
                          O2 Saturation
                        </Text>
                      </div>
                    </SimpleGrid>

                    {/* Alert Status */}
                    {(monitoring as any).alerts && (monitoring as any).alerts.length > 0 && (
                      <Alert
                        variant="light"
                        color="red"
                        icon={<IconAlertTriangle size={16} />}
                        mb="md"
                      >
                        <Text size="sm" fw={500}>
                          Active Alerts: {(monitoring as any).alerts.length}
                        </Text>
                        <Text size="xs">Latest: {(monitoring as any).alerts[0]}</Text>
                      </Alert>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Battery: {(monitoring as any).batteryLevel || 'N/A'}%
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewMonitoring(monitoring as any)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconChartLine size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconSettings size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Digital Prescriptions Tab */}
        <Tabs.Panel value="prescriptions">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Digital Prescriptions</Title>
              <Group>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreatePrescription}>
                  New Prescription
                </Button>
                <Button variant="light" leftSection={<IconDownload size={16} />}>
                  Export All
                </Button>
              </Group>
            </Group>

            {/* Prescriptions Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (prescription) => (
                  <Card key={prescription.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {prescription.patientName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          ID: {(prescription as any).prescriptionId || prescription.id}
                        </Text>
                      </div>
                      <Badge
                        color={
                          (prescription as any).status === 'active'
                            ? 'green'
                            : (prescription as any).status === 'pending'
                              ? 'orange'
                              : (prescription as any).status === 'completed'
                                ? 'blue'
                                : 'red'
                        }
                        variant="light"
                      >
                        {((prescription as any).status || 'pending').toUpperCase()}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Prescribed by
                        </Text>
                        <Text size="sm">Dr. {(prescription as any).doctorName || 'N/A'}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Date Issued
                        </Text>
                        <Text size="sm">
                          {formatDate(
                            (prescription as any).issuedDate ||
                              (prescription as any).date ||
                              new Date().toISOString()
                          )}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Valid Until
                        </Text>
                        <Text
                          size="sm"
                          c={
                            (prescription as any).expiryDate &&
                            new Date((prescription as any).expiryDate) < new Date()
                              ? 'red'
                              : undefined
                          }
                        >
                          {formatDate((prescription as any).expiryDate || new Date().toISOString())}
                        </Text>
                      </Group>
                    </Stack>

                    <Divider label="Medications" labelPosition="center" mb="md" />

                    <Stack gap="xs" mb="md">
                      {(Array.isArray((prescription as any).medications)
                        ? (prescription as any).medications
                        : []
                      ).map((med: any, index: number) => (
                        <Card key={index} padding="xs" withBorder>
                          <Group justify="space-between">
                            <div>
                              <Text size="sm" fw={500}>
                                {med.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {med.dosage} - {med.frequency}
                              </Text>
                            </div>
                            <Badge variant="light" size="xs">
                              {med.duration}
                            </Badge>
                          </Group>
                        </Card>
                      ))}
                    </Stack>

                    {(prescription as any).pharmacyInfo && (
                      <Group justify="space-between" mb="md">
                        <Text size="sm" c="dimmed">
                          Pharmacy
                        </Text>
                        <Text size="sm">{(prescription as any).pharmacyInfo}</Text>
                      </Group>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Digital Signature: ✓ Verified
                      </Text>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewPrescription(prescription as any)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconDownload size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconShare size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Virtual Consultations Tab */}
        <Tabs.Panel value="consultations">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Virtual Consultations</Title>
              <Button leftSection={<IconCalendarEvent size={16} />} variant="light">
                Schedule Consultation
              </Button>
            </Group>

            {/* Consultations Grid */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (consultation) => (
                  <Card key={consultation.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Group>
                          <Avatar color="teal" size="md">
                            {consultation.patientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                          <div>
                            <Text fw={600} size="lg">
                              {consultation.patientName}
                            </Text>
                            <Text size="sm" c="dimmed">
                              with Dr. {consultation.doctorName}
                            </Text>
                          </div>
                        </Group>
                      </div>
                      <Badge color={getStatusColor((consultation as any).status)} variant="light">
                        {consultation.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Specialty
                        </Text>
                        <Text size="sm">{consultation.specialty}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Appointment
                        </Text>
                        <Text size="sm">
                          {formatDateTime(
                            (consultation as any).appointmentDate || new Date().toISOString()
                          )}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Duration
                        </Text>
                        <Text size="sm">
                          {(consultation as any).estimatedDuration || consultation.duration} minutes
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Consultation Fee
                        </Text>
                        <Text size="sm" fw={500}>
                          ₹{(consultation as any).consultationFee || 0}
                        </Text>
                      </Group>
                    </Stack>

                    {((consultation as any).symptoms || (consultation as any).reason) && (
                      <>
                        <Text size="sm" c="dimmed" mb="xs">
                          Chief Complaints:
                        </Text>
                        <Text size="sm" lineClamp={2} mb="md">
                          {(consultation as any).symptoms || (consultation as any).reason}
                        </Text>
                      </>
                    )}

                    {(consultation as any).followUpRequired && (
                      <Alert
                        variant="light"
                        color="blue"
                        icon={<IconCalendarEvent size={16} />}
                        mb="md"
                      >
                        <Text size="sm">Follow-up consultation recommended</Text>
                      </Alert>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Session ID:{' '}
                        {(consultation as any).sessionId || (consultation as any).consultationId}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        {(consultation as any).status === 'active' && (
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => handleStartVideoCall()}
                          >
                            <IconVideo size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon variant="subtle" color="orange">
                          <IconMessage size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Video Call Modal */}
      <Modal
        opened={videoCallOpened}
        onClose={() => {
          if (isInCall) {
            handleEndCall();
          } else {
            closeVideoCall();
          }
        }}
        title="Video Consultation"
        size="xl"
        fullScreen
        withCloseButton={false}
      >
        <div style={{ position: 'relative', height: '100vh', backgroundColor: '#000' }}>
          {/* Main Video Area */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 120px)',
              position: 'relative',
            }}
          >
            {/* Doctor's Video (Main) */}
            <div
              style={{
                width: '70%',
                height: '80%',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {isVideoEnabled ? (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <IconVideo size={80} />
                  <Text size="xl" mt="md">
                    Dr. Smith
                  </Text>
                  <Text size="sm" c="dimmed">
                    Cardiology Consultation
                  </Text>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <IconVideoOff size={80} />
                  <Text size="xl" mt="md">
                    Camera Off
                  </Text>
                </div>
              )}

              {/* Screen Share Indicator */}
              {isScreenSharing && (
                <Badge
                  style={{ position: 'absolute', top: 10, left: 10 }}
                  color="blue"
                  variant="filled"
                >
                  Screen Sharing
                </Badge>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <Badge
                  style={{ position: 'absolute', top: 10, right: 10 }}
                  color="red"
                  variant="filled"
                >
                  ● Recording
                </Badge>
              )}
            </div>

            {/* Patient's Video (Picture in Picture) */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: '200px',
                height: '150px',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <IconUser size={40} />
                <Text size="sm" mt="xs">
                  You
                </Text>
              </div>
            </div>

            {/* Call Duration */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px 16px',
                borderRadius: '8px',
                color: 'white',
              }}
            >
              <Text size="lg" fw={600}>
                {formatDuration(callDuration)}
              </Text>
            </div>
          </div>

          {/* Control Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <ActionIcon
              size="xl"
              variant={isAudioEnabled ? 'filled' : 'light'}
              color={isAudioEnabled ? 'blue' : 'red'}
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <IconMicrophone size={24} /> : <IconMicrophoneOff size={24} />}
            </ActionIcon>

            <ActionIcon
              size="xl"
              variant={isVideoEnabled ? 'filled' : 'light'}
              color={isVideoEnabled ? 'blue' : 'red'}
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <IconVideo size={24} /> : <IconVideoOff size={24} />}
            </ActionIcon>

            <ActionIcon
              size="xl"
              variant={isScreenSharing ? 'filled' : 'light'}
              color="green"
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <IconScreenShareOff size={24} /> : <IconScreenShare size={24} />}
            </ActionIcon>

            <ActionIcon
              size="xl"
              variant={isRecording ? 'filled' : 'light'}
              color="red"
              onClick={toggleRecording}
            >
              {isRecording ? <IconX size={24} /> : <IconCircleCheck size={24} />}
            </ActionIcon>

            <ActionIcon size="xl" variant="light" color="gray">
              <IconMessage size={24} />
            </ActionIcon>

            <ActionIcon size="xl" variant="filled" color="red" onClick={handleEndCall}>
              <IconPhoneOff size={24} />
            </ActionIcon>
          </div>
        </div>
      </Modal>

      {/* Start Session Modal */}
      <Modal
        opened={startSessionOpened}
        onClose={closeStartSession}
        title="Schedule Telemedicine Session"
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
              label="Doctor"
              placeholder="Select doctor"
              data={[].map(
                /* TODO: Fetch from API */ (doctor) => ({
                  value: doctor.id,
                  label: `Dr. ${(doctor as any).firstName || doctor.name.split(' ')[0]} ${(doctor as any).lastName || doctor.name.split(' ')[1] || ''} - ${(doctor as any).specialty || doctor.specialization}`,
                })
              )}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Select
              label="Session Type"
              placeholder="Select type"
              data={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
                { value: 'therapy', label: 'Therapy' },
                { value: 'monitoring', label: 'Monitoring' },
              ]}
              required
            />
            <NumberInput
              label="Duration (minutes)"
              placeholder="Enter duration"
              min={15}
              max={120}
              defaultValue={30}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <DatePickerInput label="Date" placeholder="Select date" minDate={new Date()} required />
            <Select
              label="Time"
              placeholder="Select time"
              data={[
                { value: '09:00', label: '9:00 AM' },
                { value: '10:00', label: '10:00 AM' },
                { value: '11:00', label: '11:00 AM' },
                { value: '14:00', label: '2:00 PM' },
                { value: '15:00', label: '3:00 PM' },
                { value: '16:00', label: '4:00 PM' },
              ]}
              required
            />
          </SimpleGrid>

          <Select
            label="Platform"
            placeholder="Select platform"
            data={[
              { value: 'zoom', label: 'Zoom' },
              { value: 'teams', label: 'Microsoft Teams' },
              { value: 'webex', label: 'Cisco Webex' },
              { value: 'custom', label: 'Custom Platform' },
            ]}
            defaultValue="zoom"
            required
          />

          <Textarea
            label="Session Notes"
            placeholder="Enter any special instructions or notes"
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeStartSession}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Session Scheduled',
                  message: 'Telemedicine session has been scheduled successfully',
                  color: 'green',
                });
                closeStartSession();
              }}
            >
              Schedule Session
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Prescription Modal */}
      <Modal
        opened={createPrescriptionOpened}
        onClose={closeCreatePrescription}
        title="Create Digital Prescription"
        size="lg"
      >
        <Stack>
          <TextInput label="Patient Name" placeholder="Enter patient name" required />
          <TextInput label="Diagnosis" placeholder="Enter diagnosis" required />
          <Textarea
            label="Medications"
            placeholder="Enter medications with dosage and instructions"
            rows={4}
            required
          />
          <Textarea label="Additional Notes" placeholder="Enter any additional notes" rows={3} />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeCreatePrescription}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Prescription Created',
                  message: 'Digital prescription has been created successfully',
                  color: 'green',
                });
                closeCreatePrescription();
              }}
            >
              Create Prescription
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Session Modal */}
      <Modal
        opened={viewSessionOpened}
        onClose={closeViewSession}
        title="Session Details"
        size="lg"
      >
        {selectedSession && (
          <Stack>
            <Group justify="space-between">
              <Text fw={500}>Session ID:</Text>
              <Text>{selectedSession.sessionId || selectedSession.id}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Patient:</Text>
              <Text>{selectedSession.patientName}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Doctor:</Text>
              <Text>{selectedSession.doctorName}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Status:</Text>
              <Badge color={getStatusColor(selectedSession.status)}>{selectedSession.status}</Badge>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Type:</Text>
              <Badge color={getSessionTypeColor(selectedSession.type)}>{selectedSession.type}</Badge>
            </Group>
            <Divider />
            <Text fw={500}>Notes:</Text>
            <Text size="sm" c="dimmed">
              {selectedSession.notes || 'No notes available'}
            </Text>
          </Stack>
        )}
      </Modal>

      {/* View Monitoring Modal */}
      <Modal
        opened={viewMonitoringOpened}
        onClose={closeViewMonitoring}
        title="Monitoring Details"
        size="lg"
      >
        {selectedMonitoring && (
          <Stack>
            <Group justify="space-between">
              <Text fw={500}>Patient:</Text>
              <Text>{selectedMonitoring.patientName}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Device:</Text>
              <Text>{selectedMonitoring.deviceType}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Status:</Text>
              <Badge color={selectedMonitoring.status === 'active' ? 'green' : 'gray'}>
                {selectedMonitoring.status}
              </Badge>
            </Group>
            <Divider />
            <Text fw={500}>Latest Readings:</Text>
            <Text size="sm" c="dimmed">
              Monitoring data details would be displayed here
            </Text>
          </Stack>
        )}
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        opened={viewPrescriptionOpened}
        onClose={closePrescription}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <Stack>
            <Group justify="space-between">
              <Text fw={500}>Prescription ID:</Text>
              <Text>{selectedPrescription.id}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Patient:</Text>
              <Text>{selectedPrescription.patientName}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Doctor:</Text>
              <Text>{selectedPrescription.doctorName}</Text>
            </Group>
            <Divider />
            <Text fw={500}>Medications:</Text>
            <Text size="sm" c="dimmed">
              {selectedPrescription.medications || 'No medications listed'}
            </Text>
            <Text fw={500} mt="md">
              Notes:
            </Text>
            <Text size="sm" c="dimmed">
              {selectedPrescription.notes || 'No notes available'}
            </Text>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default Telemedicine;
