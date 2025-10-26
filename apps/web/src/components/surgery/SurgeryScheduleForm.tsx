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
  Alert,
  NumberInput,
  MultiSelect,
  Checkbox,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconBandage, IconAlertCircle } from '@tabler/icons-react';
import surgeryService from '../../services/surgery.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';

interface SurgeryScheduleFormProps {
  opened: boolean;
  onClose: () => void;
  surgery?: any;
  onSuccess: () => void;
}

const SurgeryScheduleForm: React.FC<SurgeryScheduleFormProps> = ({
  opened,
  onClose,
  surgery,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [anesthesiologists, setAnesthesiologists] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    surgeryType: '',
    procedureName: '',
    leadSurgeonId: '',
    assistantSurgeonIds: [] as string[],
    anesthesiologistId: '',
    nurseIds: [] as string[],
    operationTheater: '',
    scheduledDate: new Date(),
    scheduledTime: '',
    estimatedDuration: 0,
    priority: 'elective',
    preOpDiagnosis: '',
    plannedProcedure: '',
    anesthesiaType: '',
    bloodType: '',
    bloodUnitsRequired: 0,
    specialEquipment: '',
    specialInstructions: '',
    consentObtained: false,
    preOpOrdersCompleted: false,
    status: 'scheduled',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPatients();
      fetchSurgeons();
      fetchAnesthesiologists();
      fetchNurses();
      
      if (surgery) {
        // Edit mode
        setFormData({
          patientId: surgery.patientId || '',
          surgeryType: surgery.surgeryType || '',
          procedureName: surgery.procedureName || '',
          leadSurgeonId: surgery.leadSurgeonId || '',
          assistantSurgeonIds: surgery.assistantSurgeonIds || [],
          anesthesiologistId: surgery.anesthesiologistId || '',
          nurseIds: surgery.nurseIds || [],
          operationTheater: surgery.operationTheater || '',
          scheduledDate: surgery.scheduledDate ? new Date(surgery.scheduledDate) : new Date(),
          scheduledTime: surgery.scheduledTime || '',
          estimatedDuration: surgery.estimatedDuration || 0,
          priority: surgery.priority || 'elective',
          preOpDiagnosis: surgery.preOpDiagnosis || '',
          plannedProcedure: surgery.plannedProcedure || '',
          anesthesiaType: surgery.anesthesiaType || '',
          bloodType: surgery.bloodType || '',
          bloodUnitsRequired: surgery.bloodUnitsRequired || 0,
          specialEquipment: surgery.specialEquipment || '',
          specialInstructions: surgery.specialInstructions || '',
          consentObtained: surgery.consentObtained || false,
          preOpOrdersCompleted: surgery.preOpOrdersCompleted || false,
          status: surgery.status || 'scheduled',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, surgery]);

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

  const fetchSurgeons = async () => {
    try {
      const response = await staffService.getStaff({ role: 'DOCTOR', limit: 100 });
      if (response.success && response.data) {
        const surgeonOptions = response.data.staff
          .filter((s: any) => s.user?.role === 'DOCTOR')
          .map((d: any) => ({
            value: d.id,
            label: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
          }));
        setSurgeons(surgeonOptions);
      }
    } catch (error) {
      console.error('Error fetching surgeons:', error);
    }
  };

  const fetchAnesthesiologists = async () => {
    try {
      const response = await staffService.getStaff({ role: 'DOCTOR', limit: 100 });
      if (response.success && response.data) {
        const anesthOptions = response.data.staff
          .filter((s: any) => s.user?.role === 'DOCTOR')
          .map((d: any) => ({
            value: d.id,
            label: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
          }));
        setAnesthesiologists(anesthOptions);
      }
    } catch (error) {
      console.error('Error fetching anesthesiologists:', error);
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await staffService.getStaff({ role: 'NURSE', limit: 100 });
      if (response.success && response.data) {
        const nurseOptions = response.data.staff
          .filter((s: any) => s.user?.role === 'NURSE')
          .map((n: any) => ({
            value: n.id,
            label: `${n.user?.firstName} ${n.user?.lastName}`,
          }));
        setNurses(nurseOptions);
      }
    } catch (error) {
      console.error('Error fetching nurses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      surgeryType: '',
      procedureName: '',
      leadSurgeonId: '',
      assistantSurgeonIds: [],
      anesthesiologistId: '',
      nurseIds: [],
      operationTheater: '',
      scheduledDate: new Date(),
      scheduledTime: '',
      estimatedDuration: 0,
      priority: 'elective',
      preOpDiagnosis: '',
      plannedProcedure: '',
      anesthesiaType: '',
      bloodType: '',
      bloodUnitsRequired: 0,
      specialEquipment: '',
      specialInstructions: '',
      consentObtained: false,
      preOpOrdersCompleted: false,
      status: 'scheduled',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.procedureName.trim()) errors.procedureName = 'Procedure name is required';
    if (!formData.leadSurgeonId) errors.leadSurgeonId = 'Lead surgeon is required';
    if (!formData.anesthesiologistId) errors.anesthesiologistId = 'Anesthesiologist is required';
    if (!formData.operationTheater.trim()) errors.operationTheater = 'Operation theater is required';
    if (!formData.scheduledTime) errors.scheduledTime = 'Scheduled time is required';
    if (formData.estimatedDuration <= 0) errors.estimatedDuration = 'Duration must be greater than 0';
    if (!formData.preOpDiagnosis.trim()) errors.preOpDiagnosis = 'Pre-operative diagnosis is required';
    if (!formData.plannedProcedure.trim()) errors.plannedProcedure = 'Planned procedure is required';
    if (!formData.anesthesiaType) errors.anesthesiaType = 'Anesthesia type is required';
    
    if (!formData.consentObtained) {
      errors.consentObtained = 'Patient consent must be obtained before scheduling';
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
        patientId: formData.patientId,
        surgeonId: formData.leadSurgeonId,
        operationTheaterId: formData.operationTheater,
        surgeryType: formData.surgeryType,
        surgeryName: formData.procedureName,
        description: formData.plannedProcedure,
        scheduledDate: formData.scheduledDate.toISOString(),
        estimatedDuration: formData.estimatedDuration,
        priority: (formData.priority === 'elective' ? 'ROUTINE' : formData.priority.toUpperCase()) as 'ROUTINE' | 'URGENT' | 'EMERGENCY',
        status: formData.status.toUpperCase() as any,
        preOpNotes: formData.preOpDiagnosis,
        anesthesiaType: formData.anesthesiaType,
        assistantSurgeons: formData.assistantSurgeonIds,
        nurses: formData.nurseIds,
        anesthesiologist: formData.anesthesiologistId,
      };

      let response;
      if (surgery) {
        response = await surgeryService.updateSurgery(surgery.id, submitData);
      } else {
        response = await surgeryService.createSurgery(submitData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: surgery ? 'Surgery updated successfully' : 'Surgery scheduled successfully',
          color: 'green',
          icon: <IconBandage />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting surgery form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save surgery',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const surgeryTypes = [
    { value: 'general', label: 'General Surgery' },
    { value: 'orthopedic', label: 'Orthopedic Surgery' },
    { value: 'cardiac', label: 'Cardiac Surgery' },
    { value: 'neurosurgery', label: 'Neurosurgery' },
    { value: 'plastic', label: 'Plastic Surgery' },
    { value: 'pediatric', label: 'Pediatric Surgery' },
    { value: 'vascular', label: 'Vascular Surgery' },
    { value: 'thoracic', label: 'Thoracic Surgery' },
    { value: 'urological', label: 'Urological Surgery' },
    { value: 'gynecological', label: 'Gynecological Surgery' },
    { value: 'ophthalmic', label: 'Ophthalmic Surgery' },
    { value: 'ent', label: 'ENT Surgery' },
  ];

  const priorities = [
    { value: 'emergency', label: 'Emergency' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'expedited', label: 'Expedited' },
    { value: 'elective', label: 'Elective' },
  ];

  const anesthesiaTypes = [
    { value: 'general', label: 'General Anesthesia' },
    { value: 'regional', label: 'Regional Anesthesia' },
    { value: 'local', label: 'Local Anesthesia' },
    { value: 'sedation', label: 'Sedation' },
    { value: 'spinal', label: 'Spinal Anesthesia' },
    { value: 'epidural', label: 'Epidural Anesthesia' },
  ];

  const theaters = [
    { value: 'ot1', label: 'Operation Theater 1' },
    { value: 'ot2', label: 'Operation Theater 2' },
    { value: 'ot3', label: 'Operation Theater 3' },
    { value: 'ot4', label: 'Operation Theater 4' },
    { value: 'minor_ot', label: 'Minor OT' },
    { value: 'emergency_ot', label: 'Emergency OT' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={surgery ? 'Edit Surgery Schedule' : 'Schedule New Surgery'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconBandage size={20} />} color="blue" variant="light">
            Enter surgery details below. Ensure all pre-operative requirements are met.
          </Alert>

          {/* Patient and Surgery Type */}
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
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Surgery Type"
                placeholder="Select surgery type"
                required
                data={surgeryTypes}
                value={formData.surgeryType}
                onChange={(value) => setFormData({ ...formData, surgeryType: value || '' })}
                searchable
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Procedure Name"
            placeholder="Enter specific procedure name"
            required
            value={formData.procedureName}
            onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
            error={formErrors.procedureName}
          />

          {/* Surgical Team */}
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            Surgical Team
          </h3>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Lead Surgeon"
                placeholder="Select lead surgeon"
                required
                data={surgeons}
                value={formData.leadSurgeonId}
                onChange={(value) => setFormData({ ...formData, leadSurgeonId: value || '' })}
                error={formErrors.leadSurgeonId}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label="Assistant Surgeons"
                placeholder="Select assistant surgeons"
                data={surgeons.filter(s => s.value !== formData.leadSurgeonId)}
                value={formData.assistantSurgeonIds}
                onChange={(value) => setFormData({ ...formData, assistantSurgeonIds: value })}
                searchable
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Anesthesiologist"
                placeholder="Select anesthesiologist"
                required
                data={anesthesiologists}
                value={formData.anesthesiologistId}
                onChange={(value) => setFormData({ ...formData, anesthesiologistId: value || '' })}
                error={formErrors.anesthesiologistId}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label="Nursing Team"
                placeholder="Select nurses"
                data={nurses}
                value={formData.nurseIds}
                onChange={(value) => setFormData({ ...formData, nurseIds: value })}
                searchable
              />
            </Grid.Col>
          </Grid>

          {/* Scheduling */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="Operation Theater"
                placeholder="Select OT"
                required
                data={theaters}
                value={formData.operationTheater}
                onChange={(value) => setFormData({ ...formData, operationTheater: value || '' })}
                error={formErrors.operationTheater}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <DatePickerInput
                label="Surgery Date"
                placeholder="Select date"
                required
                value={formData.scheduledDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, scheduledDate: dateValue });
                }}
                minDate={new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <TimeInput
                label="Start Time"
                placeholder="Select time"
                required
                value={formData.scheduledTime}
                onChange={(event) => setFormData({ ...formData, scheduledTime: event.currentTarget.value })}
                error={formErrors.scheduledTime}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Duration (minutes)"
                placeholder="Est. duration"
                required
                value={formData.estimatedDuration}
                onChange={(value) => setFormData({ ...formData, estimatedDuration: Number(value) || 0 })}
                error={formErrors.estimatedDuration}
                min={0}
              />
            </Grid.Col>
          </Grid>

          {/* Clinical Details */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Priority"
                placeholder="Select priority"
                required
                data={priorities}
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value || 'elective' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Anesthesia Type"
                placeholder="Select anesthesia"
                required
                data={anesthesiaTypes}
                value={formData.anesthesiaType}
                onChange={(value) => setFormData({ ...formData, anesthesiaType: value || '' })}
                error={formErrors.anesthesiaType}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Pre-operative Diagnosis"
            placeholder="Enter pre-operative diagnosis"
            required
            minRows={2}
            value={formData.preOpDiagnosis}
            onChange={(e) => setFormData({ ...formData, preOpDiagnosis: e.target.value })}
            error={formErrors.preOpDiagnosis}
          />

          <Textarea
            label="Planned Procedure"
            placeholder="Describe the planned procedure"
            required
            minRows={3}
            value={formData.plannedProcedure}
            onChange={(e) => setFormData({ ...formData, plannedProcedure: e.target.value })}
            error={formErrors.plannedProcedure}
          />

          {/* Blood Requirements */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Blood Type Required"
                placeholder="Select blood type"
                data={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
                value={formData.bloodType}
                onChange={(value) => setFormData({ ...formData, bloodType: value || '' })}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Blood Units Required"
                placeholder="Enter units"
                value={formData.bloodUnitsRequired}
                onChange={(value) => setFormData({ ...formData, bloodUnitsRequired: Number(value) || 0 })}
                min={0}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Special Equipment Required"
            placeholder="List any special equipment needed"
            minRows={2}
            value={formData.specialEquipment}
            onChange={(e) => setFormData({ ...formData, specialEquipment: e.target.value })}
          />

          <Textarea
            label="Special Instructions"
            placeholder="Enter any special instructions"
            minRows={2}
            value={formData.specialInstructions}
            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
          />

          {/* Pre-operative Checklist */}
          <Stack gap="xs">
            <Checkbox
              label="Patient consent obtained"
              checked={formData.consentObtained}
              onChange={(event) => setFormData({ ...formData, consentObtained: event.currentTarget.checked })}
              error={formErrors.consentObtained}
            />
            <Checkbox
              label="Pre-operative orders completed"
              checked={formData.preOpOrdersCompleted}
              onChange={(event) => setFormData({ ...formData, preOpOrdersCompleted: event.currentTarget.checked })}
            />
          </Stack>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {surgery ? 'Update Surgery' : 'Schedule Surgery'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default SurgeryScheduleForm;
