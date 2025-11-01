'use client';

import { Container, Title, Text } from '@mantine/core';

export default function AdmissionsPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Patient Admissions</Title>
      <Text c="dimmed">Patient admission management and tracking will be displayed here.</Text>
    </Container>
  );
}
