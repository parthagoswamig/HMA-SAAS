'use client';

import { Skeleton, SimpleGrid, Card, Stack } from '@mantine/core';

export default function DashboardLoading() {
  return (
    <div
      style={{
        padding: '2rem',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <Stack gap="xl">
        {/* Header Skeleton */}
        <div>
          <Skeleton height={40} width="60%" mb="md" radius="md" />
          <Skeleton height={20} width="40%" radius="md" />
        </div>

        {/* Stats Grid Skeleton */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Skeleton height={24} width="70%" radius="md" />
                <Skeleton height={36} width="50%" radius="md" />
                <Skeleton height={16} width="90%" radius="md" />
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Module Cards Grid Skeleton */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card
              key={i}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Stack gap="sm">
                <Skeleton height={48} width={48} circle />
                <Skeleton height={24} width="80%" radius="md" />
                <Skeleton height={16} width="100%" radius="md" />
                <Skeleton height={16} width="60%" radius="md" />
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
