'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Text,
  Badge,
  SimpleGrid,
  Pagination,
  Button,
  Card,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Layout from '../../components/Layout';
import { notifications } from '@mantine/notifications';
import {
  IconEye,
  IconCalendar,
  IconUsers,
  IconCheck,
  IconDotsVertical,
  IconClipboardList,
  IconFileText,
  IconCalculator,
  IconRefresh,
  IconShield,
  IconAlertTriangle,
  IconHistory,
  IconUser,
  IconDatabase,
  IconFileExport,
  IconCopy,
} from '@tabler/icons-react';

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  tenantId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  location?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  isSensitive?: boolean;
  isSuspicious?: boolean;
  requiresReview?: boolean;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

interface AuditStatistics {
  totalLogs: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  suspiciousCount: number;
  sensitiveAccessCount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const AuditPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModal, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(25);

  // Filter states
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const [showOnlySensitive, setShowOnlySensitive] = useState(false);
  const [showOnlyRequiresReview, setShowOnlyRequiresReview] = useState(false);

  const actions = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'READ',
    'LOGIN',
    'LOGIN_FAILED',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'PERMISSION_CHANGE',
    'ROLE_CHANGE',
  ];

  const entityTypes = [
    'USER',
    'PATIENT',
    'APPOINTMENT',
    'BILLING',
    'MEDICAL_RECORD',
    'PRESCRIPTION',
    'LAB_RESULT',
    'INVENTORY',
    'FINANCE',
    'INSURANCE',
    'STAFF',
    'DEPARTMENT',
    'BED',
    'EQUIPMENT',
    'SUPPLIES',
    'SYSTEM',
  ];

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (actionFilter !== 'all') {
        params.append('action', actionFilter);
      }

      if (entityTypeFilter !== 'all') {
        params.append('entityType', entityTypeFilter);
      }

      if (userFilter) {
        params.append('userId', userFilter);
      }

      if (dateRange[0]) {
        params.append('startDate', dateRange[0].toISOString());
      }

      if (dateRange[1]) {
        params.append('endDate', dateRange[1].toISOString());
      }

      if (showOnlySuspicious) {
        params.append('isSuspicious', 'true');
      }

      if (showOnlySensitive) {
        params.append('isSensitive', 'true');
      }

      if (showOnlyRequiresReview) {
        params.append('requiresReview', 'true');
      }

      const response = await fetch(`${API_BASE_URL}/audit/logs?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to load audit logs');
        notifications.show({
          title: 'Error',
          message: 'Failed to load audit logs',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load audit logs',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, entityTypeFilter, userFilter, dateRange, showOnlySuspicious, showOnlySensitive, showOnlyRequiresReview, itemsPerPage]);

  const loadStatistics = useCallback(async () => {
    try {
      const startDate = dateRange[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const endDate = dateRange[1] || new Date();

      const response = await fetch(`${API_BASE_URL}/audit/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'default', // You might want to get this from context
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAuditLogs();
    loadStatistics();
  }, [loadAuditLogs, loadStatistics]);

  const markAsReviewed = async (logId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit/logs/${logId}/reviewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy: 'current-user', // You might want to get this from context
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Audit log marked as reviewed',
          color: 'green',
        });
        loadAuditLogs();
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to mark as reviewed',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to mark as reviewed',
        color: 'red',
      });
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return auditLogs;

    return auditLogs.filter(log =>
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [auditLogs, searchTerm]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'LOGIN': return 'teal';
      case 'LOGIN_FAILED': return 'orange';
      case 'READ': return 'gray';
      default: return 'gray';
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'USER': return <IconUser size={16} />;
      case 'PATIENT': return <IconUsers size={16} />;
      case 'APPOINTMENT': return <IconCalendar size={16} />;
      case 'BILLING': return <IconCalculator size={16} />;
      case 'MEDICAL_RECORD': return <IconFileText size={16} />;
      default: return <IconDatabase size={16} />;
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <IconHistory size={28} />
              Audit Logs
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Monitor and track all system activities, user actions, and security events
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" onClick={exportLogs} leftSection={<IconFileExport size={16} />}>
              Export
            </Button>
            <Button variant="outline" leftSection={<IconRefresh size={16} />} onClick={loadAuditLogs}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {statistics.totalLogs.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Logs</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {statistics.suspiciousCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Suspicious</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {statistics.sensitiveAccessCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sensitive Access</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {Object.keys(statistics.byAction).length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Action Types</div>
              </div>
            </Card>
          </SimpleGrid>
        )}

        {/* Filters */}
        <Card style={{ marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <TextInput
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Filter by action
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                  }}
                >
                  <option value="all">All Actions</option>
                  {actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Filter by entity type
                </label>
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                  }}
                >
                  <option value="all">All Entity Types</option>
                  {entityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <TextInput
                placeholder="Filter by user"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Date Range
                </label>
                <input
                  type="date"
                  value={dateRange[0]?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setDateRange([date, dateRange[1]]);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={showOnlySuspicious}
                    onChange={(e) => setShowOnlySuspicious(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>Only Suspicious</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={showOnlySensitive}
                    onChange={(e) => setShowOnlySensitive(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>Only Sensitive</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={showOnlyRequiresReview}
                    onChange={(e) => setShowOnlyRequiresReview(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>Requires Review</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <div style={{ padding: '1.5rem' }}>
            {loading ? (
              <div style={{
                color: '#6b7280'
              }}>
                <IconClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <div>No audit logs found</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Try adjusting your filters or check back later for new activity
                </div>
              </div>
            ) : (
              <>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Timestamp</Table.Th>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Action</Table.Th>
                      <Table.Th>Entity</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>IP Address</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredLogs.map((log) => (
                      <Table.Tr key={log.id}>
                        <Table.Td>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {new Date(log.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {log.userEmail}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {log.userRole}
                            </div>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getActionColor(log.action)} variant="light">
                            {log.action}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getEntityTypeIcon(log.entityType)}
                            <span>{log.entityType}</span>
                            {log.entityId && (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                #{log.entityId.slice(-8)}
                              </span>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2}>
                            {log.description}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" style={{ fontFamily: 'monospace' }}>
                            {log.ipAddress}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {log.isSuspicious && (
                              <span style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <IconAlertTriangle size={12} />
                                Suspicious
                              </span>
                            )}
                            {log.isSensitive && (
                              <span style={{
                                backgroundColor: '#fed7aa',
                                color: '#9a3412',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <IconShield size={12} />
                                Sensitive
                              </span>
                            )}
                            {log.requiresReview && (
                              <span style={{
                                backgroundColor: '#dbeafe',
                                color: '#1d4ed8',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <IconEye size={12} />
                                Review
                              </span>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.25rem',
                              }}
                            >
                              <IconDotsVertical size={16} />
                            </button>
                            <div style={{
                              display: 'none',
                              position: 'absolute',
                              right: '0',
                              top: '100%',
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              zIndex: 10,
                              minWidth: '150px'
                            }}>
                              <button
                                onClick={() => {
                                  setSelectedLog(log);
                                  openDetail();
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem 1rem',
                                  border: 'none',
                                  background: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <IconEye size={16} />
                                View Details
                              </button>
                              {log.requiresReview && (
                                <button
                                  onClick={() => markAsReviewed(log.id)}
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: 'none',
                                    background: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  <IconCheck size={16} />
                                  Mark Reviewed
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                  notifications.show({
                                    title: 'Copied',
                                    message: 'Log data copied to clipboard',
                                    color: 'green',
                                  });
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem 1rem',
                                  border: 'none',
                                  background: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <IconCopy size={16} />
                                Copy Log
                              </button>
                            </div>
                          </div>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '2rem'
                  }}>
                    <Pagination
                      total={totalPages}
                      value={currentPage}
                      onChange={setCurrentPage}
                      size="md"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Detail Modal */}
        {detailModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <IconClipboardList size={20} />
                  Audit Log Details
                </h2>
                <button
                  onClick={closeDetail}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              {selectedLog && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Log ID
                      </label>
                      <div style={{
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        backgroundColor: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        {selectedLog.id}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Timestamp
                      </label>
                      <div style={{ fontSize: '0.875rem' }}>
                        {new Date(selectedLog.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        User
                      </label>
                      <div style={{ fontSize: '0.875rem' }}>
                        {selectedLog.userEmail}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Role
                      </label>
                      <div style={{ fontSize: '0.875rem' }}>
                        {selectedLog.userRole}
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Action
                      </label>
                      <span style={{
                        backgroundColor: getActionColor(selectedLog.action) === 'green' ? '#dcfce7' :
                                       getActionColor(selectedLog.action) === 'blue' ? '#dbeafe' :
                                       getActionColor(selectedLog.action) === 'red' ? '#fee2e2' :
                                       getActionColor(selectedLog.action) === 'teal' ? '#d1fae5' :
                                       getActionColor(selectedLog.action) === 'orange' ? '#fed7aa' : '#f3f4f6',
                        color: getActionColor(selectedLog.action) === 'green' ? '#166534' :
                               getActionColor(selectedLog.action) === 'blue' ? '#1d4ed8' :
                               getActionColor(selectedLog.action) === 'red' ? '#dc2626' :
                               getActionColor(selectedLog.action) === 'teal' ? '#0d9488' :
                               getActionColor(selectedLog.action) === 'orange' ? '#9a3412' : '#374151',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {selectedLog.action}
                      </span>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Entity Type
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getEntityTypeIcon(selectedLog.entityType)}
                        <span style={{ fontSize: '0.875rem' }}>
                          {selectedLog.entityType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedLog.entityId && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Entity ID
                      </label>
                      <div style={{
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        backgroundColor: '#f9fafb',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        {selectedLog.entityId}
                      </div>
                    </div>
                  )}

                  {selectedLog.description && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Description
                      </label>
                      <div style={{ fontSize: '0.875rem' }}>
                        {selectedLog.description}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                  }}>
                    {selectedLog.ipAddress && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          IP Address
                        </label>
                        <div style={{
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          backgroundColor: '#f9fafb',
                          padding: '0.5rem',
                          borderRadius: '0.25rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          {selectedLog.ipAddress}
                        </div>
                      </div>
                    )}
                    {selectedLog.endpoint && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          Endpoint
                        </label>
                        <div style={{
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          backgroundColor: '#f9fafb',
                          padding: '0.5rem',
                          borderRadius: '0.25rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          {selectedLog.endpoint}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedLog.oldValues && Object.keys(selectedLog.oldValues).length > 0 && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.5rem'
                      }}>
                        Previous Values
                      </label>
                      <textarea
                        value={JSON.stringify(selectedLog.oldValues, null, 2)}
                        readOnly
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          backgroundColor: '#f9fafb',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  )}

                  {selectedLog.newValues && Object.keys(selectedLog.newValues).length > 0 && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.5rem'
                      }}>
                        New Values
                      </label>
                      <textarea
                        value={JSON.stringify(selectedLog.newValues, null, 2)}
                        readOnly
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          backgroundColor: '#f9fafb',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  )}

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.5rem'
                      }}>
                        Metadata
                      </label>
                      <textarea
                        value={JSON.stringify(selectedLog.metadata, null, 2)}
                        readOnly
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          backgroundColor: '#f9fafb',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditPage;
