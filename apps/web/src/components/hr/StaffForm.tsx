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
  NumberInput,
  Textarea,
  Switch,
  LoadingOverlay,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import hrService from '../../services/hr.service';
import type { CreateStaffDto, UpdateStaffDto } from '../../services/hr.service';

interface StaffFormProps {
  opened: boolean;
  onClose: () => void;
  staff?: any;
  onSubmit: (data: CreateStaffDto | UpdateStaffDto) => Promise<void>;
}

const DESIGNATIONS = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
  { value: 'RADIOLOGIST', label: 'Radiologist' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OTHER', label: 'Other' },
];

function StaffForm({ opened, onClose, staff, onSubmit }: StaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: '',
    employeeId: '',
    dateOfJoining: new Date(),
    salary: 0,
    address: '',
    emergencyContact: '',
    qualifications: '',
    specialization: '',
    isActive: true,
  });

  useEffect(() => {
    if (opened) {
      fetchDepartments();
      if (staff) {
        setFormData({
          firstName: staff.firstName || '',
          lastName: staff.lastName || '',
          email: staff.email || '',
          phone: staff.phone || '',
          departmentId: staff.departmentId || '',
          designation: staff.designation || '',
          employeeId: staff.employeeId || '',
          dateOfJoining: staff.dateOfJoining ? new Date(staff.dateOfJoining) : new Date(),
          salary: staff.salary || 0,
          address: staff.address || '',
          emergencyContact: staff.emergencyContact || '',
          qualifications: staff.qualifications || '',
          specialization: staff.specialization || '',
          isActive: staff.isActive !== undefined ? staff.isActive : true,
        });
      } else {
        resetForm();
      }
    }
  }, [opened, staff]);

  const fetchDepartments = async () => {
    try {
      const response = await hrService.getDepartments({ limit: 100 });
      if (response.success && response.data) {
        setDepartments(
          response.data.items.map((dept) => ({
            value: dept.id,
            label: dept.name,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load departments',
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      designation: '',
      employeeId: '',
      dateOfJoining: new Date(),
      salary: 0,
      address: '',
      emergencyContact: '',
      qualifications: '',
      specialization: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'First name is required',
        color: 'red',
      });
      return;
    }

    if (!formData.lastName.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Last name is required',
        color: 'red',
      });
      return;
    }

    if (!formData.email.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Email is required',
        color: 'red',
      });
      return;
    }

    if (!formData.phone.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Phone number is required',
        color: 'red',
      });
      return;
    }

    if (!formData.departmentId) {
      notifications.show({
        title: 'Validation Error',
        message: 'Department is required',
        color: 'red',
      });
      return;
    }

    if (!formData.designation) {
      notifications.show({
        title: 'Validation Error',
        message: 'Designation is required',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        dateOfJoining: formData.dateOfJoining.toISOString(),
        salary: formData.salary || undefined,
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
      title={staff ? 'Edit Staff Member' : 'Add New Staff Member'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Personal Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Contact Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email"
                placeholder="email@example.com"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone"
                placeholder="Enter phone number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Employment Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Department"
                placeholder="Select department"
                required
                data={departments}
                value={formData.departmentId}
                onChange={(value) => setFormData({ ...formData, departmentId: value || '' })}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Designation"
                placeholder="Select designation"
                required
                data={DESIGNATIONS}
                value={formData.designation}
                onChange={(value) => setFormData({ ...formData, designation: value || '' })}
                searchable
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Employee ID"
                placeholder="Enter employee ID (optional)"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Date of Joining"
                placeholder="Select date"
                value={formData.dateOfJoining}
                onChange={(value) =>
                  setFormData({ ...formData, dateOfJoining: value ? new Date(value) : new Date() })
                }
                clearable={false}
              />
            </Grid.Col>
          </Grid>

          {/* Salary and Qualifications */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Salary"
                placeholder="Enter salary (optional)"
                min={0}
                value={formData.salary}
                onChange={(value) => setFormData({ ...formData, salary: Number(value) || 0 })}
                prefix="₹"
                thousandSeparator=","
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact"
                placeholder="Enter emergency contact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Additional Information */}
          <Textarea
            label="Address"
            placeholder="Enter address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            minRows={2}
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Qualifications"
                placeholder="Enter qualifications"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Specialization"
                placeholder="Enter specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Status */}
          <Switch
            label="Active Status"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {staff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default StaffForm;
