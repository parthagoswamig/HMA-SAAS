import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  LoadingOverlay,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCurrencyRupee, IconCalendar, IconReceipt } from '@tabler/icons-react';
import type { CreateTransactionDto, UpdateTransactionDto } from '../../services/finance.service';

interface FinanceTransactionFormProps {
  opened: boolean;
  onClose: () => void;
  transaction?: any;
  onSubmit: (data: CreateTransactionDto | UpdateTransactionDto) => Promise<void>;
  loading?: boolean;
}

export default function FinanceTransactionForm({
  opened,
  onClose,
  transaction,
  onSubmit,
  loading = false,
}: FinanceTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'INCOME',
    category: '',
    amount: 0,
    description: '',
    date: new Date(),
    paymentMethod: 'CASH',
    referenceNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'INCOME',
        category: transaction.category || '',
        amount: transaction.amount || 0,
        description: transaction.description || '',
        date: transaction.date ? new Date(transaction.date) : new Date(),
        paymentMethod: transaction.paymentMethod || 'CASH',
        referenceNumber: transaction.referenceNumber || '',
      });
    } else {
      resetForm();
    }
  }, [transaction, opened]);

  const resetForm = () => {
    setFormData({
      type: 'INCOME',
      category: '',
      amount: 0,
      description: '',
      date: new Date(),
      paymentMethod: 'CASH',
      referenceNumber: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }
    if (!formData.category || formData.category.trim().length < 2) {
      newErrors.category = 'Category must be at least 2 characters';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.description || formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
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
      const submitData: any = {
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: formData.date.toISOString(),
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
      };

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const transactionTypeOptions = [
    { value: 'INCOME', label: 'Income' },
    { value: 'EXPENSE', label: 'Expense' },
  ];

  const incomeCategories = [
    { value: 'CONSULTATION_FEES', label: 'Consultation Fees' },
    { value: 'PROCEDURE_FEES', label: 'Procedure Fees' },
    { value: 'LAB_FEES', label: 'Laboratory Fees' },
    { value: 'PHARMACY_SALES', label: 'Pharmacy Sales' },
    { value: 'ROOM_CHARGES', label: 'Room Charges' },
    { value: 'OTHER_INCOME', label: 'Other Income' },
  ];

  const expenseCategories = [
    { value: 'STAFF_SALARIES', label: 'Staff Salaries' },
    { value: 'MEDICAL_SUPPLIES', label: 'Medical Supplies' },
    { value: 'EQUIPMENT_MAINTENANCE', label: 'Equipment Maintenance' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'RENT', label: 'Rent' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'OTHER_EXPENSES', label: 'Other Expenses' },
  ];

  const paymentMethodOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'NET_BANKING', label: 'Net Banking' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  ];

  const categoryOptions = formData.type === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconCurrencyRupee size={24} />
          <span>{transaction ? 'Update Transaction' : 'Create Transaction'}</span>
        </Group>
      }
      size="md"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Transaction Type"
            placeholder="Select type"
            data={transactionTypeOptions}
            value={formData.type}
            onChange={(value) => {
              setFormData({ ...formData, type: value || 'INCOME', category: '' });
            }}
            error={errors.type}
            required
          />

          <Select
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value || '' })}
            error={errors.category}
            required
            searchable
          />

          <NumberInput
            label="Amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(value) => setFormData({ ...formData, amount: Number(value) || 0 })}
            error={errors.amount}
            required
            min={0}
            decimalScale={2}
            leftSection={<IconCurrencyRupee size={16} />}
          />

          <Textarea
            label="Description"
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            required
            minRows={3}
            maxRows={5}
          />

          <DatePickerInput
            label="Date"
            placeholder="Select date"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value ? new Date(value) : new Date() })}
            leftSection={<IconCalendar size={16} />}
            maxDate={new Date()}
          />

          <Select
            label="Payment Method"
            placeholder="Select payment method"
            data={paymentMethodOptions}
            value={formData.paymentMethod}
            onChange={(value) => setFormData({ ...formData, paymentMethod: value || 'CASH' })}
          />

          <TextInput
            label="Reference Number"
            placeholder="Enter reference number (optional)"
            value={formData.referenceNumber}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            leftSection={<IconReceipt size={16} />}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
