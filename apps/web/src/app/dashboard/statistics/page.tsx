'use client';

import { Container, Title, Text } from '@mantine/core';

export default function StatisticsPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Statistics & Analytics</Title>
      <Text c="dimmed">Detailed statistics and analytics dashboards will be displayed here.</Text>
    </Container>
  );
}
