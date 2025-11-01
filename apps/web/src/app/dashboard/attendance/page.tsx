'use client';

import { Container, Title, Text } from '@mantine/core';

export default function AttendancePage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Attendance Management</Title>
      <Text c="dimmed">Staff attendance tracking and management will be displayed here.</Text>
    </Container>
  );
}
