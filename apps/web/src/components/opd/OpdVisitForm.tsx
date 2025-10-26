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
  Textarea,
  LoadingOverlay,
  NumberInput,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import opdService from '../../services/opd.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';

interface OpdVisitFormProps {
  opened: boolean;
  onClose: () => void;
  visit?: any;
  onSuccess: () => void;
}

const OpdVisitForm: React.FC<OpdVisitFormProps> = ({ opened, onClose, visit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'general-medicine', label: 'General Medicine' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'gynecology', label: 'Gynecology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'emergency', label: 'Emergency' },
  ]);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    visitDate: new Date(),
    visitTime: '',
    reason: '',
    chiefComplaint: '',
    vitalSigns: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      weight: '',
      height: '',
      oxygenSaturation: '',
    },
    notes: '',
    visitType: 'new',
    urgency: 'routine',
    referredFrom: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPatients();
      fetchDoctors();
      
      if (visit) {
        // Populate form with existing visit data
        setFormData({
          patientId: visit.patientId || '',
          doctorId: visit.doctorId || '',
          departmentId: visit.departmentId || '',
          visitDate: visit.visitDate ? new Date(visit.visitDate) : new Date(),
          visitTime: visit.visitTime || '',
          reason: visit.reason || '',
          chiefComplaint: visit.chiefComplaint || '',
          vitalSigns: {
            temperature: visit.vitalSigns?.temperature || '',
            bloodPressure: visit.vitalSigns?.bloodPressure || '',
            heartRate: visit.vitalSigns?.heartRate || '',
            respiratoryRate: visit.vitalSigns?.respiratoryRate || '',
            weight: visit.vitalSigns?.weight || '',
            height: visit.vitalSigns?.height || '',
            oxygenSaturation: visit.vitalSigns?.oxygenSaturation || '',
          },
          notes: visit.notes || '',
          visitType: visit.visitType || 'new',
          urgency: visit.urgency || 'routine',
          referredFrom: visit.referredFrom || '',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, visit]);

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        const patientOptions = response.data.patients.map((p: any) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName} - ${p.medicalRecordNumber || p.id.slice(-6)}`,
        }));
        setPatients(patientOptions);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await staffService.getStaff({ role: 'DOCTOR', limit: 100 });
      if (response.success && response.data) {
        const doctorOptions = response.data.staff
          .filter((s: any) => s.user?.role === 'DOCTOR')
          .map((d: any) => ({
            value: d.id,
            label: `Dr. ${d.user?.firstName} ${d.user?.lastName} - ${d.user?.specialization || 'General'}`,
          }));
        setDoctors(doctorOptions);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      departmentId: '',
      visitDate: new Date(),
      visitTime: '',
      reason: '',
      chiefComplaint: '',
      vitalSigns: {
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        weight: '',
        height: '',
        oxygenSaturation: '',
      },
      notes: '',
      visitType: 'new',
      urgency: 'routine',
      referredFrom: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.doctorId) errors.doctorId = 'Doctor is required';
    if (!formData.visitDate) errors.visitDate = 'Visit date is required';
    if (!formData.reason.trim()) errors.reason = 'Reason for visit is required';
    if (!formData.chiefComplaint.trim()) errors.chiefComplaint = 'Chief complaint is required';

    // Validate vital signs if provided
    if (formData.vitalSigns.temperature && (parseFloat(formData.vitalSigns.temperature) < 95 || parseFloat(formData.vitalSigns.temperature) > 105)) {
      errors.temperature = 'Invalid temperature range (95-105°F)';
    }
    if (formData.vitalSigns.heartRate && (parseInt(formData.vitalSigns.heartRate) < 40 || parseInt(formData.vitalSigns.heartRate) > 200)) {
      errors.heartRate = 'Invalid heart rate range (40-200 bpm)';
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
      });
      return;
    }

    setLoading(true);
    try {
      const visitDateTime = new Date(formData.visitDate);
      if (formData.visitTime) {
        const [hours, minutes] = formData.visitTime.split(':');
        visitDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const submitData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId || undefined,
        visitDate: visitDateTime.toISOString(),
        reason: formData.reason,
        chiefComplaint: formData.chiefComplaint,
        vitalSigns: {
          temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
          bloodPressure: formData.vitalSigns.bloodPressure || undefined,
          heartRate: formData.vitalSigns.heartRate ? parseInt(formData.vitalSigns.heartRate) : undefined,
          respiratoryRate: formData.vitalSigns.respiratoryRate ? parseInt(formData.vitalSigns.respiratoryRate) : undefined,
          weight: formData.vitalSigns.weight ? parseFloat(formData.vitalSigns.weight) : undefined,
          height: formData.vitalSigns.height ? parseFloat(formData.vitalSigns.height) : undefined,
        },
        notes: formData.notes || undefined,
      };

      let response;
      if (visit) {
        response = await opdService.updateVisit(visit.id, {
          status: visit.status,
          diagnosis: visit.diagnosis,
          prescription: visit.prescription,
          followUpDate: visit.followUpDate,
          notes: submitData.notes,
        });
      } else {
        response = await opdService.createVisit(submitData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: visit ? 'OPD visit updated successfully' : 'OPD visit registered successfully',
          color: 'green',
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save OPD visit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={visit ? 'Edit OPD Visit' : 'New OPD Visit Registration'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Patient and Doctor Selection */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Patient"
                placeholder="Select patient"
                required
                data={patients}
                value={formData.patientId}
                onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
                error={formErrors.patientId}
                searchable
                nothingFoundMessage="No patients found"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Doctor"
                placeholder="Select doctor"
                required
                data={doctors}
                value={formData.doctorId}
                onChange={(value) => setFormData({ ...formData, doctorId: value || '' })}
                error={formErrors.doctorId}
                searchable
                nothingFoundMessage="No doctors found"
              />
            </Grid.Col>
          </Grid>

          {/* Department and Visit Details */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Department"
                placeholder="Select department"
                data={departments}
                value={formData.departmentId}
                onChange={(value) => setFormData({ ...formData, departmentId: value || '' })}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Visit Type"
                placeholder="Select visit type"
                required
                data={[
                  { value: 'new', label: 'New Visit' },
                  { value: 'follow_up', label: 'Follow-up' },
                  { value: 'emergency', label: 'Emergency' },
                ]}
                value={formData.visitType}
                onChange={(value) => setFormData({ ...formData, visitType: value || 'new' })}
              />
            </Grid.Col>
          </Grid>

          {/* Date and Time */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Visit Date"
                placeholder="Select date"
                required
                value={formData.visitDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, visitDate: dateValue });
                }}
                error={formErrors.visitDate}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TimeInput
                label="Visit Time"
                placeholder="Select time"
                value={formData.visitTime}
                onChange={(event) => setFormData({ ...formData, visitTime: event.currentTarget.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Urgency and Referral */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Urgency"
                placeholder="Select urgency"
                data={[
                  { value: 'routine', label: 'Routine' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'emergency', label: 'Emergency' },
                ]}
                value={formData.urgency}
                onChange={(value) => setFormData({ ...formData, urgency: value || 'routine' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Referred From"
                placeholder="Enter referral source"
                value={formData.referredFrom}
                onChange={(e) => setFormData({ ...formData, referredFrom: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Chief Complaint and Reason */}
          <TextInput
            label="Reason for Visit"
            placeholder="Enter reason for visit"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            error={formErrors.reason}
          />

          <Textarea
            label="Chief Complaint"
            placeholder="Describe the patient's chief complaint"
            required
            minRows={3}
            value={formData.chiefComplaint}
            onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
            error={formErrors.chiefComplaint}
          />

          {/* Vital Signs */}
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Vital Signs</h3>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Temperature (°F)"
                  placeholder="98.6"
                  value={formData.vitalSigns.temperature}
                  onChange={(value) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, temperature: value?.toString() || '' }
                  })}
                  error={formErrors.temperature}
                  min={95}
                  max={105}
                  step={0.1}
                  decimalScale={1}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Blood Pressure"
                  placeholder="120/80"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value }
                  })}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Heart Rate (bpm)"
                  placeholder="72"
                  value={formData.vitalSigns.heartRate}
                  onChange={(value) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, heartRate: value?.toString() || '' }
                  })}
                  error={formErrors.heartRate}
                  min={40}
                  max={200}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Respiratory Rate"
                  placeholder="16"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(value) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, respiratoryRate: value?.toString() || '' }
                  })}
                  min={8}
                  max={40}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Weight (kg)"
                  placeholder="70"
                  value={formData.vitalSigns.weight}
                  onChange={(value) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, weight: value?.toString() || '' }
                  })}
                  min={1}
                  max={300}
                  step={0.1}
                  decimalScale={1}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Height (cm)"
                  placeholder="170"
                  value={formData.vitalSigns.height}
                  onChange={(value) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, height: value?.toString() || '' }
                  })}
                  min={30}
                  max={250}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="O2 Saturation (%)"
                  placeholder="98"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={(value) => setFormData({
                    ...formData,
                    vitalSigns: { ...formData.vitalSigns, oxygenSaturation: value?.toString() || '' }
                  })}
                  min={70}
                  max={100}
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* Additional Notes */}
          <Textarea
            label="Additional Notes"
            placeholder="Enter any additional notes or observations"
            minRows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {visit ? 'Update Visit' : 'Register Visit'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default OpdVisitForm;
