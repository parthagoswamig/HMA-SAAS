'use client';

// Types
interface AIInsight {
  id: string;
  type:
    | 'diagnosis'
    | 'treatment'
    | 'drug-interaction'
    | 'risk-assessment'
    | 'recommendation'
    | 'alert';
  title: string;
  description: string;
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'clinical' | 'medication' | 'diagnostic' | 'preventive' | 'emergency';
  patientId?: string;
  patientName?: string;
  generatedBy: string; // AI model name
  generatedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'implemented';
  evidence: Array<{
    source: string;
    relevance: number;
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    timeframe: string;
  }>;
  metadata: {
    symptoms?: string[];
    vitals?: Record<string, any>;
    labResults?: Record<string, any>;
    medications?: string[];
    allergies?: string[];
  };
}

interface AIQuery {
  id: string;
  question: string;
  context: {
    patientId?: string;
    symptoms?: string[];
    vitals?: Record<string, any>;
    history?: string[];
  };
  response: string;
  confidence: number;
  model: string;
  timestamp: string;
  userId: string;
  userName: string;
  category: 'diagnosis' | 'treatment' | 'medication' | 'general' | 'emergency';
  feedback?: {
    rating: number;
    helpful: boolean;
    comments?: string;
  };
}

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
  Divider,
  Alert,
  Loader,
  Accordion,
  Rating,
  Spoiler,
  Chip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import EmptyState from '../../../components/EmptyState';
import {
  IconSend,
  IconPlus,
  IconSearch,
  IconEye,
  IconShare,
  IconBrain,
  IconStethoscope,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconRefresh,
  IconRobot,
  IconBulb,
  IconSparkles,
  IconTarget,
  IconInfoCircle,
  IconQuestionMark,
  IconStar,
  IconMessageCircle,
  IconClockHour4,
  IconMoodCheck,
  IconBookmark,
  IconPill,
  IconShield,
  IconChartBar,
  IconMedicalCross,
} from '@tabler/icons-react';

