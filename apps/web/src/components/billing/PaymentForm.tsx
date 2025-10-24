import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  Text,
  NumberInput,
  LoadingOverlay,
  Alert,
  Badge,
  Card,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconCurrencyRupee, IconAlertCircle } from '@tabler/icons-react';
import type { CreatePaymentDto } from '../../services/billing.service';

interface PaymentFormProps {
  opened: boolean;
  onClose: () => void;
  invoice: any;
  onSubmit: (data: CreatePaymentDto) => Promise<void>;
  loading?: boolean;
}

export default function PaymentForm({
  opened,
  onClose,
  invoice,
  onSubmit,
  loading = false,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'CASH',
    paymentDate: new Date(),
    referenceNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (invoice && opened) {
      const totalPaid =
        invoice.payments?.reduce((sum: number, payment: any) => {
          if (payment.status === 'COMPLETED') {
            return sum + payment.amount;
          }
          return sum;
        }, 0) || 0;

      const remainingAmount = invoice.totalAmount - totalPaid;

      setFormData({
        amount: remainingAmount,
        paymentMethod: 'CASH',
        paymentDate: new Date(),
        referenceNumber: '',
        notes: '',
      });
    }
  }, [invoice, opened]);

  const resetForm = () => {
    setFormData({
      amount: 0,
      paymentMethod: 'CASH',
      paymentDate: new Date(),
      referenceNumber: '',
      notes: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    const totalPaid =
      invoice.payments?.reduce((sum: number, payment: any) => {
        if (payment.status === 'COMPLETED') {
          return sum + payment.amount;
        }
        return sum;
      }, 0) || 0;

    const remainingAmount = invoice.totalAmount - totalPaid;

    if (formData.amount > remainingAmount) {
      newErrors.amount = `Amount cannot exceed remaining balance (₹${remainingAmount.toFixed(2)})`;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (
      ['CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'].includes(formData.paymentMethod) &&
      !formData.referenceNumber
    ) {
      newErrors.referenceNumber = 'Reference number is required for this payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreatePaymentDto = {
        invoiceId: invoice.id,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate.toISOString(),
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      };

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting payment:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!invoice) return null;

  const totalPaid =
    invoice.payments?.reduce((sum: number, payment: any) => {
      if (payment.status === 'COMPLETED') {
        return sum + payment.amount;
      }
      return sum;
    }, 0) || 0;

  const remainingAmount = invoice.totalAmount - totalPaid;

  const paymentMethodOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Credit/Debit Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconCurrencyRupee size={24} />
          <Text size="lg" fw={600}>
            Record Payment
          </Text>
        </Group>
      }
      size="md"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Invoice Info */}
          <Card withBorder bg="blue.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Invoice Number:
                </Text>
                <Text size="sm" fw={600}>
                  {invoice.invoiceNumber}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Patient:
                </Text>
                <Text size="sm" fw={500}>
                  {invoice.patient?.firstName} {invoice.patient?.lastName}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Total Amount:
                </Text>
                <Text size="sm" fw={600}>
                  ₹{invoice.totalAmount.toFixed(2)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Paid:
                </Text>
                <Text size="sm" fw={500} c="green">
                  ₹{totalPaid.toFixed(2)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Remaining:
                </Text>
                <Badge size="lg" color={remainingAmount > 0 ? 'orange' : 'green'}>
                  ₹{remainingAmount.toFixed(2)}
                </Badge>
              </Group>
            </Stack>
          </Card>

          {remainingAmount <= 0 && (
            <Alert icon={<IconAlertCircle size={16} />} color="green">
              This invoice is fully paid!
            </Alert>
          )}

          {/* Payment Amount */}
          <NumberInput
            label="Payment Amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(value) => setFormData({ ...formData, amount: Number(value) || 0 })}
            error={errors.amount}
            required
            min={0}
            max={remainingAmount}
            prefix="₹"
            decimalScale={2}
            leftSection={<IconCurrencyRupee size={16} />}
          />

          {/* Payment Method */}
          <Select
            label="Payment Method"
            placeholder="Select payment method"
            data={paymentMethodOptions}
            value={formData.paymentMethod}
            onChange={(value) => setFormData({ ...formData, paymentMethod: value || 'CASH' })}
            error={errors.paymentMethod}
            required
          />

          {/* Payment Date */}
          <DatePickerInput
            label="Payment Date"
            placeholder="Select date"
            value={formData.paymentDate}
            onChange={(value) => setFormData({ ...formData, paymentDate: value ? new Date(value) : new Date() })}
            leftSection={<IconCalendar size={16} />}
            maxDate={new Date()}
          />

          {/* Reference Number */}
          {['CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'].includes(formData.paymentMethod) && (
            <TextInput
              label="Reference Number"
              placeholder="Transaction ID / Cheque Number"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              error={errors.referenceNumber}
              required
            />
          )}

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            minRows={2}
            maxRows={4}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={remainingAmount <= 0}>
              Record Payment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
