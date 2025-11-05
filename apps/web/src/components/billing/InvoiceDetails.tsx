import React from 'react';
import {
  Modal,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Divider,
  Grid,
  Card,
  Table,
  Timeline,
} from '@mantine/core';
import {
  IconCurrencyRupee,
  IconUser,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconReceipt,
  IconPrinter,
  IconDownload,
  IconCash,
} from '@tabler/icons-react';

interface InvoiceDetailsProps {
  opened: boolean;
  onClose: () => void;
  invoice: any;
  onEdit?: (invoice: any) => void;
  onDelete?: (invoice: any) => void;
  onRecordPayment?: (invoice: any) => void;
  onPrint?: (invoice: any) => void;
}

export default function InvoiceDetails({
  opened,
  onClose,
  invoice,
  onEdit,
  onDelete,
  onRecordPayment,
  onPrint,
}: InvoiceDetailsProps) {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'yellow',
      PARTIALLY_PAID: 'orange',
      PAID: 'green',
      OVERDUE: 'red',
      CANCELLED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const patient = invoice.patient || {};
  const items = invoice.invoiceItems || [];
  const payments = invoice.payments || [];

  const totalPaid = payments.reduce((sum: number, payment: any) => {
    if (payment.status === 'COMPLETED') {
      return sum + payment.amount;
    }
    return sum;
  }, 0);

  const remainingAmount = invoice.totalAmount - totalPaid;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group>
            <IconReceipt size={24} />
            <div>
              <Text size="lg" fw={600}>
                Invoice Details
              </Text>
              <Text size="xs" c="dimmed">
                {invoice.invoiceNumber}
              </Text>
            </div>
          </Group>
          <Badge color={getStatusColor(invoice.status)} size="lg">
            {invoice.status}
          </Badge>
        </Group>
      }
      size="xl"
      padding="md"
    >
      <Stack gap="md">
        {/* Patient Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconUser size={20} />
            <Text fw={600}>Patient Information</Text>
          </Group>
          <Divider mb="sm" />
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Name:
                  </Text>
                  <Text fw={500}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                </Group>
                {patient.medicalRecordNumber && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      MRN:
                    </Text>
                    <Text fw={500}>{patient.medicalRecordNumber}</Text>
                  </Group>
                )}
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap="xs">
                {patient.phone && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Phone:
                    </Text>
                    <Text fw={500}>{patient.phone}</Text>
                  </Group>
                )}
                {patient.email && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Email:
                    </Text>
                    <Text fw={500}>{patient.email}</Text>
                  </Group>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Invoice Dates */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconCalendar size={20} />
            <Text fw={600}>Invoice Dates</Text>
          </Group>
          <Divider mb="sm" />
          <Grid>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Invoice Date:
                </Text>
                <Text fw={500}>{formatDate(invoice.date)}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Due Date:
                </Text>
                <Text fw={500}>{formatDate(invoice.dueDate)}</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Invoice Items */}
        <Card withBorder padding="md">
          <Text fw={600} mb="sm">
            Invoice Items
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Description</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Tax</Table.Th>
                <Table.Th>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item: any, index: number) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.description}</Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">
                      {item.itemType}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>{formatCurrency(item.unitPrice)}</Table.Td>
                  <Table.Td>{formatCurrency(item.discount)}</Table.Td>
                  <Table.Td>{item.taxRate}%</Table.Td>
                  <Table.Td>
                    <Text fw={500}>{formatCurrency(item.totalAmount)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        {/* Totals */}
        <Card withBorder padding="md" bg="gray.0">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm">Subtotal:</Text>
              <Text size="sm" fw={500}>
                {formatCurrency(invoice.subTotal)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Tax:</Text>
              <Text size="sm" fw={500}>
                {formatCurrency(invoice.taxAmount)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Discount:</Text>
              <Text size="sm" fw={500}>
                -{formatCurrency(invoice.discountAmount)}
              </Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text size="lg" fw={700}>
                Total Amount:
              </Text>
              <Badge size="xl" color="blue">
                {formatCurrency(invoice.totalAmount)}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="green">
                Paid:
              </Text>
              <Text size="sm" fw={600} c="green">
                {formatCurrency(totalPaid)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="orange">
                Remaining:
              </Text>
              <Text size="sm" fw={600} c="orange">
                {formatCurrency(remainingAmount)}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Payment History */}
        {payments.length > 0 && (
          <Card withBorder padding="md">
            <Group mb="xs">
              <IconCash size={20} />
              <Text fw={600}>Payment History</Text>
            </Group>
            <Divider mb="sm" />
            <Timeline active={payments.length} bulletSize={24}>
              {payments.map((payment: any, index: number) => (
                <Timeline.Item
                  key={index}
                  bullet={<IconCurrencyRupee size={12} />}
                  title={formatCurrency(payment.amount)}
                >
                  <Text size="xs" c="dimmed">
                    {payment.paymentMethod} - {formatDate(payment.paymentDate)}
                  </Text>
                  {payment.referenceNumber && (
                    <Text size="xs" c="dimmed">
                      Ref: {payment.referenceNumber}
                    </Text>
                  )}
                  <Badge size="xs" color={payment.status === 'COMPLETED' ? 'green' : 'gray'} mt={4}>
                    {payment.status}
                  </Badge>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}

        {/* Notes */}
        {invoice.notes && (
          <Card withBorder padding="md">
            <Text fw={600} mb="xs">
              Notes
            </Text>
            <Text size="sm">{invoice.notes}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Group>
            {onPrint && (
              <Button
                variant="light"
                leftSection={<IconPrinter size={16} />}
                onClick={() => onPrint(invoice)}
              >
                Print
              </Button>
            )}
            <Button variant="light" leftSection={<IconDownload size={16} />}>
              Download PDF
            </Button>
          </Group>

          <Group>
            {onDelete && invoice.status !== 'PAID' && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this invoice?')) {
                    onDelete(invoice);
                    onClose();
                  }
                }}
              >
                Cancel Invoice
              </Button>
            )}
            {onRecordPayment && remainingAmount > 0 && (
              <Button
                leftSection={<IconCurrencyRupee size={16} />}
                onClick={() => {
                  onRecordPayment(invoice);
                  onClose();
                }}
              >
                Record Payment
              </Button>
            )}
            {onEdit && invoice.status === 'PENDING' && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  onEdit(invoice);
                  onClose();
                }}
              >
                Edit Invoice
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
