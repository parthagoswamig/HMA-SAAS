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
  MultiSelect,
  Checkbox,
  NumberInput,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconFlask, IconAlertCircle } from '@tabler/icons-react';
import laboratoryService from '../../services/laboratory.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';

interface LabTestRequestFormProps {
  opened: boolean;
  onClose: () => void;
  testRequest?: any;
  onSuccess: () => void;
}

const LabTestRequestForm: React.FC<LabTestRequestFormProps> = ({
  opened,
  onClose,
  testRequest,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    requestingDoctorId: '',
    testIds: [] as string[],
    sampleType: '',
    sampleCollectionDate: new Date(),
    sampleCollectionTime: '',
    priority: 'routine',
    clinicalHistory: '',
    provisionalDiagnosis: '',
    reasonForTest: '',
    fastingRequired: false,
    fastingDuration: 0,
    specialInstructions: '',
    urgentReporting: false,
    sampleCollected: false,
    collectedBy: '',
    status: 'requested',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPatients();
      fetchDoctors();
      fetchLabTests();
      
      if (testRequest) {
        // Edit mode
        setFormData({
          patientId: testRequest.patientId || '',
          requestingDoctorId: testRequest.requestingDoctorId || '',
          testIds: testRequest.testIds || [],
          sampleType: testRequest.sampleType || '',
          sampleCollectionDate: testRequest.sampleCollectionDate ? new Date(testRequest.sampleCollectionDate) : new Date(),
          sampleCollectionTime: testRequest.sampleCollectionTime || '',
          priority: testRequest.priority || 'routine',
          clinicalHistory: testRequest.clinicalHistory || '',
          provisionalDiagnosis: testRequest.provisionalDiagnosis || '',
          reasonForTest: testRequest.reasonForTest || '',
          fastingRequired: testRequest.fastingRequired || false,
          fastingDuration: testRequest.fastingDuration || 0,
          specialInstructions: testRequest.specialInstructions || '',
          urgentReporting: testRequest.urgentReporting || false,
          sampleCollected: testRequest.sampleCollected || false,
          collectedBy: testRequest.collectedBy || '',
          status: testRequest.status || 'requested',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, testRequest]);

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
            label: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
          }));
        setDoctors(doctorOptions);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchLabTests = async () => {
    // Mock lab tests - would fetch from API
    const tests = [
      { value: 'cbc', label: 'Complete Blood Count (CBC)' },
      { value: 'blood_sugar', label: 'Blood Sugar' },
      { value: 'lipid_profile', label: 'Lipid Profile' },
      { value: 'liver_function', label: 'Liver Function Test' },
      { value: 'kidney_function', label: 'Kidney Function Test' },
      { value: 'thyroid', label: 'Thyroid Profile' },
      { value: 'urine_routine', label: 'Urine Routine' },
      { value: 'stool_routine', label: 'Stool Routine' },
      { value: 'blood_culture', label: 'Blood Culture' },
      { value: 'electrolytes', label: 'Electrolytes' },
      { value: 'hba1c', label: 'HbA1c' },
      { value: 'vitamin_d', label: 'Vitamin D' },
      { value: 'vitamin_b12', label: 'Vitamin B12' },
      { value: 'iron_studies', label: 'Iron Studies' },
      { value: 'cardiac_markers', label: 'Cardiac Markers' },
    ];
    setLabTests(tests);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      requestingDoctorId: '',
      testIds: [],
      sampleType: '',
      sampleCollectionDate: new Date(),
      sampleCollectionTime: '',
      priority: 'routine',
      clinicalHistory: '',
      provisionalDiagnosis: '',
      reasonForTest: '',
      fastingRequired: false,
      fastingDuration: 0,
      specialInstructions: '',
      urgentReporting: false,
      sampleCollected: false,
      collectedBy: '',
      status: 'requested',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.requestingDoctorId) errors.requestingDoctorId = 'Requesting doctor is required';
    if (formData.testIds.length === 0) errors.testIds = 'At least one test must be selected';
    if (!formData.sampleType) errors.sampleType = 'Sample type is required';
    if (!formData.reasonForTest.trim()) errors.reasonForTest = 'Reason for test is required';
    if (!formData.clinicalHistory.trim()) errors.clinicalHistory = 'Clinical history is required';
    
    if (formData.fastingRequired && formData.fastingDuration <= 0) {
      errors.fastingDuration = 'Fasting duration must be specified';
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
        doctorId: formData.requestingDoctorId,
        tests: formData.testIds,
        notes: formData.specialInstructions || formData.clinicalHistory,
        priority: formData.priority,
      };

      let response;
      if (testRequest) {
        response = await laboratoryService.updateLabOrder(testRequest.id, {
          status: formData.status,
          notes: formData.specialInstructions,
        });
      } else {
        response = await laboratoryService.createLabOrder(submitData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: testRequest ? 'Lab test request updated successfully' : 'Lab test request created successfully',
          color: 'green',
          icon: <IconFlask />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting lab test form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save lab test request',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleTypes = [
    { value: 'blood', label: 'Blood' },
    { value: 'urine', label: 'Urine' },
    { value: 'stool', label: 'Stool' },
    { value: 'sputum', label: 'Sputum' },
    { value: 'csf', label: 'CSF' },
    { value: 'tissue', label: 'Tissue' },
    { value: 'fluid', label: 'Body Fluid' },
    { value: 'swab', label: 'Swab' },
    { value: 'aspirate', label: 'Aspirate' },
  ];

  const priorities = [
    { value: 'stat', label: 'STAT (Immediate)' },
    { value: 'urgent', label: 'Urgent (2 hours)' },
    { value: 'routine', label: 'Routine (24 hours)' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={testRequest ? 'Edit Lab Test Request' : 'New Lab Test Request'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconFlask size={20} />} color="blue" variant="light">
            Enter laboratory test request details. Ensure sample collection guidelines are followed.
          </Alert>

          {/* Patient and Doctor */}
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
                label="Requesting Doctor"
                placeholder="Select doctor"
                required
                data={doctors}
                value={formData.requestingDoctorId}
                onChange={(value) => setFormData({ ...formData, requestingDoctorId: value || '' })}
                error={formErrors.requestingDoctorId}
                searchable
              />
            </Grid.Col>
          </Grid>

          {/* Test Selection */}
          <MultiSelect
            label="Laboratory Tests"
            placeholder="Select tests to perform"
            required
            data={labTests}
            value={formData.testIds}
            onChange={(value) => setFormData({ ...formData, testIds: value })}
            error={formErrors.testIds}
            searchable
          />

          {/* Sample Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Sample Type"
                placeholder="Select sample type"
                required
                data={sampleTypes}
                value={formData.sampleType}
                onChange={(value) => setFormData({ ...formData, sampleType: value || '' })}
                error={formErrors.sampleType}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="Collection Date"
                placeholder="Select date"
                required
                value={formData.sampleCollectionDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, sampleCollectionDate: dateValue });
                }}
                minDate={new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TimeInput
                label="Collection Time"
                placeholder="Select time"
                value={formData.sampleCollectionTime}
                onChange={(event) => setFormData({ ...formData, sampleCollectionTime: event.currentTarget.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Priority and Fasting */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Priority"
                placeholder="Select priority"
                required
                data={priorities}
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value || 'routine' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Checkbox
                  label="Fasting Required"
                  checked={formData.fastingRequired}
                  onChange={(event) => setFormData({ ...formData, fastingRequired: event.currentTarget.checked })}
                />
                {formData.fastingRequired && (
                  <NumberInput
                    label="Fasting Duration (hours)"
                    placeholder="Enter hours"
                    required
                    value={formData.fastingDuration}
                    onChange={(value) => setFormData({ ...formData, fastingDuration: Number(value) || 0 })}
                    error={formErrors.fastingDuration}
                    min={0}
                    max={24}
                  />
                )}
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Clinical Information */}
          <Textarea
            label="Clinical History"
            placeholder="Enter patient's clinical history"
            required
            minRows={2}
            value={formData.clinicalHistory}
            onChange={(e) => setFormData({ ...formData, clinicalHistory: e.target.value })}
            error={formErrors.clinicalHistory}
          />

          <Textarea
            label="Reason for Test"
            placeholder="Enter the reason for requesting these tests"
            required
            minRows={2}
            value={formData.reasonForTest}
            onChange={(e) => setFormData({ ...formData, reasonForTest: e.target.value })}
            error={formErrors.reasonForTest}
          />

          <TextInput
            label="Provisional Diagnosis"
            placeholder="Enter provisional diagnosis"
            value={formData.provisionalDiagnosis}
            onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })}
          />

          <Textarea
            label="Special Instructions"
            placeholder="Enter any special instructions for the lab"
            minRows={2}
            value={formData.specialInstructions}
            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
          />

          {/* Sample Collection Status */}
          <Stack gap="xs">
            <Checkbox
              label="Sample Collected"
              checked={formData.sampleCollected}
              onChange={(event) => setFormData({ ...formData, sampleCollected: event.currentTarget.checked })}
            />
            
            {formData.sampleCollected && (
              <TextInput
                label="Collected By"
                placeholder="Enter name of person who collected sample"
                value={formData.collectedBy}
                onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
              />
            )}

            <Checkbox
              label="Urgent Reporting Required"
              checked={formData.urgentReporting}
              onChange={(event) => setFormData({ ...formData, urgentReporting: event.currentTarget.checked })}
            />
          </Stack>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {testRequest ? 'Update Request' : 'Create Request'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default LabTestRequestForm;
