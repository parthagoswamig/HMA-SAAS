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
  Stack,
  SimpleGrid,
  ThemeIcon,
  Progress,
  ActionIcon,
  Menu,
  ScrollArea,
  // Box,
  // Divider,
  NumberInput,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconUsers,
  IconFlask,
  IconFileText,
  // IconCalendar,
  // IconTrendingUp,
  IconAlertCircle,
  IconCheck,
  // IconX,
  IconDotsVertical,
  // IconClipboardList,
  IconBooks,
  // IconActivity,
  IconDownload,
} from '@tabler/icons-react';
// Mock data imports removed
import researchService from '../../../services/research.service';

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [activeTab, setActiveTab] = useState('trials');
  const [selectedTrial, setSelectedTrial] = useState<any>(null);

  const [trialModalOpened, { open: openTrialModal, close: closeTrialModal }] = useDisclosure(false);
  const [projectModalOpened, { open: openProjectModal, close: closeProjectModal }] =
    useDisclosure(false);

  // API state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchProjects(), fetchStats()]);
    } catch (err: any) {
      console.error('Error loading research data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load research data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await researchService.getProjects();
      // Projects data handled by service
    } catch (err: any) {
      console.error('Error fetching research projects:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await researchService.getStats();
      // Stats data handled by service
    } catch (err: any) {
      console.error('Error fetching research stats:', err);
    }
  };

  // Filter trials
  const filteredTrials = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (trial) => {
        const matchesSearch =
          trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trial.trialId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || trial.status === statusFilter;
        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, statusFilter]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (project) => {
        const matchesSearch =
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.projectId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      recruiting: 'blue',
      active: 'green',
      completed: 'gray',
      suspended: 'orange',
      terminated: 'red',
      planning: 'cyan',
      on_hold: 'yellow',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      phase_i: 'Phase I',
      phase_ii: 'Phase II',
      phase_iii: 'Phase III',
      phase_iv: 'Phase IV',
      na: 'N/A',
    };
    return labels[phase] || phase;
  };

  const quickStats = [
    {
      title: 'Active Trials',
      value: 0 /* TODO: Fetch from API */,
      icon: IconFlask,
      color: 'blue',
    },
    {
      title: 'Total Participants',
      value: 0 /* TODO: Fetch from API */,
      icon: IconUsers,
      color: 'green',
    },
    {
      title: 'Research Projects',
      value: 0 /* TODO: Fetch from API */,
      icon: IconBooks,
      color: 'orange',
    },
    {
      title: 'Adverse Events',
      value: 0 /* TODO: Fetch from API */,
      icon: IconAlertCircle,
      color: 'red',
    },
  ];

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Medical Research & Clinical Trials</Title>
            <Text c="dimmed" size="sm">
              Manage clinical trials, research projects, and participant data
            </Text>
          </div>
          <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={openTrialModal}>
              New Clinical Trial
            </Button>
            <Button leftSection={<IconPlus size={16} />} variant="light" onClick={openProjectModal}>
              New Research Project
            </Button>
          </Group>
        </Group>

        {/* Quick Stats */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      {stat.title}
                    </Text>
                    <Text size="xl" fw={700} mt="xs">
                      {stat.value}
                    </Text>
                  </div>
                  <ThemeIcon size="xl" radius="md" variant="light" color={stat.color}>
                    <Icon size={24} />
                  </ThemeIcon>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Main Content */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'trials')}>
            <Tabs.List>
              <Tabs.Tab value="trials" leftSection={<IconFlask size={16} />}>
                Clinical Trials
              </Tabs.Tab>
              <Tabs.Tab value="projects" leftSection={<IconBooks size={16} />}>
                Research Projects
              </Tabs.Tab>
              <Tabs.Tab value="participants" leftSection={<IconUsers size={16} />}>
                Participants
              </Tabs.Tab>
              <Tabs.Tab value="adverse" leftSection={<IconAlertCircle size={16} />}>
                Adverse Events
              </Tabs.Tab>
            </Tabs.List>

            {/* Filters */}
            <Group mt="md" mb="md">
              <TextInput
                placeholder="Search..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filter by status"
                data={[
                  { value: 'all', label: 'All Status' },
                  { value: 'recruiting', label: 'Recruiting' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                style={{ width: 200 }}
              />
            </Group>

            {/* Clinical Trials Tab */}
            <Tabs.Panel value="trials">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Trial ID</Table.Th>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Phase</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Investigator</Table.Th>
                      <Table.Th>Enrollment</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredTrials.map((trial) => (
                      <Table.Tr key={trial.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {trial.trialId}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{trial.title}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {getPhaseLabel(trial.phase)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(trial.status)} variant="light" size="sm">
                            {trial.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{trial.investigator}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Text size="sm">
                              {trial.currentEnrollment}/{trial.targetEnrollment}
                            </Text>
                            <Progress
                              value={(trial.currentEnrollment / trial.targetEnrollment) * 100}
                              size="sm"
                              style={{ width: 60 }}
                            />
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => {
                                setSelectedTrial(trial);
                                openTrialModal();
                              }}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="gray">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <Menu position="bottom-end">
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconDownload size={14} />}>
                                  Export Data
                                </Menu.Item>
                                <Menu.Item leftSection={<IconFileText size={14} />}>
                                  View Protocol
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Tabs.Panel>

            {/* Research Projects Tab */}
            <Tabs.Panel value="projects">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Project ID</Table.Th>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Principal Investigator</Table.Th>
                      <Table.Th>Department</Table.Th>
                      <Table.Th>Budget</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredProjects.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={7}>
                          <EmptyState
                            icon={<IconFlask size={48} />}
                            title="No research projects"
                            description="Add your first research project"
                            size="sm"
                          />
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredProjects.map((project) => (
                        <Table.Tr key={project.id}>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {project.projectId}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{project.title}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={getStatusColor(project.status)} variant="light" size="sm">
                              {project.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{project.principalInvestigator}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{project.department}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">₹{project.budget.toLocaleString()}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="blue">
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle" color="gray">
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Tabs.Panel>

            {/* Participants Tab */}
            <Tabs.Panel value="participants">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Participant ID</Table.Th>
                      <Table.Th>Trial ID</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Study Arm</Table.Th>
                      <Table.Th>Adherence</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[].map(
                      /* TODO: Fetch from API */ (participant) => (
                        <Table.Tr key={participant.id}>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {participant.participantId}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{participant.trialId}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{participant.patientName}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getStatusColor(participant.status)}
                              variant="light"
                              size="sm"
                            >
                              {participant.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{participant.studyArm}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Progress
                                value={participant.adherenceRate}
                                size="sm"
                                style={{ width: 60 }}
                              />
                              <Text size="sm">{participant.adherenceRate}%</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="blue">
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle" color="gray">
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      )
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Tabs.Panel>

            {/* Adverse Events Tab */}
            <Tabs.Panel value="adverse">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Event ID</Table.Th>
                      <Table.Th>Trial ID</Table.Th>
                      <Table.Th>Participant</Table.Th>
                      <Table.Th>Event Type</Table.Th>
                      <Table.Th>Severity</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[].map(
                      /* TODO: Fetch from API */ (event) => (
                        <Table.Tr key={event.id}>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {event.eventId}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{event.trialId}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{event.participantId}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{event.eventType.replace(/_/g, ' ')}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                event.severity === 'mild'
                                  ? 'yellow'
                                  : event.severity === 'moderate'
                                    ? 'orange'
                                    : 'red'
                              }
                              variant="light"
                              size="sm"
                            >
                              {event.severity}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={event.ongoing ? 'orange' : 'green'}
                              variant="light"
                              size="sm"
                            >
                              {event.ongoing ? 'Ongoing' : 'Resolved'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="blue">
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle" color="gray">
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      )
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>

      {/* New Trial Modal */}
      <Modal
        opened={trialModalOpened}
        onClose={closeTrialModal}
        title={selectedTrial ? 'Trial Details' : 'New Clinical Trial'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput label="Trial ID" placeholder="TRIAL-2024-XXX" required />
          <TextInput label="Title" placeholder="Enter trial title" required />
          <Select
            label="Phase"
            placeholder="Select phase"
            data={[
              { value: 'phase_i', label: 'Phase I' },
              { value: 'phase_ii', label: 'Phase II' },
              { value: 'phase_iii', label: 'Phase III' },
              { value: 'phase_iv', label: 'Phase IV' },
            ]}
            required
          />
          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'recruiting', label: 'Recruiting' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'completed', label: 'Completed' },
            ]}
            required
          />
          <TextInput label="Principal Investigator" placeholder="Dr. Name" required />
          <NumberInput label="Target Enrollment" placeholder="Enter number" required />
          <Textarea label="Description" placeholder="Enter trial description" rows={4} />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeTrialModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Clinical trial saved successfully',
                  color: 'green',
                  icon: <IconCheck size={16} />,
                });
                closeTrialModal();
              }}
            >
              Save Trial
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* New Project Modal */}
      <Modal
        opened={projectModalOpened}
        onClose={closeProjectModal}
        title="New Research Project"
        size="lg"
      >
        <Stack gap="md">
          <TextInput label="Project ID" placeholder="PROJ-2024-XXX" required />
          <TextInput label="Title" placeholder="Enter project title" required />
          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
            ]}
            required
          />
          <TextInput label="Principal Investigator" placeholder="Dr. Name" required />
          <TextInput label="Department" placeholder="Enter department" required />
          <NumberInput label="Budget" placeholder="Enter budget" required />
          <TextInput label="Funding Source" placeholder="Enter funding source" required />
          <Textarea label="Description" placeholder="Enter project description" rows={4} />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeProjectModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Research project saved successfully',
                  color: 'green',
                  icon: <IconCheck size={16} />,
                });
                closeProjectModal();
              }}
            >
              Save Project
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
