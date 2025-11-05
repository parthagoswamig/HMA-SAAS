'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  NumberInput,
  Textarea,
  LoadingOverlay,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import patientsService from '../../services/patients.service';
import type {
  CreateInsuranceClaimDto,
  UpdateInsuranceClaimDto,
} from '../../services/insurance.service';

interface InsuranceClaimFormProps {
  opened: boolean;
  onClose: () => void;
  claim?: any;
  onSubmit: (data: CreateInsuranceClaimDto | UpdateInsuranceClaimDto) => Promise<void>;
}

const INSURANCE_PROVIDERS = [
  { value: 'STAR_HEALTH', label: 'Star Health Insurance' },
  { value: 'ICICI_LOMBARD', label: 'ICICI Lombard' },
  { value: 'HDFC_ERGO', label: 'HDFC ERGO' },
  { value: 'MAX_BUPA', label: 'Max Bupa' },
  { value: 'CARE_HEALTH', label: 'Care Health Insurance' },
  { value: 'BAJAJ_ALLIANZ', label: 'Bajaj Allianz' },
  { value: 'RELIANCE_GENERAL', label: 'Reliance General Insurance' },
  { value: 'TATA_AIG', label: 'Tata AIG' },
  { value: 'NEW_INDIA', label: 'New India Assurance' },
  { value: 'ORIENTAL', label: 'Oriental Insurance' },
  { value: 'NATIONAL', label: 'National Insurance' },
  { value: 'UNITED_INDIA', label: 'United India Insurance' },
  { value: 'OTHER', label: 'Other' },
];

function InsuranceClaimForm({ opened, onClose, claim, onSubmit }: InsuranceClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    insuranceProvider: '',
    policyNumber: '',
    claimNumber: '',
    amount: 0,
    diagnosis: '',
    treatmentDetails: '',
    submittedAt: new Date(),
    notes: '',
  });

  useEffect(() => {
    if (opened) {
      fetchPatients();
      if (claim) {
        setFormData({
          patientId: claim.patientId || '',
          insuranceProvider: claim.insuranceProvider || '',
          policyNumber: claim.policyNumber || '',
          claimNumber: claim.claimNumber || '',
          amount: claim.amount || 0,
          diagnosis: claim.diagnosis || '',
          treatmentDetails: claim.treatmentDetails || '',
          submittedAt: claim.submittedAt ? new Date(claim.submittedAt) : new Date(),
          notes: claim.notes || '',
        });
      } else {
        resetForm();
      }
    }
  }, [opened, claim]);

  const fetchPatients = async () => {
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        setPatients(
          response.data.patients.map((patient: any) => ({
            value: patient.id,
            label: `${patient.firstName} ${patient.lastName} (${patient.mrn})`,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load patients',
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      insuranceProvider: '',
      policyNumber: '',
      claimNumber: '',
      amount: 0,
      diagnosis: '',
      treatmentDetails: '',
      submittedAt: new Date(),
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.patientId) {
      notifications.show({
        title: 'Validation Error',
        message: 'Patient is required',
        color: 'red',
      });
      return;
    }

    if (!formData.insuranceProvider) {
      notifications.show({
        title: 'Validation Error',
        message: 'Insurance provider is required',
        color: 'red',
      });
      return;
    }

    if (!formData.policyNumber.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Policy number is required',
        color: 'red',
      });
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Claim amount must be greater than 0',
        color: 'red',
      });
      return;
    }

    if (!formData.diagnosis.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Diagnosis is required',
        color: 'red',
      });
      return;
    }

    if (!formData.treatmentDetails.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Treatment details are required',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        submittedAt: formData.submittedAt.toISOString(),
        claimNumber: formData.claimNumber || undefined,
        notes: formData.notes || undefined,
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
      title={claim ? 'Edit Insurance Claim' : 'Create New Insurance Claim'}
      size="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {/* Patient Selection */}
          <Select
            label="Patient"
            placeholder="Select patient"
            required
            data={patients}
            value={formData.patientId}
            onChange={(value) => setFormData({ ...formData, patientId: value || '' })}
            searchable
            disabled={!!claim}
          />

          {/* Insurance Provider */}
          <Select
            label="Insurance Provider"
            placeholder="Select insurance provider"
            required
            data={INSURANCE_PROVIDERS}
            value={formData.insuranceProvider}
            onChange={(value) => setFormData({ ...formData, insuranceProvider: value || '' })}
            searchable
          />

          {/* Policy Number */}
          <TextInput
            label="Policy Number"
            placeholder="Enter policy number"
            required
            value={formData.policyNumber}
            onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
          />

          {/* Claim Number */}
          <TextInput
            label="Claim Number"
            placeholder="Enter claim number (optional)"
            value={formData.claimNumber}
            onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
          />

          {/* Claim Amount */}
          <NumberInput
            label="Claim Amount"
            placeholder="Enter claim amount"
            required
            min={0}
            value={formData.amount}
            onChange={(value) => setFormData({ ...formData, amount: Number(value) || 0 })}
            prefix="₹"
            thousandSeparator=","
            decimalScale={2}
          />

          {/* Submitted Date */}
          <DatePickerInput
            label="Submission Date"
            placeholder="Select submission date"
            value={formData.submittedAt}
            onChange={(value) => setFormData({ ...formData, submittedAt: value ? new Date(value) : new Date() })}
            clearable={false}
          />

          {/* Diagnosis */}
          <Textarea
            label="Diagnosis"
            placeholder="Enter diagnosis"
            required
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            minRows={2}
          />

          {/* Treatment Details */}
          <Textarea
            label="Treatment Details"
            placeholder="Enter treatment details"
            required
            value={formData.treatmentDetails}
            onChange={(e) => setFormData({ ...formData, treatmentDetails: e.target.value })}
            minRows={3}
          />

          {/* Notes */}
          <Textarea
            label="Additional Notes"
            placeholder="Enter any additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            minRows={2}
          />

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {claim ? 'Update Claim' : 'Create Claim'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default InsuranceClaimForm;
