'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Modal,
  Text,
  Badge,
  Loader,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Layout from '../../components/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconEye,
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconUserX,
  IconShield,
  IconHistory,
  IconUser,
  IconDatabase,
  IconCopy,
  IconDotsVertical,
  IconBriefcase,
  IconFileExport,
} from '@tabler/icons-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  licenseNumber?: string;
  specialization?: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModal, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(25);

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const roles = [
    'ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'NURSE',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'RADIOLOGIST',
    'RECEPTIONIST',
    'ACCOUNTANT',
    'INVENTORY_MANAGER',
    'SECURITY',
  ];

  const departments = [
    'Emergency',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'Administration',
    'Finance',
    'IT',
    'Maintenance',
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'PENDING', label: 'Pending' },
  ];

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      if (departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE_URL}/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        console.error('Failed to load users');
        notifications.show({
          title: 'Error',
          message: 'Failed to load users',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load users',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, departmentFilter, statusFilter, itemsPerPage]);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers]);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `User status updated to ${newStatus}`,
          color: 'green',
        });
        loadUsers();
        loadStats();
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to update user status',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update user status',
        color: 'red',
      });
    }
  };

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `users-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    return users.filter(user =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'gray';
      case 'SUSPENDED': return 'red';
      case 'PENDING': return 'yellow';
      default: return 'gray';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DOCTOR': return <IconUser size={16} />;
      case 'NURSE': return <IconUser size={16} />;
      case 'ADMIN': return <IconShield size={16} />;
      case 'LAB_TECHNICIAN': return <IconDatabase size={16} />;
      case 'PHARMACIST': return <IconBriefcase size={16} />;
      default: return <IconUser size={16} />;
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
              <IconUsers size={28} />
              User Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage hospital staff, roles, permissions, and access control
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" onClick={exportUsers}>
              <IconFileExport size={16} style={{ marginRight: '0.5rem' }} />
              Export
            </Button>
            <Button variant="primary">
              <IconUserPlus size={16} style={{ marginRight: '0.5rem' }} />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg" mb="xl">
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Users</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.activeUsers}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {stats.pendingUsers}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {stats.suspendedUsers}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Suspended</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {Object.keys(stats.byRole).length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Role Types</div>
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
              <Input
                placeholder="Search users..."
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
                  Filter by role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
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
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
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
                  Filter by department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
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
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
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
                  Filter by status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <option value="all">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div style={{ padding: '1.5rem' }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}>
                <Loader size="lg" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <IconUsers size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <div>No users found</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Try adjusting your filters or add new users to get started
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Department</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Login</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredUsers.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: '600',
                            }}>
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                {user.firstName} {user.lastName}
                              </div>
                              {user.specialization && (
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  {user.specialization}
                                </div>
                              )}
                            </div>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {user.email}
                            </div>
                            {user.phone && (
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getRoleIcon(user.role)}
                            <Badge color="blue" variant="light">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{user.department || 'Not assigned'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(user.status)} variant="light">
                            {user.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </Text>
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
                              minWidth: '200px'
                            }}>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
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
                              <button
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
                                <IconEdit size={16} />
                                Edit User
                              </button>
                              {user.status === 'ACTIVE' && (
                                <button
                                  onClick={() => toggleUserStatus(user.id, 'SUSPENDED')}
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
                                    fontSize: '0.875rem',
                                    color: '#dc2626'
                                  }}
                                >
                                  <IconUserX size={16} />
                                  Suspend
                                </button>
                              )}
                              {user.status === 'SUSPENDED' && (
                                <button
                                  onClick={() => toggleUserStatus(user.id, 'ACTIVE')}
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
                                    fontSize: '0.875rem',
                                    color: '#10b981'
                                  }}
                                >
                                  <IconUserCheck size={16} />
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(user, null, 2));
                                  notifications.show({
                                    title: 'Copied',
                                    message: 'User data copied to clipboard',
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
                                Copy User
                              </button>
                            </div>
                          </div>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '2rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: `1px solid ${page === currentPage ? '#667eea' : '#d1d5db'}`,
                            borderRadius: '0.375rem',
                            background: page === currentPage ? '#667eea' : 'white',
                            color: page === currentPage ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Detail Modal */}
        {selectedUser && (
          <Modal
            opened={detailModal}
            onClose={closeDetail}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IconUsers size={20} />
                User Details
              </div>
            }
            size="lg"
          >
            <div style={{ padding: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: '600',
                    margin: '0 auto 1rem',
                  }}>
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <Badge color={getStatusColor(selectedUser.status)} variant="light">
                    {selectedUser.status}
                  </Badge>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                      Email
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {selectedUser.email}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getRoleIcon(selectedUser.role)}
                      <Badge color="blue" variant="light">
                        {selectedUser.role.replace('_', ' ')}
                      </Badge>
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
                      Department
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {selectedUser.department || 'Not assigned'}
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
                      Phone
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {selectedUser.phone || 'Not provided'}
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
                      Date of Birth
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'Not provided'}
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
                      Hire Date
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {selectedUser.hireDate ? new Date(selectedUser.hireDate).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>

                  {selectedUser.licenseNumber && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        License Number
                      </label>
                      <div style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {selectedUser.licenseNumber}
                      </div>
                    </div>
                  )}

                  {selectedUser.specialization && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        Specialization
                      </label>
                      <div style={{ fontSize: '0.875rem' }}>
                        {selectedUser.specialization}
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      Last Login
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
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
                      Account Created
                    </label>
                    <div style={{ fontSize: '0.875rem' }}>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <Button variant="outline">
                  <IconEdit size={16} style={{ marginRight: '0.5rem' }} />
                  Edit User
                </Button>
                <Button variant="outline">
                  <IconHistory size={16} style={{ marginRight: '0.5rem' }} />
                  View Activity
                </Button>
                <Button variant="outline">
                  <IconShield size={16} style={{ marginRight: '0.5rem' }} />
                  Reset Password
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default UserManagementPage;
