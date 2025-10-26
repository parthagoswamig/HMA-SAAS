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
  Radio,
  Checkbox,
  NumberInput,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconEmergencyBed, IconAlertCircle, IconAmbulance } from '@tabler/icons-react';
import emergencyService from '../../services/emergency.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';

interface EmergencyAdmissionFormProps {
  opened: boolean;
  onClose: () => void;
  admission?: any;
  onSuccess: () => void;
}

const EmergencyAdmissionForm: React.FC<EmergencyAdmissionFormProps> = ({
  opened,
  onClose,
  admission,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [existingPatients, setExistingPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    // Patient Info (for new patient or existing)
    isNewPatient: true,
    existingPatientId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    gender: '',
    phone: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    
    // Emergency Details
    arrivalTime: new Date(),
    arrivalMode: 'walk_in',
    chiefComplaint: '',
    triageLevel: '',
    triageNotes: '',
    
    // Vital Signs
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    painScore: 0,
    
    // Clinical Information
    presentingSymptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    lastMealTime: '',
    
    // Assignment
    assignedDoctorId: '',
    assignedNurseId: '',
    bedNumber: '',
    
    // Additional Info
    policeCase: false,
    mlcNumber: '',
    accidentDetails: '',
    insuranceInfo: '',
    
    status: 'triaged',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchExistingPatients();
      fetchDoctors();
      fetchNurses();
      
      if (admission) {
        // Edit mode - populate form
        setFormData({
          isNewPatient: false,
          existingPatientId: admission.patientId || '',
          firstName: admission.patient?.firstName || '',
          lastName: admission.patient?.lastName || '',
          dateOfBirth: admission.patient?.dateOfBirth ? new Date(admission.patient.dateOfBirth) : new Date(),
          gender: admission.patient?.gender || '',
          phone: admission.patient?.phone || '',
          emergencyContact: admission.emergencyContact || '',
          emergencyContactPhone: admission.emergencyContactPhone || '',
          
          arrivalTime: admission.arrivalTime ? new Date(admission.arrivalTime) : new Date(),
          arrivalMode: admission.arrivalMode || 'walk_in',
          chiefComplaint: admission.chiefComplaint || '',
          triageLevel: admission.triageLevel || '',
          triageNotes: admission.triageNotes || '',
          
          temperature: admission.vitalSigns?.temperature || '',
          bloodPressureSystolic: admission.vitalSigns?.bloodPressureSystolic || '',
          bloodPressureDiastolic: admission.vitalSigns?.bloodPressureDiastolic || '',
          heartRate: admission.vitalSigns?.heartRate || '',
          respiratoryRate: admission.vitalSigns?.respiratoryRate || '',
          oxygenSaturation: admission.vitalSigns?.oxygenSaturation || '',
          painScore: admission.vitalSigns?.painScore || 0,
          
          presentingSymptoms: admission.presentingSymptoms || '',
          medicalHistory: admission.medicalHistory || '',
          currentMedications: admission.currentMedications || '',
          allergies: admission.allergies || '',
          lastMealTime: admission.lastMealTime || '',
          
          assignedDoctorId: admission.assignedDoctorId || '',
          assignedNurseId: admission.assignedNurseId || '',
          bedNumber: admission.bedNumber || '',
          
          policeCase: admission.policeCase || false,
          mlcNumber: admission.mlcNumber || '',
          accidentDetails: admission.accidentDetails || '',
          insuranceInfo: admission.insuranceInfo || '',
          
          status: admission.status || 'triaged',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, admission]);

  const fetchExistingPatients = async () => {
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        const patientOptions = response.data.patients.map((p: any) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName} - ${p.medicalRecordNumber || p.id.slice(-6)}`,
        }));
        setExistingPatients(patientOptions);
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
            label: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
          }));
        setDoctors(doctorOptions);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
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
      isNewPatient: true,
      existingPatientId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(),
      gender: '',
      phone: '',
      emergencyContact: '',
      emergencyContactPhone: '',
      arrivalTime: new Date(),
      arrivalMode: 'walk_in',
      chiefComplaint: '',
      triageLevel: '',
      triageNotes: '',
      temperature: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      painScore: 0,
      presentingSymptoms: '',
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      lastMealTime: '',
      assignedDoctorId: '',
      assignedNurseId: '',
      bedNumber: '',
      policeCase: false,
      mlcNumber: '',
      accidentDetails: '',
      insuranceInfo: '',
      status: 'triaged',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.isNewPatient) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.gender) errors.gender = 'Gender is required';
    } else {
      if (!formData.existingPatientId) errors.existingPatientId = 'Please select a patient';
    }

    if (!formData.chiefComplaint.trim()) errors.chiefComplaint = 'Chief complaint is required';
    if (!formData.triageLevel) errors.triageLevel = 'Triage level is required';
    if (!formData.presentingSymptoms.trim()) errors.presentingSymptoms = 'Presenting symptoms are required';
    
    // Validate vital signs if provided
    if (formData.temperature && (parseFloat(formData.temperature) < 95 || parseFloat(formData.temperature) > 105)) {
      errors.temperature = 'Invalid temperature range (95-105°F)';
    }
    if (formData.heartRate && (parseInt(formData.heartRate) < 40 || parseInt(formData.heartRate) > 200)) {
      errors.heartRate = 'Invalid heart rate range (40-200 bpm)';
    }
    
    if (formData.policeCase && !formData.mlcNumber.trim()) {
      errors.mlcNumber = 'MLC number is required for police cases';
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
      const vitalSigns = {
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        bloodPressure: formData.bloodPressureSystolic && formData.bloodPressureDiastolic ? 
          `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}` : undefined,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : undefined,
      };

      let response;
      if (admission) {
        const updateData = {
          chiefComplaint: formData.chiefComplaint,
          triageLevel: formData.triageLevel.toUpperCase() as 'CRITICAL' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT',
          status: formData.status.toUpperCase() as 'WAITING' | 'IN_TREATMENT' | 'DISCHARGED' | 'ADMITTED' | 'TRANSFERRED',
          assignedDoctorId: formData.assignedDoctorId,
          treatmentNotes: formData.presentingSymptoms,
          vitalSigns,
        };
        response = await emergencyService.updateCase(admission.id, updateData);
      } else {
        const createData = {
          patientId: formData.existingPatientId || formData.firstName, // This needs proper patient creation logic
          chiefComplaint: formData.chiefComplaint,
          triageLevel: formData.triageLevel.toUpperCase() as 'CRITICAL' | 'URGENT' | 'SEMI_URGENT' | 'NON_URGENT',
          vitalSigns,
        };
        response = await emergencyService.createCase(createData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: admission ? 'Emergency admission updated successfully' : 'Emergency admission created successfully',
          color: 'green',
          icon: <IconEmergencyBed />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting emergency form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save emergency admission',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const triageLevels = [
    { value: '1', label: 'Level 1 - Resuscitation (Immediate)' },
    { value: '2', label: 'Level 2 - Emergent (15 min)' },
    { value: '3', label: 'Level 3 - Urgent (30 min)' },
    { value: '4', label: 'Level 4 - Less Urgent (60 min)' },
    { value: '5', label: 'Level 5 - Non Urgent (120 min)' },
  ];

  const arrivalModes = [
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'ambulance', label: 'Ambulance' },
    { value: 'private_vehicle', label: 'Private Vehicle' },
    { value: 'police', label: 'Police' },
    { value: 'transfer', label: 'Transfer from Other Hospital' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={admission ? 'Edit Emergency Admission' : 'New Emergency Admission'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconAmbulance size={20} />} color="red" variant="light">
            Emergency admission form. Complete triage assessment immediately.
          </Alert>

          {/* Patient Selection */}
          <Radio.Group
            label="Patient Type"
            value={formData.isNewPatient ? 'new' : 'existing'}
            onChange={(value) => setFormData({ ...formData, isNewPatient: value === 'new' })}
          >
            <Group mt="xs">
              <Radio value="new" label="New Patient" />
              <Radio value="existing" label="Existing Patient" />
            </Group>
          </Radio.Group>

          {formData.isNewPatient ? (
            <>
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
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <DatePickerInput
                    label="Date of Birth"
                    placeholder="Select date"
                    required
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
                    required
                    data={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={formData.gender}
                    onChange={(value) => setFormData({ ...formData, gender: value || '' })}
                    error={formErrors.gender}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid.Col>
              </Grid>
            </>
          ) : (
            <Select
              label="Select Patient"
              placeholder="Search and select patient"
              required
              data={existingPatients}
              value={formData.existingPatientId}
              onChange={(value) => setFormData({ ...formData, existingPatientId: value || '' })}
              error={formErrors.existingPatientId}
              searchable
            />
          )}

          {/* Emergency Contact */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact Name"
                placeholder="Enter contact name"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact Phone"
                placeholder="Enter contact phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Emergency Details */}
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'red' }}>
            Emergency Information
          </h3>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Arrival Mode"
                placeholder="Select arrival mode"
                required
                data={arrivalModes}
                value={formData.arrivalMode}
                onChange={(value) => setFormData({ ...formData, arrivalMode: value || 'walk_in' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Triage Level"
                placeholder="Select triage level"
                required
                data={triageLevels}
                value={formData.triageLevel}
                onChange={(value) => setFormData({ ...formData, triageLevel: value || '' })}
                error={formErrors.triageLevel}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Chief Complaint"
            placeholder="Enter chief complaint"
            required
            value={formData.chiefComplaint}
            onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
            error={formErrors.chiefComplaint}
          />

          <Textarea
            label="Presenting Symptoms"
            placeholder="Describe presenting symptoms"
            required
            minRows={2}
            value={formData.presentingSymptoms}
            onChange={(e) => setFormData({ ...formData, presentingSymptoms: e.target.value })}
            error={formErrors.presentingSymptoms}
          />

          {/* Vital Signs */}
          <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            Vital Signs
          </h3>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Temperature (°F)"
                placeholder="e.g., 98.6"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                error={formErrors.temperature}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Group grow>
                <TextInput
                  label="BP Systolic"
                  placeholder="120"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                />
                <TextInput
                  label="BP Diastolic"
                  placeholder="80"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                />
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Heart Rate (bpm)"
                placeholder="e.g., 72"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                error={formErrors.heartRate}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Respiratory Rate"
                placeholder="e.g., 16"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="O2 Saturation (%)"
                placeholder="e.g., 98"
                value={formData.oxygenSaturation}
                onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Pain Score (0-10)"
                placeholder="0"
                value={formData.painScore}
                onChange={(value) => setFormData({ ...formData, painScore: Number(value) || 0 })}
                min={0}
                max={10}
              />
            </Grid.Col>
          </Grid>

          {/* Clinical Information */}
          <Textarea
            label="Medical History"
            placeholder="Enter relevant medical history"
            minRows={2}
            value={formData.medicalHistory}
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Textarea
                label="Current Medications"
                placeholder="List current medications"
                minRows={2}
                value={formData.currentMedications}
                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Textarea
                label="Known Allergies"
                placeholder="List known allergies"
                minRows={2}
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Assignment */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Assigned Doctor"
                placeholder="Select doctor"
                data={doctors}
                value={formData.assignedDoctorId}
                onChange={(value) => setFormData({ ...formData, assignedDoctorId: value || '' })}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Assigned Nurse"
                placeholder="Select nurse"
                data={nurses}
                value={formData.assignedNurseId}
                onChange={(value) => setFormData({ ...formData, assignedNurseId: value || '' })}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Bed Number"
                placeholder="Enter bed number"
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Police/Legal Case */}
          <Checkbox
            label="Police/Legal Case"
            checked={formData.policeCase}
            onChange={(event) => setFormData({ ...formData, policeCase: event.currentTarget.checked })}
          />

          {formData.policeCase && (
            <>
              <TextInput
                label="MLC Number"
                placeholder="Enter MLC number"
                required
                value={formData.mlcNumber}
                onChange={(e) => setFormData({ ...formData, mlcNumber: e.target.value })}
                error={formErrors.mlcNumber}
              />
              <Textarea
                label="Accident/Incident Details"
                placeholder="Enter details"
                minRows={2}
                value={formData.accidentDetails}
                onChange={(e) => setFormData({ ...formData, accidentDetails: e.target.value })}
              />
            </>
          )}

          <Textarea
            label="Triage Notes"
            placeholder="Enter additional triage notes"
            minRows={2}
            value={formData.triageNotes}
            onChange={(e) => setFormData({ ...formData, triageNotes: e.target.value })}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="red">
              {admission ? 'Update Admission' : 'Admit Patient'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EmergencyAdmissionForm;
