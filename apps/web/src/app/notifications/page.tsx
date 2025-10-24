'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type:
    | 'EMERGENCY'
    | 'APPOINTMENT'
    | 'LAB_RESULT'
    | 'PRESCRIPTION'
    | 'SYSTEM'
    | 'BILLING'
    | 'GENERAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isArchived: boolean;
  recipientId: string;
  recipientName: string;
  recipientRole: 'DOCTOR' | 'NURSE' | 'PATIENT' | 'ADMIN' | 'STAFF';
  senderId?: string;
  senderName?: string;
  relatedEntityType?: 'PATIENT' | 'APPOINTMENT' | 'LAB_ORDER' | 'PRESCRIPTION' | 'INVOICE';
  relatedEntityId?: string;
  channels: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[];
  scheduledTime?: string;
  deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const NotificationsPage = () => {
  const [currentTab, setCurrentTab] = useState<
    'inbox' | 'sent' | 'templates' | 'preferences' | 'analytics' | 'broadcast'
  >('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setNotifications(data.data);
          setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
        }
      } else {
        console.log('Failed to load notifications from API, using empty data');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      // Loading completed
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'ALL' || notification.priority === priorityFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'UNREAD' && !notification.isRead) ||
      (statusFilter === 'READ' && notification.isRead);

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      EMERGENCY: '#ef4444',
      APPOINTMENT: '#3b82f6',
      LAB_RESULT: '#8b5cf6',
      PRESCRIPTION: '#10b981',
      SYSTEM: '#f59e0b',
      BILLING: '#06b6d4',
      GENERAL: '#6b7280',
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      HIGH: '#ef4444',
      MEDIUM: '#f59e0b',
      LOW: '#10b981',
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      EMERGENCY: '🚨',
      APPOINTMENT: '📅',
      LAB_RESULT: '🧪',
      PRESCRIPTION: '💊',
      SYSTEM: '⚙️',
      BILLING: '💰',
      GENERAL: '📝',
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const NotificationModal = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Notification Details
          </h2>
          <button
            onClick={() => setShowNotificationModal(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {selectedNotification && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{getTypeIcon(selectedNotification.type)}</span>
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.25rem',
                  }}
                >
                  {selectedNotification.title}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getTypeColor(selectedNotification.type),
                    }}
                  >
                    {selectedNotification.type.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getPriorityColor(selectedNotification.priority),
                    }}
                  >
                    {selectedNotification.priority}
                  </span>
                  {selectedNotification.actionRequired && (
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#dc2626',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                      }}
                    >
                      ACTION REQUIRED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Message
              </h4>
              <p
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                {selectedNotification.message}
              </p>
            </div>

            {/* Details */}
            <div>
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Details
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: '600' }}>Recipient:</span>{' '}
                  {selectedNotification.recipientName}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Role:</span>{' '}
                  {selectedNotification.recipientRole}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Sent:</span>{' '}
                  {new Date(selectedNotification.timestamp).toLocaleString()}
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>Status:</span>{' '}
                  {selectedNotification.deliveryStatus}
                </div>
                {selectedNotification.senderName && (
                  <div>
                    <span style={{ fontWeight: '600' }}>From:</span>{' '}
                    {selectedNotification.senderName}
                  </div>
                )}
                {selectedNotification.expiresAt && (
                  <div>
                    <span style={{ fontWeight: '600' }}>Expires:</span>{' '}
                    {new Date(selectedNotification.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Channels */}
            <div>
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                Delivery Channels
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedNotification.channels.map((channel) => (
                  <span
                    key={channel}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e0f2fe',
                      color: '#0e7490',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              {selectedNotification.actionRequired && selectedNotification.actionUrl && (
                <Button variant="primary">Take Action</Button>
              )}
              <Button variant="outline">Mark as Read</Button>
              <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ComposeModal = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Compose Notification
          </h2>
          <button
            onClick={() => setShowComposeModal(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Input label="Title" placeholder="Notification title..." />

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Type
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white',
              }}
            >
              <option value="GENERAL">General</option>
              <option value="APPOINTMENT">Appointment</option>
              <option value="LAB_RESULT">Lab Result</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="SYSTEM">System</option>
              <option value="BILLING">Billing</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Priority
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white',
              }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <Input label="Recipients" placeholder="Enter user IDs or roles..." />

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Message
            </label>
            <textarea
              placeholder="Enter your message..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Delivery Channels
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['EMAIL', 'SMS', 'PUSH', 'IN_APP'].map((channel) => (
                <label
                  key={channel}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <input type="checkbox" defaultChecked />
                  <span>{channel}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <Button variant="outline" onClick={() => setShowComposeModal(false)}>
              Cancel
            </Button>
            <Button variant="secondary">Save Draft</Button>
            <Button variant="primary">Send Now</Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Notification Center
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage alerts, messages, and communication across the hospital system
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary" onClick={() => setShowComposeModal(true)}>
              ✉️ Compose
            </Button>
            <Button variant="outline">📊 Analytics</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '0.5rem' }}>📬</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {unreadCount}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Unread</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>🚨</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {notifications.filter((n) => n.priority === 'HIGH').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>High Priority</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#10b981', marginBottom: '0.5rem' }}>📤</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {notifications.filter((n) => n.deliveryStatus === 'DELIVERED').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Delivered</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                {notifications.filter((n) => n.actionRequired).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Action Required</div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'inbox', label: '📥 Inbox', desc: 'Received' },
              { key: 'sent', label: '📤 Sent', desc: 'Outgoing' },
              { key: 'templates', label: '📄 Templates', desc: 'Message Templates' },
              { key: 'preferences', label: '⚙️ Preferences', desc: 'User Settings' },
              { key: 'analytics', label: '📊 Analytics', desc: 'Performance' },
              { key: 'broadcast', label: '📢 Broadcast', desc: 'Mass Messaging' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setCurrentTab(
                    tab.key as
                      | 'inbox'
                      | 'sent'
                      | 'templates'
                      | 'preferences'
                      | 'analytics'
                      | 'broadcast'
                  )
                }
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: currentTab === tab.key ? '#667eea' : '#6b7280',
                  borderBottom:
                    currentTab === tab.key ? '2px solid #667eea' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>{tab.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inbox Tab */}
        {currentTab === 'inbox' && (
          <>
            {/* Search and Filters */}
            <Card style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minWidth: '150px',
                  }}
                >
                  <option value="ALL">All Types</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="APPOINTMENT">Appointment</option>
                  <option value="LAB_RESULT">Lab Result</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="SYSTEM">System</option>
                  <option value="BILLING">Billing</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minWidth: '120px',
                  }}
                >
                  <option value="ALL">All Priority</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    minWidth: '120px',
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="UNREAD">Unread</option>
                  <option value="READ">Read</option>
                </select>

                <Button variant="outline">🔄 Refresh</Button>
              </div>
            </Card>

            {/* Notifications List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: notification.isRead ? 'white' : '#fef3c7',
                    border:
                      notification.priority === 'HIGH' ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
                        {getTypeIcon(notification.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <h3
                            style={{
                              fontSize: '1rem',
                              fontWeight: notification.isRead ? '500' : '600',
                              color: '#1f2937',
                              margin: 0,
                            }}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#3b82f6',
                                borderRadius: '50%',
                              }}
                            />
                          )}
                          {notification.actionRequired && (
                            <span
                              style={{
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#dc2626',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                              }}
                            >
                              ACTION
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            margin: 0,
                            marginBottom: '0.5rem',
                            lineHeight: '1.4',
                          }}
                        >
                          {notification.message.length > 120
                            ? notification.message.substring(0, 120) + '...'
                            : notification.message}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {notification.senderName} •{' '}
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <span
                              style={{
                                padding: '0.125rem 0.375rem',
                                borderRadius: '4px',
                                fontSize: '0.625rem',
                                fontWeight: '600',
                                color: 'white',
                                backgroundColor: getTypeColor(notification.type),
                              }}
                            >
                              {notification.type.replace('_', ' ')}
                            </span>
                            <span
                              style={{
                                padding: '0.125rem 0.375rem',
                                borderRadius: '4px',
                                fontSize: '0.625rem',
                                fontWeight: '600',
                                color: 'white',
                                backgroundColor: getPriorityColor(notification.priority),
                              }}
                            >
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowNotificationModal(true);
                        }}
                      >
                        View
                      </Button>
                      {notification.actionRequired && (
                        <Button size="sm" variant="primary">
                          Action
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {currentTab === 'templates' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[].map(
              /* TODO: API */ (template) => (
                <Card key={template.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0,
                          }}
                        >
                          {template.name}
                        </h3>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white',
                            backgroundColor: getTypeColor(template.type),
                          }}
                        >
                          {template.type.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: template.isActive ? '#166534' : '#dc2626',
                            backgroundColor: template.isActive ? '#f0fdf4' : '#fef2f2',
                          }}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <div
                          style={{
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: '#374151',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Subject: {template.subject}
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                          {template.content}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {template.channels.map((channel) => (
                          <span
                            key={channel}
                            style={{
                              padding: '0.125rem 0.5rem',
                              backgroundColor: '#e0f2fe',
                              color: '#0e7490',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                            }}
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        )}

        {/* Other tabs placeholder */}
        {['sent', 'preferences', 'analytics', 'broadcast'].includes(currentTab) && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {currentTab === 'sent' && '📤'}
                {currentTab === 'preferences' && '⚙️'}
                {currentTab === 'analytics' && '📊'}
                {currentTab === 'broadcast' && '📢'}
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                {currentTab === 'sent' && 'Sent Notifications'}
                {currentTab === 'preferences' && 'Notification Preferences'}
                {currentTab === 'analytics' && 'Notification Analytics'}
                {currentTab === 'broadcast' && 'Broadcast Messaging'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {currentTab === 'sent' &&
                  'View and manage outgoing notifications and delivery status.'}
                {currentTab === 'preferences' &&
                  'Configure personal notification settings and preferences.'}
                {currentTab === 'analytics' &&
                  'Analyze notification performance, engagement, and delivery metrics.'}
                {currentTab === 'broadcast' &&
                  'Send mass notifications to groups of users or departments.'}
              </p>
              <Button variant="primary">
                {currentTab === 'sent' && '📤 View Sent Items'}
                {currentTab === 'preferences' && '⚙️ Configure Settings'}
                {currentTab === 'analytics' && '📊 View Analytics'}
                {currentTab === 'broadcast' && '📢 Create Broadcast'}
              </Button>
            </div>
          </Card>
        )}

        {/* Modals */}
        {showNotificationModal && <NotificationModal />}
        {showComposeModal && <ComposeModal />}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
