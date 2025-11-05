'use client';

import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  Container,
  Stack,
  Button,
  Title,
  Card,
  Tabs,
  ActionIcon,
  Group,
  Text,
  Badge,
  SimpleGrid,
  Paper,
  LoadingOverlay,
  Alert,
  TextInput,
  Select,
  Avatar,
  Menu,
  Grid,
} from '@mantine/core';
import {
  IconPlus,
  IconMail,
  IconBell,
  IconTrash,
  IconMailOpened,
  IconEye,
  IconCheck,
  IconDotsVertical,
  IconInbox,
  IconSend,
  IconSearch,
  IconAlertCircle,
} from '@tabler/icons-react';
import Layout from '../../components/shared/Layout';
import DataTable from '../../components/shared/DataTable';
import MessageForm from '../../components/communications/MessageForm';
import MessageDetails from '../../components/communications/MessageDetails';
import { useAppStore } from '../../stores/appStore';
import { User, UserRole, TableColumn } from '../../types/common';
import communicationsService from '../../services/communications.service';
import type { CreateMessageDto, MessageFilters } from '../../services/communications.service';

const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@hospital.com',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.ADMIN,
  permissions: [],
  isActive: true,
  tenantInfo: {
    tenantId: 'T001',
    tenantName: 'Main Hospital',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function CommunicationsPage() {
  const { user, setUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [messageFormOpened, { open: openMessageForm, close: closeMessageForm }] =
    useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      setUser(mockUser);
    }
    fetchMessages();
    fetchNotifications();
    fetchStats();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setUser]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const filters: MessageFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter === 'unread') filters.read = false;
      if (statusFilter === 'read') filters.read = true;

      const response = await communicationsService.getMessages(filters);
      if (response.success && response.data) {
        setMessages(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to fetch messages',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await communicationsService.getNotifications();
      if (response.success && response.data) {
        setNotificationsList(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await communicationsService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Mock users - in production, fetch from users API
      setUsers([
        { id: '2', firstName: 'John', lastName: 'Doe', email: 'john@hospital.com' },
        { id: '3', firstName: 'Jane', lastName: 'Smith', email: 'jane@hospital.com' },
      ]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async (data: CreateMessageDto) => {
    try {
      const response = await communicationsService.sendMessage(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Message sent successfully',
          color: 'green',
        });
        fetchMessages();
        fetchStats();
        closeMessageForm();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to send message',
        color: 'red',
      });
      throw error;
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await communicationsService.markMessageAsRead(messageId);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Message marked as read',
          color: 'green',
        });
        fetchMessages();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to mark message as read',
        color: 'red',
      });
    }
  };

  const handleDeleteMessage = async (message: any) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await communicationsService.deleteMessage(message.id);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Message deleted successfully',
          color: 'green',
        });
        fetchMessages();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting message:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to delete message',
        color: 'red',
      });
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await communicationsService.markNotificationAsRead(notificationId);
      if (response.success) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const response = await communicationsService.markAllNotificationsAsRead();
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'All notifications marked as read',
          color: 'green',
        });
        fetchNotifications();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await communicationsService.deleteNotification(notificationId);
      if (response.success) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    openDetails();
    if (!message.read) {
      handleMarkAsRead(message.id);
    }
  };

  const handleReplyMessage = (_message: any) => {
    // Set recipient to sender of original message
    openMessageForm();
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'gray',
      NORMAL: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority] || 'blue';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const messageColumns: TableColumn[] = [
    {
      key: 'read',
      title: '',
      render: (message: any) => (
        <ActionIcon size="sm" variant="subtle" color={message.read ? 'gray' : 'blue'}>
          {message.read ? <IconMailOpened size={16} /> : <IconMail size={16} />}
        </ActionIcon>
      ),
    },
    {
      key: 'sender',
      title: 'From',
      sortable: true,
      render: (message: any) => (
        <Group gap="xs">
          <Avatar size="sm" radius="xl" color="blue">
            {message.sender?.firstName?.[0]}
            {message.sender?.lastName?.[0]}
          </Avatar>
          <div>
            <Text fw={message.read ? 400 : 600} size="sm">
              {message.sender?.firstName} {message.sender?.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {message.sender?.email}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'subject',
      title: 'Subject',
      sortable: true,
      render: (message: any) => (
        <Text fw={message.read ? 400 : 600} lineClamp={1}>
          {message.subject}
        </Text>
      ),
    },
    {
      key: 'priority',
      title: 'Priority',
      sortable: true,
      render: (message: any) => (
        <Badge size="sm" color={getPriorityColor(message.priority)}>
          {message.priority}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      sortable: true,
      render: (message: any) => <Text size="sm">{formatDate(message.createdAt)}</Text>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (message: any) => (
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleViewMessage(message)}>
            <IconEye size={16} />
          </ActionIcon>
          {!message.read && (
            <ActionIcon variant="subtle" color="green" onClick={() => handleMarkAsRead(message.id)}>
              <IconCheck size={16} />
            </ActionIcon>
          )}
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={14} />}
                onClick={() => handleViewMessage(message)}
              >
                View
              </Menu.Item>
              {!message.read && (
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleMarkAsRead(message.id)}
                >
                  Mark as Read
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => handleDeleteMessage(message)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
    },
  ];

  const notificationColumns: TableColumn[] = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (notification: any) => (
        <Text fw={notification.read ? 400 : 600}>{notification.title}</Text>
      ),
    },
    {
      key: 'message',
      title: 'Message',
      render: (notification: any) => <Text lineClamp={2}>{notification.message}</Text>,
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (notification: any) => (
        <Badge size="sm" color={getNotificationColor(notification.type)}>
          {notification.type}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      sortable: true,
      render: (notification: any) => <Text size="sm">{formatDate(notification.createdAt)}</Text>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (notification: any) => (
        <Group gap="xs">
          {!notification.read && (
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => handleMarkNotificationAsRead(notification.id)}
            >
              <IconCheck size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDeleteNotification(notification.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const layoutUser = user || mockUser;
  const userForLayout = {
    id: layoutUser.id,
    name: `${layoutUser.firstName} ${layoutUser.lastName}`,
    email: layoutUser.email,
    role: layoutUser.role,
  };

  return (
    <Layout user={userForLayout} notifications={0} onLogout={() => {}}>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Communications</Title>
              <Text c="dimmed" size="sm">
                Manage messages and notifications
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={openMessageForm}>
              New Message
            </Button>
          </Group>

          {/* Statistics Cards */}
          {stats && (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Unread Messages
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.unreadMessages}
                    </Text>
                  </div>
                  <IconMail size={32} color="#228be6" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Total Messages
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.totalMessages}
                    </Text>
                  </div>
                  <IconInbox size={32} color="#12b886" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Unread Notifications
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.unreadNotifications}
                    </Text>
                  </div>
                  <IconBell size={32} color="#fab005" />
                </Group>
              </Card>

              <Card withBorder padding="lg">
                <Group justify="space-between">
                  <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                      Sent Messages
                    </Text>
                    <Text fw={700} size="xl">
                      {stats.sentMessages}
                    </Text>
                  </div>
                  <IconSend size={32} color="#40c057" />
                </Group>
              </Card>
            </SimpleGrid>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'messages')}>
            <Tabs.List>
              <Tabs.Tab value="messages" leftSection={<IconMail size={16} />}>
                Messages
              </Tabs.Tab>
              <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
                Notifications
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="messages" pt="md">
              {/* Filters */}
              <Paper withBorder p="md" mb="md">
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <TextInput
                      placeholder="Search messages..."
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Select
                      placeholder="Filter by status"
                      data={[
                        { value: '', label: 'All Messages' },
                        { value: 'unread', label: 'Unread' },
                        { value: 'read', label: 'Read' },
                      ]}
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value || '')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Button fullWidth onClick={fetchMessages}>
                      Apply Filters
                    </Button>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Messages Table */}
              <Paper withBorder>
                <LoadingOverlay visible={loading} />
                {messages.length === 0 && !loading ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="No messages found"
                    color="blue"
                  >
                    No messages match your current filters.
                  </Alert>
                ) : (
                  <DataTable columns={messageColumns} data={messages} loading={loading} />
                )}
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="notifications" pt="md">
              {/* Notifications Header */}
              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">
                  {notificationsList.length} notifications
                </Text>
                {stats && stats.unreadNotifications > 0 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconCheck size={14} />}
                    onClick={handleMarkAllNotificationsAsRead}
                  >
                    Mark All as Read
                  </Button>
                )}
              </Group>

              {/* Notifications Table */}
              <Paper withBorder>
                <LoadingOverlay visible={loading} />
                {notificationsList.length === 0 && !loading ? (
                  <Alert icon={<IconAlertCircle size={16} />} title="No notifications" color="blue">
                    You have no notifications.
                  </Alert>
                ) : (
                  <DataTable
                    columns={notificationColumns}
                    data={notificationsList}
                    loading={loading}
                  />
                )}
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>

      {/* Message Form Modal */}
      <MessageForm
        opened={messageFormOpened}
        onClose={closeMessageForm}
        onSubmit={handleSendMessage}
        users={users}
      />

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetails
          opened={detailsOpened}
          onClose={closeDetails}
          message={selectedMessage}
          onDelete={handleDeleteMessage}
          onReply={handleReplyMessage}
        />
      )}
    </Layout>
  );
}

export default CommunicationsPage;
