'use client';

import { Stack, Group, Text, Box, Progress } from '@mantine/core';

interface MantineChartProps {
  data: any[];
  size?: number;
  thickness?: number;
  withLabels?: boolean;
  withTooltip?: boolean;
}

interface AreaChartProps {
  data: any[];
  dataKey: string;
  series: { name: string; color: string }[];
  h?: number;
  curveType?: string;
}

interface LineChartProps {
  data: any[];
  dataKey: string;
  series: { name: string; color: string; label: string }[];
  h?: number;
  curveType?: string;
}

export function MantineDonutChart({ data }: MantineChartProps) {
  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No data available
      </Text>
    );
  }

  const total = safeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Stack gap="sm">
      {safeData.map((item, index) => (
        <Group key={index} justify="space-between">
          <Group gap="xs">
            <Box
              w={12}
              h={12}
              style={{
                backgroundColor: item.color,
                borderRadius: '2px',
              }}
            />
            <Text size="sm">{item.name}</Text>
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={600}>
              {item.value}
            </Text>
            <Text size="xs" c="dimmed">
              ({Math.round((item.value / total) * 100)}%)
            </Text>
          </Group>
        </Group>
      ))}
    </Stack>
  );
}

export function SimpleAreaChart({ data, series }: AreaChartProps) {
  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No data available
      </Text>
    );
  }

  const maxValue = Math.max(...safeData.map((item) => item[series[0].name]));

  return (
    <Stack gap="xs">
      {safeData.slice(-6).map((item, index) => (
        <Group key={index} justify="space-between">
          <Text size="sm" w={60}>
            {item.hour || item.date}
          </Text>
          <Box style={{ flex: 1 }}>
            <Progress value={(item[series[0].name] / maxValue) * 100} color="red" size="sm" />
          </Box>
          <Text size="sm" fw={600} w={30}>
            {item[series[0].name]}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

export function SimpleLineChart({ data, series }: LineChartProps) {
  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No data available
      </Text>
    );
  }

  const maxValue = Math.max(...safeData.flatMap((item) => series.map((s) => item[s.name])));

  return (
    <Stack gap="xs">
      {safeData.map((item, index) => (
        <Group key={index} justify="space-between">
          <Text size="sm" w={60}>
            {item.date}
          </Text>
          <Box style={{ flex: 1 }}>
            <Stack gap={2}>
              {series.map((s) => (
                <Group key={s.name} gap="xs">
                  <Box
                    w={8}
                    h={8}
                    style={{
                      backgroundColor: s.color.includes('.') ? s.color.split('.')[0] : s.color,
                      borderRadius: '50%',
                    }}
                  />
                  <Text size="xs" w={60}>
                    {s.label}
                  </Text>
                  <Progress
                    value={(item[s.name] / maxValue) * 100}
                    color={s.color.includes('.') ? s.color.split('.')[0] : s.color}
                    size="xs"
                    style={{ flex: 1 }}
                  />
                  <Text size="xs" fw={600} w={20}>
                    {item[s.name]}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>
        </Group>
      ))}
    </Stack>
  );
}

interface BarChartProps {
  data: any[];
  dataKey: string;
  series: { name: string; color: string }[];
  h?: number;
}

export function SimpleBarChart({ data, series }: BarChartProps) {
  // Safety check: ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No data available
      </Text>
    );
  }

  const maxValue = Math.max(...safeData.map((item) => item[series[0].name]));

  return (
    <Stack gap="sm">
      {safeData.map((item, index) => (
        <Group key={index} justify="space-between">
          <Text size="sm" w={120}>
            {item.category || item[Object.keys(item)[0]]}
          </Text>
          <Box style={{ flex: 1 }}>
            <Progress
              value={(item[series[0].name] / maxValue) * 100}
              color={
                series[0].color.includes('.') ? series[0].color.split('.')[0] : series[0].color
              }
              size="lg"
            />
          </Box>
          <Text size="sm" fw={600} w={50}>
            {item[series[0].name]}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}
