'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Select,
  Textarea,
  Button,
  Grid,
  Paper,
  Title,
  Divider,
  Alert,
  FileInput,
  NumberInput,
  ActionIcon,
  TagsInput,
  Stepper,
  LoadingOverlay,
  Card,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import {
  IconUsers,
  IconCheck,
  IconAlertCircle,
  IconPhone,
  IconMail,
  IconMapPin,
  IconShieldX,
  IconFileText,
  IconTrash,
  IconCloudUpload,
  IconCalendar,
  IconUpload,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { CreatePatientDto, UpdatePatientDto, Patient } from '../../types/patient';
import { Gender, BloodGroup, MaritalStatus } from '../../types/common';
import { isValidEmail } from '../../lib/utils';

interface PatientFormProps {
  opened: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSubmit: (data: CreatePatientDto | UpdatePatientDto) => Promise<void>;
  loading?: boolean;
}

interface FormStep {
  label: string;
  description: string;
}

const steps: FormStep[] = [
  { label: 'Basic Info', description: 'Personal information' },
  { label: 'Contact', description: 'Contact details' },
  { label: 'Medical', description: 'Medical history' },
  { label: 'Insurance', description: 'Insurance information' },
  { label: 'Documents', description: 'Upload documents' },
  { label: 'Review & Submit', description: 'Review and submit' },
];

function PatientForm({
  opened,
  onClose,
  patient,
  onSubmit,
  loading: _loading = false,
}: PatientFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formLoading, { open: startLoading, close: stopLoading }] = useDisclosure(false);

  // Form initialization
  const form = useForm<CreatePatientDto>({
    initialValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: new Date(),
      gender: Gender.MALE,
      bloodGroup: undefined,
      maritalStatus: undefined,
      contactInfo: {
        phone: '',
        email: '',
        alternatePhone: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        landmark: '',
      },
      insuranceInfo: {
        insuranceType: undefined,
        insuranceProvider: '',
        policyNumber: '',
        policyHolderName: '',
        relationshipToPatient: '',
        coverageAmount: undefined,
        isActive: false,
      },
      aadhaarNumber: '',
      otherIdNumber: '',
      otherIdType: undefined,
      allergies: [],
      chronicDiseases: [],
      currentMedications: [],
      occupation: '',
      religion: '',
      language: '',
      notes: '',
    },
    validate: {
      firstName: (value) =>
        value.trim().length < 2 ? 'First name must be at least 2 characters' : null,
      lastName: (value) =>
        value.trim().length < 2 ? 'Last name must be at least 2 characters' : null,
      middleName: (value) => {
        if (value && value.trim().length > 0 && value.trim().length < 2) {
          return 'Middle name must be at least 2 characters if provided';
        }
        return null;
      },
    },
  });

  // Load patient data if editing
  useEffect(() => {
    if (patient && opened) {
      // Reset to first step when editing
      setActiveStep(0);
      form.setValues({
        firstName: patient.firstName,
        lastName: patient.lastName,
        middleName: patient.middleName || '',
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        maritalStatus: patient.maritalStatus,
        contactInfo: patient.contactInfo,
        address: patient.address,
        insuranceInfo: patient.insuranceInfo || {
          insuranceType: undefined,
          insuranceProvider: '',
          policyNumber: '',
          policyHolderName: '',
          relationshipToPatient: '',
          coverageAmount: undefined,
          isActive: false,
        },
        aadhaarNumber: patient.aadhaarNumber || '',
        otherIdNumber: patient.otherIdNumber || '',
        otherIdType: patient.otherIdType,
        allergies: patient.allergies || [],
        chronicDiseases: patient.chronicDiseases || [],
        currentMedications: patient.currentMedications || [],
        occupation: patient.occupation || '',
        religion: patient.religion || '',
        language: patient.language || '',
        notes: patient.notes || '',
      });
    } else if (!patient && opened) {
      // Reset to first step for new patient
      setActiveStep(0);
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, opened]);

  // Helper functions
  const handleClose = () => {
    form.reset();
    setActiveStep(0);
    setUploadedFiles([]);
    onClose();
  };

  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Basic Info
        if (!form.values.firstName || form.values.firstName.trim().length < 2) {
          notifications.show({
            title: 'Validation Error',
            message: 'First name must be at least 2 characters',
            color: 'red',
            icon: <IconAlertCircle />,
          });
          return false;
        }
        if (!form.values.lastName || form.values.lastName.trim().length < 2) {
          notifications.show({
            title: 'Validation Error',
            message: 'Last name must be at least 2 characters',
            color: 'red',
            icon: <IconAlertCircle />,
          });
          return false;
        }
        return true;
      case 1: // Contact Info
        const phoneDigits = form.values.contactInfo.phone.replace(/\D/g, '');
        if (!form.values.contactInfo?.phone || phoneDigits.length < 10) {
          notifications.show({
            title: 'Validation Error',
            message: 'Please enter a valid 10-digit phone number',
            color: 'red',
          });
          return false;
        }
        if (!form.values.address.street || form.values.address.street.trim().length < 3) {
          notifications.show({
            title: 'Validation Error',
            message: 'Street address is required',
            color: 'red',
          });
          return false;
        }
        if (!form.values.address.city || form.values.address.city.trim().length < 2) {
          notifications.show({
            title: 'Validation Error',
            message: 'City is required',
            color: 'red',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (values: any) => {
    console.log('=== PATIENT FORM SUBMISSION STARTED ===');
    console.log('Form values:', values);
    startLoading();
    
    // Handle date conversion
    let convertedDate: Date | undefined;
    if (values.dateOfBirth) {
      try {
        convertedDate = values.dateOfBirth instanceof Date 
          ? values.dateOfBirth 
          : new Date(values.dateOfBirth);
      } catch (error) {
        console.error('Date conversion error:', error);
        convertedDate = undefined;
      }
    }
      
    console.log('Converted dateOfBirth:', convertedDate);
    
    try {
      // Prepare the base patient data that matches CreatePatientDto
      const basePatientData: any = {
        // Basic Info
        firstName: values.firstName?.trim() || '',
        lastName: values.lastName?.trim() || '',
        middleName: values.middleName?.trim() || '',
        dateOfBirth: convertedDate || new Date(),
        gender: values.gender || Gender.MALE,
        bloodGroup: values.bloodGroup,
        maritalStatus: values.maritalStatus || MaritalStatus.SINGLE,
        
        // Contact Info
        contactInfo: {
          phone: values.contactInfo?.phone ? values.contactInfo.phone.replace(/[^\d+]/g, '') : '',
          email: values.contactInfo?.email?.trim() || '',
          alternatePhone: values.contactInfo?.alternatePhone || '',
          emergencyContact: {
            name: values.contactInfo?.emergencyContact?.name?.trim() || '',
            phone: values.contactInfo?.emergencyContact?.phone?.replace(/[^\d+]/g, '') || '',
            relationship: values.contactInfo?.emergencyContact?.relationship?.trim() || '',
          },
        },
        
        // Address
        address: {
          street: values.address?.street?.trim() || '',
          city: values.address?.city?.trim() || '',
          state: values.address?.state?.trim() || '',
          country: values.address?.country?.trim() || 'India',
          postalCode: values.address?.postalCode?.trim() || '',
          landmark: values.address?.landmark?.trim() || '',
        },
        
        // Insurance
        insuranceInfo: {
          insuranceProvider: values.insuranceInfo?.insuranceProvider?.trim() || '',
          policyNumber: values.insuranceInfo?.policyNumber?.trim() || '',
          insuranceType: values.insuranceInfo?.insuranceType,
          policyHolderName: values.insuranceInfo?.policyHolderName || '',
          relationshipToPatient: values.insuranceInfo?.relationshipToPatient || '',
          coverageAmount: values.insuranceInfo?.coverageAmount,
          isActive: values.insuranceInfo?.isActive || false,
        },
        
        // Medical History
        allergies: Array.isArray(values.allergies) ? values.allergies : [],
        chronicDiseases: Array.isArray(values.chronicDiseases) ? values.chronicDiseases : [],
        currentMedications: Array.isArray(values.currentMedications) ? values.currentMedications : [],
        
        // Additional fields
        aadhaarNumber: values.aadhaarNumber || '',
        otherIdNumber: values.otherIdNumber || '',
        otherIdType: values.otherIdType,
        occupation: values.occupation || '',
        religion: values.religion || '',
        language: values.language || '',
        notes: values.notes || '',
      };
      
      // For updates, include the ID
      const patientData = patient?.id 
        ? { ...basePatientData, id: patient.id } as UpdatePatientDto
        : basePatientData as CreatePatientDto;
      
      console.log('Patient data being sent:', patientData);
      console.log('Calling onSubmit function...');
      
      await onSubmit(patientData);

      console.log('onSubmit completed successfully!');
      notifications.show({
        title: patient ? 'Patient Updated' : 'Patient Created',
        message: `Patient ${values.firstName} ${values.lastName} has been ${patient ? 'updated' : 'created'} successfully.`,
        color: 'green',
      });

      handleClose();
    } catch (error: any) {
      console.error('=== PATIENT FORM SUBMISSION ERROR ===');
      console.error('Patient form submission error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response?.data) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifications.show({
        title: `Failed to ${patient ? 'update' : 'create'} patient`,
        message: errorMessage,
        color: 'red',
        autoClose: 10000,
      });
    } finally {
      stopLoading();
    }
  };

  const nextStep = () => {
    const currentStepValid = validateCurrentStep();
    if (currentStepValid) {
      setActiveStep((current) => (current < steps.length - 1 ? current + 1 : current));
    }
  };

  const prevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current));
  };

  const handleFileUpload = (files: File | File[] | null) => {
    if (!files) return;
    const fileArray = Array.isArray(files) ? files : [files];
    setUploadedFiles(prev => [...prev, ...fileArray]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const BasicInfoStep = (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group mb="md">
          <IconUsers size="1.2rem" />
          <Title order={4}>Basic Information</Title>
        </Group>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              {...form.getInputProps('firstName')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              {...form.getInputProps('lastName')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DatePickerInput
              label="Date of Birth"
              placeholder="Select date of birth"
              required
              maxDate={new Date()}
              {...form.getInputProps('dateOfBirth')}
              leftSection={<IconCalendar size="1rem" />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Gender"
              placeholder="Select gender"
              required
              data={[
                { value: Gender.MALE, label: 'Male' },
                { value: Gender.FEMALE, label: 'Female' },
                { value: Gender.OTHER, label: 'Other' },
              ]}
              {...form.getInputProps('gender')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Blood Group"
              placeholder="Select blood group"
              data={Object.values(BloodGroup).map((bg) => ({ value: bg, label: bg }))}
              {...form.getInputProps('bloodGroup')}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Marital Status"
              placeholder="Select marital status"
              data={Object.values(MaritalStatus).map((ms) => ({
                value: ms,
                label: ms.replace('_', ' '),
              }))}
              {...form.getInputProps('maritalStatus')}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Occupation"
              placeholder="Enter occupation"
              {...form.getInputProps('occupation')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Religion"
              placeholder="Enter religion"
              {...form.getInputProps('religion')}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Languages Known"
              placeholder="Enter languages (comma separated)"
              {...form.getInputProps('language')}
            />
          </Grid.Col>
        </Grid>
      </Paper>
    </Stack>
  );

  // Step 2: Contact Information
  const ContactInfoStep = (
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group mb="md">
            <IconPhone size="1.2rem" />
            <Title order={4}>Primary Contact</Title>
          </Group>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Phone Number"
                placeholder="+91 XXXXX XXXXX"
                required
                {...form.getInputProps('contactInfo.phone')}
                leftSection={<IconPhone size="1rem" />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Email Address"
                placeholder="email@example.com"
                {...form.getInputProps('contactInfo.email')}
                leftSection={<IconMail size="1rem" />}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Alternate Phone"
                placeholder="+91 XXXXX XXXXX"
                {...form.getInputProps('contactInfo.alternatePhone')}
                leftSection={<IconPhone size="1rem" />}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p="md" withBorder>
          <Group mb="md">
            <IconMapPin size="1.2rem" />
            <Title order={4}>Address Information</Title>
          </Group>
          <Grid>
            <Grid.Col span={12}>
              <Textarea
                label="Street Address"
                placeholder="Enter complete street address"
                required
                {...form.getInputProps('address.street')}
                minRows={2}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="City"
                placeholder="Enter city"
                required
                {...form.getInputProps('address.city')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="State"
                placeholder="Enter state"
                required
                {...form.getInputProps('address.state')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Postal Code"
                placeholder="Enter postal code"
                required
                {...form.getInputProps('address.postalCode')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Country"
                placeholder="Enter country"
                {...form.getInputProps('address.country')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Landmark"
                placeholder="Enter nearby landmark"
                {...form.getInputProps('address.landmark')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p="md" withBorder>
          <Group mb="md">
            <IconAlertCircle size="1.2rem" />
            <Title order={4}>Emergency Contact</Title>
          </Group>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Contact Name"
                placeholder="Enter emergency contact name"
                {...form.getInputProps('contactInfo.emergencyContact.name')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Contact Phone"
                placeholder="+91 XXXXX XXXXX"
                {...form.getInputProps('contactInfo.emergencyContact.phone')}
                leftSection={<IconPhone size="1rem" />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Relationship"
                placeholder="Enter relationship"
                {...form.getInputProps('contactInfo.emergencyContact.relationship')}
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
  );

  // Step 3: Medical Information
  const MedicalInfoStep = (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group mb="md">
          <IconAlertCircle size="1.2rem" color="red" />
          <Title order={4}>Allergies</Title>
        </Group>
        <TagsInput
          label="Known Allergies"
          description="Add allergies one by one"
          placeholder="Type allergy and press Enter"
          {...form.getInputProps('allergies')}
        />
      </Paper>

      <Paper p="md" withBorder>
        <Group mb="md">
          <IconFileText size="1.2rem" color="orange" />
          <Title order={4}>Chronic Diseases</Title>
        </Group>
        <TagsInput
          label="Chronic Diseases"
          description="Add chronic conditions one by one"
          placeholder="Type condition and press Enter"
          {...form.getInputProps('chronicDiseases')}
        />
      </Paper>

      <Paper p="md" withBorder>
        <Group mb="md">
          <IconFileText size="1.2rem" color="blue" />
          <Title order={4}>Current Medications</Title>
        </Group>
        <TagsInput
          label="Current Medications"
          description="Add current medications one by one"
          placeholder="Type medication and press Enter"
          {...form.getInputProps('currentMedications')}
        />
      </Paper>

      <Paper p="md" withBorder>
        <Group mb="md">
          <IconFileText size="1.2rem" />
          <Title order={4}>Identity Documents</Title>
        </Group>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              label="Aadhaar Number"
              placeholder="XXXX XXXX XXXX"
              {...form.getInputProps('aadhaarNumber')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Other ID Type"
              placeholder="Select ID type"
              data={[
                { value: 'pan', label: 'PAN Card' },
                { value: 'passport', label: 'Passport' },
                { value: 'driving_license', label: 'Driving License' },
                { value: 'voter_id', label: 'Voter ID' },
              ]}
              {...form.getInputProps('otherIdType')}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Other ID Number"
              placeholder="Enter ID number"
              {...form.getInputProps('otherIdNumber')}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          Additional Notes
        </Title>
        <Textarea
          label="Medical Notes"
          description="Any additional medical information"
          placeholder="Enter any additional notes"
          minRows={3}
          {...form.getInputProps('notes')}
        />
      </Paper>
    </Stack>
  );

  // Step 4: Insurance Information
  const InsuranceStep = (
      <Paper p="md" withBorder>
        <Group mb="md">
          <IconShieldX size="1.2rem" color="green" />
          <Title order={4}>Insurance Information</Title>
        </Group>
        <Alert color="blue" mb="md">
          Insurance information is optional but recommended for billing purposes.
        </Alert>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Insurance Type"
              placeholder="Select insurance type"
              data={[
                { value: 'government', label: 'Government' },
                { value: 'private', label: 'Private' },
                { value: 'corporate', label: 'Corporate' },
                { value: 'self_pay', label: 'Self Pay' },
              ]}
              {...form.getInputProps('insuranceInfo.insuranceType')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Insurance Provider"
              placeholder="Enter insurance company name"
              {...form.getInputProps('insuranceInfo.insuranceProvider')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Policy Number"
              placeholder="Enter policy number"
              {...form.getInputProps('insuranceInfo.policyNumber')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Policy Holder Name"
              placeholder="Enter policy holder name"
              {...form.getInputProps('insuranceInfo.policyHolderName')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Relationship to Patient"
              placeholder="Self, Spouse, Parent, etc."
              {...form.getInputProps('insuranceInfo.relationshipToPatient')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="Coverage Amount"
              placeholder="Enter coverage amount"
              min={0}
              {...form.getInputProps('insuranceInfo.coverageAmount')}
              leftSection="â‚¹"
            />
          </Grid.Col>
        </Grid>
      </Paper>
  );

  // Step 5: Document Upload
  const DocumentsStep = (
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group mb="md">
            <IconUpload size="1.2rem" />
            <Title order={4}>Upload Documents</Title>
          </Group>

          <FileInput
            label="Upload Patient Documents"
            description="Upload ID proofs, medical reports, insurance documents, etc."
            placeholder="Click to upload or drag files here"
            multiple
            accept="image/*,application/pdf,.doc,.docx"
            onChange={handleFileUpload}
            leftSection={<IconCloudUpload size="1rem" />}
          />

          {uploadedFiles.length > 0 && (
            <Stack mt="md">
              <Text fw={500}>Uploaded Files:</Text>
              {uploadedFiles.map((file, index) => (
                <Group
                  key={index}
                  justify="space-between"
                  p="xs"
                  bg="gray.0"
                  style={{ borderRadius: 4 }}
                >
                  <Group>
                    <IconFileText size="1rem" />
                    <div>
                      <Text size="sm" fw={500}>
                        {file.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {(file.size / 1024).toFixed(1)} KB
                      </Text>
                    </div>
                  </Group>
                  <Group>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => removeUploadedFile(index)}
                    >
                      <IconTrash size="0.8rem" />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Paper>

        <Alert color="blue">
          <Group>
            <IconAlertCircle size="1rem" />
            <Text size="sm">
              Documents can also be uploaded after patient registration from the patient details
              page.
            </Text>
          </Group>
        </Alert>
      </Stack>
  );

  // Step 6: Review & Submit
  const ReviewStep = (
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group mb="md">
            <IconCheck size="1.2rem" color="green" />
            <Title order={4}>Review & Submit</Title>
          </Group>

          <Alert color="blue" mb="md">
            Please review the information below before submitting. You can go back to make changes
            if needed.
          </Alert>

          <Grid>
            <Grid.Col span={12}>
              <Card withBorder>
                <Title order={5} mb="sm">
                  Patient Information Summary
                </Title>
                <Stack gap="xs">
                  <Group>
                    <Text fw={500}>Name:</Text>
                    <Text>
                      {form.values.firstName} {form.values.lastName}
                    </Text>
                  </Group>
                  <Group>
                    <Text fw={500}>Phone:</Text>
                    <Text>{form.values.contactInfo.phone}</Text>
                  </Group>
                  <Group>
                    <Text fw={500}>Email:</Text>
                    <Text>{form.values.contactInfo.email || 'Not provided'}</Text>
                  </Group>
                  <Group>
                    <Text fw={500}>Address:</Text>
                    <Text>
                      {form.values.address.street}, {form.values.address.city}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={12}>
              <Card withBorder>
                <Title order={5} mb="sm">
                  Documents
                </Title>
                {uploadedFiles.length > 0 ? (
                  <Text c="green">✓ {uploadedFiles.length} file(s) uploaded</Text>
                ) : (
                  <Text c="dimmed">No documents uploaded (optional)</Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        <Alert color="green">
          <Group>
            <IconCheck size="1rem" />
            <Text size="sm">
              Ready to submit! Click &quot;Create Patient&quot; to complete the registration
              process.
            </Text>
          </Group>
        </Alert>
      </Stack>
  );

  const getCurrentStepContent = () => {
    switch (activeStep) {
      case 0:
        return BasicInfoStep;
      case 1:
        return ContactInfoStep;
      case 2:
        return MedicalInfoStep;
      case 3:
        return InsuranceStep;
      case 4:
        return DocumentsStep;
      case 5:
        return ReviewStep;
      default:
        return null;
    }
  };

  return (
    <Modal
      key={patient?.id || 'new'}
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconUsers size="1.2rem" />
          <Text fw={600}>{patient ? 'Edit Patient' : 'New Patient Registration'}</Text>
        </Group>
      }
      size="xl"
      closeOnClickOutside={false}
      closeOnEscape={!formLoading}
    >
      <form onSubmit={form.onSubmit((values: any) => handleSubmit(values as CreatePatientDto))}>
        <LoadingOverlay visible={formLoading} />

        <Stack gap="lg">
          <Stepper active={activeStep}>
            {steps.map((step, index) => (
              <Stepper.Step key={index} label={step.label} description={step.description} />
            ))}
          </Stepper>

          <Divider />

          {getCurrentStepContent()}

          <Group justify="space-between" mt="xl">
            <Button variant="outline" onClick={prevStep} disabled={activeStep === 0 || formLoading}>
              Previous
            </Button>

            <Group>
              {activeStep < steps.length - 1 ? (
                <Button onClick={nextStep} disabled={formLoading}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={formLoading}
                  leftSection={<IconCheck size="1rem" />}
                  color="green"
                >
                  {patient ? 'Update Patient' : 'Create Patient'}
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default PatientForm;
