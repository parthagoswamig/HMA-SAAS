'use client';

import { Container, Title, Text } from '@mantine/core';

export default function SupportPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Support & Help Desk</Title>
      <Text c="dimmed">Support tickets and help desk management will be displayed here.</Text>
    </Container>
  );
}
