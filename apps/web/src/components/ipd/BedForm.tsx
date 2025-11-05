'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Textarea,
  LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ipdService from '../../services/ipd.service';
import type { CreateBedDto } from '../../services/ipd.service';

interface BedFormProps {
  opened: boolean;
  onClose: () => void;
  bed?: any;
  onSubmit: (data: CreateBedDto) => Promise<void>;
}

const BED_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RESERVED', label: 'Reserved' },
];

function BedForm({ opened, onClose, bed, onSubmit }: BedFormProps) {
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    wardId: '',
    bedNumber: '',
    description: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED',
  });

  useEffect(() => {
    if (opened) {
      fetchWards();
      if (bed) {
        setFormData({
          wardId: bed.wardId || '',
          bedNumber: bed.bedNumber || '',
          description: bed.description || '',
          status: bed.status || 'AVAILABLE',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, bed]);

  const fetchWards = async () => {
    try {
      const response = await ipdService.getWards({ limit: 100 });
      if (response.success && response.data) {
        setWards(
          response.data.items.map((ward) => ({
            value: ward.id,
            label: `${ward.name} (${ward.location || 'No location'})`,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load wards',
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      wardId: '',
      bedNumber: '',
      description: '',
      status: 'AVAILABLE',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.wardId) {
      notifications.show({
        title: 'Validation Error',
        message: 'Ward is required',
        color: 'red',
      });
      return;
    }

    if (!formData.bedNumber.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Bed number is required',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        wardId: formData.wardId,
        bedNumber: formData.bedNumber,
        description: formData.description || undefined,
        status: formData.status,
      };

      await onSubmit(submitData);
      resetForm();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      // Error notification is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={bed ? 'Edit Bed' : 'Create New Bed'}
      size="md"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Ward Selection */}
          <Select
            label="Ward"
            placeholder="Select ward"
            required
            data={wards}
            value={formData.wardId}
            onChange={(value) => setFormData({ ...formData, wardId: value || '' })}
            searchable
            disabled={!!bed}
          />

          {/* Bed Number */}
          <TextInput
            label="Bed Number"
            placeholder="Enter bed number"
            required
            value={formData.bedNumber}
            onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
          />

          {/* Status */}
          <Select
            label="Status"
            placeholder="Select bed status"
            required
            data={BED_STATUS_OPTIONS}
            value={formData.status}
            onChange={(value) =>
              setFormData({ ...formData, status: (value as any) || 'AVAILABLE' })
            }
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Enter bed description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={2}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {bed ? 'Update Bed' : 'Create Bed'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default BedForm;
