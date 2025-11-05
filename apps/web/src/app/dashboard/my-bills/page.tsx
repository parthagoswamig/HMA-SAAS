'use client';

import { Card, Title, Text, Stack, Badge, Group, Button, Table, Progress } from '@mantine/core';
import { IconReceipt, IconCreditCard, IconDownload, IconAlertCircle } from '@tabler/icons-react';

export default function MyBillsPage() {
  const bills = [
    {
      id: 'INV-2024-001',
      date: '2024-03-15',
      description: 'General Consultation',
      amount: 150.0,
      paid: 150.0,
      status: 'Paid',
      dueDate: '2024-03-20',
    },
    {
      id: 'INV-2024-002',
      date: '2024-03-18',
      description: 'Lab Tests - Complete Blood Count',
      amount: 80.0,
      paid: 0,
      status: 'Pending',
      dueDate: '2024-03-25',
    },
    {
      id: 'INV-2024-003',
      date: '2024-03-19',
      description: 'Prescription Medicines',
      amount: 45.5,
      paid: 45.5,
      status: 'Paid',
      dueDate: '2024-03-24',
    },
  ];

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = bills.reduce((sum, bill) => sum + bill.paid, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">
          My Bills
        </Title>
        <Text c="dimmed">View and manage your medical bills and payments</Text>
      </div>

      {/* Financial Overview */}
      <Group>
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Total Bills
              </Text>
              <Title order={3}>${totalAmount.toFixed(2)}</Title>
            </div>
            <IconReceipt size={32} color="#667eea" />
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Paid
              </Text>
              <Title order={3} c="green">
                ${paidAmount.toFixed(2)}
              </Title>
            </div>
            <IconCreditCard size={32} color="#10b981" />
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="apart">
            <div>
              <Text size="sm" c="dimmed">
                Pending
              </Text>
              <Title order={3} c="orange">
                ${pendingAmount.toFixed(2)}
              </Title>
            </div>
            <IconAlertCircle size={32} color="#f59e0b" />
          </Group>
        </Card>
      </Group>

      {/* Payment Progress */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="sm" fw={500} mb="xs">
          Payment Progress
        </Text>
        <Progress
          value={(paidAmount / totalAmount) * 100}
          size="xl"
          radius="md"
          color="green"
          mb="xs"
        />
        <Text size="xs" c="dimmed">
          {((paidAmount / totalAmount) * 100).toFixed(1)}% paid (
          {bills.filter((b) => b.status === 'Paid').length} of {bills.length} bills)
        </Text>
      </Card>

      {/* Pending Bills Alert */}
      {pendingAmount > 0 && (
        <Card shadow="sm" padding="md" radius="md" withBorder bg="orange.0">
          <Group>
            <IconAlertCircle size={24} color="#f59e0b" />
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600} c="orange">
                You have pending payments
              </Text>
              <Text size="xs" c="dimmed">
                ${pendingAmount.toFixed(2)} in outstanding bills. Please make payment by the due
                date to avoid late fees.
              </Text>
            </div>
            <Button size="sm" color="orange">
              Pay Now
            </Button>
          </Group>
        </Card>
      )}

      {/* Bills Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          All Bills
        </Title>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Invoice ID</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bills.map((bill) => (
              <Table.Tr key={bill.id}>
                <Table.Td>
                  <Text size="sm" fw={500} c="blue">
                    {bill.id}
                  </Text>
                </Table.Td>
                <Table.Td>{new Date(bill.date).toLocaleDateString()}</Table.Td>
                <Table.Td>{bill.description}</Table.Td>
                <Table.Td>
                  <Text fw={600}>${bill.amount.toFixed(2)}</Text>
                </Table.Td>
                <Table.Td>{new Date(bill.dueDate).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Badge color={bill.status === 'Paid' ? 'green' : 'orange'} variant="light">
                    {bill.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {bill.status === 'Pending' ? (
                      <Button size="xs" color="blue" variant="light">
                        Pay Now
                      </Button>
                    ) : (
                      <Button size="xs" variant="subtle" leftSection={<IconDownload size={14} />}>
                        Receipt
                      </Button>
                    )}
                    <Button size="xs" variant="subtle">
                      View Details
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Payment Methods */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Payment Methods
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          We accept the following payment methods:
        </Text>
        <Group>
          <Badge size="lg" variant="outline" color="blue">
            Credit Card
          </Badge>
          <Badge size="lg" variant="outline" color="blue">
            Debit Card
          </Badge>
          <Badge size="lg" variant="outline" color="blue">
            Online Banking
          </Badge>
          <Badge size="lg" variant="outline" color="blue">
            Insurance
          </Badge>
        </Group>
      </Card>

      {/* Help Section */}
      <Card shadow="sm" padding="md" radius="md" withBorder bg="blue.0">
        <Text size="sm" c="dimmed">
          <strong>Need Help?</strong> If you have any questions about your bills or payments, please
          contact our billing department at billing@hospital.com or call (555) 123-4567.
        </Text>
      </Card>
    </Stack>
  );
}
