'use client';

import { Container, Title, Text } from '@mantine/core';

export default function NotificationsPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Notifications</Title>
      <Text c="dimmed">System notifications and alerts will be displayed here.</Text>
    </Container>
  );
}
