'use client';

import { Container, Title, Text } from '@mantine/core';

export default function LogsPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">System Logs</Title>
      <Text c="dimmed">System activity logs and monitoring will be displayed here.</Text>
    </Container>
  );
}
