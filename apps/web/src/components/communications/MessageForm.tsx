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
  LoadingOverlay,
} from '@mantine/core';
import { IconSend, IconUser } from '@tabler/icons-react';
import type { CreateMessageDto } from '../../services/communications.service';

interface MessageFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMessageDto) => Promise<void>;
  loading?: boolean;
  users?: any[];
}

export default function MessageForm({
  opened,
  onClose,
  onSubmit,
  loading = false,
  users = [],
}: MessageFormProps) {
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'NORMAL',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!opened) {
      resetForm();
    }
  }, [opened]);

  const resetForm = () => {
    setFormData({
      recipientId: '',
      subject: '',
      content: '',
      priority: 'NORMAL',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipientId) {
      newErrors.recipientId = 'Recipient is required';
    }
    if (!formData.subject || formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }
    if (!formData.content || formData.content.trim().length < 10) {
      newErrors.content = 'Message must be at least 10 characters';
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
      await onSubmit(formData as CreateMessageDto);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName} - ${u.email}`,
  }));

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconSend size={24} />
          <Text size="lg" fw={600}>
            Send Message
          </Text>
        </Group>
      }
      size="md"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Recipient */}
          <Select
            label="Recipient"
            placeholder="Select recipient"
            data={userOptions}
            value={formData.recipientId}
            onChange={(value) => setFormData({ ...formData, recipientId: value || '' })}
            error={errors.recipientId}
            required
            searchable
            leftSection={<IconUser size={16} />}
          />

          {/* Priority */}
          <Select
            label="Priority"
            placeholder="Select priority"
            data={priorityOptions}
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value || 'NORMAL' })}
          />

          {/* Subject */}
          <TextInput
            label="Subject"
            placeholder="Enter message subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            error={errors.subject}
            required
          />

          {/* Content */}
          <Textarea
            label="Message"
            placeholder="Enter your message"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            error={errors.content}
            required
            minRows={4}
            maxRows={8}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} leftSection={<IconSend size={16} />}>
              Send Message
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
