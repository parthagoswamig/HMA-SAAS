'use client';

import { Container, Title, Text } from '@mantine/core';

export default function SettingsPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Settings</Title>
      <Text c="dimmed">Application settings and configuration will be displayed here.</Text>
    </Container>
  );
}
