import React from 'react';
import { Modal, Text, Group, Stack, Badge, Button, Divider, Card, Avatar } from '@mantine/core';
import { IconMail, IconUser, IconClock, IconTrash, IconArrowBackUp } from '@tabler/icons-react';

interface MessageDetailsProps {
  opened: boolean;
  onClose: () => void;
  message: any;
  onDelete?: (message: any) => void;
  onReply?: (message: any) => void;
}

export default function MessageDetails({
  opened,
  onClose,
  message,
  onDelete,
  onReply,
}: MessageDetailsProps) {
  if (!message) return null;

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'gray',
      NORMAL: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority] || 'blue';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sender = message.sender || {};
  const recipient = message.recipient || {};

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconMail size={24} />
          <div>
            <Text size="lg" fw={600}>
              Message Details
            </Text>
            <Badge size="sm" color={getPriorityColor(message.priority)}>
              {message.priority}
            </Badge>
          </div>
        </Group>
      }
      size="md"
      padding="md"
    >
      <Stack gap="md">
        {/* Sender Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconUser size={20} />
            <Text fw={600}>From</Text>
          </Group>
          <Divider mb="sm" />
          <Group>
            <Avatar color="blue" radius="xl">
              {sender.firstName?.[0]}
              {sender.lastName?.[0]}
            </Avatar>
            <div>
              <Text fw={500}>
                {sender.firstName} {sender.lastName}
              </Text>
              <Text size="sm" c="dimmed">
                {sender.email}
              </Text>
            </div>
          </Group>
        </Card>

        {/* Recipient Information */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconUser size={20} />
            <Text fw={600}>To</Text>
          </Group>
          <Divider mb="sm" />
          <Group>
            <Avatar color="green" radius="xl">
              {recipient.firstName?.[0]}
              {recipient.lastName?.[0]}
            </Avatar>
            <div>
              <Text fw={500}>
                {recipient.firstName} {recipient.lastName}
              </Text>
              <Text size="sm" c="dimmed">
                {recipient.email}
              </Text>
            </div>
          </Group>
        </Card>

        {/* Message Details */}
        <Card withBorder padding="md">
          <Group mb="xs">
            <IconClock size={20} />
            <Text fw={600}>Message</Text>
          </Group>
          <Divider mb="sm" />

          <Stack gap="sm">
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Subject:
              </Text>
              <Text fw={600}>{message.subject}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Content:
              </Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Sent:
              </Text>
              <Text size="sm">{formatDate(message.createdAt)}</Text>
            </div>

            {message.read && message.readAt && (
              <div>
                <Text size="xs" c="dimmed" mb={4}>
                  Read:
                </Text>
                <Text size="sm">{formatDate(message.readAt)}</Text>
              </div>
            )}
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Group>
            {onDelete && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this message?')) {
                    onDelete(message);
                    onClose();
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Group>

          <Group>
            {onReply && (
              <Button
                leftSection={<IconArrowBackUp size={16} />}
                onClick={() => {
                  onReply(message);
                  onClose();
                }}
              >
                Reply
              </Button>
            )}
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
