import React from 'react';
import {
  Loader,
  Skeleton,
  Stack,
  Card,
  Group,
  SimpleGrid,
  Center,
  Text,
  Box,
} from '@mantine/core';
import { IconHeartbeat } from '@tabler/icons-react';

// Simple CSS animations
const pulseAnimation = {
  animation: 'pulse 2s ease-in-out infinite',
};

const spinAnimation = {
  animation: 'spin 2s linear infinite',
};

const slideUpAnimation = {
  animation: 'slideUp 0.5s ease-out',
};

// Full Page Loader
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <Center style={{ minHeight: '80vh' }}>
      <Stack align="center" gap="md">
        <Box style={spinAnimation}>
          <IconHeartbeat size={48} color="#667eea" />
        </Box>
        <Text size="lg" fw={500} style={pulseAnimation}>
          {message}
        </Text>
      </Stack>
    </Center>
  );
};

// Card Skeleton Loader
export const CardSkeleton: React.FC = () => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Skeleton height={24} width="60%" radius="md" />
        <Skeleton height={40} radius="md" />
        <Group gap="xs">
          <Skeleton height={20} width={80} radius="xl" />
          <Skeleton height={20} width={100} radius="xl" />
        </Group>
      </Stack>
    </Card>
  );
};

// Table Skeleton Loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <Stack gap="xs">
      {/* Header */}
      <Group gap="md" wrap="nowrap">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height={32} flex={1} radius="md" />
        ))}
      </Group>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Group key={`row-${rowIndex}`} gap="md" wrap="nowrap">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height={48} flex={1} radius="md" />
          ))}
        </Group>
      ))}
    </Stack>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Skeleton height={20} width="40%" radius="md" />
              <Skeleton height={32} width={32} circle />
            </Group>
            <Skeleton height={32} width="60%" radius="md" />
            <Skeleton height={16} width="30%" radius="md" />
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
};

// Dashboard Skeleton Loader
export const DashboardSkeleton: React.FC = () => {
  return (
    <Stack gap="xl" style={slideUpAnimation}>
      {/* Header */}
      <Group justify="space-between">
        <Skeleton height={32} width={200} radius="md" />
        <Group gap="sm">
          <Skeleton height={36} width={120} radius="md" />
          <Skeleton height={36} width={140} radius="md" />
        </Group>
      </Group>

      {/* Stats Cards */}
      <StatsCardSkeleton />

      {/* Content Area */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          {/* Search and Filters */}
          <Group gap="md">
            <Skeleton height={40} flex={1} radius="md" />
            <Skeleton height={40} width={120} radius="md" />
            <Skeleton height={40} width={120} radius="md" />
          </Group>

          {/* Table */}
          <TableSkeleton rows={8} columns={7} />
        </Stack>
      </Card>
    </Stack>
  );
};

// Form Skeleton Loader
export const FormSkeleton: React.FC = () => {
  return (
    <Stack gap="md">
      <Skeleton height={28} width="40%" radius="md" />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {Array.from({ length: 6 }).map((_, i) => (
          <Stack key={i} gap="xs">
            <Skeleton height={18} width="30%" radius="md" />
            <Skeleton height={40} radius="md" />
          </Stack>
        ))}
      </SimpleGrid>
      <Group justify="flex-end" gap="sm" mt="md">
        <Skeleton height={36} width={100} radius="md" />
        <Skeleton height={36} width={100} radius="md" />
      </Group>
    </Stack>
  );
};

// Chart Skeleton Loader
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Skeleton height={24} width="40%" radius="md" />
          <Skeleton height={28} width={100} radius="md" />
        </Group>
        <Skeleton height={height} radius="md" />
        <Group justify="center" gap="lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <Group key={i} gap="xs">
              <Skeleton height={12} width={12} circle />
              <Skeleton height={16} width={60} radius="md" />
            </Group>
          ))}
        </Group>
      </Stack>
    </Card>
  );
};

// Inline Loader for buttons/actions
export const InlineLoader: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return <Loader size={size} />;
};

// Empty State Component
export const EmptyState: React.FC<{
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({ message = 'No data available', description = 'Add new records to get started', icon }) => {
  return (
    <Center style={{ minHeight: 300 }}>
      <Stack align="center" gap="md">
        {icon && <Box style={{ opacity: 0.3 }}>{icon}</Box>}
        <Text size="lg" fw={500} c="dimmed">
          {message}
        </Text>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Stack>
    </Center>
  );
};

// Export all components
const LoadingStates = {
  PageLoader,
  CardSkeleton,
  TableSkeleton,
  StatsCardSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ChartSkeleton,
  InlineLoader,
  EmptyState,
};

export default LoadingStates;
