'use client';

import React, { useState, useMemo } from 'react';
import {
  Paper,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Progress,
  SimpleGrid,
  Stack,
  Select,
  RingProgress,
  ThemeIcon,
  Alert,
  Tabs,
  ActionIcon,
  Menu,
  Button,
  Center,
  Modal,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconUserPlus,
  IconHeart,
  IconCalendar,
  IconChartBar,
  IconRefresh,
  IconDownload,
  IconPrinter,
  IconShare,
  IconAlertCircle,
  IconMedicalCross,
  IconShield,
  IconStethoscope,
  IconActivity,
  IconClock,
} from '@tabler/icons-react';
import { PatientStats, Patient } from '../../types/patient';
import { formatDate } from '../../lib/utils';

interface PatientAnalyticsProps {
  opened: boolean;
  onClose: () => void;
  patients: Patient[];
  stats: PatientStats | null;
}

interface ChartTimeframe {
  value: string;
  label: string;
}

const timeframes: ChartTimeframe[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
];

export default function PatientAnalytics({
  opened,
  onClose,
  patients,
  stats,
}: PatientAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate derived statistics (must be before conditional return to follow Rules of Hooks)
  const derivedStats = useMemo(() => {
    const totalPatients = patients.length;
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const newPatientsThisMonth = patients.filter(
      (p) => new Date(p.registrationDate) >= lastMonth
    ).length;

    const newPatientsLastMonth = patients.filter((p) => {
      const regDate = new Date(p.registrationDate);
      const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
      return regDate >= twoMonthsAgo && regDate < lastMonth;
    }).length;

    const growthRate =
      newPatientsLastMonth > 0
        ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100
        : 0;

    // Age group distribution
    const ageGroups = patients.reduce(
      (acc, patient) => {
        if (patient.age < 18) acc.pediatric++;
        else if (patient.age < 65) acc.adult++;
        else acc.senior++;
        return acc;
      },
      { pediatric: 0, adult: 0, senior: 0 }
    );

    // Most common conditions
    const conditions = patients
      .flatMap((p) => p.chronicDiseases)
      .reduce(
        (acc, condition) => {
          acc[condition] = (acc[condition] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const topConditions = Object.entries(conditions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([condition, count]) => ({
        condition,
        count,
        percentage: (count / totalPatients) * 100,
      }));

    return {
      growthRate,
      ageGroups,
      topConditions,
      totalPatients,
      newPatientsThisMonth,
    };
  }, [patients]);

  // Handle null stats (after all hooks to follow Rules of Hooks)
  if (!stats) {
    return (
      <Modal opened={opened} onClose={onClose} size="xl" title="Patient Analytics" padding="lg">
        <Center p="xl">
          <Stack align="center" gap="md">
            <IconAlertCircle size="3rem" color="gray" />
            <Text size="lg" c="dimmed">
              No patient statistics available
            </Text>
            <Text size="sm" c="dimmed">
              Patient data is still loading or unavailable
            </Text>
          </Stack>
        </Center>
      </Modal>
    );
  }

  // Stat Card Component
  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }) => (
    <Card withBorder p="lg" radius="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {value}
          </Text>
          {subtitle && (
            <Text size="sm" c="dimmed" mt="xs">
              {subtitle}
            </Text>
          )}
          {trend && trendValue && (
            <Group gap="xs" mt="xs">
              <ThemeIcon
                size="xs"
                variant="light"
                color={trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray'}
              >
                {trend === 'up' ? (
                  <IconTrendingUp size="0.7rem" />
                ) : trend === 'down' ? (
                  <IconTrendingDown size="0.7rem" />
                ) : (
                  <IconActivity size="0.7rem" />
                )}
              </ThemeIcon>
              <Text
                size="xs"
                c={trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'dimmed'}
                fw={500}
              >
                {trendValue}
              </Text>
            </Group>
          )}
        </div>
        <ThemeIcon size="xl" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );

  // Overview Tab
  const OverviewTab = () => (
    <Stack gap="lg">
      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          title="Total Patients"
          value={derivedStats.totalPatients.toLocaleString()}
          subtitle="All registered patients"
          icon={<IconUsers size="1.5rem" />}
          color="blue"
          trend="up"
          trendValue={`+${derivedStats.newPatientsThisMonth} this month`}
        />
        <StatCard
          title="New This Month"
          value={derivedStats.newPatientsThisMonth}
          subtitle="New registrations"
          icon={<IconUserPlus size="1.5rem" />}
          color="green"
          trend={derivedStats.growthRate >= 0 ? 'up' : 'down'}
          trendValue={`${derivedStats.growthRate >= 0 ? '+' : ''}${derivedStats.growthRate.toFixed(1)}%`}
        />
        <StatCard
          title="Active Patients"
          value={stats.activePatients.toLocaleString()}
          subtitle="Currently under care"
          icon={<IconHeart size="1.5rem" />}
          color="red"
        />
        <StatCard
          title="Average Age"
          value={`${stats.averageAge} years`}
          subtitle="Patient demographics"
          icon={<IconCalendar size="1.5rem" />}
          color="purple"
        />
      </SimpleGrid>

      {/* Gender and Age Distribution */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Title order={4} mb="md">
              Gender Distribution
            </Title>
            <Stack gap="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Male</Text>
                  <Text size="sm" fw={500}>
                    {stats.genderDistribution.male} (
                    {((stats.genderDistribution.male / derivedStats.totalPatients) * 100).toFixed(
                      1
                    )}
                    %)
                  </Text>
                </Group>
                <Progress
                  value={(stats.genderDistribution.male / derivedStats.totalPatients) * 100}
                  color="blue"
                  size="lg"
                />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Female</Text>
                  <Text size="sm" fw={500}>
                    {stats.genderDistribution.female} (
                    {((stats.genderDistribution.female / derivedStats.totalPatients) * 100).toFixed(
                      1
                    )}
                    %)
                  </Text>
                </Group>
                <Progress
                  value={(stats.genderDistribution.female / derivedStats.totalPatients) * 100}
                  color="pink"
                  size="lg"
                />
              </div>

              {stats.genderDistribution.other > 0 && (
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Other</Text>
                    <Text size="sm" fw={500}>
                      {stats.genderDistribution.other} (
                      {(
                        (stats.genderDistribution.other / derivedStats.totalPatients) *
                        100
                      ).toFixed(1)}
                      %)
                    </Text>
                  </Group>
                  <Progress
                    value={(stats.genderDistribution.other / derivedStats.totalPatients) * 100}
                    color="gray"
                    size="lg"
                  />
                </div>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Title order={4} mb="md">
              Age Groups
            </Title>
            <Group justify="center" mb="md">
              <RingProgress
                size={200}
                thickness={20}
                sections={[
                  {
                    value: (derivedStats.ageGroups.pediatric / derivedStats.totalPatients) * 100,
                    color: 'cyan',
                    tooltip: 'Pediatric (0-17)',
                  },
                  {
                    value: (derivedStats.ageGroups.adult / derivedStats.totalPatients) * 100,
                    color: 'blue',
                    tooltip: 'Adult (18-64)',
                  },
                  {
                    value: (derivedStats.ageGroups.senior / derivedStats.totalPatients) * 100,
                    color: 'orange',
                    tooltip: 'Senior (65+)',
                  },
                ]}
                label={
                  <Center>
                    <div>
                      <Text size="xl" fw={700} ta="center">
                        {derivedStats.totalPatients}
                      </Text>
                      <Text size="sm" c="dimmed" ta="center">
                        Total Patients
                      </Text>
                    </div>
                  </Center>
                }
              />
            </Group>
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: 'var(--mantine-color-cyan-6)',
                      borderRadius: 2,
                    }}
                  />
                  <Text size="sm">Pediatric (0-17)</Text>
                </Group>
                <Text size="sm" fw={500}>
                  {derivedStats.ageGroups.pediatric}
                </Text>
              </Group>
              <Group justify="space-between">
                <Group gap="xs">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: 'var(--mantine-color-blue-6)',
                      borderRadius: 2,
                    }}
                  />
                  <Text size="sm">Adult (18-64)</Text>
                </Group>
                <Text size="sm" fw={500}>
                  {derivedStats.ageGroups.adult}
                </Text>
              </Group>
              <Group justify="space-between">
                <Group gap="xs">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: 'var(--mantine-color-orange-6)',
                      borderRadius: 2,
                    }}
                  />
                  <Text size="sm">Senior (65+)</Text>
                </Group>
                <Text size="sm" fw={500}>
                  {derivedStats.ageGroups.senior}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Visit Trends */}
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Visit Trends</Title>
          <Select
            data={timeframes}
            value={selectedTimeframe}
            onChange={(value) => setSelectedTimeframe(value || '30d')}
            size="sm"
            w={150}
          />
        </Group>
        <Stack gap="sm">
          {stats.visitTrends.map((trend, index) => (
            <Group key={index} justify="space-between">
              <Text size="sm">{formatDate(new Date(trend.date))}</Text>
              <Group gap="sm" align="center">
                <Progress value={(trend.count / 200) * 100} size="sm" w={100} color="blue" />
                <Text size="sm" fw={500} w={40} ta="right">
                  {trend.count}
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );

  // Medical Analytics Tab
  const MedicalTab = () => (
    <Stack gap="lg">
      {/* Blood Group Distribution */}
      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          Blood Group Distribution
        </Title>
        <Grid>
          {Object.entries(stats.bloodGroupDistribution).map(([bloodGroup, count]) => (
            <Grid.Col key={bloodGroup} span={{ base: 6, md: 3 }}>
              <Card withBorder p="md" ta="center">
                <Text size="xl" fw={700} c="red">
                  {bloodGroup}
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {count} patients
                </Text>
                <Text size="xs" c="dimmed">
                  {((count / derivedStats.totalPatients) * 100).toFixed(1)}%
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>

      {/* Top Medical Conditions */}
      {derivedStats.topConditions.length > 0 && (
        <Paper p="md" withBorder>
          <Title order={4} mb="md">
            Most Common Chronic Conditions
          </Title>
          <Stack gap="md">
            {derivedStats.topConditions.map((condition, index) => (
              <Group key={condition.condition} justify="space-between" align="center">
                <Group>
                  <Badge size="sm" variant="light" color="orange">
                    #{index + 1}
                  </Badge>
                  <Text size="sm" fw={500}>
                    {condition.condition}
                  </Text>
                </Group>
                <Group gap="sm" align="center">
                  <Progress value={condition.percentage} size="sm" w={100} color="orange" />
                  <Text size="sm" fw={500} w={60} ta="right">
                    {condition.count} ({condition.percentage.toFixed(1)}%)
                  </Text>
                </Group>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Medical Alerts Summary */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group mb="md">
              <IconAlertCircle size="1.2rem" color="red" />
              <Title order={4}>Allergy Alert Summary</Title>
            </Group>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Patients with Known Allergies</Text>
                <Badge color="red" variant="light">
                  {patients.filter((p) => p.allergies.length > 0).length}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">No Known Allergies</Text>
                <Badge color="green" variant="light">
                  {patients.filter((p) => p.allergies.length === 0).length}
                </Badge>
              </Group>
              <Progress
                value={
                  (patients.filter((p) => p.allergies.length > 0).length /
                    derivedStats.totalPatients) *
                  100
                }
                color="red"
                size="sm"
                mt="sm"
              />
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group mb="md">
              <IconMedicalCross size="1.2rem" color="orange" />
              <Title order={4}>Chronic Disease Summary</Title>
            </Group>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Patients with Chronic Conditions</Text>
                <Badge color="orange" variant="light">
                  {patients.filter((p) => p.chronicDiseases.length > 0).length}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">No Chronic Conditions</Text>
                <Badge color="green" variant="light">
                  {patients.filter((p) => p.chronicDiseases.length === 0).length}
                </Badge>
              </Group>
              <Progress
                value={
                  (patients.filter((p) => p.chronicDiseases.length > 0).length /
                    derivedStats.totalPatients) *
                  100
                }
                color="orange"
                size="sm"
                mt="sm"
              />
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );

  // Insurance Analytics Tab
  const InsuranceTab = () => (
    <Stack gap="lg">
      {/* Insurance Coverage Overview */}
      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          Insurance Coverage Overview
        </Title>
        <Group justify="center" mb="md">
          <RingProgress
            size={200}
            thickness={20}
            sections={[
              {
                value: (stats.insuranceDistribution.insured / derivedStats.totalPatients) * 100,
                color: 'green',
                tooltip: 'Insured Patients',
              },
              {
                value: (stats.insuranceDistribution.uninsured / derivedStats.totalPatients) * 100,
                color: 'red',
                tooltip: 'Uninsured Patients',
              },
            ]}
            label={
              <Center>
                <div>
                  <Text size="xl" fw={700} ta="center" c="green">
                    {(
                      (stats.insuranceDistribution.insured / derivedStats.totalPatients) *
                      100
                    ).toFixed(1)}
                    %
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Insured
                  </Text>
                </div>
              </Center>
            }
          />
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" color="green" variant="light">
                  <IconShield size="0.8rem" />
                </ThemeIcon>
                <Text size="sm">Insured</Text>
              </Group>
              <Text size="sm" fw={500}>
                {stats.insuranceDistribution.insured}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" color="red" variant="light">
                  <IconAlertCircle size="0.8rem" />
                </ThemeIcon>
                <Text size="sm">Uninsured</Text>
              </Group>
              <Text size="sm" fw={500}>
                {stats.insuranceDistribution.uninsured}
              </Text>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Insurance Type Breakdown */}
      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          Insurance Type Distribution
        </Title>
        <Alert icon={<IconShield size="1rem" />} color="blue" mb="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm">Government Insurance</Text>
              <Text size="sm" fw={500}>
                45% (1,281 patients)
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Private Insurance</Text>
              <Text size="sm" fw={500}>
                35% (996 patients)
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Corporate Insurance</Text>
              <Text size="sm" fw={500}>
                20% (569 patients)
              </Text>
            </Group>
          </Stack>
        </Alert>
      </Paper>

      {/* Payment Analysis */}
      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          Payment Method Analysis
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="xl" variant="light" color="green" mx="auto" mb="sm">
              <IconShield size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">
              75%
            </Text>
            <Text size="sm" c="dimmed">
              Insurance Claims
            </Text>
          </Card>

          <Card withBorder p="md" ta="center">
            <ThemeIcon size="xl" variant="light" color="blue" mx="auto" mb="sm">
              <IconClock size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">
              20%
            </Text>
            <Text size="sm" c="dimmed">
              Self Pay
            </Text>
          </Card>

          <Card withBorder p="md" ta="center">
            <ThemeIcon size="xl" variant="light" color="orange" mx="auto" mb="sm">
              <IconAlertCircle size="1.5rem" />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">
              5%
            </Text>
            <Text size="sm" c="dimmed">
              Payment Plans
            </Text>
          </Card>
        </SimpleGrid>
      </Paper>
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <div>
          <Title order={2}>Patient Analytics</Title>
          <Text c="dimmed" size="sm">
            Comprehensive insights and statistics about patient data
          </Text>
        </div>
      }
      padding="lg"
    >
      <Group justify="space-between" align="flex-start" mb="md">
        <Group>
          <ActionIcon variant="light" size="lg">
            <IconRefresh size="1.2rem" />
          </ActionIcon>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="outline" leftSection={<IconDownload size="1rem" />}>
                Export
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconDownload size="0.9rem" />}>Export as PDF</Menu.Item>
              <Menu.Item leftSection={<IconDownload size="0.9rem" />}>Export as Excel</Menu.Item>
              <Menu.Item leftSection={<IconPrinter size="0.9rem" />}>Print Report</Menu.Item>
              <Menu.Item leftSection={<IconShare size="0.9rem" />}>Share Report</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size="0.8rem" />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="medical" leftSection={<IconStethoscope size="0.8rem" />}>
            Medical Analytics
          </Tabs.Tab>
          <Tabs.Tab value="insurance" leftSection={<IconShield size="0.8rem" />}>
            Insurance Analytics
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <OverviewTab />
        </Tabs.Panel>

        <Tabs.Panel value="medical" pt="md">
          <MedicalTab />
        </Tabs.Panel>

        <Tabs.Panel value="insurance" pt="md">
          <InsuranceTab />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
