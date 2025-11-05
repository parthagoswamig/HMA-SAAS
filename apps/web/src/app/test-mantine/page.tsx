'use client';

import { Button, Card, Title } from '@mantine/core';

export default function TestMantine() {
  return (
    <div style={{ padding: '20px' }}>
      <Card padding="lg" radius="md" withBorder>
        <Title order={2}>Mantine Test Page</Title>
        <Button color="blue" mt="md">
          Test Button
        </Button>
      </Card>
    </div>
  );
}
