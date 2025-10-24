'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState } from 'react';

interface StaffMember {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role:
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'DOCTOR'
    | 'NURSE'
    | 'LAB_TECHNICIAN'
    | 'RADIOLOGIST'
    | 'PHARMACIST'
    | 'RECEPTIONIST'
    | 'ACCOUNTANT';
  department: string;
  designation: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  isActive: boolean;
  specialization?: string;
  licenseNumber?: string;
  shift: 'morning' | 'evening' | 'night' | 'rotating';
  salary: number;
  performanceRating: number;
  lastLoginAt?: string;
}

const StaffPage = () => {
  const [currentTab, setCurrentTab] = useState<'directory' | 'schedule' | 'performance'>(
    'directory'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [staff] = useState<StaffMember[]>([
    {
      id: '1',
      userId: 'u1',
      employeeId: 'EMP001',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@hospital.com',
      phone: '+91-9876543210',
      role: 'DOCTOR',
      department: 'Cardiology',
      designation: 'Senior Cardiologist',
      qualification: 'MD Cardiology, MBBS',
      experience: '8 years',
      joiningDate: '2020-01-15',
      isActive: true,
      specialization: 'Interventional Cardiology',
      licenseNumber: 'MED12345',
      shift: 'morning',
      salary: 150000,
      performanceRating: 4.8,
      lastLoginAt: '2024-12-05T08:30:00',
    },
    {
      id: '2',
      userId: 'u2',
      employeeId: 'EMP002',
      firstName: 'Nurse',
      lastName: 'Jennifer',
      email: 'jennifer@hospital.com',
      phone: '+91-9876543211',
      role: 'NURSE',
      department: 'Emergency',
      designation: 'Head Nurse',
      qualification: 'BSc Nursing',
      experience: '5 years',
      joiningDate: '2021-03-10',
      isActive: true,
      shift: 'night',
      salary: 45000,
      performanceRating: 4.6,
      lastLoginAt: '2024-12-04T20:15:00',
    },
    {
      id: '3',
      userId: 'u3',
      employeeId: 'EMP003',
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      email: 'michael.chen@hospital.com',
      phone: '+91-9876543212',
      role: 'DOCTOR',
      department: 'Pediatrics',
      designation: 'Pediatric Specialist',
      qualification: 'MD Pediatrics, MBBS',
      experience: '6 years',
      joiningDate: '2019-08-22',
      isActive: true,
      specialization: 'Child Development',
      licenseNumber: 'MED12346',
      shift: 'evening',
      salary: 120000,
      performanceRating: 4.7,
      lastLoginAt: '2024-12-05T14:20:00',
    },
    {
      id: '4',
      userId: 'u4',
      employeeId: 'EMP004',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@hospital.com',
      phone: '+91-9876543213',
      role: 'LAB_TECHNICIAN',
      department: 'Laboratory',
      designation: 'Senior Lab Technician',
      qualification: 'BSc Medical Laboratory Technology',
      experience: '4 years',
      joiningDate: '2022-02-14',
      isActive: true,
      shift: 'morning',
      salary: 35000,
      performanceRating: 4.5,
      lastLoginAt: '2024-12-05T07:45:00',
    },
    {
      id: '5',
      userId: 'u5',
      employeeId: 'EMP005',
      firstName: 'Lisa',
      lastName: 'Rodriguez',
      email: 'lisa.rodriguez@hospital.com',
      phone: '+91-9876543214',
      role: 'PHARMACIST',
      department: 'Pharmacy',
      designation: 'Chief Pharmacist',
      qualification: 'PharmD',
      experience: '7 years',
      joiningDate: '2018-11-05',
      isActive: false,
      shift: 'rotating',
      salary: 80000,
      performanceRating: 4.9,
      lastLoginAt: '2024-11-30T16:00:00',
    },
  ]);

  const departments = [
    'Cardiology',
    'Emergency',
    'Pediatrics',
    'Laboratory',
    'Pharmacy',
    'Radiology',
    'Orthopedics',
  ];
  const roles = [
    'DOCTOR',
    'NURSE',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'RADIOLOGIST',
    'RECEPTIONIST',
    'ADMIN',
  ];

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return '#8b5cf6';
      case 'NURSE':
        return '#10b981';
      case 'LAB_TECHNICIAN':
        return '#3b82f6';
      case 'PHARMACIST':
        return '#f59e0b';
      case 'RADIOLOGIST':
        return '#ef4444';
      case 'ADMIN':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning':
        return '#10b981';
      case 'evening':
        return '#f59e0b';
      case 'night':
        return '#8b5cf6';
      case 'rotating':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return '#10b981';
    if (rating >= 4.0) return '#f59e0b';
    if (rating >= 3.5) return '#ef4444';
    return '#dc2626';
  };

  const StaffCard = ({ member }: { member: StaffMember }) => (
    <Card variant="elevated" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `${getRoleColor(member.role)}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.5rem',
                border: `2px solid ${getRoleColor(member.role)}30`,
              }}
            >
              {member.role === 'DOCTOR'
                ? '👨‍⚕️'
                : member.role === 'NURSE'
                  ? '👩‍⚕️'
                  : member.role === 'LAB_TECHNICIAN'
                    ? '🔬'
                    : member.role === 'PHARMACIST'
                      ? '💊'
                      : member.role === 'RADIOLOGIST'
                        ? '🩻'
                        : '👤'}
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {member.firstName} {member.lastName}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: `${getRoleColor(member.role)}15`,
                    color: getRoleColor(member.role),
                  }}
                >
                  {member.role.replace('_', ' ')}
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: member.isActive ? '#dcfce7' : '#fee2e2',
                    color: member.isActive ? '#166534' : '#991b1b',
                  }}
                >
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: `${getShiftColor(member.shift)}15`,
                    color: getShiftColor(member.shift),
                  }}
                >
                  {member.shift} shift
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Employee ID:</strong> {member.employeeId}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Department:</strong> {member.department}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Designation:</strong> {member.designation}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Email:</strong> {member.email}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Phone:</strong> {member.phone}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Experience:</strong> {member.experience}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Qualification:</strong> {member.qualification}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Joining Date:</strong> {new Date(member.joiningDate).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Salary:</strong> ₹{member.salary.toLocaleString()}/month
              </p>
            </div>
          </div>

          {/* Performance Rating */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                Performance Rating
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: getPerformanceColor(member.performanceRating),
                }}
              >
                {member.performanceRating}/5.0
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '0.5rem',
              }}
            >
              <div
                style={{
                  width: `${(member.performanceRating / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: getPerformanceColor(member.performanceRating),
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = `/staff/${member.id}`)}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => (window.location.href = `/staff/${member.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => (window.location.href = `/staff/${member.id}/schedule`)}
          >
            Schedule
          </Button>
        </div>
      </div>
    </Card>
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
              Staff Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage hospital staff, roles, schedules, and performance tracking
            </p>
          </div>
          <Button onClick={() => (window.location.href = '/staff/new')}>
            + Add New Staff Member
          </Button>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'directory', label: '👥 Staff Directory', count: staff.length },
              { key: 'schedule', label: '📅 Schedule Management', count: null },
              { key: 'performance', label: '📊 Performance Tracking', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'directory' | 'schedule' | 'performance')}
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
                {tab.label}
                {tab.count && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: currentTab === tab.key ? '#667eea' : '#e5e7eb',
                      color: currentTab === tab.key ? 'white' : '#6b7280',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentTab === 'directory' && (
          <>
            {/* Filters and Search */}
            <Card style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  alignItems: 'end',
                }}
              >
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="🔍"
                  label="Search"
                />

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
                    Role Filter
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
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
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ')}
                      </option>
                    ))}
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
                    Department Filter
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
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
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
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
                    Status Filter
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <Card variant="bordered">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {staff.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Staff</div>
                </div>
              </Card>

              <Card variant="bordered">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {staff.filter((s) => s.isActive).length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active</div>
                </div>
              </Card>

              <Card variant="bordered">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {staff.filter((s) => s.role === 'DOCTOR').length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Doctors</div>
                </div>
              </Card>

              <Card variant="bordered">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {Math.round(
                      (staff.reduce((acc, s) => acc + s.performanceRating, 0) / staff.length) * 10
                    ) / 10}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Avg Rating</div>
                </div>
              </Card>
            </div>

            {/* Staff List */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                  Staff Members ({filteredStaff.length})
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" size="sm">
                    Export
                  </Button>
                  <Button variant="secondary" size="sm">
                    Print Directory
                  </Button>
                </div>
              </div>

              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => <StaffCard key={member.id} member={member} />)
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      No staff members found
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      No staff members match your current search criteria.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterRole('all');
                        setFilterDepartment('all');
                        setFilterStatus('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {currentTab === 'schedule' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}
              >
                Schedule Management
              </h3>
              <p
                style={{
                  color: '#6b7280',
                  marginBottom: '2rem',
                  maxWidth: '500px',
                  margin: '0 auto 2rem auto',
                }}
              >
                Manage staff schedules, shifts, and work assignments. Create weekly schedules,
                handle shift swaps, and track attendance.
              </p>
              <Button>Create Weekly Schedule</Button>
            </div>
          </Card>
        )}

        {currentTab === 'performance' && (
          <div>
            <Card title="Performance Overview" style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '2rem',
                }}
              >
                {staff
                  .filter((s) => s.isActive)
                  .map((member) => (
                    <div key={member.id} style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: `${getRoleColor(member.role)}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto',
                            fontSize: '1.8rem',
                          }}
                        >
                          {member.role === 'DOCTOR'
                            ? '👨‍⚕️'
                            : member.role === 'NURSE'
                              ? '👩‍⚕️'
                              : member.role === 'LAB_TECHNICIAN'
                                ? '🔬'
                                : member.role === 'PHARMACIST'
                                  ? '💊'
                                  : '👤'}
                        </div>
                        <h4
                          style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '600' }}
                        >
                          {member.firstName} {member.lastName}
                        </h4>
                        <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                          {member.designation}
                        </p>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div
                          style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: getPerformanceColor(member.performanceRating),
                            marginBottom: '0.25rem',
                          }}
                        >
                          {member.performanceRating}
                        </div>
                        <div
                          style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}
                        >
                          Performance Rating
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${(member.performanceRating / 5) * 100}%`,
                              height: '100%',
                              backgroundColor: getPerformanceColor(member.performanceRating),
                              borderRadius: '2px',
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => (window.location.href = `/staff/${member.id}/performance`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffPage;
