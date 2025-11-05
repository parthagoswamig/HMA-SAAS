import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  LoadingOverlay,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconFileText, IconUser, IconCalendar, IconStethoscope } from '@tabler/icons-react';
import type { CreateMedicalRecordDto, UpdateMedicalRecordDto } from '../../services/emr.service';

interface MedicalRecordFormProps {
  opened: boolean;
  onClose: () => void;
  record?: any;
  onSubmit: (data: CreateMedicalRecordDto | UpdateMedicalRecordDto) => Promise<void>;
  loading?: boolean;
  patients?: any[];
  doctors?: any[];
}

export default function MedicalRecordForm({
  opened,
  onClose,
  record,
  onSubmit,
  loading = false,
  patients = [],
  doctors = [],
}: MedicalRecordFormProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    recordType: 'CONSULTATION',
    title: '',
    description: '',
    date: new Date(),
    doctorId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record) {
      setFormData({
        patientId: record.patientId || '',
        recordType: record.recordType || 'CONSULTATION',
        title: record.title || '',
        description: record.description || '',
        date: record.date ? new Date(record.date) : new Date(),
        doctorId: record.doctorId || '',
      });
    } else {
      resetForm();
    }
  }, [record, opened]);

  const resetForm = () => {
    setFormData({
      patientId: '',
      recordType: 'CONSULTATION',
      title: '',
      description: '',
      date: new Date(),
      doctorId: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!record && !formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.recordType) {
      newErrors.recordType = 'Record type is required';
    }
    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
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
        recordType: formData.recordType,
        title: formData.title,
        description: formData.description,
        date: formData.date.toISOString(),
        doctorId: formData.doctorId || undefined,
      };

      if (!record) {
        submitData.patientId = formData.patientId;
      }

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting medical record:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} - ${p.medicalRecordNumber || p.id}`,
  }));

  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: `Dr. ${d.firstName} ${d.lastName}`,
  }));

  const recordTypeOptions = [
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'DIAGNOSIS', label: 'Diagnosis' },
    { value: 'PRESCRIPTION', label: 'Prescription' },
    { value: 'LAB_RESULT', label: 'Lab Result' },
    { value: 'IMAGING', label: 'Imaging' },
    { value: 'PROCEDURE', label: 'Procedure' },
    { value: 'VACCINATION', label: 'Vaccination' },
    { value: 'ALLERGY', label: 'Allergy' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconFileText size={24} />
          <span>{record ? 'Update Medical Record' : 'Create Medical Record'}</span>
        </Group>
      }
      size="lg"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {!record && (
            <Select
              label="Patient"
              placeholder="Select patient"
              data={patientOptions}
              value={formData.patientId}
              onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
              error={errors.patientId}
              required
              searchable
              leftSection={<IconUser size={16} />}
            />
          )}

          <Select
            label="Record Type"
            placeholder="Select record type"
            data={recordTypeOptions}
            value={formData.recordType}
            onChange={(value) => setFormData({ ...formData, recordType: value || 'CONSULTATION' })}
            error={errors.recordType}
            required
          />

          <TextInput
            label="Title"
            placeholder="Enter record title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter detailed description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            required
            minRows={4}
            maxRows={8}
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
            label="Doctor"
            placeholder="Select doctor (optional)"
            data={doctorOptions}
            value={formData.doctorId}
            onChange={(value) => setFormData({ ...formData, doctorId: value || '' })}
            searchable
            clearable
            leftSection={<IconStethoscope size={16} />}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {record ? 'Update Record' : 'Create Record'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
