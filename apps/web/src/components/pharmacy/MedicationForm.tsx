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
import { IconPill, IconAlertCircle } from '@tabler/icons-react';
import pharmacyService from '../../services/pharmacy.service';

interface MedicationFormProps {
  opened: boolean;
  onClose: () => void;
  medication?: any;
  onSuccess: () => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  opened,
  onClose,
  medication,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brandName: '',
    drugCode: '',
    category: '',
    type: 'tablet',
    dosage: '',
    strength: '',
    manufacturer: '',
    supplier: '',
    batchNumber: '',
    expiryDate: new Date(),
    quantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderLevel: 0,
    unitPrice: 0,
    sellingPrice: 0,
    storage: '',
    description: '',
    sideEffects: '',
    contraindications: '',
    interactions: '',
    prescriptionRequired: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      if (medication) {
        // Edit mode - populate form with existing data
        setFormData({
          name: medication.name || '',
          genericName: medication.genericName || '',
          brandName: medication.brandName || '',
          drugCode: medication.drugCode || '',
          category: medication.category || '',
          type: medication.type || 'tablet',
          dosage: medication.dosage || '',
          strength: medication.strength || '',
          manufacturer: medication.manufacturer || '',
          supplier: medication.supplier || '',
          batchNumber: medication.batchNumber || '',
          expiryDate: medication.expiryDate ? new Date(medication.expiryDate) : new Date(),
          quantity: medication.quantity || 0,
          minStockLevel: medication.minStockLevel || 0,
          maxStockLevel: medication.maxStockLevel || 0,
          reorderLevel: medication.reorderLevel || 0,
          unitPrice: medication.unitPrice || 0,
          sellingPrice: medication.sellingPrice || 0,
          storage: medication.storage || '',
          description: medication.description || '',
          sideEffects: medication.sideEffects || '',
          contraindications: medication.contraindications || '',
          interactions: medication.interactions || '',
          prescriptionRequired: medication.prescriptionRequired !== false,
        });
      } else {
        // Add mode - reset form
        resetForm();
      }
    }
  }, [opened, medication]);

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      brandName: '',
      drugCode: '',
      category: '',
      type: 'tablet',
      dosage: '',
      strength: '',
      manufacturer: '',
      supplier: '',
      batchNumber: '',
      expiryDate: new Date(),
      quantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderLevel: 0,
      unitPrice: 0,
      sellingPrice: 0,
      storage: '',
      description: '',
      sideEffects: '',
      contraindications: '',
      interactions: '',
      prescriptionRequired: true,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Medication name is required';
    if (!formData.genericName.trim()) errors.genericName = 'Generic name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.dosage.trim()) errors.dosage = 'Dosage is required';
    if (!formData.strength.trim()) errors.strength = 'Strength is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.unitPrice < 0) errors.unitPrice = 'Unit price cannot be negative';
    if (formData.sellingPrice < 0) errors.sellingPrice = 'Selling price cannot be negative';
    if (formData.sellingPrice < formData.unitPrice) {
      errors.sellingPrice = 'Selling price cannot be less than unit price';
    }
    if (formData.minStockLevel < 0) errors.minStockLevel = 'Min stock level cannot be negative';
    if (formData.maxStockLevel < formData.minStockLevel) {
      errors.maxStockLevel = 'Max stock level cannot be less than min stock level';
    }
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Reorder level cannot be negative';
    
    // Check expiry date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(formData.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    if (expiryDate <= today) {
      errors.expiryDate = 'Expiry date must be in the future';
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
        expiryDate: formData.expiryDate.toISOString(),
      };

      let response;
      if (medication) {
        response = await pharmacyService.updateMedication(medication.id, submitData);
      } else {
        response = await pharmacyService.createMedication(submitData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: medication ? 'Medication updated successfully' : 'Medication added successfully',
          color: 'green',
          icon: <IconPill />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting medication form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save medication',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'antibiotic', label: 'Antibiotic' },
    { value: 'analgesic', label: 'Analgesic' },
    { value: 'cardiovascular', label: 'Cardiovascular' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'respiratory', label: 'Respiratory' },
    { value: 'gastrointestinal', label: 'Gastrointestinal' },
    { value: 'neurological', label: 'Neurological' },
    { value: 'dermatological', label: 'Dermatological' },
    { value: 'hormonal', label: 'Hormonal' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'psychiatric', label: 'Psychiatric' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
    { value: 'vitamins', label: 'Vitamins & Supplements' },
    { value: 'vaccines', label: 'Vaccines' },
    { value: 'other', label: 'Other' },
  ];

  const medicationTypes = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'cream', label: 'Cream' },
    { value: 'ointment', label: 'Ointment' },
    { value: 'drops', label: 'Drops' },
    { value: 'inhaler', label: 'Inhaler' },
    { value: 'patch', label: 'Patch' },
    { value: 'suppository', label: 'Suppository' },
    { value: 'gel', label: 'Gel' },
    { value: 'spray', label: 'Spray' },
    { value: 'powder', label: 'Powder' },
    { value: 'solution', label: 'Solution' },
  ];

  const storageConditions = [
    { value: 'room_temperature', label: 'Room Temperature (15-25°C)' },
    { value: 'refrigerated', label: 'Refrigerated (2-8°C)' },
    { value: 'frozen', label: 'Frozen (-20°C)' },
    { value: 'cool_dry', label: 'Cool and Dry Place' },
    { value: 'protected_from_light', label: 'Protected from Light' },
    { value: 'controlled', label: 'Controlled Substance' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={medication ? 'Edit Medication' : 'Add New Medication'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Basic Information */}
          <Alert icon={<IconPill size={20} />} color="blue" variant="light">
            Enter medication details below. All fields marked with * are required.
          </Alert>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Medication Name"
                placeholder="Enter medication name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={formErrors.name}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Generic Name"
                placeholder="Enter generic name"
                required
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                error={formErrors.genericName}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Brand Name"
                placeholder="Enter brand name"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Drug Code"
                placeholder="Enter drug code"
                value={formData.drugCode}
                onChange={(e) => setFormData({ ...formData, drugCode: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
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
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Type"
                placeholder="Select type"
                required
                data={medicationTypes}
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value || 'tablet' })}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Prescription Required"
                placeholder="Select option"
                data={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
                value={formData.prescriptionRequired.toString()}
                onChange={(value) => setFormData({ ...formData, prescriptionRequired: value === 'true' })}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Dosage"
                placeholder="e.g., 500mg"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                error={formErrors.dosage}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Strength"
                placeholder="e.g., 10mg/ml"
                required
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                error={formErrors.strength}
              />
            </Grid.Col>
          </Grid>

          {/* Stock Information */}
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            Stock Information
          </h3>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
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
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Batch Number"
                placeholder="Enter batch number"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="Expiry Date"
                placeholder="Select expiry date"
                required
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

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Min Stock Level"
                placeholder="0"
                value={formData.minStockLevel}
                onChange={(value) => setFormData({ ...formData, minStockLevel: Number(value) || 0 })}
                error={formErrors.minStockLevel}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Max Stock Level"
                placeholder="0"
                value={formData.maxStockLevel}
                onChange={(value) => setFormData({ ...formData, maxStockLevel: Number(value) || 0 })}
                error={formErrors.maxStockLevel}
                min={0}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
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

          {/* Pricing & Supply */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Unit Price (₹)"
                placeholder="0.00"
                required
                value={formData.unitPrice}
                onChange={(value) => setFormData({ ...formData, unitPrice: Number(value) || 0 })}
                error={formErrors.unitPrice}
                min={0}
                step={0.01}
                decimalScale={2}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
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
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Storage Condition"
                placeholder="Select storage"
                data={storageConditions}
                value={formData.storage}
                onChange={(value) => setFormData({ ...formData, storage: value || '' })}
                searchable
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Manufacturer"
                placeholder="Enter manufacturer name"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Supplier"
                placeholder="Enter supplier name"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Additional Information */}
          <Textarea
            label="Description"
            placeholder="Enter medication description"
            minRows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Textarea
            label="Side Effects"
            placeholder="List common side effects"
            minRows={2}
            value={formData.sideEffects}
            onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
          />

          <Textarea
            label="Contraindications"
            placeholder="List contraindications"
            minRows={2}
            value={formData.contraindications}
            onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
          />

          <Textarea
            label="Drug Interactions"
            placeholder="List known drug interactions"
            minRows={2}
            value={formData.interactions}
            onChange={(e) => setFormData({ ...formData, interactions: e.target.value })}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {medication ? 'Update Medication' : 'Add Medication'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default MedicationForm;
