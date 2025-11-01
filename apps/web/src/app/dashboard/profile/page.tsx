'use client';

import { Container, Title, Text } from '@mantine/core';

export default function ProfilePage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">User Profile</Title>
      <Text c="dimmed">User profile and hospital information will be displayed here.</Text>
    </Container>
  );
}
