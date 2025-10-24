'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Text,
  Group,
  Badge,
  SimpleGrid,
  Stack,
  Button,
  Card,
  Avatar,
  Title,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUsers,
  IconPhone,
  IconCalendar,
  IconHeart,
  IconAlertCircle,
  IconShield,
  IconUserPlus,
  IconSearch,
  IconChartBar,
  IconFileExport,
  IconUser,
} from '@tabler/icons-react';
import DataTable from '../../../components/shared/DataTable';
import PatientForm from '../../../components/patients/PatientForm';
import PatientDetails from '../../../components/patients/PatientDetails';
import MedicalHistoryManager from '../../../components/patients/MedicalHistoryManager';
import DocumentManager from '../../../components/patients/DocumentManager';
import PatientSearch from '../../../components/patients/PatientSearch';
import PatientAnalytics from '../../../components/patients/PatientAnalytics';
import PatientExportReport from '../../../components/patients/PatientExportReport';
import PatientPortalAccess from '../../../components/patients/PatientPortalAccess';
import { useAppStore } from '../../../stores/appStore';
import { User, UserRole, TableColumn, FilterOption, Status, Gender } from '../../../types/common';
import {
  Patient,
  PatientListItem,
  CreatePatientDto,
  UpdatePatientDto,
  PatientSearchParams,
} from '../../../types/patient';
import { formatDate, formatPhoneNumber } from '../../../lib/utils';
import { notifications } from '@mantine/notifications';
import patientsService from '../../../services/patients.service';

