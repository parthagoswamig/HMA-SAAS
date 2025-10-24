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
  Modal,
  Text,
  Tabs,
  Card,
  ActionIcon,
  Stack,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Progress,
  Textarea,
  Table,
  Switch,
  NumberInput,
  Alert,
  Timeline,
  MultiSelect,
  Indicator,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import {
  MantineDonutChart,
  SimpleLineChart,
  SimpleAreaChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconMessage,
  IconRefresh,
  IconSend,
  // IconMessageCircle,
  IconBell,
  IconTarget,
  // IconStar,
  IconDeviceMobile,
  IconBrandWhatsapp,
  IconMail,
  IconPhoneCall,
  IconClockHour4,
  IconX,
  IconTemplate,
  IconCheckbox,
  IconActivity,
  IconChartBar,
  IconTrash,
  IconEdit,
  IconClockPause,
  IconAlertCircle,
  IconCalendar,
  IconCheck,
} from '@tabler/icons-react';

// Types
interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'email' | 'push' | 'voice';
  category:
    | 'appointment'
    | 'reminder'
    | 'follow-up'
    | 'emergency'
    | 'marketing'
    | 'billing'
    | 'general';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdDate: string;
  lastUsed?: string;
  usageCount: number;
  language: string;
}

interface CommunicationMessage {
  id: string;
  templateId?: string;
  templateName?: string;
  type: 'sms' | 'whatsapp' | 'email' | 'push' | 'voice';
  recipient: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    type: 'patient' | 'doctor' | 'staff' | 'group';
  };
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
  scheduledTime?: string;
  sentTime?: string;
  deliveredTime?: string;
  readTime?: string;
  attempts: number;
  cost: number;
  errorMessage?: string;
  metadata: {
    patientId?: string;
    appointmentId?: string;
    billId?: string;
    campaignId?: string;
  };
}

interface CommunicationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'sms' | 'whatsapp' | 'email' | 'multi-channel';
  templateId: string;
  templateName: string;
  targetAudience: {
    type: 'all-patients' | 'specific-patients' | 'department' | 'age-group' | 'custom';
    criteria: Record<string, any>;
    count: number;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  totalCost: number;
  createdBy: string;
  createdDate: string;
}

