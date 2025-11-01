'use client';

import { Container, Title, Text } from '@mantine/core';

export default function PayrollPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Payroll Management</Title>
      <Text c="dimmed">Staff payroll and salary management will be displayed here.</Text>
    </Container>
  );
}
