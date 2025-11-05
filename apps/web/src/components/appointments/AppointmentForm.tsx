import React, { useState, useEffect } from 'react';
import {
  Modal,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  Grid,
  Text,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconClock, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../../services/appointments.service';

interface AppointmentFormProps {
  opened: boolean;
  onClose: () => void;
  appointment?: any;
  onSubmit: (data: CreateAppointmentDto | UpdateAppointmentDto) => Promise<void>;
  loading?: boolean;
  patients?: any[];
  doctors?: any[];
}

export default function AppointmentForm({
  opened,
  onClose,
  appointment,
  onSubmit,
  loading = false,
  patients = [],
  doctors = [],
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<{
    patientId: string;
    doctorId: string;
    departmentId: string;
    appointmentDate: Date | null;
    appointmentTime: string;
    reason: string;
    notes: string;
    status: string;
  }>({
    patientId: '',
    doctorId: '',
    departmentId: '',
    appointmentDate: new Date(),
    appointmentTime: '',
    reason: '',
    notes: '',
    status: 'SCHEDULED',
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appointment) {
      const appointmentDateTime = new Date(appointment.startTime);
      setFormData({
        patientId: appointment.patientId || '',
        doctorId: appointment.doctorId || '',
        departmentId: appointment.departmentId || '',
        appointmentDate: appointmentDateTime,
        appointmentTime: appointmentDateTime.toTimeString().slice(0, 5),
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'SCHEDULED',
      });
    } else {
      resetForm();
    }
  }, [appointment, opened]);

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      departmentId: '',
      appointmentDate: new Date(),
      appointmentTime: '',
      reason: '',
      notes: '',
      status: 'SCHEDULED',
    });
    setErrors({});
    setAvailableSlots([]);
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      // In a real implementation, fetch available slots from API
      setAvailableSlots(generateTimeSlots());
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.doctorId) {
      newErrors.doctorId = 'Doctor is required';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Date is required';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Time is required';
    }
    if (!formData.reason || formData.reason.trim().length < 3) {
      newErrors.reason = 'Reason must be at least 3 characters';
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
      // Combine date and time into ISO string
      const [hours, minutes] = formData.appointmentTime.split(':');
      const appointmentDateTime = new Date(formData.appointmentDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const submitData: CreateAppointmentDto = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId || undefined,
        appointmentDateTime: appointmentDateTime.toISOString(),
        reason: formData.reason,
        notes: formData.notes || undefined,
        status: formData.status,
      };

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting appointment:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} - ${p.medicalRecordNumber || p.id}`,
  }));

  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: `Dr. ${d.firstName} ${d.lastName}`,
  }));

  const timeSlotOptions = availableSlots.map((slot) => ({
    value: slot,
    label: slot,
  }));

  const statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
    { value: 'RESCHEDULED', label: 'Rescheduled' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconCalendar size={24} />
          <Text size="lg" fw={600}>
            {appointment ? 'Edit Appointment' : 'Book New Appointment'}
          </Text>
        </Group>
      }
      size="lg"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Patient Selection */}
          <Select
            label="Patient"
            placeholder="Select patient"
            data={patientOptions}
            value={formData.patientId}
            onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
            error={errors.patientId}
            required
            searchable
            leftSection={<IconCheck size={16} />}
          />

          {/* Doctor Selection */}
          <Select
            label="Doctor"
            placeholder="Select doctor"
            data={doctorOptions}
            value={formData.doctorId}
            onChange={(value) => setFormData({ ...formData, doctorId: value || '' })}
            error={errors.doctorId}
            required
            searchable
            leftSection={<IconCheck size={16} />}
          />

          {/* Date and Time */}
          <Grid>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Appointment Date"
                placeholder="Select date"
                value={formData.appointmentDate}
                onChange={(value) =>
                  setFormData({ ...formData, appointmentDate: value ? new Date(value) : new Date() })
                }
                error={errors.appointmentDate}
                required
                minDate={new Date()}
                leftSection={<IconCalendar size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Appointment Time"
                placeholder="Select time"
                data={timeSlotOptions}
                value={formData.appointmentTime}
                onChange={(value) => setFormData({ ...formData, appointmentTime: value || '' })}
                error={errors.appointmentTime}
                required
                searchable
                leftSection={<IconClock size={16} />}
                disabled={!formData.doctorId || !formData.appointmentDate}
              />
            </Grid.Col>
          </Grid>

          {availableSlots.length > 0 && formData.doctorId && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
              {availableSlots.length} time slots available for selected date
            </Alert>
          )}

          {/* Status (only for editing) */}
          {appointment && (
            <Select
              label="Status"
              placeholder="Select status"
              data={statusOptions}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value || 'SCHEDULED' })}
            />
          )}

          {/* Reason */}
          <Textarea
            label="Reason for Visit"
            placeholder="Enter reason for appointment"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            error={errors.reason}
            required
            minRows={2}
            maxRows={4}
          />

          {/* Notes */}
          <Textarea
            label="Additional Notes"
            placeholder="Enter any additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            minRows={2}
            maxRows={4}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {appointment ? 'Update Appointment' : 'Book Appointment'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
