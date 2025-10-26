'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  LoadingOverlay,
  Alert,
  MultiSelect,
  Checkbox,
  PasswordInput,
  Switch,
  Tabs,
  Badge,
  Text,
  Divider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconUser, IconAlertCircle, IconLock, IconShield } from '@tabler/icons-react';

interface UserManagementFormProps {
  opened: boolean;
  onClose: () => void;
  user?: any;
  onSuccess: () => void;
}

const UserManagementForm: React.FC<UserManagementFormProps> = ({
  opened,
  onClose,
  user,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    
    // Role & Permissions
    role: '',
    permissions: [] as string[],
    department: '',
    designation: '',
    employeeId: '',
    
    // Account Settings
    isActive: true,
    emailVerified: false,
    twoFactorEnabled: false,
    mustChangePassword: false,
    passwordExpiryDays: 90,
    
    // Personal Information
    dateOfBirth: new Date(),
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Professional Information
    specialization: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    licenseExpiry: new Date(),
    joinDate: new Date(),
    
    // Access Control
    accessLevel: 'basic',
    allowedModules: [] as string[],
    restrictedActions: [] as string[],
    ipRestriction: '',
    accessHours: {
      enabled: false,
      startTime: '',
      endTime: '',
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchRoles();
      fetchDepartments();
      
      if (user) {
        // Edit mode - populate form with existing data
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          username: user.username || '',
          password: '',
          confirmPassword: '',
          role: user.role || '',
          permissions: user.permissions || [],
          department: user.department || '',
          designation: user.designation || '',
          employeeId: user.employeeId || '',
          isActive: user.isActive !== false,
          emailVerified: user.emailVerified || false,
          twoFactorEnabled: user.twoFactorEnabled || false,
          mustChangePassword: user.mustChangePassword || false,
          passwordExpiryDays: user.passwordExpiryDays || 90,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
          gender: user.gender || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          country: user.country || '',
          emergencyContact: user.emergencyContact || '',
          emergencyPhone: user.emergencyPhone || '',
          specialization: user.specialization || '',
          qualification: user.qualification || '',
          experience: user.experience || '',
          licenseNumber: user.licenseNumber || '',
          licenseExpiry: user.licenseExpiry ? new Date(user.licenseExpiry) : new Date(),
          joinDate: user.joinDate ? new Date(user.joinDate) : new Date(),
          accessLevel: user.accessLevel || 'basic',
          allowedModules: user.allowedModules || [],
          restrictedActions: user.restrictedActions || [],
          ipRestriction: user.ipRestriction || '',
          accessHours: user.accessHours || { enabled: false, startTime: '', endTime: '' },
        });
      } else {
        resetForm();
      }
    }
  }, [opened, user]);

  const fetchRoles = async () => {
    // Mock roles - would fetch from API
    const rolesList = [
      { value: 'ADMIN', label: 'Administrator' },
      { value: 'DOCTOR', label: 'Doctor' },
      { value: 'NURSE', label: 'Nurse' },
      { value: 'RECEPTIONIST', label: 'Receptionist' },
      { value: 'PHARMACIST', label: 'Pharmacist' },
      { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
      { value: 'ACCOUNTANT', label: 'Accountant' },
      { value: 'PATIENT', label: 'Patient' },
      { value: 'STAFF', label: 'Staff' },
    ];
    setRoles(rolesList);
  };

  const fetchDepartments = async () => {
    // Mock departments - would fetch from API
    const deptList = [
      { value: 'emergency', label: 'Emergency' },
      { value: 'cardiology', label: 'Cardiology' },
      { value: 'neurology', label: 'Neurology' },
      { value: 'pediatrics', label: 'Pediatrics' },
      { value: 'orthopedics', label: 'Orthopedics' },
      { value: 'radiology', label: 'Radiology' },
      { value: 'laboratory', label: 'Laboratory' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'administration', label: 'Administration' },
    ];
    setDepartments(deptList);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      permissions: [],
      department: '',
      designation: '',
      employeeId: '',
      isActive: true,
      emailVerified: false,
      twoFactorEnabled: false,
      mustChangePassword: false,
      passwordExpiryDays: 90,
      dateOfBirth: new Date(),
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      emergencyContact: '',
      emergencyPhone: '',
      specialization: '',
      qualification: '',
      experience: '',
      licenseNumber: '',
      licenseExpiry: new Date(),
      joinDate: new Date(),
      accessLevel: 'basic',
      allowedModules: [],
      restrictedActions: [],
      ipRestriction: '',
      accessHours: { enabled: false, startTime: '', endTime: '' },
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.role) errors.role = 'Role is required';
    
    // Password validation for new users
    if (!user) {
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Phone validation
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    // License validation for medical staff
    if (['DOCTOR', 'NURSE', 'PHARMACIST'].includes(formData.role)) {
      if (!formData.licenseNumber) errors.licenseNumber = 'License number is required for medical staff';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields correctly',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString(),
        licenseExpiry: formData.licenseExpiry.toISOString(),
        joinDate: formData.joinDate.toISOString(),
      };

      // Remove password fields if not changed
      if (user && !formData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }

      let response;
      if (user) {
        // Update existing user - would call API
        response = { success: true };
      } else {
        // Create new user - would call API
        response = { success: true };
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: user ? 'User updated successfully' : 'User created successfully',
          color: 'green',
          icon: <IconUser />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting user form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save user',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const permissionOptions = [
    { value: 'create', label: 'Create Records' },
    { value: 'read', label: 'Read Records' },
    { value: 'update', label: 'Update Records' },
    { value: 'delete', label: 'Delete Records' },
    { value: 'approve', label: 'Approve Actions' },
    { value: 'export', label: 'Export Data' },
    { value: 'import', label: 'Import Data' },
    { value: 'manage_users', label: 'Manage Users' },
    { value: 'manage_roles', label: 'Manage Roles' },
    { value: 'view_reports', label: 'View Reports' },
    { value: 'manage_settings', label: 'Manage Settings' },
    { value: 'access_audit', label: 'Access Audit Logs' },
  ];

  const moduleOptions = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'patients', label: 'Patients' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'opd', label: 'OPD' },
    { value: 'ipd', label: 'IPD' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'billing', label: 'Billing' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'HR Management' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'reports', label: 'Reports' },
    { value: 'settings', label: 'Settings' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={user ? 'Edit User' : 'Create New User'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconUser size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="permissions" leftSection={<IconShield size={16} />}>
              Permissions
            </Tabs.Tab>
            <Tabs.Tab value="professional">
              Professional
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic">
            <Stack gap="md" mt="md">
              <Alert icon={<IconUser size={20} />} color="blue" variant="light">
                Enter user basic information and account details.
              </Alert>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="First Name"
                    placeholder="Enter first name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    error={formErrors.firstName}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Last Name"
                    placeholder="Enter last name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    error={formErrors.lastName}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Email"
                    placeholder="Enter email address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={formErrors.email}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={formErrors.phone}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Username"
                    placeholder="Enter username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={formErrors.username}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Employee ID"
                    placeholder="Enter employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="Role"
                    placeholder="Select role"
                    required
                    data={roles}
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value || '' })}
                    error={formErrors.role}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="Department"
                    placeholder="Select department"
                    data={departments}
                    value={formData.department}
                    onChange={(value) => setFormData({ ...formData, department: value || '' })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="Designation"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <DatePickerInput
                    label="Date of Birth"
                    placeholder="Select date"
                    value={formData.dateOfBirth}
                    onChange={(value) => {
                      const dateValue = value ? new Date(value) : new Date();
                      setFormData({ ...formData, dateOfBirth: dateValue });
                    }}
                    maxDate={new Date()}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    data={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={formData.gender}
                    onChange={(value) => setFormData({ ...formData, gender: value || '' })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <DatePickerInput
                    label="Join Date"
                    placeholder="Select date"
                    value={formData.joinDate}
                    onChange={(value) => {
                      const dateValue = value ? new Date(value) : new Date();
                      setFormData({ ...formData, joinDate: dateValue });
                    }}
                    maxDate={new Date()}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <Stack gap="md" mt="md">
              <Alert icon={<IconLock size={20} />} color="blue" variant="light">
                Configure account security and password settings.
              </Alert>

              {!user && (
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={formErrors.password}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        confirmPassword: e.target.value 
                      })}
                      error={formErrors.confirmPassword}
                    />
                  </Grid.Col>
                </Grid>
              )}

              <Divider label="Account Status" />

              <Group>
                <Switch
                  label="Account Active"
                  checked={formData.isActive}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    isActive: event.currentTarget.checked 
                  })}
                />
                <Switch
                  label="Email Verified"
                  checked={formData.emailVerified}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    emailVerified: event.currentTarget.checked 
                  })}
                />
                <Switch
                  label="Two-Factor Authentication"
                  checked={formData.twoFactorEnabled}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    twoFactorEnabled: event.currentTarget.checked 
                  })}
                />
                <Switch
                  label="Must Change Password"
                  checked={formData.mustChangePassword}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    mustChangePassword: event.currentTarget.checked 
                  })}
                />
              </Group>

              <Divider label="Access Restrictions" />

              <TextInput
                label="IP Restriction"
                placeholder="e.g., 192.168.1.0/24"
                value={formData.ipRestriction}
                onChange={(e) => setFormData({ ...formData, ipRestriction: e.target.value })}
              />

              <Stack gap="xs">
                <Checkbox
                  label="Restrict access hours"
                  checked={formData.accessHours.enabled}
                  onChange={(event) => setFormData({ 
                    ...formData, 
                    accessHours: { 
                      ...formData.accessHours, 
                      enabled: event.currentTarget.checked 
                    } 
                  })}
                />
                
                {formData.accessHours.enabled && (
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Start Time"
                        placeholder="e.g., 08:00"
                        value={formData.accessHours.startTime}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          accessHours: { 
                            ...formData.accessHours, 
                            startTime: e.target.value 
                          } 
                        })}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="End Time"
                        placeholder="e.g., 18:00"
                        value={formData.accessHours.endTime}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          accessHours: { 
                            ...formData.accessHours, 
                            endTime: e.target.value 
                          } 
                        })}
                      />
                    </Grid.Col>
                  </Grid>
                )}
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="permissions">
            <Stack gap="md" mt="md">
              <Alert icon={<IconShield size={20} />} color="blue" variant="light">
                Set user permissions and module access.
              </Alert>

              <Select
                label="Access Level"
                placeholder="Select access level"
                data={[
                  { value: 'basic', label: 'Basic User' },
                  { value: 'advanced', label: 'Advanced User' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'admin', label: 'Administrator' },
                  { value: 'super_admin', label: 'Super Administrator' },
                ]}
                value={formData.accessLevel}
                onChange={(value) => setFormData({ ...formData, accessLevel: value || 'basic' })}
              />

              <MultiSelect
                label="Permissions"
                placeholder="Select permissions"
                data={permissionOptions}
                value={formData.permissions}
                onChange={(value) => setFormData({ ...formData, permissions: value })}
                searchable
              />

              <MultiSelect
                label="Allowed Modules"
                placeholder="Select allowed modules"
                data={moduleOptions}
                value={formData.allowedModules}
                onChange={(value) => setFormData({ ...formData, allowedModules: value })}
                searchable
              />

              <MultiSelect
                label="Restricted Actions"
                placeholder="Select restricted actions"
                data={[
                  { value: 'delete_patient', label: 'Delete Patient Records' },
                  { value: 'modify_billing', label: 'Modify Billing' },
                  { value: 'access_financial', label: 'Access Financial Data' },
                  { value: 'export_sensitive', label: 'Export Sensitive Data' },
                  { value: 'modify_audit', label: 'Modify Audit Logs' },
                ]}
                value={formData.restrictedActions}
                onChange={(value) => setFormData({ ...formData, restrictedActions: value })}
                searchable
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="professional">
            <Stack gap="md" mt="md">
              <Alert icon={<IconUser size={20} />} color="blue" variant="light">
                Professional information and qualifications.
              </Alert>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Specialization"
                    placeholder="Enter specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Qualification"
                    placeholder="Enter qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Experience"
                placeholder="Enter years of experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />

              {['DOCTOR', 'NURSE', 'PHARMACIST'].includes(formData.role) && (
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="License Number"
                      placeholder="Enter license number"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        licenseNumber: e.target.value 
                      })}
                      error={formErrors.licenseNumber}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <DatePickerInput
                      label="License Expiry"
                      placeholder="Select expiry date"
                      value={formData.licenseExpiry}
                      onChange={(value) => {
                        const dateValue = value ? new Date(value) : new Date();
                        setFormData({ ...formData, licenseExpiry: dateValue });
                      }}
                      minDate={new Date()}
                    />
                  </Grid.Col>
                </Grid>
              )}

              <Divider label="Emergency Contact" />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Emergency Contact Name"
                    placeholder="Enter contact name"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: e.target.value 
                    })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Emergency Phone"
                    placeholder="Enter contact phone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyPhone: e.target.value 
                    })}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {user ? 'Update User' : 'Create User'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default UserManagementForm;
