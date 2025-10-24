import React from 'react';
import {
  Popover,
  ActionIcon,
  Stack,
  Text,
  Badge,
  Group,
  ScrollArea,
  Button,
  Divider,
  Card,
  Indicator,
} from '@mantine/core';
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconX,
} from '@tabler/icons-react';

interface NotificationCenterProps {
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewAll,
}: NotificationCenterProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <IconCircleCheck size={16} color="#40c057" />;
      case 'WARNING':
        return <IconAlertTriangle size={16} color="#fab005" />;
      case 'ERROR':
        return <IconX size={16} color="#fa5252" />;
      default:
        return <IconInfoCircle size={16} color="#228be6" />;
    }
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      SUCCESS: 'green',
      WARNING: 'yellow',
      ERROR: 'red',
      INFO: 'blue',
      APPOINTMENT: 'cyan',
      BILLING: 'orange',
      SYSTEM: 'gray',
    };
    return colors[type] || 'blue';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover width={400} position="bottom-end" shadow="md">
      <Popover.Target>
        <Indicator inline label={unreadCount} size={16} disabled={unreadCount === 0} color="red">
          <ActionIcon variant="subtle" size="lg">
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Stack gap={0}>
          {/* Header */}
          <Group justify="space-between" p="md" pb="xs">
            <Text fw={600} size="sm">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Button
                variant="subtle"
                size="xs"
                onClick={onMarkAllAsRead}
                leftSection={<IconCheck size={14} />}
              >
                Mark all read
              </Button>
            )}
          </Group>

          <Divider />

          {/* Notifications List */}
          <ScrollArea h={400}>
            {notifications.length === 0 ? (
              <Stack align="center" justify="center" p="xl">
                <IconBell size={48} color="gray" />
                <Text c="dimmed" size="sm">
                  No notifications
                </Text>
              </Stack>
            ) : (
              <Stack gap={0}>
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    p="sm"
                    withBorder={false}
                    style={{
                      backgroundColor: notification.read ? 'transparent' : '#f8f9fa',
                      borderBottom: '1px solid #e9ecef',
                      cursor: 'pointer',
                    }}
                  >
                    <Group align="flex-start" gap="xs" wrap="nowrap">
                      {getNotificationIcon(notification.type)}

                      <Stack gap={4} style={{ flex: 1 }}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="sm" fw={notification.read ? 400 : 600} lineClamp={1}>
                            {notification.title}
                          </Text>
                          <Badge size="xs" color={getNotificationColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </Group>

                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {notification.message}
                        </Text>

                        <Group justify="space-between" mt={4}>
                          <Text size="xs" c="dimmed">
                            {formatTime(notification.createdAt)}
                          </Text>

                          <Group gap={4}>
                            {!notification.read && (
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead(notification.id);
                                }}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
                            )}
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                              }}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <Divider />
              <Button variant="subtle" fullWidth onClick={onViewAll} size="sm">
                View All Notifications
              </Button>
            </>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
