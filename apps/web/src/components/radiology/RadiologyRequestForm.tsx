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
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconRadioactive, IconAlertCircle } from '@tabler/icons-react';
import radiologyService from '../../services/radiology.service';
import patientsService from '../../services/patients.service';
import staffService from '../../services/staff.service';

interface RadiologyRequestFormProps {
  opened: boolean;
  onClose: () => void;
  request?: any;
  onSuccess: () => void;
}

const RadiologyRequestForm: React.FC<RadiologyRequestFormProps> = ({
  opened,
  onClose,
  request,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [radiologists, setRadiologists] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    requestingDoctorId: '',
    radiologistId: '',
    examinationType: '',
    bodyPart: '',
    laterality: '',
    priority: 'routine',
    scheduledDate: new Date(),
    scheduledTime: '',
    clinicalHistory: '',
    provisionalDiagnosis: '',
    reasonForExamination: '',
    contrastRequired: false,
    contrastType: '',
    allergies: '',
    pregnancyStatus: 'not_applicable',
    previousImaging: false,
    previousImagingDetails: '',
    specialInstructions: '',
    urgentReporting: false,
    status: 'requested',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPatients();
      fetchDoctors();
      fetchRadiologists();
      
      if (request) {
        // Edit mode - populate form with existing data
        setFormData({
          patientId: request.patientId || '',
          requestingDoctorId: request.requestingDoctorId || '',
          radiologistId: request.radiologistId || '',
          examinationType: request.examinationType || '',
          bodyPart: request.bodyPart || '',
          laterality: request.laterality || '',
          priority: request.priority || 'routine',
          scheduledDate: request.scheduledDate ? new Date(request.scheduledDate) : new Date(),
          scheduledTime: request.scheduledTime || '',
          clinicalHistory: request.clinicalHistory || '',
          provisionalDiagnosis: request.provisionalDiagnosis || '',
          reasonForExamination: request.reasonForExamination || '',
          contrastRequired: request.contrastRequired || false,
          contrastType: request.contrastType || '',
          allergies: request.allergies || '',
          pregnancyStatus: request.pregnancyStatus || 'not_applicable',
          previousImaging: request.previousImaging || false,
          previousImagingDetails: request.previousImagingDetails || '',
          specialInstructions: request.specialInstructions || '',
          urgentReporting: request.urgentReporting || false,
          status: request.status || 'requested',
        });
      } else {
        // Add mode - reset form
        resetForm();
      }
    }
  }, [opened, request]);

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

  const fetchRadiologists = async () => {
    try {
      // Fetch radiologists (doctors with radiology specialization)
      const response = await staffService.getStaff({ role: 'DOCTOR', limit: 100 });
      if (response.success && response.data) {
        const radiologistOptions = response.data.staff
          .filter((s: any) => s.user?.role === 'DOCTOR' && 
            (s.user?.specialization?.toLowerCase().includes('radiol') || 
             s.department?.toLowerCase().includes('radiol')))
          .map((r: any) => ({
            value: r.id,
            label: `Dr. ${r.user?.firstName} ${r.user?.lastName} - Radiologist`,
          }));
        
        // If no radiologists found, use all doctors
        if (radiologistOptions.length === 0) {
          const allDoctorOptions = response.data.staff
            .filter((s: any) => s.user?.role === 'DOCTOR')
            .map((d: any) => ({
              value: d.id,
              label: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
            }));
          setRadiologists(allDoctorOptions);
        } else {
          setRadiologists(radiologistOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching radiologists:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      requestingDoctorId: '',
      radiologistId: '',
      examinationType: '',
      bodyPart: '',
      laterality: '',
      priority: 'routine',
      scheduledDate: new Date(),
      scheduledTime: '',
      clinicalHistory: '',
      provisionalDiagnosis: '',
      reasonForExamination: '',
      contrastRequired: false,
      contrastType: '',
      allergies: '',
      pregnancyStatus: 'not_applicable',
      previousImaging: false,
      previousImagingDetails: '',
      specialInstructions: '',
      urgentReporting: false,
      status: 'requested',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.requestingDoctorId) errors.requestingDoctorId = 'Requesting doctor is required';
    if (!formData.examinationType) errors.examinationType = 'Examination type is required';
    if (!formData.bodyPart.trim()) errors.bodyPart = 'Body part is required';
    if (!formData.reasonForExamination.trim()) errors.reasonForExamination = 'Reason for examination is required';
    if (!formData.clinicalHistory.trim()) errors.clinicalHistory = 'Clinical history is required';
    
    if (formData.contrastRequired && !formData.contrastType) {
      errors.contrastType = 'Contrast type is required when contrast is needed';
    }
    
    if (formData.previousImaging && !formData.previousImagingDetails.trim()) {
      errors.previousImagingDetails = 'Previous imaging details are required';
    }

    // Validate scheduled date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(formData.scheduledDate);
    scheduledDate.setHours(0, 0, 0, 0);
    if (scheduledDate < today && formData.priority !== 'urgent') {
      errors.scheduledDate = 'Scheduled date cannot be in the past for non-urgent requests';
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
        scheduledDate: formData.scheduledDate.toISOString(),
      };

      let response;
      if (request) {
        response = await radiologyService.updateStudy(request.id, submitData as any);
      } else {
        response = await radiologyService.createStudy(submitData as any);
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: request ? 'Radiology request updated successfully' : 'Radiology request created successfully',
          color: 'green',
          icon: <IconRadioactive />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting radiology form:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save radiology request',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const examinationTypes = [
    { value: 'xray', label: 'X-Ray' },
    { value: 'ct', label: 'CT Scan' },
    { value: 'mri', label: 'MRI' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'mammography', label: 'Mammography' },
    { value: 'fluoroscopy', label: 'Fluoroscopy' },
    { value: 'pet', label: 'PET Scan' },
    { value: 'nuclear', label: 'Nuclear Medicine' },
    { value: 'angiography', label: 'Angiography' },
    { value: 'dexa', label: 'DEXA Scan' },
  ];

  const bodyParts = [
    { value: 'head', label: 'Head' },
    { value: 'neck', label: 'Neck' },
    { value: 'chest', label: 'Chest' },
    { value: 'abdomen', label: 'Abdomen' },
    { value: 'pelvis', label: 'Pelvis' },
    { value: 'spine', label: 'Spine' },
    { value: 'upper_extremity', label: 'Upper Extremity' },
    { value: 'lower_extremity', label: 'Lower Extremity' },
    { value: 'whole_body', label: 'Whole Body' },
  ];

  const lateralities = [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'bilateral', label: 'Bilateral' },
    { value: 'not_applicable', label: 'Not Applicable' },
  ];

  const priorities = [
    { value: 'urgent', label: 'Urgent (STAT)' },
    { value: 'high', label: 'High Priority' },
    { value: 'routine', label: 'Routine' },
    { value: 'scheduled', label: 'Scheduled' },
  ];

  const contrastTypes = [
    { value: 'iodinated', label: 'Iodinated Contrast' },
    { value: 'gadolinium', label: 'Gadolinium-based' },
    { value: 'barium', label: 'Barium Sulfate' },
    { value: 'gastrografin', label: 'Gastrografin' },
    { value: 'microbubble', label: 'Microbubble' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={request ? 'Edit Radiology Request' : 'New Radiology Request'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Request Information */}
          <Alert icon={<IconRadioactive size={20} />} color="blue" variant="light">
            Enter radiology examination request details. All fields marked with * are required.
          </Alert>

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

          {/* Examination Details */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Examination Type"
                placeholder="Select type"
                required
                data={examinationTypes}
                value={formData.examinationType}
                onChange={(value) => setFormData({ ...formData, examinationType: value || '' })}
                error={formErrors.examinationType}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Body Part/Region"
                placeholder="e.g., Chest, Left Knee"
                required
                value={formData.bodyPart}
                onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                error={formErrors.bodyPart}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Laterality"
                placeholder="Select laterality"
                data={lateralities}
                value={formData.laterality}
                onChange={(value) => setFormData({ ...formData, laterality: value || '' })}
              />
            </Grid.Col>
          </Grid>

          {/* Clinical Information */}
          <Textarea
            label="Clinical History"
            placeholder="Enter patient's relevant clinical history"
            required
            minRows={2}
            value={formData.clinicalHistory}
            onChange={(e) => setFormData({ ...formData, clinicalHistory: e.target.value })}
            error={formErrors.clinicalHistory}
          />

          <Textarea
            label="Reason for Examination"
            placeholder="Enter the reason for requesting this examination"
            required
            minRows={2}
            value={formData.reasonForExamination}
            onChange={(e) => setFormData({ ...formData, reasonForExamination: e.target.value })}
            error={formErrors.reasonForExamination}
          />

          <TextInput
            label="Provisional Diagnosis"
            placeholder="Enter provisional diagnosis"
            value={formData.provisionalDiagnosis}
            onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })}
          />

          {/* Scheduling */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Priority"
                placeholder="Select priority"
                required
                data={priorities}
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value || 'routine' })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DatePickerInput
                label="Scheduled Date"
                placeholder="Select date"
                required
                value={formData.scheduledDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, scheduledDate: dateValue });
                }}
                error={formErrors.scheduledDate}
                minDate={formData.priority === 'urgent' ? undefined : new Date()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TimeInput
                label="Scheduled Time"
                placeholder="Select time"
                value={formData.scheduledTime}
                onChange={(event) => setFormData({ ...formData, scheduledTime: event.currentTarget.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Contrast Information */}
          <Stack gap="xs">
            <Checkbox
              label="Contrast Required"
              checked={formData.contrastRequired}
              onChange={(event) => setFormData({ ...formData, contrastRequired: event.currentTarget.checked })}
            />
            
            {formData.contrastRequired && (
              <Select
                label="Contrast Type"
                placeholder="Select contrast type"
                required
                data={contrastTypes}
                value={formData.contrastType}
                onChange={(value) => setFormData({ ...formData, contrastType: value || '' })}
                error={formErrors.contrastType}
              />
            )}
          </Stack>

          {/* Patient Safety Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Known Allergies"
                placeholder="Enter any known allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Radio.Group
                label="Pregnancy Status"
                value={formData.pregnancyStatus}
                onChange={(value) => setFormData({ ...formData, pregnancyStatus: value })}
              >
                <Group mt="xs">
                  <Radio value="not_applicable" label="N/A" />
                  <Radio value="not_pregnant" label="Not Pregnant" />
                  <Radio value="pregnant" label="Pregnant" />
                  <Radio value="unknown" label="Unknown" />
                </Group>
              </Radio.Group>
            </Grid.Col>
          </Grid>

          {/* Previous Imaging */}
          <Stack gap="xs">
            <Checkbox
              label="Previous Imaging Available"
              checked={formData.previousImaging}
              onChange={(event) => setFormData({ ...formData, previousImaging: event.currentTarget.checked })}
            />
            
            {formData.previousImaging && (
              <Textarea
                label="Previous Imaging Details"
                placeholder="Describe previous imaging studies"
                required
                minRows={2}
                value={formData.previousImagingDetails}
                onChange={(e) => setFormData({ ...formData, previousImagingDetails: e.target.value })}
                error={formErrors.previousImagingDetails}
              />
            )}
          </Stack>

          {/* Additional Information */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Assigned Radiologist"
                placeholder="Select radiologist (optional)"
                data={radiologists}
                value={formData.radiologistId}
                onChange={(value) => setFormData({ ...formData, radiologistId: value || '' })}
                searchable
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack justify="center" style={{ height: '100%' }}>
                <Checkbox
                  label="Urgent Reporting Required"
                  checked={formData.urgentReporting}
                  onChange={(event) => setFormData({ ...formData, urgentReporting: event.currentTarget.checked })}
                />
              </Stack>
            </Grid.Col>
          </Grid>

          <Textarea
            label="Special Instructions"
            placeholder="Enter any special instructions for the radiologist"
            minRows={2}
            value={formData.specialInstructions}
            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {request ? 'Update Request' : 'Create Request'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default RadiologyRequestForm;
