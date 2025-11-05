import React from 'react';
import { Modal, Text, Group, Stack, Badge, Button, Divider, Card } from '@mantine/core';
import {
  IconCurrencyRupee,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconReceipt,
} from '@tabler/icons-react';

interface FinanceTransactionDetailsProps {
  opened: boolean;
  onClose: () => void;
  transaction: any;
  onEdit?: (transaction: any) => void;
  onDelete?: (transaction: any) => void;
}

export default function FinanceTransactionDetails({
  opened,
  onClose,
  transaction,
  onEdit,
  onDelete,
}: FinanceTransactionDetailsProps) {
  if (!transaction) return null;

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'green' : 'red';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group>
            <IconCurrencyRupee size={24} />
            <div>
              <Text size="lg" fw={600}>
                Transaction Details
              </Text>
              <Badge color={getTypeColor(transaction.type)} size="sm" mt={4}>
                {transaction.type}
              </Badge>
            </div>
          </Group>
        </Group>
      }
      size="md"
      padding="md"
    >
      <Stack gap="md">
        {/* Transaction Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconCurrencyRupee size={20} />
            <Text fw={600}>Transaction Information</Text>
          </Group>
          <Divider mb="sm" />

          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Type:
              </Text>
              <Badge color={getTypeColor(transaction.type)}>{transaction.type}</Badge>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Category:
              </Text>
              <Text fw={500}>{formatCategory(transaction.category)}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Amount:
              </Text>
              <Text fw={600} size="lg" c={getTypeColor(transaction.type)}>
                {transaction.type === 'EXPENSE' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
            </Group>

            <div>
              <Text size="sm" c="dimmed" mb={4}>
                Description:
              </Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{transaction.description}</Text>
            </div>
          </Stack>
        </Card>

        {/* Payment Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconReceipt size={20} />
            <Text fw={600}>Payment Information</Text>
          </Group>
          <Divider mb="sm" />

          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Date:
              </Text>
              <Text size="sm">{formatDate(transaction.date)}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Payment Method:
              </Text>
              <Badge variant="light">{transaction.paymentMethod?.replace(/_/g, ' ')}</Badge>
            </Group>

            {transaction.referenceNumber && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Reference Number:
                </Text>
                <Text size="sm" fw={500}>
                  {transaction.referenceNumber}
                </Text>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Timestamps */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconCalendar size={20} />
            <Text fw={600}>Record Information</Text>
          </Group>
          <Divider mb="sm" />

          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Created:
              </Text>
              <Text size="sm">{formatDate(transaction.createdAt)}</Text>
            </Group>

            {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Last Updated:
                </Text>
                <Text size="sm">{formatDate(transaction.updatedAt)}</Text>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Group>
            {onDelete && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this transaction?')) {
                    onDelete(transaction);
                    onClose();
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Group>

          <Group>
            {onEdit && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  onEdit(transaction);
                  onClose();
                }}
              >
                Edit Transaction
              </Button>
            )}
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
