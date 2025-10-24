import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  Grid,
  Text,
  NumberInput,
  ActionIcon,
  Table,
  Badge,
  LoadingOverlay,
  Divider,
  Card,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconPlus, IconTrash, IconCurrencyRupee } from '@tabler/icons-react';
import type { CreateInvoiceDto, InvoiceItem } from '../../services/billing.service';

interface InvoiceFormProps {
  opened: boolean;
  onClose: () => void;
  invoice?: any;
  onSubmit: (data: CreateInvoiceDto) => Promise<void>;
  loading?: boolean;
  patients?: any[];
}

export default function InvoiceForm({
  opened,
  onClose,
  invoice,
  onSubmit,
  loading = false,
  patients = [],
}: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    discountAmount: 0,
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      itemType: 'SERVICE',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        patientId: invoice.patientId || '',
        date: invoice.date ? new Date(invoice.date) : new Date(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        discountAmount: invoice.discountAmount || 0,
        notes: invoice.notes || '',
      });
      if (invoice.invoiceItems && invoice.invoiceItems.length > 0) {
        setItems(
          invoice.invoiceItems.map((item: any) => ({
            itemType: item.itemType || 'SERVICE',
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            taxRate: item.taxRate || 0,
          }))
        );
      }
    } else {
      resetForm();
    }
  }, [invoice, opened]);

  const resetForm = () => {
    setFormData({
      patientId: '',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      discountAmount: 0,
      notes: '',
    });
    setItems([
      {
        itemType: 'SERVICE',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    items.forEach((item, index) => {
      if (!item.description || item.description.trim().length < 3) {
        newErrors[`item_${index}_description`] = 'Description is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateInvoiceDto = {
        patientId: formData.patientId,
        date: formData.date.toISOString(),
        dueDate: formData.dueDate.toISOString(),
        items: items,
        discountAmount: formData.discountAmount,
        notes: formData.notes,
      };

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting invoice:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemType: 'SERVICE',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const afterDiscount = subtotal - (item.discount || 0);
    const tax = (afterDiscount * (item.taxRate || 0)) / 100;
    return afterDiscount + tax;
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalTax = 0;
    const totalDiscount = formData.discountAmount || 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemAfterDiscount = itemSubtotal - itemDiscount;
      const itemTax = (itemAfterDiscount * (item.taxRate || 0)) / 100;

      subTotal += itemSubtotal;
      totalTax += itemTax;
    });

    const grandTotal = subTotal - totalDiscount + totalTax;

    return { subTotal, totalTax, totalDiscount, grandTotal };
  };

  const totals = calculateTotals();

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} - ${p.medicalRecordNumber || p.id}`,
  }));

  const itemTypeOptions = [
    { value: 'SERVICE', label: 'Service' },
    { value: 'MEDICATION', label: 'Medication' },
    { value: 'LAB_TEST', label: 'Lab Test' },
    { value: 'PROCEDURE', label: 'Procedure' },
    { value: 'CONSULTATION', label: 'Consultation' },
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
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </Text>
        </Group>
      }
      size="xl"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Patient Selection */}
          <Select
            label="Patient"
            placeholder="Select patient"
            data={patientOptions}
            value={formData.patientId}
            onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
            error={errors.patientId}
            required
            searchable
          />

          {/* Dates */}
          <Grid>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Invoice Date"
                placeholder="Select date"
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value ? new Date(value) : new Date() })}
                leftSection={<IconCalendar size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Due Date"
                placeholder="Select due date"
                value={formData.dueDate}
                onChange={(value) => setFormData({ ...formData, dueDate: value ? new Date(value) : new Date() })}
                error={errors.dueDate}
                required
                leftSection={<IconCalendar size={16} />}
                minDate={formData.date}
              />
            </Grid.Col>
          </Grid>

          <Divider label="Invoice Items" labelPosition="center" />

          {/* Items Table */}
          <Card withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Qty</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Discount</Table.Th>
                  <Table.Th>Tax %</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Select
                        data={itemTypeOptions}
                        value={item.itemType}
                        onChange={(value) => updateItem(index, 'itemType', value || 'SERVICE')}
                        size="xs"
                        style={{ minWidth: 120 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        error={!!errors[`item_${index}_description`]}
                        size="xs"
                        style={{ minWidth: 200 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => updateItem(index, 'quantity', value || 1)}
                        min={1}
                        error={!!errors[`item_${index}_quantity`]}
                        size="xs"
                        style={{ width: 70 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.unitPrice}
                        onChange={(value) => updateItem(index, 'unitPrice', value || 0)}
                        min={0}
                        prefix="₹"
                        error={!!errors[`item_${index}_unitPrice`]}
                        size="xs"
                        style={{ width: 100 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.discount}
                        onChange={(value) => updateItem(index, 'discount', value || 0)}
                        min={0}
                        prefix="₹"
                        size="xs"
                        style={{ width: 90 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.taxRate}
                        onChange={(value) => updateItem(index, 'taxRate', value || 0)}
                        min={0}
                        max={100}
                        suffix="%"
                        size="xs"
                        style={{ width: 70 }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        ₹{calculateItemTotal(item).toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group justify="center" mt="md">
              <Button
                leftSection={<IconPlus size={16} />}
                variant="light"
                onClick={addItem}
                size="xs"
              >
                Add Item
              </Button>
            </Group>
          </Card>

          {/* Totals */}
          <Card withBorder bg="gray.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Subtotal:</Text>
                <Text size="sm" fw={500}>
                  ₹{totals.subTotal.toFixed(2)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Tax:</Text>
                <Text size="sm" fw={500}>
                  ₹{totals.totalTax.toFixed(2)}
                </Text>
              </Group>
              <Group justify="space-between">
                <NumberInput
                  label="Global Discount"
                  value={formData.discountAmount}
                  onChange={(value) => setFormData({ ...formData, discountAmount: Number(value) || 0 })}
                  min={0}
                  prefix="₹"
                  size="xs"
                  style={{ width: 150 }}
                />
                <Text size="sm" fw={500}>
                  -₹{totals.totalDiscount.toFixed(2)}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="lg" fw={700}>
                  Grand Total:
                </Text>
                <Badge size="xl" color="green">
                  ₹{totals.grandTotal.toFixed(2)}
                </Badge>
              </Group>
            </Stack>
          </Card>

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
            <Button type="submit" loading={loading}>
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