const AIAssistant = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('insights');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [newQuery, setNewQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [insightDetailOpened, { open: openInsightDetail, close: closeInsightDetail }] =
    useDisclosure(false);
  const [askAIOpened, { open: openAskAI, close: closeAskAI }] = useDisclosure(false);

  // Filter insights
  const filteredInsights = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (insight) => {
        const matchesSearch =
          insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (insight.patientName &&
            insight.patientName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = !selectedCategory || insight.category === selectedCategory;
        const matchesSeverity = !selectedSeverity || insight.severity === selectedSeverity;

        return matchesSearch && matchesCategory && matchesSeverity;
      }
    );
  }, [searchQuery, selectedCategory, selectedSeverity]);

  // Filter queries
  const filteredQueries = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (query) => {
        const matchesSearch =
          query.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          query.response.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      }
    );
  }, [searchQuery]);

  const handleViewInsight = (insight: AIInsight) => {
    setSelectedInsight(insight);
    openInsightDetail();
  };

  const handleViewQuery = (_query: AIQuery) => {
    // Query detail functionality removed
  };

  const handleAskAI = async () => {
    if (!newQuery.trim()) return;

    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      notifications.show({
        title: 'AI Response Generated',
        message: 'Your question has been processed and the response is ready',
        color: 'green',
      });
      closeAskAI();
      setNewQuery('');
    }, 3000);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'green';
      case 'implemented':
        return 'teal';
      case 'reviewed':
        return 'blue';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return <IconStethoscope size={16} />;
      case 'treatment':
        return <IconStethoscope size={16} />;
      case 'drug-interaction':
        return <IconPill size={16} />;
      case 'risk-assessment':
        return <IconShield size={16} />;
      case 'recommendation':
        return <IconBulb size={16} />;
      case 'alert':
        return <IconAlertTriangle size={16} />;
      default:
        return <IconBrain size={16} />;
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

  // AI Assistant stats
  const aiStats = {
    totalInsights: 0 /* TODO: Fetch from API */,
    pendingInsights: [].filter(/* TODO: Fetch from API */ (i) => i.status === 'pending').length,
    acceptedInsights: [].filter(/* TODO: Fetch from API */ (i) => i.status === 'accepted').length,
    criticalInsights: [].filter(/* TODO: Fetch from API */ (i) => i.severity === 'critical').length,
    totalQueries: 0 /* TODO: Fetch from API */,
    avgConfidence: Math.round(
      [].reduce(/* TODO: Fetch from API */ (acc, i) => acc + i.confidence, 0) /
        0 /* TODO: Fetch from API */
    ),
    avgRating:
      []
        .filter(/* TODO: Fetch from API */ (q) => q.feedback?.rating)
        .reduce((acc, q) => acc + (q.feedback?.rating || 0), 0) /
      [].filter(/* TODO: Fetch from API */ (q) => q.feedback?.rating).length,
    helpfulResponses: [].filter(/* TODO: Fetch from API */ (q) => q.feedback?.helpful).length,
  };

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <Group mb="xs" gap="sm">
            <ThemeIcon color="blue" size="xl" variant="light" visibleFrom="sm">
              <IconBrain size={24} />
            </ThemeIcon>
            <div>
              <Title order={1} className="text-xl sm:text-2xl md:text-3xl">AI Clinical Assistant</Title>
              <Text c="dimmed" className="text-xs sm:text-sm">
                Intelligent clinical decision support and medical insights
              </Text>
            </div>
          </Group>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="light" leftSection={<IconRefresh size={16} />} className="w-full sm:w-auto" size="sm">
            Refresh Insights
          </Button>
          <Button leftSection={<IconMessageCircle size={16} />} onClick={openAskAI} className="w-full sm:w-auto" size="sm">
            Ask AI
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 8 }} mb={{ base: 'md', sm: 'lg' }} spacing={{ base: 'xs', sm: 'sm', md: 'md' }}>
        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="blue" size="lg" radius="md" variant="light">
              <IconSparkles size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.totalInsights}
              </Text>
              <Text size="xs" c="dimmed">
                AI Insights
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
                {aiStats.pendingInsights}
              </Text>
              <Text size="xs" c="dimmed">
                Pending Review
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="green" size="lg" radius="md" variant="light">
              <IconCheck size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.acceptedInsights}
              </Text>
              <Text size="xs" c="dimmed">
                Accepted
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="red" size="lg" radius="md" variant="light">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.criticalInsights}
              </Text>
              <Text size="xs" c="dimmed">
                Critical
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="purple" size="lg" radius="md" variant="light">
              <IconQuestionMark size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.totalQueries}
              </Text>
              <Text size="xs" c="dimmed">
                AI Queries
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="teal" size="lg" radius="md" variant="light">
              <IconTarget size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.avgConfidence}%
              </Text>
              <Text size="xs" c="dimmed">
                Avg Confidence
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="orange" size="lg" radius="md" variant="light">
              <IconStar size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.avgRating.toFixed(1)}
              </Text>
              <Text size="xs" c="dimmed">
                Avg Rating
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="sm" radius="md" withBorder className="p-2 sm:p-3 md:p-4">
          <Group justify="center">
            <ThemeIcon color="lime" size="lg" radius="md" variant="light">
              <IconMoodCheck size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {aiStats.helpfulResponses}
              </Text>
              <Text size="xs" c="dimmed">
                Helpful
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'insights')}>
        <Tabs.List className="flex-wrap">
          <Tabs.Tab value="insights" leftSection={<IconBulb size={16} />} className="text-xs sm:text-sm">
            AI Insights
          </Tabs.Tab>
          <Tabs.Tab value="queries" leftSection={<IconMessageCircle size={16} />} className="text-xs sm:text-sm">
            Query History
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />} className="text-xs sm:text-sm">
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* AI Insights Tab */}
        <Tabs.Panel value="insights">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search insights..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Category"
                data={[
                  { value: 'clinical', label: 'Clinical' },
                  { value: 'medication', label: 'Medication' },
                  { value: 'diagnostic', label: 'Diagnostic' },
                  { value: 'preventive', label: 'Preventive' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'all', label: 'All' },
                ]}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || 'all')}
                clearable
              />
              <Select
                placeholder="Severity"
                data={[
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                value={selectedSeverity}
                onChange={(value) => setSelectedSeverity(value || '')}
                clearable
              />
            </Group>

            {/* Insights Cards */}
            <Stack gap="md">
              {filteredInsights.length === 0 ? (
                <EmptyState
                  icon={<IconRobot size={48} />}
                  title="No AI insights"
                  description="Start using AI assistant"
                  size="sm"
                />
              ) : (
                filteredInsights.map((insight) => (
                  <Card
                    key={insight.id}
                    padding="lg"
                    radius="md"
                    withBorder
                    onClick={() => handleViewInsight(insight)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Group justify="space-between" mb="md">
                      <div>
                        <Group mb="xs">
                          <ThemeIcon
                            size="sm"
                            variant="light"
                            color={getSeverityColor(insight.severity)}
                          >
                            {getTypeIcon(insight.type)}
                          </ThemeIcon>
                          <Title order={4}>{insight.title}</Title>
                        </Group>
                        {insight.patientName && (
                          <Text c="dimmed" size="sm">
                            Patient: {insight.patientName}
                          </Text>
                        )}
                      </div>
                      <Group>
                        <Badge color={getSeverityColor(insight.severity)} variant="light" size="lg">
                          {insight.severity.toUpperCase()}
                        </Badge>
                        <Badge color={getStatusColor(insight.status)} variant="outline">
                          {insight.status.toUpperCase()}
                        </Badge>
                      </Group>
                    </Group>

                    <Text size="sm" mb="md" lineClamp={2}>
                      {insight.description}
                    </Text>

                    <Group justify="space-between">
                      <div>
                        <Text size="xs" c="dimmed">
                          Generated by {insight.generatedBy} •{' '}
                          {formatDateTime(insight.generatedDate)}
                        </Text>
                        {insight.reviewedBy && (
                          <Text size="xs" c="dimmed">
                            Reviewed by {insight.reviewedBy} •{' '}
                            {formatDateTime(insight.reviewedDate!)}
                          </Text>
                        )}
                      </div>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red">
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                ))
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* AI Queries Tab */}
        <Tabs.Panel value="queries">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Recent AI Queries</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={openAskAI}>
                Ask New Question
              </Button>
            </Group>

            <Stack gap="lg">
              {filteredQueries.map((query) => (
                <Card
                  key={query.id}
                  padding="lg"
                  radius="md"
                  withBorder
                  onClick={() => handleViewQuery(query)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group justify="space-between" mb="md">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="md" mb="xs" lineClamp={2}>
                        {query.question}
                      </Text>
                      <Group gap="sm">
                        <Badge variant="light" size="sm" tt="capitalize">
                          {query.category}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          by {query.userName} • {formatDateTime(query.timestamp)}
                        </Text>
                      </Group>
                    </div>
                    <Group>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Confidence:
                        </Text>
                        <Progress value={query.confidence} size="sm" w={60} color="green" />
                        <Text size="xs" fw={500}>
                          {query.confidence}%
                        </Text>
                      </Group>
                      {query.feedback && (
                        <Group gap="xs">
                          <Rating value={query.feedback.rating} readOnly size="sm" />
                          <Text size="xs" c="dimmed">
                            ({query.feedback.rating})
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </Group>

                  <Spoiler maxHeight={60} showLabel="Show more" hideLabel="Hide">
                    <Text size="sm" c="dimmed">
                      {query.response}
                    </Text>
                  </Spoiler>

                  <Group justify="space-between" mt="md">
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light" color="blue">
                        <IconRobot size={14} />
                      </ThemeIcon>
                      <Text size="xs" c="dimmed">
                        {query.model}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconBookmark size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconShare size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Clinical Guidelines Tab */}
        <Tabs.Panel value="guidelines">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Evidence-Based Clinical Guidelines
            </Title>

            <Accordion variant="contained">
              {[].map(
                /* TODO: Fetch from API */ (guideline) => (
                  <Accordion.Item key={guideline.id} value={guideline.id}>
                    <Accordion.Control>
                      <Group justify="space-between">
                        <div>
                          <Text fw={600}>{guideline.title}</Text>
                          <Group gap="sm" mt="xs">
                            <Badge variant="light" size="sm" tt="capitalize">
                              {guideline.category}
                            </Badge>
                            <Text size="sm" c="dimmed">
                              {guideline.condition}
                            </Text>
                          </Group>
                        </div>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            {guideline.source} • v{guideline.version}
                          </Text>
                        </Group>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="md">
                        <Text size="sm">{guideline.description}</Text>

                        <Divider />

                        <div>
                          <Text size="sm" fw={600} mb="md">
                            Recommendations:
                          </Text>
                          <Stack gap="sm">
                            {guideline.recommendations.map((rec, index) => (
                              <Card key={index} padding="sm" radius="sm" withBorder>
                                <Group justify="space-between" mb="xs">
                                  <Group gap="xs">
                                    <Badge size="xs" color="blue" variant="filled">
                                      Level {rec.level}
                                    </Badge>
                                    <Badge size="xs" color="green" variant="outline">
                                      {rec.strength}
                                    </Badge>
                                  </Group>
                                </Group>
                                <Text size="sm" mb="xs">
                                  {rec.recommendation}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  <strong>Evidence:</strong> {rec.evidence}
                                </Text>
                              </Card>
                            ))}
                          </Stack>
                        </div>

                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Applicable to: {guideline.applicability.join(', ')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Last updated: {formatDate(guideline.lastUpdated)}
                          </Text>
                        </Group>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                )
              )}
            </Accordion>
          </Paper>
        </Tabs.Panel>

        {/* Drug Interactions Tab */}
        <Tabs.Panel value="interactions">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Drug Interaction Checker
            </Title>

            <Stack gap="md">
              {[].map(
                /* TODO: Fetch from API */ (interaction) => (
                  <Card key={interaction.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Group mb="xs">
                          <Text fw={600} size="lg">
                            {interaction.drug1} + {interaction.drug2}
                          </Text>
                        </Group>
                        <Group gap="sm">
                          <Badge color={getSeverityColor(interaction.severity)} variant="light">
                            {interaction.interactionType.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {interaction.severity}
                          </Badge>
                          <Badge variant="outline" size="sm" color="gray">
                            {interaction.frequency}
                          </Badge>
                        </Group>
                      </div>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Documentation:
                        </Text>
                        <Badge
                          size="sm"
                          color={
                            interaction.documentation === 'excellent'
                              ? 'green'
                              : interaction.documentation === 'good'
                                ? 'blue'
                                : 'orange'
                          }
                        >
                          {interaction.documentation}
                        </Badge>
                      </Group>
                    </Group>

                    <Stack gap="sm">
                      <div>
                        <Text size="sm" fw={600} c="dimmed">
                          Mechanism:
                        </Text>
                        <Text size="sm">{interaction.mechanism}</Text>
                      </div>

                      <div>
                        <Text size="sm" fw={600} c="dimmed">
                          Clinical Effect:
                        </Text>
                        <Text size="sm">{interaction.clinicalEffect}</Text>
                      </div>

                      <div>
                        <Text size="sm" fw={600} c="dimmed">
                          Recommendation:
                        </Text>
                        <Text size="sm">{interaction.recommendation}</Text>
                      </div>
                    </Stack>

                    <Group justify="space-between" mt="md">
                      <Group gap="md">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Onset:
                          </Text>
                          <Text size="xs" fw={500}>
                            {interaction.onset}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Severity:
                          </Text>
                          <Text size="xs" fw={500}>
                            {interaction.severity}
                          </Text>
                        </Group>
                      </Group>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconInfoCircle size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="orange">
                          <IconBookmark size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Insight Types Distribution */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                AI Insights by Type
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="blue" size="sm" radius="xl">
                      <IconStethoscope size={14} />
                    </ThemeIcon>
                    <Text size="sm">Diagnosis</Text>
                  </Group>
                  <Badge color="blue" variant="light">
                    1
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="red" size="sm" radius="xl">
                      <IconPill size={14} />
                    </ThemeIcon>
                    <Text size="sm">Drug Interaction</Text>
                  </Group>
                  <Badge color="red" variant="light">
                    1
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="orange" size="sm" radius="xl">
                      <IconShield size={14} />
                    </ThemeIcon>
                    <Text size="sm">Risk Assessment</Text>
                  </Group>
                  <Badge color="orange" variant="light">
                    1
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {/* Confidence Levels */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                AI Confidence Distribution
              </Title>
              <Stack gap="sm">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">90-100%</Text>
                    <Text size="sm" fw={500}>
                      2
                    </Text>
                  </Group>
                  <Progress value={100} color="teal" size="lg" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">80-89%</Text>
                    <Text size="sm" fw={500}>
                      1
                    </Text>
                  </Group>
                  <Progress value={50} color="teal" size="lg" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">70-79%</Text>
                    <Text size="sm" fw={500}>
                      0
                    </Text>
                  </Group>
                  <Progress value={0} color="teal" size="lg" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">60-69%</Text>
                    <Text size="sm" fw={500}>
                      0
                    </Text>
                  </Group>
                  <Progress value={0} color="teal" size="lg" />
                </div>
              </Stack>
            </Card>

            {/* Query Categories */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                AI Queries by Category
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="blue" size="sm" radius="xl">
                      <IconStethoscope size={14} />
                    </ThemeIcon>
                    <Text size="sm">Diagnosis</Text>
                  </Group>
                  <Badge color="blue" variant="light">
                    1
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="green" size="sm" radius="xl">
                      <IconMedicalCross size={14} />
                    </ThemeIcon>
                    <Text size="sm">Treatment</Text>
                  </Group>
                  <Badge color="green" variant="light">
                    1
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon color="orange" size="sm" radius="xl">
                      <IconPill size={14} />
                    </ThemeIcon>
                    <Text size="sm">Medication</Text>
                  </Group>
                  <Badge color="orange" variant="light">
                    1
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {/* User Satisfaction */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                User Satisfaction Trends
              </Title>
              <Stack gap="sm">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Week 1</Text>
                    <Group gap="md">
                      <Badge color="blue" variant="light">
                        Rating: 4.2
                      </Badge>
                      <Badge color="green" variant="light">
                        Helpful: 85%
                      </Badge>
                    </Group>
                  </Group>
                  <Progress value={85} color="green" size="md" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Week 2</Text>
                    <Group gap="md">
                      <Badge color="blue" variant="light">
                        Rating: 4.5
                      </Badge>
                      <Badge color="green" variant="light">
                        Helpful: 88%
                      </Badge>
                    </Group>
                  </Group>
                  <Progress value={88} color="green" size="md" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Week 3</Text>
                    <Group gap="md">
                      <Badge color="blue" variant="light">
                        Rating: 4.3
                      </Badge>
                      <Badge color="green" variant="light">
                        Helpful: 82%
                      </Badge>
                    </Group>
                  </Group>
                  <Progress value={82} color="green" size="md" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Week 4</Text>
                    <Group gap="md">
                      <Badge color="blue" variant="light">
                        Rating: 4.7
                      </Badge>
                      <Badge color="green" variant="light">
                        Helpful: 91%
                      </Badge>
                    </Group>
                  </Group>
                  <Progress value={91} color="green" size="md" />
                </div>
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Insight Detail Modal */}
      <Modal
        opened={insightDetailOpened}
        onClose={closeInsightDetail}
        title="AI Insight Details"
        size="xl"
      >
        {selectedInsight && (
          <ScrollArea h={600}>
            <Stack gap="md">
              {/* Insight Header */}
              <Card padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <div>
                    <Group mb="xs">
                      <ThemeIcon variant="light" color={getSeverityColor(selectedInsight.severity)}>
                        {getTypeIcon(selectedInsight.type)}
                      </ThemeIcon>
                      <Title order={3}>{selectedInsight.title}</Title>
                    </Group>
                    {selectedInsight.patientName && (
                      <Text c="dimmed">Patient: {selectedInsight.patientName}</Text>
                    )}
                  </div>
                  <Group>
                    <Badge
                      color={getSeverityColor(selectedInsight.severity)}
                      variant="light"
                      size="lg"
                    >
                      {selectedInsight.severity.toUpperCase()}
                    </Badge>
                    <Badge
                      color={getStatusColor(selectedInsight.status)}
                      variant="outline"
                      size="lg"
                    >
                      {selectedInsight.status.toUpperCase()}
                    </Badge>
                  </Group>
                </Group>

                <Text mb="md">{selectedInsight.description}</Text>

                <Group gap="md">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      Confidence:
                    </Text>
                    <Progress value={selectedInsight.confidence} size="lg" w={120} color="blue" />
                    <Text size="sm" fw={600}>
                      {selectedInsight.confidence}%
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      Generated by:
                    </Text>
                    <Text size="sm" fw={500}>
                      {selectedInsight.generatedBy}
                    </Text>
                  </Group>
                </Group>
              </Card>

              {/* Evidence */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={5} mb="md">
                  Supporting Evidence
                </Title>
                <Stack gap="sm">
                  {selectedInsight.evidence.map((evidence, index) => (
                    <Card key={index} padding="sm" radius="sm" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>
                          {evidence.source}
                        </Text>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Relevance:
                          </Text>
                          <Progress value={evidence.relevance} size="sm" w={60} color="green" />
                          <Text size="xs" fw={500}>
                            {evidence.relevance}%
                          </Text>
                        </Group>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {evidence.description}
                      </Text>
                    </Card>
                  ))}
                </Stack>
              </Card>

              {/* Recommendations */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={5} mb="md">
                  Recommendations
                </Title>
                <Stack gap="sm">
                  {selectedInsight.recommendations.map((rec, index) => (
                    <Card key={index} padding="sm" radius="sm" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>
                          {rec.action}
                        </Text>
                        <Group gap="xs">
                          <Badge size="sm" color={getPriorityColor(rec.priority)} variant="light">
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {rec.timeframe}
                          </Text>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </Card>

              {/* Clinical Context */}
              {selectedInsight.metadata && (
                <Card padding="lg" radius="md" withBorder>
                  <Title order={5} mb="md">
                    Clinical Context
                  </Title>
                  <SimpleGrid cols={2} spacing="md">
                    {selectedInsight.metadata.symptoms && (
                      <div>
                        <Text size="sm" fw={500} c="dimmed" mb="xs">
                          Symptoms
                        </Text>
                        <Group gap="xs">
                          {selectedInsight.metadata.symptoms.map((symptom, index) => (
                            <Chip key={index} size="sm" variant="light">
                              {symptom}
                            </Chip>
                          ))}
                        </Group>
                      </div>
                    )}
                    {selectedInsight.metadata.medications && (
                      <div>
                        <Text size="sm" fw={500} c="dimmed" mb="xs">
                          Current Medications
                        </Text>
                        <Group gap="xs">
                          {selectedInsight.metadata.medications.map((med, index) => (
                            <Chip key={index} size="sm" variant="light" color="blue">
                              {med}
                            </Chip>
                          ))}
                        </Group>
                      </div>
                    )}
                  </SimpleGrid>
                </Card>
              )}

              {/* Action Buttons */}
              <Group justify="flex-end">
                <Button variant="light" onClick={closeInsightDetail}>
                  Close
                </Button>
                <Button variant="light" color="red" leftSection={<IconX size={16} />}>
                  Reject
                </Button>
                <Button leftSection={<IconCheck size={16} />} color="green">
                  Accept & Implement
                </Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Ask AI Modal */}
      <Modal opened={askAIOpened} onClose={closeAskAI} title="Ask AI Assistant" size="lg">
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size="1rem" />} title="AI Assistant Guidelines" color="blue">
            Ask specific clinical questions for better responses. Include patient context when
            relevant.
          </Alert>

          <Textarea
            label="Your Question"
            placeholder="Ask about diagnosis, treatment, drug interactions, or any clinical topic..."
            minRows={4}
            value={newQuery}
            onChange={(event) => setNewQuery(event.currentTarget.value)}
            required
          />

          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Question Category"
              placeholder="Select category"
              data={[
                { value: 'diagnosis', label: 'Diagnosis' },
                { value: 'treatment', label: 'Treatment' },
                { value: 'medication', label: 'Medication' },
                { value: 'general', label: 'General Medical' },
                { value: 'emergency', label: 'Emergency' },
              ]}
            />
            <Select
              label="Patient Context (Optional)"
              placeholder="Select patient"
              data={[
                { value: 'P001', label: 'Rajesh Kumar' },
                { value: 'P002', label: 'Sunita Patel' },
                { value: 'P003', label: 'Mohammed Ali' },
              ]}
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAskAI}>
              Cancel
            </Button>
            <Button
              leftSection={isLoading ? <Loader size={16} /> : <IconSend size={16} />}
              onClick={handleAskAI}
              disabled={!newQuery.trim() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Ask AI'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default AIAssistant;
