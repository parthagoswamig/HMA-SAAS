'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  Textarea,
  LoadingOverlay,
  Alert,
  NumberInput,
  Table,
  ActionIcon,
  Checkbox,
  Divider,
  Text,
  Badge,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconReceipt, IconAlertCircle, IconTrash, IconPlus } from '@tabler/icons-react';
import billingService from '../../services/billing.service';
import patientsService from '../../services/patients.service';

interface BillingItem {
  id: string;
  itemType: string;
  itemId?: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  taxRate?: number;
  total: number;
}

interface BillingInvoiceFormProps {
  opened: boolean;
  onClose: () => void;
  invoice?: any;
  onSuccess: () => void;
}

const BillingInvoiceForm: React.FC<BillingInvoiceFormProps> = ({
  opened,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    invoiceNumber: '',
    invoiceDate: new Date(),
    dueDate: new Date(),
    visitType: '',
    visitId: '',
    paymentMethod: '',
    paymentStatus: 'pending',
    
    // Billing items
    items: [] as BillingItem[],
    
    // Totals
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceAmount: 0,
    
    // Insurance
    hasInsurance: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceCoverage: 0,
    insuranceApprovalNumber: '',
    
    // Additional
    notes: '',
    internalNotes: '',
  });

  const [newItem, setNewItem] = useState<BillingItem>({
    id: '',
    itemType: 'service',
    description: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPatients();
      generateInvoiceNumber();
      
      if (invoice) {
        // Edit mode
        setFormData({
          patientId: invoice.patientId || '',
          invoiceNumber: invoice.invoiceNumber || '',
          invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
          visitType: invoice.visitType || '',
          visitId: invoice.visitId || '',
          paymentMethod: invoice.paymentMethod || '',
          paymentStatus: invoice.paymentStatus || 'pending',
          items: invoice.items || [],
          subtotal: invoice.subtotal || 0,
          taxAmount: invoice.taxAmount || 0,
          discountAmount: invoice.discountAmount || 0,
          totalAmount: invoice.totalAmount || 0,
          paidAmount: invoice.paidAmount || 0,
          balanceAmount: invoice.balanceAmount || 0,
          hasInsurance: invoice.hasInsurance || false,
          insuranceProvider: invoice.insuranceProvider || '',
          insurancePolicyNumber: invoice.insurancePolicyNumber || '',
          insuranceCoverage: invoice.insuranceCoverage || 0,
          insuranceApprovalNumber: invoice.insuranceApprovalNumber || '',
          notes: invoice.notes || '',
          internalNotes: invoice.internalNotes || '',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, invoice]);

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        const patientOptions = response.data.patients.map((p: any) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName} - ${p.medicalRecordNumber || p.id.slice(-6)}`,
        }));
        setPatients(patientOptions);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const invoiceNum = `INV-${timestamp}-${randomStr}`;
    setFormData(prev => ({ ...prev, invoiceNumber: invoiceNum }));
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      invoiceNumber: '',
      invoiceDate: new Date(),
      dueDate: new Date(),
      visitType: '',
      visitId: '',
      paymentMethod: '',
      paymentStatus: 'pending',
      items: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,
      hasInsurance: false,
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceCoverage: 0,
      insuranceApprovalNumber: '',
      notes: '',
      internalNotes: '',
    });
    setNewItem({
      id: '',
      itemType: 'service',
      description: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      total: 0,
    });
    setFormErrors({});
  };

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) {
      notifications.show({
        title: 'Invalid Item',
        message: 'Please enter item description and price',
        color: 'red',
      });
      return;
    }

    const itemTotal = (newItem.quantity * newItem.unitPrice) - newItem.discount + newItem.tax;
    const itemToAdd = {
      ...newItem,
      id: Date.now().toString(),
      total: itemTotal,
    };

    const updatedItems = [...formData.items, itemToAdd];
    updateTotals(updatedItems);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));

    // Reset new item form
    setNewItem({
      id: '',
      itemType: 'service',
      description: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      total: 0,
    });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = formData.items.filter(item => item.id !== itemId);
    updateTotals(updatedItems);
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const updateTotals = (items: BillingItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => sum + item.tax, 0);
    const discountAmount = items.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = subtotal - discountAmount + taxAmount;
    const balanceAmount = totalAmount - formData.paidAmount - formData.insuranceCoverage;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      balanceAmount: balanceAmount > 0 ? balanceAmount : 0,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.invoiceNumber) errors.invoiceNumber = 'Invoice number is required';
    if (formData.items.length === 0) errors.items = 'At least one billing item is required';
    if (!formData.visitType) errors.visitType = 'Visit type is required';
    
    if (formData.hasInsurance) {
      if (!formData.insuranceProvider) errors.insuranceProvider = 'Insurance provider is required';
      if (!formData.insurancePolicyNumber) errors.insurancePolicyNumber = 'Policy number is required';
    }

    if (formData.paymentStatus === 'paid' && !formData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required for paid invoices';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields correctly',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        invoiceDate: formData.invoiceDate.toISOString(),
        dueDate: formData.dueDate.toISOString(),
      };

      let response;
      if (invoice) {
        response = await billingService.updateInvoice(invoice.id, submitData);
      } else {
        response = await billingService.createInvoice(submitData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: invoice ? 'Invoice updated successfully' : 'Invoice created successfully',
          color: 'green',
          icon: <IconReceipt />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting billing form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save invoice',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const visitTypes = [
    { value: 'opd', label: 'OPD Visit' },
    { value: 'ipd', label: 'IPD Admission' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'diagnostic', label: 'Diagnostic Services' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'consultation', label: 'Consultation' },
  ];

  const itemCategories = [
    { value: 'consultation', label: 'Consultation Fee' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'medication', label: 'Medication' },
    { value: 'laboratory', label: 'Laboratory Test' },
    { value: 'radiology', label: 'Radiology/Imaging' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'room', label: 'Room Charges' },
    { value: 'nursing', label: 'Nursing Care' },
    { value: 'equipment', label: 'Equipment Usage' },
    { value: 'supplies', label: 'Medical Supplies' },
    { value: 'other', label: 'Other' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'net_banking', label: 'Net Banking' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'mixed', label: 'Mixed Payment' },
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={invoice ? 'Edit Invoice' : 'Create New Invoice'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconReceipt size={20} />} color="blue" variant="light">
            Create or update billing invoice. Ensure all charges are accurate and documented.
          </Alert>

          {/* Patient and Invoice Info */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Patient"
                placeholder="Select patient"
                required
                data={patients}
                value={formData.patientId}
                onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
                error={formErrors.patientId}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Invoice Number"
                placeholder="Auto-generated"
                required
                value={formData.invoiceNumber}
                readOnly
                error={formErrors.invoiceNumber}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="Invoice Date"
                placeholder="Select date"
                required
                value={formData.invoiceDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, invoiceDate: dateValue });
                }}
                maxDate={new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="Due Date"
                placeholder="Select date"
                required
                value={formData.dueDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, dueDate: dateValue });
                }}
                minDate={formData.invoiceDate}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Visit Type"
                placeholder="Select visit type"
                required
                data={visitTypes}
                value={formData.visitType}
                onChange={(value) => setFormData({ ...formData, visitType: value || '' })}
                error={formErrors.visitType}
              />
            </Grid.Col>
          </Grid>

          {/* Billing Items */}
          <Divider label="Billing Items" labelPosition="center" />
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Item Description"
                placeholder="Enter item description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <Select
                label="Category"
                placeholder="Select"
                data={itemCategories}
                value={newItem.category}
                onChange={(value) => setNewItem({ ...newItem, category: value || '' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Quantity"
                placeholder="1"
                value={newItem.quantity}
                onChange={(value) => setNewItem({ ...newItem, quantity: Number(value) || 1 })}
                min={1}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <NumberInput
                label="Unit Price (₹)"
                placeholder="0.00"
                value={newItem.unitPrice}
                onChange={(value) => setNewItem({ ...newItem, unitPrice: Number(value) || 0 })}
                min={0}
                step={0.01}
                decimalScale={2}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <Button
                fullWidth
                leftIcon={<IconPlus size={16} />}
                onClick={addItem}
                style={{ marginTop: '25px' }}
              >
                Add Item
              </Button>
            </Grid.Col>
          </Grid>

          {formData.items.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice.toFixed(2)}</td>
                    <td>₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeItem(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {formErrors.items && (
            <Text color="red" size="sm">{formErrors.items}</Text>
          )}

          {/* Insurance Information */}
          <Divider label="Insurance Information" labelPosition="center" />
          
          <Checkbox
            label="Patient has insurance coverage"
            checked={formData.hasInsurance}
            onChange={(event) => setFormData({ ...formData, hasInsurance: event.currentTarget.checked })}
          />

          {formData.hasInsurance && (
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Insurance Provider"
                  placeholder="Enter insurance company"
                  required
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  error={formErrors.insuranceProvider}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Policy Number"
                  placeholder="Enter policy number"
                  required
                  value={formData.insurancePolicyNumber}
                  onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                  error={formErrors.insurancePolicyNumber}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label="Insurance Coverage Amount (₹)"
                  placeholder="0.00"
                  value={formData.insuranceCoverage}
                  onChange={(value) => {
                    setFormData({ ...formData, insuranceCoverage: Number(value) || 0 });
                    updateTotals(formData.items);
                  }}
                  min={0}
                  step={0.01}
                  decimalScale={2}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Approval Number"
                  placeholder="Enter approval number"
                  value={formData.insuranceApprovalNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceApprovalNumber: e.target.value })}
                />
              </Grid.Col>
            </Grid>
          )}

          {/* Payment Information */}
          <Divider label="Payment Information" labelPosition="center" />
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Payment Status"
                placeholder="Select status"
                required
                data={paymentStatuses}
                value={formData.paymentStatus}
                onChange={(value) => setFormData({ ...formData, paymentStatus: value || 'pending' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Payment Method"
                placeholder="Select method"
                data={paymentMethods}
                value={formData.paymentMethod}
                onChange={(value) => setFormData({ ...formData, paymentMethod: value || '' })}
                error={formErrors.paymentMethod}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Paid Amount (₹)"
                placeholder="0.00"
                value={formData.paidAmount}
                onChange={(value) => {
                  setFormData({ ...formData, paidAmount: Number(value) || 0 });
                  updateTotals(formData.items);
                }}
                min={0}
                step={0.01}
                decimalScale={2}
              />
            </Grid.Col>
          </Grid>

          {/* Totals Summary */}
          <Divider label="Invoice Summary" labelPosition="center" />
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text fw={500}>₹{formData.subtotal.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Tax:</Text>
                  <Text fw={500}>₹{formData.taxAmount.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Discount:</Text>
                  <Text fw={500} color="green">-₹{formData.discountAmount.toFixed(2)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={600}>Total Amount:</Text>
                  <Text fw={700} size="lg">₹{formData.totalAmount.toFixed(2)}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>Insurance Coverage:</Text>
                  <Text fw={500} color="blue">₹{formData.insuranceCoverage.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Paid Amount:</Text>
                  <Text fw={500} color="green">₹{formData.paidAmount.toFixed(2)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={600}>Balance Due:</Text>
                  <Text fw={700} size="lg" color={formData.balanceAmount > 0 ? 'red' : 'green'}>
                    ₹{formData.balanceAmount.toFixed(2)}
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Notes */}
          <Textarea
            label="Notes (visible on invoice)"
            placeholder="Enter any notes to appear on the invoice"
            minRows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <Textarea
            label="Internal Notes (not visible to patient)"
            placeholder="Enter internal notes"
            minRows={2}
            value={formData.internalNotes}
            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
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
};

export default BillingInvoiceForm;
