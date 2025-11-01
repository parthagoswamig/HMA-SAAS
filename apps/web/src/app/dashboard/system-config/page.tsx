'use client';

import { Container, Title, Text } from '@mantine/core';

export default function SystemConfigPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">System Configuration</Title>
      <Text c="dimmed">System-level configuration and settings will be displayed here.</Text>
    </Container>
  );
}
