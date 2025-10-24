import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  Grid,
  Text,
  LoadingOverlay,
  Divider,
  Card,
} from '@mantine/core';
import { IconAlertTriangle, IconUser } from '@tabler/icons-react';
import type {
  CreateEmergencyCaseDto,
  UpdateEmergencyCaseDto,
} from '../../services/emergency.service';

interface EmergencyCaseFormProps {
  opened: boolean;
  onClose: () => void;
  emergencyCase?: any;
  onSubmit: (data: CreateEmergencyCaseDto | UpdateEmergencyCaseDto) => Promise<void>;
  loading?: boolean;
  patients?: any[];
  doctors?: any[];
}

export default function EmergencyCaseForm({
  opened,
  onClose,
  emergencyCase,
  onSubmit,
  loading = false,
  patients = [],
  doctors = [],
}: EmergencyCaseFormProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    chiefComplaint: '',
    triageLevel: 'NON_URGENT',
    status: 'WAITING',
    assignedDoctorId: '',
    treatmentNotes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: 0,
      temperature: 0,
      respiratoryRate: 0,
      oxygenSaturation: 0,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (emergencyCase) {
      const vitalSigns =
        typeof emergencyCase.vitalSigns === 'string'
          ? JSON.parse(emergencyCase.vitalSigns)
          : emergencyCase.vitalSigns || {};

      setFormData({
        patientId: emergencyCase.patientId || '',
        chiefComplaint: emergencyCase.chiefComplaint || '',
        triageLevel: emergencyCase.triageLevel || 'NON_URGENT',
        status: emergencyCase.status || 'WAITING',
        assignedDoctorId: emergencyCase.assignedDoctorId || '',
        treatmentNotes: emergencyCase.treatmentNotes || '',
        vitalSigns: {
          bloodPressure: vitalSigns.bloodPressure || '',
          heartRate: vitalSigns.heartRate || 0,
          temperature: vitalSigns.temperature || 0,
          respiratoryRate: vitalSigns.respiratoryRate || 0,
          oxygenSaturation: vitalSigns.oxygenSaturation || 0,
        },
      });
    } else {
      resetForm();
    }
  }, [emergencyCase, opened]);

  const resetForm = () => {
    setFormData({
      patientId: '',
      chiefComplaint: '',
      triageLevel: 'NON_URGENT',
      status: 'WAITING',
      assignedDoctorId: '',
      treatmentNotes: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: 0,
        temperature: 0,
        respiratoryRate: 0,
        oxygenSaturation: 0,
      },
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!emergencyCase && !formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.chiefComplaint || formData.chiefComplaint.trim().length < 5) {
      newErrors.chiefComplaint = 'Chief complaint must be at least 5 characters';
    }
    if (!formData.triageLevel) {
      newErrors.triageLevel = 'Triage level is required';
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
      const submitData: any = {
        chiefComplaint: formData.chiefComplaint,
        triageLevel: formData.triageLevel,
        vitalSigns: formData.vitalSigns,
      };

      if (!emergencyCase) {
        submitData.patientId = formData.patientId;
      } else {
        submitData.status = formData.status;
        submitData.assignedDoctorId = formData.assignedDoctorId || undefined;
        submitData.treatmentNotes = formData.treatmentNotes || undefined;
      }

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting emergency case:', error);
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

  const triageLevelOptions = [
    { value: 'CRITICAL', label: 'Critical (Red)', color: 'red' },
    { value: 'URGENT', label: 'Urgent (Orange)', color: 'orange' },
    { value: 'SEMI_URGENT', label: 'Semi-Urgent (Yellow)', color: 'yellow' },
    { value: 'NON_URGENT', label: 'Non-Urgent (Green)', color: 'green' },
  ];

  const statusOptions = [
    { value: 'WAITING', label: 'Waiting' },
    { value: 'IN_TREATMENT', label: 'In Treatment' },
    { value: 'DISCHARGED', label: 'Discharged' },
    { value: 'ADMITTED', label: 'Admitted' },
    { value: 'TRANSFERRED', label: 'Transferred' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconAlertTriangle size={24} />
          <Text size="lg" fw={600}>
            {emergencyCase ? 'Update Emergency Case' : 'Register Emergency Case'}
          </Text>
        </Group>
      }
      size="lg"
      padding="md"
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Patient Selection (only for new cases) */}
          {!emergencyCase && (
            <Select
              label="Patient"
              placeholder="Select patient"
              data={patientOptions}
              value={formData.patientId}
              onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
              error={errors.patientId}
              required
              searchable
              leftSection={<IconUser size={16} />}
            />
          )}

          {/* Chief Complaint */}
          <Textarea
            label="Chief Complaint"
            placeholder="Describe the emergency condition"
            value={formData.chiefComplaint}
            onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
            error={errors.chiefComplaint}
            required
            minRows={3}
            maxRows={5}
          />

          {/* Triage Level */}
          <Select
            label="Triage Level"
            placeholder="Select triage level"
            data={triageLevelOptions}
            value={formData.triageLevel}
            onChange={(value) => setFormData({ ...formData, triageLevel: value || 'NON_URGENT' })}
            error={errors.triageLevel}
            required
            leftSection={<IconAlertTriangle size={16} />}
          />

          {/* Status (only for updates) */}
          {emergencyCase && (
            <>
              <Select
                label="Status"
                placeholder="Select status"
                data={statusOptions}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value || 'WAITING' })}
              />

              <Select
                label="Assigned Doctor"
                placeholder="Select doctor"
                data={doctorOptions}
                value={formData.assignedDoctorId}
                onChange={(value) => setFormData({ ...formData, assignedDoctorId: value || '' })}
                searchable
                clearable
              />

              <Textarea
                label="Treatment Notes"
                placeholder="Enter treatment notes"
                value={formData.treatmentNotes}
                onChange={(e) => setFormData({ ...formData, treatmentNotes: e.target.value })}
                minRows={3}
                maxRows={5}
              />
            </>
          )}

          <Divider label="Vital Signs" labelPosition="center" />

          {/* Vital Signs */}
          <Card withBorder padding="md">
            <Stack gap="sm">
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Blood Pressure"
                    placeholder="120/80"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value },
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Heart Rate (bpm)"
                    placeholder="72"
                    value={formData.vitalSigns.heartRate}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        vitalSigns: { ...formData.vitalSigns, heartRate: Number(value) || 0 },
                      })
                    }
                    min={0}
                    max={300}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Temperature (°F)"
                    placeholder="98.6"
                    value={formData.vitalSigns.temperature}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        vitalSigns: { ...formData.vitalSigns, temperature: Number(value) || 0 },
                      })
                    }
                    min={0}
                    max={120}
                    decimalScale={1}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Respiratory Rate"
                    placeholder="16"
                    value={formData.vitalSigns.respiratoryRate}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        vitalSigns: { ...formData.vitalSigns, respiratoryRate: Number(value) || 0 },
                      })
                    }
                    min={0}
                    max={100}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="O2 Saturation (%)"
                    placeholder="98"
                    value={formData.vitalSigns.oxygenSaturation}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        vitalSigns: { ...formData.vitalSigns, oxygenSaturation: Number(value) || 0 },
                      })
                    }
                    min={0}
                    max={100}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {emergencyCase ? 'Update Case' : 'Register Case'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
