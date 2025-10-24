'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  NumberInput,
  Textarea,
  LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { CreateWardDto, UpdateWardDto } from '../../services/ipd.service';

interface WardFormProps {
  opened: boolean;
  onClose: () => void;
  ward?: any;
  onSubmit: (data: CreateWardDto | UpdateWardDto) => Promise<void>;
}

function WardForm({ opened, onClose, ward, onSubmit }: WardFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 0,
    location: '',
    floor: '',
  });

  useEffect(() => {
    if (opened) {
      if (ward) {
        setFormData({
          name: ward.name || '',
          description: ward.description || '',
          capacity: ward.capacity || 0,
          location: ward.location || '',
          floor: ward.floor || '',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, ward]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: 0,
      location: '',
      floor: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Ward name is required',
        color: 'red',
      });
      return;
    }

    if (!formData.capacity || formData.capacity <= 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Ward capacity must be greater than 0',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        description: formData.description || undefined,
        location: formData.location || undefined,
        floor: formData.floor || undefined,
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
      title={ward ? 'Edit Ward' : 'Create New Ward'}
      size="md"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Ward Name */}
          <TextInput
            label="Ward Name"
            placeholder="Enter ward name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* Capacity */}
          <NumberInput
            label="Capacity"
            placeholder="Enter ward capacity"
            required
            min={1}
            value={formData.capacity}
            onChange={(value) => setFormData({ ...formData, capacity: Number(value) || 0 })}
          />

          {/* Location */}
          <TextInput
            label="Location"
            placeholder="Enter ward location (optional)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          {/* Floor */}
          <TextInput
            label="Floor"
            placeholder="Enter floor number (optional)"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Enter ward description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={3}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {ward ? 'Update Ward' : 'Create Ward'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default WardForm;
