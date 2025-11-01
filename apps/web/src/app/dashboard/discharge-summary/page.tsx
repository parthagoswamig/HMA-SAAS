'use client';

import { Container, Title, Text } from '@mantine/core';

export default function DischargeSummaryPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Discharge Summary</Title>
      <Text c="dimmed">Patient discharge summaries and documentation will be displayed here.</Text>
    </Container>
  );
}
