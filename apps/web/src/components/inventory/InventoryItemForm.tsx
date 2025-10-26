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
  NumberInput,
  Textarea,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconPackage, IconAlertCircle } from '@tabler/icons-react';
import inventoryService from '../../services/inventory.service';

interface InventoryItemFormProps {
  opened: boolean;
  onClose: () => void;
  item?: any;
  onSuccess: () => void;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  opened,
  onClose,
  item,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    category: '',
    description: '',
    unit: '',
    quantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderLevel: 0,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: new Date(),
    location: '',
    storageConditions: '',
    status: 'in_stock',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchSuppliers();
      
      if (item) {
        // Edit mode - populate form with existing data
        setFormData({
          itemName: item.itemName || item.name || '',
          itemCode: item.itemCode || '',
          category: item.category || '',
          description: item.description || '',
          unit: item.unit || '',
          quantity: item.quantity || 0,
          minStockLevel: item.minStockLevel || 0,
          maxStockLevel: item.maxStockLevel || 0,
          reorderLevel: item.reorderLevel || 0,
          costPrice: item.costPrice || 0,
          sellingPrice: item.sellingPrice || 0,
          supplier: item.supplier || '',
          manufacturer: item.manufacturer || '',
          batchNumber: item.batchNumber || '',
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : new Date(),
          location: item.location || '',
          storageConditions: item.storageConditions || '',
          status: item.status || 'in_stock',
        });
      } else {
        // Add mode - reset form
        resetForm();
      }
    }
  }, [opened, item]);

  const fetchSuppliers = async () => {
    try {
      // TODO: Add getSuppliers method to inventory service
      // const response = await inventoryService.getSuppliers();
      // if (response.success && response.data) {
      //   const supplierOptions = response.data.map((s: any) => ({
      //     value: s.id,
      //     label: s.companyName || s.name,
      //   }));
      //   setSuppliers(supplierOptions);
      // }
      setSuppliers([]);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      itemCode: '',
      category: '',
      description: '',
      unit: '',
      quantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderLevel: 0,
      costPrice: 0,
      sellingPrice: 0,
      supplier: '',
      manufacturer: '',
      batchNumber: '',
      expiryDate: new Date(),
      location: '',
      storageConditions: '',
      status: 'in_stock',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.itemName.trim()) errors.itemName = 'Item name is required';
    if (!formData.itemCode.trim()) errors.itemCode = 'Item code is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.unit.trim()) errors.unit = 'Unit is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.costPrice < 0) errors.costPrice = 'Cost price cannot be negative';
    if (formData.sellingPrice < 0) errors.sellingPrice = 'Selling price cannot be negative';
    
    if (formData.sellingPrice < formData.costPrice) {
      errors.sellingPrice = 'Selling price cannot be less than cost price';
    }
    
    if (formData.minStockLevel < 0) errors.minStockLevel = 'Min stock level cannot be negative';
    if (formData.maxStockLevel < formData.minStockLevel) {
      errors.maxStockLevel = 'Max stock level cannot be less than min stock level';
    }
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Reorder level cannot be negative';
    if (formData.reorderLevel > formData.maxStockLevel) {
      errors.reorderLevel = 'Reorder level cannot be greater than max stock level';
    }

    // Check expiry date for certain categories
    if (['medication', 'medicines', 'consumables'].includes(formData.category)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(formData.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      if (expiryDate <= today) {
        errors.expiryDate = 'Expiry date must be in the future';
      }
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
        name: formData.itemName,
        itemCode: formData.itemCode,
        category: formData.category,
        description: formData.description,
        quantity: formData.quantity,
        minQuantity: formData.minStockLevel,
        unitPrice: formData.costPrice,
        unit: formData.unit,
        supplier: formData.supplier,
        location: formData.location,
        expiryDate: formData.expiryDate.toISOString(),
      };

      let response;
      if (item) {
        response = await inventoryService.updateItem(item.id, submitData);
      } else {
        response = await inventoryService.createItem(submitData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: item ? 'Inventory item updated successfully' : 'Inventory item added successfully',
          color: 'green',
          icon: <IconPackage />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting inventory form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save inventory item',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'medication', label: 'Medication' },
    { value: 'medical_supplies', label: 'Medical Supplies' },
    { value: 'surgical_instruments', label: 'Surgical Instruments' },
    { value: 'laboratory', label: 'Laboratory Supplies' },
    { value: 'radiology', label: 'Radiology Supplies' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'cleaning', label: 'Cleaning Supplies' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'other', label: 'Other' },
  ];

  const units = [
    { value: 'piece', label: 'Piece' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'vial', label: 'Vial' },
    { value: 'ampule', label: 'Ampule' },
    { value: 'tube', label: 'Tube' },
    { value: 'roll', label: 'Roll' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'g', label: 'Gram' },
    { value: 'l', label: 'Liter' },
    { value: 'ml', label: 'Milliliter' },
    { value: 'unit', label: 'Unit' },
  ];

  const statuses = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'expired', label: 'Expired' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'discontinued', label: 'Discontinued' },
  ];

  const storageConditions = [
    { value: 'room_temperature', label: 'Room Temperature' },
    { value: 'refrigerated', label: 'Refrigerated (2-8°C)' },
    { value: 'frozen', label: 'Frozen (-20°C)' },
    { value: 'cool_dry', label: 'Cool and Dry Place' },
    { value: 'protected_light', label: 'Protected from Light' },
    { value: 'controlled', label: 'Controlled Environment' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Basic Information */}
          <Alert icon={<IconPackage size={20} />} color="blue" variant="light">
            Enter inventory item details below. All fields marked with * are required.
          </Alert>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Item Name"
                placeholder="Enter item name"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                error={formErrors.itemName}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Item Code"
                placeholder="Enter unique item code"
                required
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                error={formErrors.itemCode}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Category"
                placeholder="Select category"
                required
                data={categories}
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value || '' })}
                error={formErrors.category}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Unit"
                placeholder="Select unit"
                required
                data={units}
                value={formData.unit}
                onChange={(value) => setFormData({ ...formData, unit: value || '' })}
                error={formErrors.unit}
                searchable
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Description"
            placeholder="Enter item description"
            minRows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Stock Information */}
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            Stock Information
          </h3>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Current Quantity"
                placeholder="0"
                required
                value={formData.quantity}
                onChange={(value) => setFormData({ ...formData, quantity: Number(value) || 0 })}
                error={formErrors.quantity}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Min Stock Level"
                placeholder="0"
                value={formData.minStockLevel}
                onChange={(value) => setFormData({ ...formData, minStockLevel: Number(value) || 0 })}
                error={formErrors.minStockLevel}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Max Stock Level"
                placeholder="0"
                value={formData.maxStockLevel}
                onChange={(value) => setFormData({ ...formData, maxStockLevel: Number(value) || 0 })}
                error={formErrors.maxStockLevel}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Reorder Level"
                placeholder="0"
                value={formData.reorderLevel}
                onChange={(value) => setFormData({ ...formData, reorderLevel: Number(value) || 0 })}
                error={formErrors.reorderLevel}
                min={0}
              />
            </Grid.Col>
          </Grid>

          {/* Pricing Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Cost Price (₹)"
                placeholder="0.00"
                required
                value={formData.costPrice}
                onChange={(value) => setFormData({ ...formData, costPrice: Number(value) || 0 })}
                error={formErrors.costPrice}
                min={0}
                step={0.01}
                decimalScale={2}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Selling Price (₹)"
                placeholder="0.00"
                required
                value={formData.sellingPrice}
                onChange={(value) => setFormData({ ...formData, sellingPrice: Number(value) || 0 })}
                error={formErrors.sellingPrice}
                min={0}
                step={0.01}
                decimalScale={2}
              />
            </Grid.Col>
          </Grid>

          {/* Supplier and Batch Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Supplier"
                placeholder="Select supplier"
                data={suppliers}
                value={formData.supplier}
                onChange={(value) => setFormData({ ...formData, supplier: value || '' })}
                searchable
                nothingFoundMessage="No suppliers found"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Manufacturer"
                placeholder="Enter manufacturer name"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Batch Number"
                placeholder="Enter batch number"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Expiry Date"
                placeholder="Select expiry date"
                value={formData.expiryDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, expiryDate: dateValue });
                }}
                error={formErrors.expiryDate}
                minDate={new Date()}
              />
            </Grid.Col>
          </Grid>

          {/* Storage Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Storage Location"
                placeholder="e.g., Room A, Shelf 3"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Storage Conditions"
                placeholder="Select conditions"
                data={storageConditions}
                value={formData.storageConditions}
                onChange={(value) => setFormData({ ...formData, storageConditions: value || '' })}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Status"
                placeholder="Select status"
                data={statuses}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value || 'in_stock' })}
              />
            </Grid.Col>
          </Grid>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default InventoryItemForm;
