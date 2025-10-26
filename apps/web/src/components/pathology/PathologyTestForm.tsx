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
  NumberInput,
  Checkbox,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconMicroscope, IconAlertCircle } from '@tabler/icons-react';
import pathologyService from '../../services/pathology.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';

interface PathologyTestFormProps {
  opened: boolean;
  onClose: () => void;
  test?: any;
  onSuccess: () => void;
}

const PathologyTestForm: React.FC<PathologyTestFormProps> = ({
  opened,
  onClose,
  test,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pathologists, setPathologists] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    requestingDoctorId: '',
    pathologistId: '',
    testType: '',
    specimenType: '',
    specimenId: '',
    collectionDate: new Date(),
    collectionTime: '',
    receivedDate: new Date(),
    clinicalHistory: '',
    provisionalDiagnosis: '',
    previousBiopsy: false,
    previousBiopsyDetails: '',
    urgentProcessing: false,
    specialStains: [] as string[],
    immunohistochemistry: false,
    ihcMarkers: '',
    frozenSection: false,
    grossDescription: '',
    microscopicDescription: '',
    diagnosis: '',
    additionalComments: '',
    reportStatus: 'pending',
    criticalValues: false,
    criticalValueDetails: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPatients();
      fetchDoctors();
      fetchPathologists();
      
      if (test) {
        // Edit mode
        setFormData({
          patientId: test.patientId || '',
          requestingDoctorId: test.requestingDoctorId || '',
          pathologistId: test.pathologistId || '',
          testType: test.testType || '',
          specimenType: test.specimenType || '',
          specimenId: test.specimenId || '',
          collectionDate: test.collectionDate ? new Date(test.collectionDate) : new Date(),
          collectionTime: test.collectionTime || '',
          receivedDate: test.receivedDate ? new Date(test.receivedDate) : new Date(),
          clinicalHistory: test.clinicalHistory || '',
          provisionalDiagnosis: test.provisionalDiagnosis || '',
          previousBiopsy: test.previousBiopsy || false,
          previousBiopsyDetails: test.previousBiopsyDetails || '',
          urgentProcessing: test.urgentProcessing || false,
          specialStains: test.specialStains || [],
          immunohistochemistry: test.immunohistochemistry || false,
          ihcMarkers: test.ihcMarkers || '',
          frozenSection: test.frozenSection || false,
          grossDescription: test.grossDescription || '',
          microscopicDescription: test.microscopicDescription || '',
          diagnosis: test.diagnosis || '',
          additionalComments: test.additionalComments || '',
          reportStatus: test.reportStatus || 'pending',
          criticalValues: test.criticalValues || false,
          criticalValueDetails: test.criticalValueDetails || '',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, test]);

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

  const fetchPathologists = async () => {
    try {
      const response = await staffService.getStaff({ role: 'DOCTOR', limit: 100 });
      if (response.success && response.data) {
        // Filter for pathologists (doctors with pathology specialization)
        const pathologistOptions = response.data.staff
          .filter((s: any) => s.user?.role === 'DOCTOR')
          .map((d: any) => ({
            value: d.id,
            label: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
          }));
        setPathologists(pathologistOptions);
      }
    } catch (error) {
      console.error('Error fetching pathologists:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      requestingDoctorId: '',
      pathologistId: '',
      testType: '',
      specimenType: '',
      specimenId: '',
      collectionDate: new Date(),
      collectionTime: '',
      receivedDate: new Date(),
      clinicalHistory: '',
      provisionalDiagnosis: '',
      previousBiopsy: false,
      previousBiopsyDetails: '',
      urgentProcessing: false,
      specialStains: [],
      immunohistochemistry: false,
      ihcMarkers: '',
      frozenSection: false,
      grossDescription: '',
      microscopicDescription: '',
      diagnosis: '',
      additionalComments: '',
      reportStatus: 'pending',
      criticalValues: false,
      criticalValueDetails: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.requestingDoctorId) errors.requestingDoctorId = 'Requesting doctor is required';
    if (!formData.testType) errors.testType = 'Test type is required';
    if (!formData.specimenType) errors.specimenType = 'Specimen type is required';
    if (!formData.specimenId.trim()) errors.specimenId = 'Specimen ID is required';
    if (!formData.clinicalHistory.trim()) errors.clinicalHistory = 'Clinical history is required';
    
    if (formData.previousBiopsy && !formData.previousBiopsyDetails.trim()) {
      errors.previousBiopsyDetails = 'Previous biopsy details are required';
    }
    
    if (formData.immunohistochemistry && !formData.ihcMarkers.trim()) {
      errors.ihcMarkers = 'IHC markers must be specified';
    }
    
    if (formData.criticalValues && !formData.criticalValueDetails.trim()) {
      errors.criticalValueDetails = 'Critical value details are required';
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
      let response;
      if (test) {
        const updateData = {
          status: formData.reportStatus.toUpperCase() as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
          notes: formData.additionalComments,
          priority: formData.urgentProcessing ? 'URGENT' as const : 'NORMAL' as const,
        };
        response = await pathologyService.updateOrder(test.id, updateData);
      } else {
        const createData = {
          patientId: formData.patientId,
          doctorId: formData.requestingDoctorId,
          tests: [formData.testType], // Array of test IDs
          notes: formData.clinicalHistory,
          priority: formData.urgentProcessing ? 'URGENT' as const : 'NORMAL' as const,
          sampleCollectionDate: formData.collectionDate.toISOString(),
        };
        response = await pathologyService.createOrder(createData);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: test ? 'Pathology test updated successfully' : 'Pathology test created successfully',
          color: 'green',
          icon: <IconMicroscope />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting pathology form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save pathology test',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const testTypes = [
    { value: 'histopathology', label: 'Histopathology' },
    { value: 'cytology', label: 'Cytology' },
    { value: 'hematopathology', label: 'Hematopathology' },
    { value: 'immunopathology', label: 'Immunopathology' },
    { value: 'molecular_pathology', label: 'Molecular Pathology' },
    { value: 'autopsy', label: 'Autopsy' },
    { value: 'bone_marrow', label: 'Bone Marrow Examination' },
    { value: 'fnac', label: 'Fine Needle Aspiration Cytology' },
    { value: 'fluid_cytology', label: 'Fluid Cytology' },
  ];

  const specimenTypes = [
    { value: 'biopsy', label: 'Biopsy' },
    { value: 'excision', label: 'Excision' },
    { value: 'resection', label: 'Resection' },
    { value: 'aspiration', label: 'Aspiration' },
    { value: 'blood', label: 'Blood' },
    { value: 'bone_marrow', label: 'Bone Marrow' },
    { value: 'fluid', label: 'Body Fluid' },
    { value: 'smear', label: 'Smear' },
    { value: 'tissue', label: 'Tissue' },
  ];

  const specialStainOptions = [
    { value: 'pas', label: 'PAS (Periodic Acid-Schiff)' },
    { value: 'acid_fast', label: 'Acid Fast (AFB)' },
    { value: 'giemsa', label: 'Giemsa' },
    { value: 'silver', label: 'Silver Stain' },
    { value: 'trichrome', label: 'Trichrome' },
    { value: 'iron', label: 'Iron Stain' },
    { value: 'congo_red', label: 'Congo Red' },
    { value: 'reticulin', label: 'Reticulin' },
    { value: 'mucin', label: 'Mucin Stains' },
    { value: 'elastic', label: 'Elastic Stain' },
  ];

  const reportStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'preliminary', label: 'Preliminary' },
    { value: 'final', label: 'Final' },
    { value: 'amended', label: 'Amended' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={test ? 'Edit Pathology Test' : 'New Pathology Test'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconMicroscope size={20} />} color="blue" variant="light">
            Enter pathology test details. Ensure proper specimen handling and chain of custody.
          </Alert>

          {/* Patient and Doctor Information */}
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

          {/* Test Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Test Type"
                placeholder="Select test type"
                required
                data={testTypes}
                value={formData.testType}
                onChange={(value) => setFormData({ ...formData, testType: value || '' })}
                error={formErrors.testType}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Specimen Type"
                placeholder="Select specimen type"
                required
                data={specimenTypes}
                value={formData.specimenType}
                onChange={(value) => setFormData({ ...formData, specimenType: value || '' })}
                error={formErrors.specimenType}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Specimen ID"
                placeholder="Enter unique specimen ID"
                required
                value={formData.specimenId}
                onChange={(e) => setFormData({ ...formData, specimenId: e.target.value })}
                error={formErrors.specimenId}
              />
            </Grid.Col>
          </Grid>

          {/* Collection and Receipt Dates */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <DatePickerInput
                label="Collection Date"
                placeholder="Select date"
                required
                value={formData.collectionDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, collectionDate: dateValue });
                }}
                maxDate={new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <TimeInput
                label="Collection Time"
                placeholder="Select time"
                value={formData.collectionTime}
                onChange={(event) => setFormData({ ...formData, collectionTime: event.currentTarget.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <DatePickerInput
                label="Received Date"
                placeholder="Select date"
                required
                value={formData.receivedDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, receivedDate: dateValue });
                }}
                minDate={formData.collectionDate}
                maxDate={new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label="Assigned Pathologist"
                placeholder="Select pathologist"
                data={pathologists}
                value={formData.pathologistId}
                onChange={(value) => setFormData({ ...formData, pathologistId: value || '' })}
                searchable
                clearable
              />
            </Grid.Col>
          </Grid>

          {/* Clinical Information */}
          <Textarea
            label="Clinical History"
            placeholder="Enter relevant clinical history"
            required
            minRows={2}
            value={formData.clinicalHistory}
            onChange={(e) => setFormData({ ...formData, clinicalHistory: e.target.value })}
            error={formErrors.clinicalHistory}
          />

          <TextInput
            label="Provisional Diagnosis"
            placeholder="Enter provisional diagnosis"
            value={formData.provisionalDiagnosis}
            onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })}
          />

          {/* Previous Biopsy */}
          <Stack gap="xs">
            <Checkbox
              label="Previous Biopsy Available"
              checked={formData.previousBiopsy}
              onChange={(event) => setFormData({ ...formData, previousBiopsy: event.currentTarget.checked })}
            />
            
            {formData.previousBiopsy && (
              <Textarea
                label="Previous Biopsy Details"
                placeholder="Enter previous biopsy details and findings"
                required
                minRows={2}
                value={formData.previousBiopsyDetails}
                onChange={(e) => setFormData({ ...formData, previousBiopsyDetails: e.target.value })}
                error={formErrors.previousBiopsyDetails}
              />
            )}
          </Stack>

          {/* Processing Options */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Checkbox
                label="Urgent Processing Required"
                checked={formData.urgentProcessing}
                onChange={(event) => setFormData({ ...formData, urgentProcessing: event.currentTarget.checked })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Checkbox
                label="Frozen Section Required"
                checked={formData.frozenSection}
                onChange={(event) => setFormData({ ...formData, frozenSection: event.currentTarget.checked })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Checkbox
                label="Immunohistochemistry Required"
                checked={formData.immunohistochemistry}
                onChange={(event) => setFormData({ ...formData, immunohistochemistry: event.currentTarget.checked })}
              />
            </Grid.Col>
          </Grid>

          {/* Special Stains */}
          <MultiSelect
            label="Special Stains Required"
            placeholder="Select special stains if needed"
            data={specialStainOptions}
            value={formData.specialStains}
            onChange={(value) => setFormData({ ...formData, specialStains: value })}
            searchable
          />

          {formData.immunohistochemistry && (
            <Textarea
              label="IHC Markers"
              placeholder="Specify immunohistochemistry markers required"
              required
              minRows={2}
              value={formData.ihcMarkers}
              onChange={(e) => setFormData({ ...formData, ihcMarkers: e.target.value })}
              error={formErrors.ihcMarkers}
            />
          )}

          {/* Pathology Findings (for editing/reporting) */}
          {test && (
            <>
              <Textarea
                label="Gross Description"
                placeholder="Enter gross examination findings"
                minRows={3}
                value={formData.grossDescription}
                onChange={(e) => setFormData({ ...formData, grossDescription: e.target.value })}
              />

              <Textarea
                label="Microscopic Description"
                placeholder="Enter microscopic examination findings"
                minRows={3}
                value={formData.microscopicDescription}
                onChange={(e) => setFormData({ ...formData, microscopicDescription: e.target.value })}
              />

              <Textarea
                label="Diagnosis"
                placeholder="Enter pathological diagnosis"
                minRows={2}
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </>
          )}

          {/* Critical Values */}
          <Stack gap="xs">
            <Checkbox
              label="Critical Values Present"
              checked={formData.criticalValues}
              onChange={(event) => setFormData({ ...formData, criticalValues: event.currentTarget.checked })}
            />
            
            {formData.criticalValues && (
              <Textarea
                label="Critical Value Details"
                placeholder="Describe critical values that need immediate attention"
                required
                minRows={2}
                value={formData.criticalValueDetails}
                onChange={(e) => setFormData({ ...formData, criticalValueDetails: e.target.value })}
                error={formErrors.criticalValueDetails}
              />
            )}
          </Stack>

          <Textarea
            label="Additional Comments"
            placeholder="Enter any additional comments or special instructions"
            minRows={2}
            value={formData.additionalComments}
            onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
          />

          {test && (
            <Select
              label="Report Status"
              placeholder="Select status"
              data={reportStatuses}
              value={formData.reportStatus}
              onChange={(value) => setFormData({ ...formData, reportStatus: value || 'pending' })}
            />
          )}

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {test ? 'Update Test' : 'Create Test'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default PathologyTestForm;