// Mock data
const CommunicationsManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [templates] = useState<CommunicationTemplate[]>([]);
  const [campaigns] = useState<CommunicationCampaign[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CommunicationCampaign | null>(null);

  // Modal states
  const [messageDetailOpened, { open: openMessageDetail, close: closeMessageDetail }] =
    useDisclosure(false);
  const [newMessageOpened, { open: openNewMessage, close: closeNewMessage }] = useDisclosure(false);
  const [templateDetailOpened, { open: openTemplateDetail, close: closeTemplateDetail }] =
    useDisclosure(false);
  const [newTemplateOpened, { open: openNewTemplate, close: closeNewTemplate }] = useDisclosure(false);
  const [campaignDetailOpened, { open: openCampaignDetail, close: closeCampaignDetail }] =
    useDisclosure(false);
  const [newCampaignOpened, { open: openNewCampaign, close: closeNewCampaign }] = useDisclosure(false);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (message) => {
        const matchesSearch =
          message.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (message.templateName &&
            message.templateName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = !selectedType || message.type === selectedType;
        const matchesStatus = !selectedStatus || message.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
      }
    );
  }, [searchQuery, selectedType, selectedStatus]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedType || template.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [templates, searchQuery, selectedType]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.templateName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [campaigns, searchQuery]);

  const handleViewMessage = (message: CommunicationMessage) => {
    setSelectedMessage(message);
    openMessageDetail();
  };

  const handleViewTemplate = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    openTemplateDetail();
  };

  const handleViewCampaign = (campaign: CommunicationCampaign) => {
    setSelectedCampaign(campaign);
    openCampaignDetail();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'blue';
      case 'delivered':
        return 'green';
      case 'read':
        return 'teal';
      case 'pending':
        return 'yellow';
      case 'scheduled':
        return 'purple';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'completed':
        return 'green';
      case 'paused':
        return 'orange';
      case 'draft':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <IconDeviceMobile size={16} />;
      case 'whatsapp':
        return <IconBrandWhatsapp size={16} />;
      case 'email':
        return <IconMail size={16} />;
      case 'push':
        return <IconBell size={16} />;
      case 'voice':
        return <IconPhoneCall size={16} />;
      default:
        return <IconMessage size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Communication stats
  const communicationStats = {
    totalMessages: 0 /* TODO: Fetch from API */,
    sentMessages: [].filter(
      /* TODO: Fetch from API */ (m) =>
        m.status === 'sent' || m.status === 'delivered' || m.status === 'read'
    ).length,
    pendingMessages: [].filter(
      /* TODO: Fetch from API */ (m) => m.status === 'pending' || m.status === 'scheduled'
    ).length,
    failedMessages: [].filter(/* TODO: Fetch from API */ (m) => m.status === 'failed').length,
    totalTemplates: 0 /* TODO: Fetch from API */,
    activeTemplates: [].filter(/* TODO: Fetch from API */ (t) => t.isActive).length,
    totalCampaigns: 0 /* TODO: Fetch from API */,
    activeCampaigns: [].filter(
      /* TODO: Fetch from API */ (c) => c.status === 'running' || c.status === 'scheduled'
    ).length,
  };

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <Title order={1} className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">Communications Center</Title>
          <Text c="dimmed" className="text-xs sm:text-sm">
            Manage SMS, WhatsApp, email, and push notifications
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="light" leftSection={<IconRefresh size={16} />} className="w-full sm:w-auto" size="sm">
            Refresh Status
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openNewMessage} className="w-full sm:w-auto" size="sm">
            Send Message
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 8 }} mb={{ base: 'md', sm: 'lg' }} spacing={{ base: 'xs', sm: 'sm', md: 'md' }}>
        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="blue" size="lg" radius="md" variant="light">
              <IconMessage size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.totalMessages}
              </Text>
              <Text size="xs" c="dimmed">
                Total Messages
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="green" size="lg" radius="md" variant="light">
              <IconSend size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.sentMessages}
              </Text>
              <Text size="xs" c="dimmed">
                Sent
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="yellow" size="lg" radius="md" variant="light">
              <IconClockHour4 size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.pendingMessages}
              </Text>
              <Text size="xs" c="dimmed">
                Pending
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="red" size="lg" radius="md" variant="light">
              <IconX size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.failedMessages}
              </Text>
              <Text size="xs" c="dimmed">
                Failed
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="purple" size="lg" radius="md" variant="light">
              <IconTemplate size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.totalTemplates}
              </Text>
              <Text size="xs" c="dimmed">
                Templates
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="teal" size="lg" radius="md" variant="light">
              <IconCheckbox size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.activeTemplates}
              </Text>
              <Text size="xs" c="dimmed">
                Active
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="cyan" size="lg" radius="md" variant="light">
              <IconTarget size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.totalCampaigns}
              </Text>
              <Text size="xs" c="dimmed">
                Campaigns
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="orange" size="lg" radius="md" variant="light">
              <IconActivity size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {communicationStats.activeCampaigns}
              </Text>
              <Text size="xs" c="dimmed">
                Running
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="flex-wrap">
          <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />} className="text-xs sm:text-sm">
            Messages
          </Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<IconTemplate size={16} />} className="text-xs sm:text-sm">
            Templates
          </Tabs.Tab>
          <Tabs.Tab value="campaigns" leftSection={<IconTarget size={16} />} className="text-xs sm:text-sm">
            Campaigns
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />} className="text-xs sm:text-sm">
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Messages Tab */}
        <Tabs.Panel value="messages">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search messages..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'sms', label: 'SMS' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'email', label: 'Email' },
                  { value: 'push', label: 'Push Notification' },
                  { value: 'voice', label: 'Voice Call' },
                ]}
                value={selectedType}
                onChange={(value) => setSelectedType(value || '')}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'read', label: 'Read' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'scheduled', label: 'Scheduled' },
                ]}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value || '')}
                clearable
              />
            </Group>

            {/* Messages Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Recipient</Table.Th>
                    <Table.Th>Template</Table.Th>
                    <Table.Th>Content</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Sent Time</Table.Th>
                    <Table.Th>Cost</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredMessages.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <EmptyState
                          icon={<IconMessage size={48} />}
                          title="No messages"
                          description="Communication history will appear here"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredMessages.map((message) => (
                      <Table.Tr key={message.id}>
                        <Table.Td>
                          <Group gap="xs">
                            <ThemeIcon size="sm" variant="light">
                              {getTypeIcon(message.type)}
                            </ThemeIcon>
                            <Text size="sm" tt="uppercase">
                              {message.type}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {message.recipient.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {message.recipient.phone || message.recipient.email}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {message.templateName || 'Custom'}
                            </Text>
                            {message.subject && (
                              <Text size="xs" c="dimmed">
                                {message.subject}
                              </Text>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2} style={{ maxWidth: 200 }}>
                            {message.content}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge color={getStatusColor(message.status)} variant="light" size="sm">
                              {message.status.toUpperCase()}
                            </Badge>
                            {message.status === 'pending' && <Indicator color="orange" size={6} />}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={getPriorityColor(message.priority)}
                            variant="outline"
                            size="sm"
                          >
                            {message.priority.toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {message.sentTime
                              ? formatDateTime(message.sentTime)
                              : message.scheduledTime
                                ? `Scheduled: ${formatDateTime(message.scheduledTime)}`
                                : '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            ₹{message.cost.toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewMessage(message)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconSend size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red">
                              <IconTrash size={16} />
                            </ActionIcon>
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

        {/* Templates Tab */}
        <Tabs.Panel value="templates">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Message Templates</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openNewTemplate}>
                New Template
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  padding="lg"
                  radius="md"
                  withBorder
                  onClick={() => handleViewTemplate(template)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group justify="space-between" mb="md">
                    <div>
                      <Group mb="xs">
                        <ThemeIcon size="sm" variant="light">
                          {getTypeIcon(template.type)}
                        </ThemeIcon>
                        <Text fw={600} size="lg">
                          {template.name}
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed" tt="capitalize">
                        {template.category}
                      </Text>
                    </div>
                    <Group>
                      <Badge color={template.isActive ? 'green' : 'red'} variant="light">
                        {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                      <Badge variant="outline" size="sm" tt="uppercase">
                        {template.type}
                      </Badge>
                    </Group>
                  </Group>

                  <Text size="sm" lineClamp={3} mb="md">
                    {template.content}
                  </Text>

                  <Stack gap="xs" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Usage Count
                      </Text>
                      <Text size="sm" fw={500}>
                        {template.usageCount}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Variables
                      </Text>
                      <Text size="sm" fw={500}>
                        {template.variables.length}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Last Used
                      </Text>
                      <Text size="sm" fw={500}>
                        {template.lastUsed ? formatDate(template.lastUsed) : 'Never'}
                      </Text>
                    </Group>
                  </Stack>

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Created: {formatDate(template.createdDate)}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconSend size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Campaigns Tab */}
        <Tabs.Panel value="campaigns">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Communication Campaigns</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openNewCampaign}>
                New Campaign
              </Button>
            </Group>

            <Stack gap="lg">
              {filteredCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    padding="lg"
                    radius="md"
                    withBorder
                    onClick={() => handleViewCampaign(campaign)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Group justify="space-between" mb="md">
                      <div>
                        <Title order={4}>{campaign.name}</Title>
                        <Text c="dimmed" size="sm">
                          {campaign.description}
                        </Text>
                      </div>
                      <Group>
                        <Badge color={getStatusColor(campaign.status)} variant="light" size="lg">
                          {campaign.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" tt="uppercase">
                          {campaign.type}
                        </Badge>
                      </Group>
                    </Group>

                    <SimpleGrid cols={6} spacing="md" mb="md">
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700} c="blue">
                          {campaign.totalRecipients}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Total Recipients
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700} c="green">
                          {campaign.sentCount}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Sent
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700} c="teal">
                          {campaign.deliveredCount}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Delivered
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700} c="cyan">
                          {campaign.readCount}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Read
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700} c="red">
                          {campaign.failedCount}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Failed
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700} c="orange">
                          ₹{campaign.totalCost.toFixed(2)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Total Cost
                        </Text>
                      </div>
                    </SimpleGrid>

                    {campaign.status === 'running' && campaign.sentCount > 0 && (
                      <div className="mb-md">
                        <Text size="sm" c="dimmed" mb="xs">
                          Campaign Progress
                        </Text>
                        <Progress
                          value={(campaign.sentCount / campaign.totalRecipients) * 100}
                          size="lg"
                          color="blue"
                        />
                        <Group justify="space-between" mt="xs">
                          <Text size="xs" c="dimmed">
                            {Math.round((campaign.sentCount / campaign.totalRecipients) * 100)}%
                            completed
                          </Text>
                          <Text size="xs" c="dimmed">
                            {campaign.totalRecipients - campaign.sentCount} remaining
                          </Text>
                        </Group>
                      </div>
                    )}

                    <Group justify="space-between">
                      <div>
                        <Text size="sm" c="dimmed">
                          Template: {campaign.templateName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Target: {campaign.targetAudience.type.replace('-', ' ')} (
                          {campaign.targetAudience.count} recipients)
                        </Text>
                      </div>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        {campaign.status === 'running' && (
                          <ActionIcon variant="subtle" color="orange">
                            <IconClockPause size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Channel Settings */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Channel Configuration
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group>
                    <IconDeviceMobile size={20} />
                    <Text>SMS Service</Text>
                  </Group>
                  <Switch defaultChecked />
                </Group>
                <Group justify="space-between">
                  <Group>
                    <IconBrandWhatsapp size={20} />
                    <Text>WhatsApp Business</Text>
                  </Group>
                  <Switch defaultChecked />
                </Group>
                <Group justify="space-between">
                  <Group>
                    <IconMail size={20} />
                    <Text>Email Service</Text>
                  </Group>
                  <Switch defaultChecked />
                </Group>
                <Group justify="space-between">
                  <Group>
                    <IconBell size={20} />
                    <Text>Push Notifications</Text>
                  </Group>
                  <Switch />
                </Group>
                <Group justify="space-between">
                  <Group>
                    <IconPhoneCall size={20} />
                    <Text>Voice Calls</Text>
                  </Group>
                  <Switch />
                </Group>
              </Stack>
            </Card>

            {/* API Settings */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                API Configuration
              </Title>
              <Stack gap="md">
                <TextInput
                  label="SMS Gateway API Key"
                  placeholder="Enter API key"
                  type="password"
                />
                <TextInput
                  label="WhatsApp Business API Token"
                  placeholder="Enter API token"
                  type="password"
                />
                <TextInput label="Email SMTP Server" placeholder="smtp.gmail.com" />
                <Group grow>
                  <TextInput label="SMTP Username" placeholder="username@domain.com" />
                  <TextInput label="SMTP Password" placeholder="Enter password" type="password" />
                </Group>
                <Button variant="light" fullWidth>
                  Test Configuration
                </Button>
              </Stack>
            </Card>

            {/* Rate Limiting */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Rate Limiting
              </Title>
              <Stack gap="md">
                <NumberInput
                  label="SMS per minute"
                  placeholder="100"
                  defaultValue={100}
                  min={1}
                  max={1000}
                />
                <NumberInput
                  label="WhatsApp per minute"
                  placeholder="50"
                  defaultValue={50}
                  min={1}
                  max={500}
                />
                <NumberInput
                  label="Emails per minute"
                  placeholder="20"
                  defaultValue={20}
                  min={1}
                  max={100}
                />
                <Alert icon={<IconAlertCircle size="1rem" />} title="Rate Limiting Info">
                  Rate limits help prevent service provider restrictions and ensure reliable message
                  delivery.
                </Alert>
              </Stack>
            </Card>

            {/* Notification Preferences */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                System Notifications
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm">Failed message alerts</Text>
                  <Switch defaultChecked />
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Campaign completion</Text>
                  <Switch defaultChecked />
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Template usage reports</Text>
                  <Switch />
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Cost threshold alerts</Text>
                  <Switch defaultChecked />
                </Group>
                <NumberInput
                  label="Daily cost limit (₹)"
                  placeholder="1000"
                  defaultValue={1000}
                  min={0}
                />
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Message Type Distribution */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Message Type Distribution
              </Title>
              <MantineDonutChart
                data={[
                  { name: 'SMS', value: 2, color: 'blue' },
                  { name: 'WhatsApp', value: 2, color: 'green' },
                  { name: 'Email', value: 1, color: 'orange' },
                  { name: 'Push', value: 1, color: 'purple' },
                ]}
                size={160}
                thickness={30}
                withLabels
              />
            </Card>

            {/* Delivery Status */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Delivery Status Overview
              </Title>
              <MantineDonutChart
                data={[
                  { name: 'Delivered', value: 2, color: 'green' },
                  { name: 'Read', value: 1, color: 'teal' },
                  { name: 'Pending', value: 1, color: 'yellow' },
                  { name: 'Failed', value: 1, color: 'red' },
                ]}
                size={160}
                thickness={30}
                withLabels
              />
            </Card>

            {/* Daily Message Trends */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Daily Message Volume
              </Title>
              <SimpleLineChart
                h={200}
                data={[
                  { date: 'Mon', sms: 45, whatsapp: 32, email: 18 },
                  { date: 'Tue', sms: 52, whatsapp: 38, email: 22 },
                  { date: 'Wed', sms: 48, whatsapp: 35, email: 20 },
                  { date: 'Thu', sms: 61, whatsapp: 42, email: 25 },
                  { date: 'Fri', sms: 55, whatsapp: 40, email: 23 },
                  { date: 'Sat', sms: 38, whatsapp: 28, email: 15 },
                  { date: 'Sun', sms: 32, whatsapp: 25, email: 12 },
                ]}
                dataKey="date"
                series={[
                  { name: 'sms', color: 'blue.6', label: 'SMS' },
                  { name: 'whatsapp', color: 'green.6', label: 'WhatsApp' },
                  { name: 'email', color: 'orange.6', label: 'Email' },
                ]}
              />
            </Card>

            {/* Cost Analysis */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Monthly Communication Costs
              </Title>
              <SimpleAreaChart
                h={200}
                data={[
                  { month: 'Jan', sms: 156.5, whatsapp: 89.3, email: 12.8 },
                  { month: 'Feb', sms: 178.2, whatsapp: 95.6, email: 15.4 },
                  { month: 'Mar', sms: 165.8, whatsapp: 102.4, email: 18.2 },
                  { month: 'Apr', sms: 192.3, whatsapp: 110.8, email: 20.6 },
                  { month: 'May', sms: 185.7, whatsapp: 98.5, email: 17.9 },
                  { month: 'Jun', sms: 201.4, whatsapp: 115.2, email: 22.3 },
                ]}
                dataKey="month"
                series={[
                  { name: 'sms', color: 'blue.6' },
                  { name: 'whatsapp', color: 'green.6' },
                  { name: 'email', color: 'orange.6' },
                ]}
              />
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Message Detail Modal */}
      <Modal
        opened={messageDetailOpened}
        onClose={closeMessageDetail}
        title="Message Details"
        size="lg"
      >
        {selectedMessage && (
          <Stack gap="md">
            {/* Message Header */}
            <Group justify="space-between" mb="md">
              <div>
                <Group mb="xs">
                  <ThemeIcon variant="light">{getTypeIcon(selectedMessage.type)}</ThemeIcon>
                  <Title order={4}>{selectedMessage.type.toUpperCase()} Message</Title>
                </Group>
                <Text c="dimmed">To: {selectedMessage.recipient.name}</Text>
              </div>
              <Group>
                <Badge color={getStatusColor(selectedMessage.status)} variant="light" size="lg">
                  {selectedMessage.status.toUpperCase()}
                </Badge>
                <Badge color={getPriorityColor(selectedMessage.priority)} variant="outline">
                  {selectedMessage.priority.toUpperCase()}
                </Badge>
              </Group>
            </Group>

            {/* Message Content */}
            <Paper p="md" radius="md" withBorder>
              {selectedMessage.subject && (
                <div>
                  <Text size="sm" c="dimmed" fw={500}>
                    Subject
                  </Text>
                  <Text fw={600} mb="md">
                    {selectedMessage.subject}
                  </Text>
                </div>
              )}
              <Text size="sm" c="dimmed" fw={500}>
                Content
              </Text>
              <Text mt="xs">{selectedMessage.content}</Text>
            </Paper>

            {/* Message Timeline */}
            <Paper p="md" radius="md" withBorder>
              <Title order={5} mb="md">
                Message Timeline
              </Title>
              <Timeline bulletSize={20} lineWidth={2}>
                {selectedMessage.scheduledTime && (
                  <Timeline.Item bullet={<IconCalendar size={12} />} title="Scheduled">
                    <Text c="dimmed" size="sm">
                      Message scheduled for delivery
                    </Text>
                    <Text size="xs" mt={4}>
                      {formatDateTime(selectedMessage.scheduledTime)}
                    </Text>
                  </Timeline.Item>
                )}
                {selectedMessage.sentTime && (
                  <Timeline.Item bullet={<IconSend size={12} />} title="Sent" color="blue">
                    <Text c="dimmed" size="sm">
                      Message sent to recipient
                    </Text>
                    <Text size="xs" mt={4}>
                      {formatDateTime(selectedMessage.sentTime)}
                    </Text>
                  </Timeline.Item>
                )}
                {selectedMessage.deliveredTime && (
                  <Timeline.Item bullet={<IconCheck size={12} />} title="Delivered" color="green">
                    <Text c="dimmed" size="sm">
                      Message delivered successfully
                    </Text>
                    <Text size="xs" mt={4}>
                      {formatDateTime(selectedMessage.deliveredTime)}
                    </Text>
                  </Timeline.Item>
                )}
                {selectedMessage.readTime && (
                  <Timeline.Item bullet={<IconEye size={12} />} title="Read" color="teal">
                    <Text c="dimmed" size="sm">
                      Message read by recipient
                    </Text>
                    <Text size="xs" mt={4}>
                      {formatDateTime(selectedMessage.readTime)}
                    </Text>
                  </Timeline.Item>
                )}
              </Timeline>
            </Paper>

            {/* Message Stats */}
            <SimpleGrid cols={4} spacing="md">
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700}>
                  {selectedMessage.attempts}
                </Text>
                <Text size="sm" c="dimmed">
                  Attempts
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700}>
                  ₹{selectedMessage.cost.toFixed(2)}
                </Text>
                <Text size="sm" c="dimmed">
                  Cost
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700}>
                  {selectedMessage.recipient.phone || selectedMessage.recipient.email}
                </Text>
                <Text size="sm" c="dimmed">
                  Contact
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700} tt="capitalize">
                  {selectedMessage.recipient.type}
                </Text>
                <Text size="sm" c="dimmed">
                  Recipient Type
                </Text>
              </div>
            </SimpleGrid>

            {/* Action Buttons */}
            <Group justify="flex-end">
              <Button variant="light" onClick={closeMessageDetail}>
                Close
              </Button>
              {selectedMessage.status === 'failed' && (
                <Button leftSection={<IconRefresh size={16} />}>Retry Send</Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>

      {/* New Message Modal */}
      <Modal opened={newMessageOpened} onClose={closeNewMessage} title="Send New Message" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Message Type"
              placeholder="Select type"
              data={[
                { value: 'sms', label: 'SMS' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'Email' },
                { value: 'push', label: 'Push Notification' },
              ]}
              required
            />
            <Select
              label="Template"
              placeholder="Select template (optional)"
              data={[].map(/* TODO: Fetch from API */ (t) => ({ value: t.id, label: t.name }))}
              searchable
              clearable
            />
          </SimpleGrid>

          <MultiSelect
            label="Recipients"
            placeholder="Select recipients"
            data={[
              { value: 'P001', label: 'Rajesh Kumar - Patient' },
              { value: 'P002', label: 'Sunita Patel - Patient' },
              { value: 'D001', label: 'Dr. Sharma - Doctor' },
              { value: 'ALL_PATIENTS', label: 'All Patients' },
              { value: 'ICU_STAFF', label: 'ICU Staff' },
            ]}
            searchable
            required
          />

          <TextInput label="Subject (Email only)" placeholder="Enter subject" />

          <Textarea
            label="Message Content"
            placeholder="Enter your message..."
            minRows={4}
            required
          />

          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              defaultValue="medium"
              required
            />
            <DatePickerInput
              label="Schedule Send Time (Optional)"
              placeholder="Select date and time"
              clearable
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewMessage}>
              Cancel
            </Button>
            <Button
              leftSection={<IconSend size={16} />}
              onClick={() => {
                notifications.show({
                  title: 'Message Sent',
                  message: 'Your message has been sent successfully',
                  color: 'green',
                });
                closeNewMessage();
              }}
            >
              Send Message
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Template Detail Modal */}
      <Modal
        opened={templateDetailOpened}
        onClose={closeTemplateDetail}
        title="Template Details"
        size="lg"
      >
        {selectedTemplate && (
          <Stack gap="md">
            {/* Template Header */}
            <Group justify="space-between" mb="md">
              <div>
                <Group mb="xs">
                  <ThemeIcon variant="light">{getTypeIcon(selectedTemplate.type)}</ThemeIcon>
                  <Title order={4}>{selectedTemplate.name}</Title>
                </Group>
                <Text c="dimmed" size="sm">
                  Category: {selectedTemplate.category} | Type: {selectedTemplate.type.toUpperCase()}
                </Text>
              </div>
              <Group>
                <Badge color={selectedTemplate.isActive ? 'green' : 'red'} variant="light" size="lg">
                  {selectedTemplate.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </Group>
            </Group>

            {/* Template Content */}
            <Paper p="md" radius="md" withBorder>
              {selectedTemplate.subject && (
                <div>
                  <Text size="sm" c="dimmed" fw={500}>
                    Subject
                  </Text>
                  <Text fw={600} mb="md">
                    {selectedTemplate.subject}
                  </Text>
                </div>
              )}
              <Text size="sm" c="dimmed" fw={500}>
                Content
              </Text>
              <Text mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
                {selectedTemplate.content}
              </Text>
            </Paper>

            {/* Template Stats */}
            <SimpleGrid cols={3} spacing="md">
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700}>
                  {selectedTemplate.usageCount}
                </Text>
                <Text size="sm" c="dimmed">
                  Usage Count
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700}>
                  {selectedTemplate.variables.length}
                </Text>
                <Text size="sm" c="dimmed">
                  Variables
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={700}>
                  {selectedTemplate.language.toUpperCase()}
                </Text>
                <Text size="sm" c="dimmed">
                  Language
                </Text>
              </div>
            </SimpleGrid>

            {/* Variables */}
            {selectedTemplate.variables.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb="sm">
                  Available Variables
                </Text>
                <Group gap="xs">
                  {selectedTemplate.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}

            {/* Template Timeline */}
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Created Date
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(selectedTemplate.createdDate)}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Last Used
                </Text>
                <Text size="sm" fw={500}>
                  {selectedTemplate.lastUsed ? formatDate(selectedTemplate.lastUsed) : 'Never'}
                </Text>
              </div>
            </SimpleGrid>

            {/* Action Buttons */}
            <Group justify="flex-end">
              <Button variant="light" onClick={closeTemplateDetail}>
                Close
              </Button>
              <Button leftSection={<IconEdit size={16} />}>Edit Template</Button>
              <Button leftSection={<IconSend size={16} />}>Use Template</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Campaign Detail Modal */}
      <Modal
        opened={campaignDetailOpened}
        onClose={closeCampaignDetail}
        title="Campaign Details"
        size="xl"
      >
        {selectedCampaign && (
          <Stack gap="md">
            {/* Campaign Header */}
            <Group justify="space-between" mb="md">
              <div>
                <Title order={4}>{selectedCampaign.name}</Title>
                <Text c="dimmed" size="sm">
                  {selectedCampaign.description}
                </Text>
              </div>
              <Group>
                <Badge color={getStatusColor(selectedCampaign.status)} variant="light" size="lg">
                  {selectedCampaign.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" tt="uppercase">
                  {selectedCampaign.type}
                </Badge>
              </Group>
            </Group>

            {/* Campaign Stats */}
            <SimpleGrid cols={6} spacing="md" mb="md">
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="blue">
                  {selectedCampaign.totalRecipients}
                </Text>
                <Text size="xs" c="dimmed">
                  Total Recipients
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="green">
                  {selectedCampaign.sentCount}
                </Text>
                <Text size="xs" c="dimmed">
                  Sent
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="teal">
                  {selectedCampaign.deliveredCount}
                </Text>
                <Text size="xs" c="dimmed">
                  Delivered
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="cyan">
                  {selectedCampaign.readCount}
                </Text>
                <Text size="xs" c="dimmed">
                  Read
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="red">
                  {selectedCampaign.failedCount}
                </Text>
                <Text size="xs" c="dimmed">
                  Failed
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="orange">
                  ₹{selectedCampaign.totalCost.toFixed(2)}
                </Text>
                <Text size="xs" c="dimmed">
                  Total Cost
                </Text>
              </div>
            </SimpleGrid>

            {/* Campaign Progress */}
            {selectedCampaign.status === 'running' && selectedCampaign.sentCount > 0 && (
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Campaign Progress
                </Text>
                <Progress
                  value={(selectedCampaign.sentCount / selectedCampaign.totalRecipients) * 100}
                  size="lg"
                  color="blue"
                />
                <Group justify="space-between" mt="xs">
                  <Text size="xs" c="dimmed">
                    {Math.round((selectedCampaign.sentCount / selectedCampaign.totalRecipients) * 100)}%
                    completed
                  </Text>
                  <Text size="xs" c="dimmed">
                    {selectedCampaign.totalRecipients - selectedCampaign.sentCount} remaining
                  </Text>
                </Group>
              </div>
            )}

            {/* Campaign Details */}
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Template Used
                </Text>
                <Text size="sm" fw={500}>
                  {selectedCampaign.templateName}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Target Audience
                </Text>
                <Text size="sm" fw={500}>
                  {selectedCampaign.targetAudience.type.replace('-', ' ')} (
                  {selectedCampaign.targetAudience.count} recipients)
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Created Date
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(selectedCampaign.createdDate)}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Created By
                </Text>
                <Text size="sm" fw={500}>
                  {selectedCampaign.createdBy}
                </Text>
              </div>
            </SimpleGrid>

            {/* Action Buttons */}
            <Group justify="flex-end">
              <Button variant="light" onClick={closeCampaignDetail}>
                Close
              </Button>
              <Button leftSection={<IconEdit size={16} />}>Edit Campaign</Button>
              {selectedCampaign.status === 'running' && (
                <Button leftSection={<IconClockPause size={16} />} color="orange">
                  Pause Campaign
                </Button>
              )}
              {selectedCampaign.status === 'paused' && (
                <Button leftSection={<IconActivity size={16} />}>Resume Campaign</Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>

      {/* New Template Modal */}
      <Modal opened={newTemplateOpened} onClose={closeNewTemplate} title="Create New Template" size="lg">
        <Stack gap="md">
          <TextInput
            label="Template Name"
            placeholder="Enter template name"
            required
          />

          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Message Type"
              placeholder="Select type"
              data={[
                { value: 'sms', label: 'SMS' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email', label: 'Email' },
                { value: 'push', label: 'Push Notification' },
                { value: 'voice', label: 'Voice Call' },
              ]}
              required
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={[
                { value: 'appointment', label: 'Appointment' },
                { value: 'reminder', label: 'Reminder' },
                { value: 'follow-up', label: 'Follow-up' },
                { value: 'emergency', label: 'Emergency' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'billing', label: 'Billing' },
                { value: 'general', label: 'General' },
              ]}
              required
            />
          </SimpleGrid>

          <TextInput
            label="Subject (Email only)"
            placeholder="Enter subject"
          />

          <Textarea
            label="Template Content"
            placeholder="Enter template content with variables like {{patient_name}}, {{appointment_date}}"
            minRows={6}
            required
          />

          <Text size="sm" c="dimmed">
            Use variables like {'{{patient_name}}'}, {'{{doctor_name}}'}, {'{{appointment_date}}'} etc.
          </Text>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewTemplate}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Template Created',
                  message: 'Your template has been created successfully',
                  color: 'green',
                });
                closeNewTemplate();
              }}
            >
              Create Template
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* New Campaign Modal */}
      <Modal opened={newCampaignOpened} onClose={closeNewCampaign} title="Create New Campaign" size="lg">
        <Stack gap="md">
          <TextInput
            label="Campaign Name"
            placeholder="Enter campaign name"
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter campaign description"
            minRows={3}
            required
          />

          <Select
            label="Campaign Type"
            placeholder="Select campaign type"
            data={[
              { value: 'sms', label: 'SMS Campaign' },
              { value: 'whatsapp', label: 'WhatsApp Campaign' },
              { value: 'email', label: 'Email Campaign' },
              { value: 'multi-channel', label: 'Multi-Channel Campaign' },
            ]}
            required
          />

          <Select
            label="Template"
            placeholder="Select template to use"
            data={[
              { value: 'template1', label: 'Appointment Reminder Template' },
              { value: 'template2', label: 'Follow-up Template' },
              { value: 'template3', label: 'Emergency Alert Template' },
            ]}
            required
          />

          <Select
            label="Target Audience"
            placeholder="Select target audience"
            data={[
              { value: 'all-patients', label: 'All Patients' },
              { value: 'specific-patients', label: 'Specific Patients' },
              { value: 'department', label: 'Department' },
              { value: 'age-group', label: 'Age Group' },
              { value: 'custom', label: 'Custom Criteria' },
            ]}
            required
          />

          <DatePickerInput
            label="Schedule Campaign (Optional)"
            placeholder="Select date and time"
            clearable
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewCampaign}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Campaign Created',
                  message: 'Your campaign has been created successfully',
                  color: 'green',
                });
                closeNewCampaign();
              }}
            >
              Create Campaign
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default CommunicationsManagement;