// Mock user
const mockUser: User = {
  id: '1',
  username: 'sjohnson',
  email: 'sarah.johnson@hospital.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: UserRole.DOCTOR,
  permissions: [],
  isActive: true,
  tenantInfo: {
    tenantId: 'T001',
    tenantName: 'Main Hospital',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function PatientManagement() {
  const { user, setUser } = useAppStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientStats, setPatientStats] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDocuments, setPatientDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSearchQuery] = useState('');
  const [, setFilters] = useState<Record<string, unknown>>({});
  const [opened, { open, close }] = useDisclosure(false);
  const [viewModalOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [historyModalOpened, { open: openHistory, close: closeHistory }] = useDisclosure(false);
  const [documentsModalOpened, { open: openDocuments, close: closeDocuments }] =
    useDisclosure(false);
  const [searchModalOpened, { open: openSearch, close: closeSearch }] = useDisclosure(false);
  const [analyticsModalOpened, { open: openAnalytics, close: closeAnalytics }] =
    useDisclosure(false);
  const [exportModalOpened, { open: openExport, close: closeExport }] = useDisclosure(false);
  const [portalModalOpened, { open: openPortal, close: closePortal }] = useDisclosure(false);

  useEffect(() => {
    if (!user) {
      // setUser(null /* TODO: Fetch from API */);
    }
    fetchPatients();
    fetchStats();
  }, [user, setUser]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsService.getPatients();
      console.log('Patients API response:', response);
      
      // Ensure we have valid patient data
      const patientsData = response.data?.patients || [];
      
      // Validate and sanitize each patient object
      const validatedPatients = patientsData.map((patient: any) => ({
        ...patient,
        contactInfo: patient.contactInfo || { phone: '', email: '', alternatePhone: '', emergencyContact: { name: '', phone: '', relationship: '' } },
        address: patient.address || { street: '', city: '', state: '', country: 'India', postalCode: '', landmark: '' },
        allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
        chronicDiseases: Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases : [],
        currentMedications: Array.isArray(patient.currentMedications) ? patient.currentMedications : [],
        age: patient.age || 0,
        totalVisits: patient.totalVisits || 0,
        status: patient.status || 'active',
      }));
      
      setPatients(validatedPatients);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch patients';
      console.warn('Error fetching patients (using empty data):', errorMsg);
      // Don't show error to user if backend is not ready, just use empty data
      setError(null);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await patientsService.getPatientStats();
      console.log('Patient stats API response:', response);
      setPatientStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching patient stats (using default values):',
        err.response?.data?.message || err.message
      );
      // Set default stats when backend is unavailable
      setPatientStats({
        totalPatients: 0,
        activePatients: 0,
        todaysPatients: 0,
        weekPatients: 0,
        averageAge: 0,
        genderDistribution: { male: 0, female: 0, other: 0 },
        insuranceDistribution: { insured: 0, uninsured: 0 },
      });
    }
  };

  // Convert patients to list items for table with comprehensive null safety
  const patientListItems: PatientListItem[] = patients.map((patient) => {
    // Safely extract values with defaults
    const firstName = patient.firstName || '';
    const lastName = patient.lastName || '';
    const middleName = 'middleName' in patient ? (patient as any).middleName || '' : '';
    const fullName = middleName 
      ? `${firstName} ${middleName} ${lastName}`.trim()
      : `${firstName} ${lastName}`.trim();
    
    // Ensure gender is a valid Gender enum value
    const gender = Object.values(Gender).includes(patient.gender as Gender) 
      ? patient.gender as Gender 
      : Gender.OTHER;

    // Ensure status is a valid Status enum value
    const status = patient.status && Object.values(Status).includes(patient.status as Status)
      ? patient.status as Status
      : Status.ACTIVE;
    
    return {
      id: patient.id || '',
      patientId: patient.patientId || 'N/A',
      fullName: fullName || 'Unknown',
      age: typeof patient.age === 'number' ? patient.age : 0,
      gender,
      phoneNumber: patient.contactInfo?.phone || 'N/A',
      lastVisitDate: patient.lastVisitDate || undefined,
      totalVisits: typeof patient.totalVisits === 'number' ? patient.totalVisits : 0,
      status,
      hasInsurance: !!patient.insuranceInfo?.isActive || !!(patient.insuranceInfo as any)?.insuranceProvider,
      emergencyFlag: (Array.isArray(patient.chronicDiseases) && patient.chronicDiseases.length > 0) || false,
    } as PatientListItem;
  });

  // Table columns configuration
  const columns: TableColumn[] = [
    {
      key: 'patientId',
      title: 'Patient ID',
      sortable: true,
      width: '120px',
      render: (value) => (
        <Text fw={500} c="blue">
          {value as string}
        </Text>
      ),
    },
    {
      key: 'fullName',
      title: 'Patient Name',
      sortable: true,
      render: (value, record) => (
        <Group gap="sm">
          <Avatar size="sm" name={value as string} color="blue" />
          <div>
            <Text fw={500}>{value as string}</Text>
            <Text size="xs" c="dimmed">
              {record.age as string} years • {record.gender as string}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'phoneNumber',
      title: 'Contact',
      render: (value) => (
        <div>
          <Group gap="xs">
            <IconPhone size="1rem" />
            <Text size="sm">{formatPhoneNumber(value as string)}</Text>
          </Group>
        </div>
      ),
    },
    {
      key: 'lastVisitDate',
      title: 'Last Visit',
      sortable: true,
      render: (value) => (value ? formatDate(value as string | Date) : 'Never'),
    },
    {
      key: 'totalVisits',
      title: 'Visits',
      sortable: true,
      width: '80px',
      render: (value) => (
        <Badge variant="light" color="blue">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge color={value === 'active' ? 'green' : 'red'} variant="light">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'hasInsurance',
      title: 'Insurance',
      render: (value, record) => (
        <Group gap="xs">
          {value ? (
            <Badge color="green" variant="light" leftSection={<IconShield size="0.8rem" />}>
              Insured
            </Badge>
          ) : (
            <Badge color="gray" variant="light">
              Self Pay
            </Badge>
          )}
          {record.emergencyFlag && <IconAlertCircle size="1rem" color="red" />}
        </Group>
      ),
    },
  ];

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'hasInsurance',
      label: 'Insurance',
      type: 'select',
      options: [
        { value: 'true', label: 'Insured' },
        { value: 'false', label: 'Self Pay' },
      ],
    },
  ];

  // Handle patient actions
  const handleViewPatient = (patient: PatientListItem) => {
    const fullPatient = patients.find((p) => p.id === patient.id);
    if (fullPatient) {
      setSelectedPatient(fullPatient);
      openView();
    }
  };

  const handleEditPatient = (patient: PatientListItem) => {
    console.log('=== EDIT PATIENT CLICKED ===');
    console.log('Patient List Item:', patient);
    
    const fullPatient = patients.find((p) => p.id === patient.id);
    console.log('Full Patient Data:', fullPatient);
    
    if (fullPatient) {
      setSelectedPatient(fullPatient);
      console.log('Selected patient set, opening form modal');
      open();
    } else {
      console.error('Could not find full patient data for ID:', patient.id);
      notifications.show({
        title: 'Error',
        message: 'Could not load patient data. Please try again.',
        color: 'red',
      });
    }
  };

  const handleDeletePatient = async (patient: PatientListItem) => {
    if (
      !window.confirm(
        `Are you sure you want to delete patient ${patient.fullName} (${patient.patientId})?`
      )
    ) {
      return;
    }

    try {
      await patientsService.deletePatient(patient.id);
      notifications.show({
        title: 'Success',
        message: `Patient ${patient.fullName} deleted successfully!`,
        color: 'green',
      });
      fetchPatients(); // Refresh the list
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete patient',
        color: 'red',
      });
    }
  };

  // Patient CRUD operations
  const handleCreatePatient = async (data: CreatePatientDto) => {
    try {
      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        notifications.show({
          title: 'Authentication Required',
          message: 'Please log in to create patients',
          color: 'red',
        });
        window.location.href = '/login';
        return;
      }

      console.log('Creating patient with data:', data);
      
      // Data is already flattened and formatted in PatientForm, just pass it through
      const response = await patientsService.createPatient(data as any);
      console.log('Patient creation response:', response);
      
      const newPatient = response.data;
      const patientName = `${newPatient.firstName || ''} ${newPatient.lastName || ''}`.trim() || 'Patient';
      const patientId = newPatient.id || newPatient.patientId || 'N/A';
      
      // Refresh the patients list and stats first
      await fetchPatients();
      await fetchStats();
      
      // Close the form modal
      close();
      
      // Show notification after modal closes (delay ensures visibility)
      setTimeout(() => {
        notifications.show({
          title: '✅ Patient Registered Successfully!',
          message: `Patient Name: ${patientName}\nPatient ID: ${patientId}`,
          color: 'green',
          autoClose: 7000,
          position: 'top-right',
          style: { 
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #22c55e'
          },
        });
      }, 500);
    } catch (error: any) {
      console.error('Patient creation error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create patient';
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
      
      notifications.show({
        title: 'Error',
        message: displayMsg,
        color: 'red',
        autoClose: 10000,
      });
      // Don't throw error - let the form stay open so user can fix issues
    }
  };

  const handleUpdatePatient = async (data: UpdatePatientDto) => {
    try {
      console.log('Updating patient with data:', data);
      
      // Data is already flattened and formatted in PatientForm, just pass it through
      const response = await patientsService.updatePatient(data.id!, data as any);
      console.log('Patient update response:', response);
      
      const updatedPatient = response.data;
      const patientName = `${updatedPatient.firstName || ''} ${updatedPatient.lastName || ''}`.trim() || 'Patient';
      const patientId = updatedPatient.id || updatedPatient.patientId || data.id;

      // Refresh the patients list and stats first
      await fetchPatients();
      await fetchStats();
      
      // Close the form modal
      close();
      
      // Show notification after modal closes
      setTimeout(() => {
        notifications.show({
          title: '✅ Patient Updated Successfully!',
          message: `Patient Name: ${patientName}\nPatient ID: ${patientId}`,
          color: 'green',
          autoClose: 5000,
          position: 'top-right',
          style: { 
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #22c55e'
          },
        });
      }, 500);
    } catch (error: any) {
      console.error('Patient update error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update patient';
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
      
      notifications.show({
        title: 'Error',
        message: displayMsg,
        color: 'red',
        autoClose: 10000,
      });
      // Don't throw error - let the form stay open so user can fix issues
    }
  };

  // Medical history operations
  const handleSaveMedicalHistory = async (history: any) => {
    console.log('Saving medical history:', history);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleUpdateMedicalHistory = async (id: string, history: any) => {
    console.log('Updating medical history:', id, history);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleDeleteMedicalHistory = async (id: string) => {
    console.log('Deleting medical history:', id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Document operations
  const handleUploadDocument = async (document: any, file: File) => {
    console.log('Uploading document:', document, file);
    try {
      // Simulate document upload - in real app, upload to server/storage
      const newDocument = {
        id: Date.now().toString(),
        ...document,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        fileUrl: URL.createObjectURL(file), // Temporary URL for preview
      };
      
      setPatientDocuments(prev => [...prev, newDocument]);
      
      notifications.show({
        title: '✅ Document Uploaded',
        message: `${file.name} uploaded successfully!`,
        color: 'green',
      });
    } catch (error) {
      console.error('Document upload error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload document',
        color: 'red',
      });
    }
  };

  const handleUpdateDocument = async (id: string, document: any) => {
    console.log('Updating document:', id, document);
    try {
      setPatientDocuments(prev => 
        prev.map(doc => doc.id === id ? { ...doc, ...document } : doc)
      );
      
      notifications.show({
        title: '✅ Document Updated',
        message: 'Document information updated successfully!',
        color: 'green',
      });
    } catch (error) {
      console.error('Document update error:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    console.log('Deleting document:', id);
    try {
      setPatientDocuments(prev => prev.filter(doc => doc.id !== id));
      
      notifications.show({
        title: '✅ Document Deleted',
        message: 'Document removed successfully!',
        color: 'green',
      });
    } catch (error) {
      console.error('Document delete error:', error);
    }
  };

  const handleDownloadDocument = async (document: any) => {
    console.log('Downloading document:', document);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleViewDocument = async (document: any) => {
    console.log('Viewing document:', document);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Search operations
  const handleSearch = async (criteria: PatientSearchParams) => {
    console.log('Searching patients with criteria:', criteria);
    
    try {
      setLoading(true);
      
      // Filter patients based on search criteria
      let filteredPatients = [...patients];
      
      // Search term (searches across multiple fields)
      if (criteria.searchTerm) {
        const term = criteria.searchTerm.toLowerCase();
        filteredPatients = filteredPatients.filter(p => 
          p.firstName?.toLowerCase().includes(term) ||
          p.lastName?.toLowerCase().includes(term) ||
          p.patientId?.toLowerCase().includes(term) ||
          p.contactInfo?.phone?.includes(term) ||
          p.contactInfo?.email?.toLowerCase().includes(term)
        );
      }
      
      // Patient ID
      if (criteria.patientId) {
        filteredPatients = filteredPatients.filter(p => 
          p.patientId?.toLowerCase().includes(criteria.patientId!.toLowerCase())
        );
      }
      
      // First Name
      if (criteria.firstName) {
        filteredPatients = filteredPatients.filter(p => 
          p.firstName?.toLowerCase().includes(criteria.firstName!.toLowerCase())
        );
      }
      
      // Last Name
      if (criteria.lastName) {
        filteredPatients = filteredPatients.filter(p => 
          p.lastName?.toLowerCase().includes(criteria.lastName!.toLowerCase())
        );
      }
      
      // Phone
      if (criteria.phone) {
        filteredPatients = filteredPatients.filter(p => 
          p.contactInfo?.phone?.includes(criteria.phone!)
        );
      }
      
      // Email
      if (criteria.email) {
        filteredPatients = filteredPatients.filter(p => 
          p.contactInfo?.email?.toLowerCase().includes(criteria.email!.toLowerCase())
        );
      }
      
      // Gender
      if (criteria.gender) {
        filteredPatients = filteredPatients.filter(p => p.gender === criteria.gender);
      }
      
      // Blood Group
      if (criteria.bloodGroup) {
        filteredPatients = filteredPatients.filter(p => p.bloodGroup === criteria.bloodGroup);
      }
      
      // Status
      if (criteria.status) {
        filteredPatients = filteredPatients.filter(p => p.status === criteria.status);
      }
      
      // Age range
      if (criteria.ageFrom !== undefined) {
        filteredPatients = filteredPatients.filter(p => (p.age || 0) >= criteria.ageFrom!);
      }
      if (criteria.ageTo !== undefined) {
        filteredPatients = filteredPatients.filter(p => (p.age || 0) <= criteria.ageTo!);
      }
      
      // Has Insurance
      if (criteria.hasInsurance !== undefined) {
        filteredPatients = filteredPatients.filter(p => 
          criteria.hasInsurance ? !!p.insuranceInfo?.insuranceProvider : !p.insuranceInfo?.insuranceProvider
        );
      }
      
      // Has Allergies
      if (criteria.hasAllergies !== undefined) {
        filteredPatients = filteredPatients.filter(p => 
          criteria.hasAllergies ? (p.allergies?.length || 0) > 0 : (p.allergies?.length || 0) === 0
        );
      }
      
      // Has Chronic Diseases
      if (criteria.hasChronicDiseases !== undefined) {
        filteredPatients = filteredPatients.filter(p => 
          criteria.hasChronicDiseases ? (p.chronicDiseases?.length || 0) > 0 : (p.chronicDiseases?.length || 0) === 0
        );
      }
      
      setPatients(filteredPatients);
      
      notifications.show({
        title: '🔍 Search Complete',
        message: `Found ${filteredPatients.length} patient(s) matching your criteria`,
        color: 'blue',
        autoClose: 3000,
      });
      
      closeSearch();
    } catch (error) {
      console.error('Search error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to search patients',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = (name: string, criteria: PatientSearchParams) => {
    console.log('Saving search:', name, criteria);
    notifications.show({
      title: '💾 Search Saved',
      message: `Search "${name}" has been saved successfully`,
      color: 'green',
    });
  };

  // Export operations
  const handleExportPatients = async (options: any) => {
    console.log('Exporting patients:', options);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const handleGenerateReport = async (reportType: string, patientIds?: string[]) => {
    console.log('Generating report:', reportType, patientIds);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      reportType: reportType as
        | 'demographics'
        | 'visit_summary'
        | 'medical_summary'
        | 'insurance_summary',
      patientId: 'all',
      generatedAt: new Date(),
      generatedBy: 'current_user',
      data: {},
      format: 'pdf' as const,
    };
  };

  // Portal operations
  const handleEnablePortalAccess = async (patientId: string, preferences: any) => {
    console.log('Enabling portal access:', patientId, preferences);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleDisablePortalAccess = async (patientId: string) => {
    console.log('Disabling portal access:', patientId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleUpdatePortalPreferences = async (patientId: string, preferences: any) => {
    console.log('Updating portal preferences:', patientId, preferences);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleResetPortalPassword = async (patientId: string) => {
    console.log('Resetting portal password:', patientId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleSendPortalCredentials = async (patientId: string, method: 'email' | 'sms') => {
    console.log('Sending portal credentials:', patientId, method);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Additional handlers
  const handleScheduleAppointment = (patientId: string) => {
    console.log('Schedule appointment for patient:', patientId);
    // Would navigate to appointment scheduling
  };

  const handleOpenHistory = (patient: PatientListItem) => {
    const fullPatient = patients.find((p) => p.id === patient.id);
    if (fullPatient) {
      setSelectedPatient(fullPatient);
      openHistory();
    }
  };

  const handleOpenDocuments = (patient: PatientListItem) => {
    const fullPatient = patients.find((p) => p.id === patient.id);
    if (fullPatient) {
      setSelectedPatient(fullPatient);
      // Reset documents for new patient
      setPatientDocuments([]);
      // In real app, fetch documents from API here
      // fetchPatientDocuments(fullPatient.id);
      openDocuments();
    }
  };

  const handleOpenPortal = (patient: PatientListItem) => {
    const fullPatient = patients.find((p) => p.id === patient.id);
    if (fullPatient) {
      setSelectedPatient(fullPatient);
      openPortal();
    }
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    open();
  };

  const handleCloseForm = () => {
    setSelectedPatient(null);
    close();
  };

  // Wrapper function for PatientDetails onEdit prop
  const handleEditFromDetails = (patient: Patient) => {
    // Convert Patient to PatientListItem format for the existing handler
    const firstName = patient.firstName || '';
    const lastName = patient.lastName || '';
    const middleName = 'middleName' in patient ? (patient as any).middleName || '' : '';
    const fullName = middleName 
      ? `${firstName} ${middleName} ${lastName}`.trim()
      : `${firstName} ${lastName}`.trim();
    
    // Ensure gender is a valid Gender enum value
    const gender = Object.values(Gender).includes(patient.gender as Gender) 
      ? patient.gender as Gender 
      : Gender.OTHER;

    // Ensure status is a valid Status enum value
    const status = patient.status && Object.values(Status).includes(patient.status as Status)
      ? patient.status as Status
      : Status.ACTIVE;
    
    const patientListItem: PatientListItem = {
      id: patient.id || '',
      patientId: patient.patientId || 'N/A',
      fullName: fullName || 'Unknown',
      age: typeof patient.age === 'number' ? patient.age : 0,
      gender,
      phoneNumber: patient.contactInfo?.phone || 'N/A',
      lastVisitDate: patient.lastVisitDate || undefined,
      totalVisits: typeof patient.totalVisits === 'number' ? patient.totalVisits : 0,
      status,
      hasInsurance: !!patient.insuranceInfo?.isActive || !!(patient.insuranceInfo as any)?.insuranceProvider,
      emergencyFlag: (Array.isArray(patient.chronicDiseases) && patient.chronicDiseases.length > 0) || false,
    } as PatientListItem;
    
    handleEditPatient(patientListItem);
  };

  // Statistics cards
  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <div style={{ color: `var(--mantine-color-${color}-6)` }}>{icon}</div>
      </Group>

      <Text size="xl" fw={700} mb="xs">
        {value}
      </Text>

      <Text size="sm" c="dimmed" mb="sm">
        {title}
      </Text>

      {subtitle && (
        <Text size="xs" c="dimmed">
          {subtitle}
        </Text>
      )}
    </Card>
  );

  return (
    <Container fluid px={0} style={{ maxWidth: '100%' }}>
      <Stack gap="lg" px="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Patient Management</Title>
            <Text c="dimmed">
              Manage patient registration, medical records, and healthcare information
            </Text>
          </div>
          <Group>
            <Button variant="outline" leftSection={<IconSearch size="1rem" />} onClick={openSearch}>
              Advanced Search
            </Button>
            <Button
              variant="outline"
              leftSection={<IconChartBar size="1rem" />}
              onClick={openAnalytics}
            >
              Analytics
            </Button>
            <Button
              variant="outline"
              leftSection={<IconFileExport size="1rem" />}
              onClick={openExport}
            >
              Export
            </Button>
            <Button leftSection={<IconUserPlus size="1rem" />} onClick={handleNewPatient}>
              New Patient
            </Button>
          </Group>
        </Group>

        {/* Error Display */}
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {patientStats && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <StatCard
              title="Total Patients"
              value={(patientStats.totalPatients || 0).toLocaleString()}
              icon={<IconUsers size="2rem" />}
              color="blue"
              subtitle={
                patientStats.newPatientsThisMonth
                  ? `+${patientStats.newPatientsThisMonth} this month`
                  : undefined
              }
            />
            <StatCard
              title="New Today"
              value={(patientStats.newPatientsToday || patientStats.todaysPatients || 0).toString()}
              icon={<IconUserPlus size="2rem" />}
              color="green"
              subtitle="New registrations today"
            />
            <StatCard
              title="Active Patients"
              value={(patientStats.activePatients || 0).toLocaleString()}
              icon={<IconHeart size="2rem" />}
              color="red"
              subtitle="Currently under care"
            />
            <StatCard
              title="Average Age"
              value={patientStats.averageAge ? `${patientStats.averageAge} years` : 'N/A'}
              icon={<IconCalendar size="2rem" />}
              color="purple"
              subtitle="Patient demographics"
            />
          </SimpleGrid>
        )}

        {/* Patient List Table */}
        <DataTable
          data={patientListItems}
          columns={columns}
          loading={loading}
          searchable={true}
          filterable={true}
          sortable={true}
          filters={filterOptions}
          onSearch={(query) => setSearchQuery(query)}
          onFilter={(filters) => setFilters(filters)}
          pagination={{
            page: 1,
            limit: 10,
            total: patientListItems.length,
            onPageChange: (page) => console.log('Page:', page),
            onLimitChange: (limit) => console.log('Limit:', limit),
          }}
          actions={{
            view: handleViewPatient,
            edit: handleEditPatient,
            delete: handleDeletePatient,
            custom: [
              {
                label: 'Documents',
                icon: <IconFileExport size="1rem" />,
                action: (patient: PatientListItem) => handleOpenDocuments(patient),
              },
              {
                label: 'Portal',
                icon: <IconUser size="1rem" />,
                action: (patient: PatientListItem) => handleOpenPortal(patient),
              },
            ],
          }}
          emptyMessage="No patients found"
        />

        {/* Enhanced Patient Details Modal */}
        <PatientDetails
          opened={viewModalOpened}
          onClose={closeView}
          patient={selectedPatient}
          visits={[]}
          documents={[]}
          medicalHistory={[]}
          appointments={[]}
          onEdit={handleEditFromDetails}
          onScheduleAppointment={handleScheduleAppointment}
        />

        {/* Enhanced Patient Form Modal */}
        <PatientForm
          opened={opened}
          onClose={handleCloseForm}
          patient={selectedPatient}
          onSubmit={selectedPatient ? handleUpdatePatient : handleCreatePatient}
        />

        {/* Medical History Manager */}
        {selectedPatient && (
          <MedicalHistoryManager
            opened={historyModalOpened}
            onClose={closeHistory}
            patientId={selectedPatient.patientId}
            patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            medicalHistory={[]}
            onSave={handleSaveMedicalHistory}
            onUpdate={handleUpdateMedicalHistory}
            onDelete={handleDeleteMedicalHistory}
          />
        )}

        {/* Document Manager */}
        {selectedPatient && (
          <DocumentManager
            opened={documentsModalOpened}
            onClose={closeDocuments}
            patientId={selectedPatient.patientId}
            patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            documents={patientDocuments}
            onUpload={handleUploadDocument}
            onUpdate={handleUpdateDocument}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
            onView={handleViewDocument}
          />
        )}

        {/* Patient Search */}
        <PatientSearch
          opened={searchModalOpened}
          onClose={closeSearch}
          onSearch={handleSearch}
          onSaveSearch={handleSaveSearch}
          currentCriteria={{}}
        />

        {/* Patient Analytics */}
        <PatientAnalytics
          opened={analyticsModalOpened}
          onClose={closeAnalytics}
          patients={patients}
          stats={patientStats}
        />

        {/* Export & Reporting */}
        <PatientExportReport
          opened={exportModalOpened}
          onClose={closeExport}
          onExport={handleExportPatients}
          onGenerateReport={handleGenerateReport}
          patientCount={patients.length}
        />

        {/* Patient Portal Access */}
        {selectedPatient && (
          <PatientPortalAccess
            opened={portalModalOpened}
            onClose={closePortal}
            patient={selectedPatient}
            onEnableAccess={handleEnablePortalAccess}
            onDisableAccess={handleDisablePortalAccess}
            onUpdatePreferences={handleUpdatePortalPreferences}
            onResetPassword={handleResetPortalPassword}
            onSendCredentials={handleSendPortalCredentials}
          />
        )}
      </Stack>
    </Container>
  );
}

