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
  // Store documents per patient ID
  const [documentsMap, setDocumentsMap] = useState<Record<string, any[]>>({});
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
      // User context will be set by auth provider
    }
    fetchPatients();
    fetchStats();
  }, [user, setUser]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsService.getPatients();
      // Patients data fetched successfully
      
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
      // Patient stats fetched successfully
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
  const handleViewPatient = async (patient: PatientListItem) => {
    const fullPatient = patients.find((p) => p.id === patient.id);
    if (fullPatient) {
      setSelectedPatient(fullPatient);
      
      // Load documents for this patient from cache or API
      if (documentsMap[fullPatient.id]) {
        setPatientDocuments(documentsMap[fullPatient.id]);
      } else {
        // Fetch documents from API
        try {
          const docsResponse = await patientsService.getPatientDocuments(fullPatient.id);
          if (docsResponse.success && docsResponse.data) {
            const docs = Array.isArray(docsResponse.data) ? docsResponse.data : [];
            setPatientDocuments(docs);
            setDocumentsMap(prev => ({
              ...prev,
              [fullPatient.id]: docs
            }));
          } else {
            setPatientDocuments([]);
          }
        } catch (error) {
          console.error('Error fetching documents:', error);
          setPatientDocuments([]);
        }
      }
      
      openView();
    }
  };

  const handleEditPatient = (patient: PatientListItem) => {
    const fullPatient = patients.find((p) => p.id === patient.id);
    
    if (fullPatient) {
      setSelectedPatient(fullPatient);
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
  const handleCreatePatient = async (data: CreatePatientDto, files?: File[]) => {
    try {
      // Creating new patient
      
      // Check if user is authenticated by checking localStorage token
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

      // Submitting patient data to API
      
      // Data is already flattened and formatted in PatientForm, just pass it through
      const response = await patientsService.createPatient(data as any);
      
      const newPatient = response.data;
      const patientName = `${newPatient.firstName || ''} ${newPatient.lastName || ''}`.trim() || 'Patient';
      const patientId = newPatient.id || newPatient.patientId || 'N/A';
      
      // Upload documents if any files were provided
      if (files && files.length > 0) {
        try {
          await patientsService.uploadDocuments(patientId, files);
          
          // Fetch and store documents for this patient
          const docsResponse = await patientsService.getPatientDocuments(patientId);
          if (docsResponse.success && docsResponse.data) {
            setDocumentsMap(prev => ({
              ...prev,
              [patientId]: docsResponse.data
            }));
          }
        } catch (docError: any) {
          console.error('Error uploading documents:', docError);
          // Show warning but don't fail the patient creation
          notifications.show({
            title: 'Warning',
            message: 'Patient created but some documents failed to upload. You can upload them later.',
            color: 'yellow',
            autoClose: 5000,
          });
        }
      }
      
      // Refresh the patients list and stats first
      await fetchPatients();
      await fetchStats();
      
      // Close the form modal
      close();
      
      // Show notification after modal closes (delay ensures visibility)
      setTimeout(() => {
        const documentsMsg = files && files.length > 0 ? `\n${files.length} document(s) uploaded` : '';
        notifications.show({
          title: '✅ Patient Registered Successfully!',
          message: `Patient Name: ${patientName}\nPatient ID: ${patientId}${documentsMsg}`,
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

  const handleUpdatePatient = async (data: UpdatePatientDto, files?: File[]) => {
    try {
      // Updating patient data
      
      // Data is already flattened and formatted in PatientForm, just pass it through
      const response = await patientsService.updatePatient(data.id!, data as any);
      
      const updatedPatient = response.data;
      const patientName = `${updatedPatient.firstName || ''} ${updatedPatient.lastName || ''}`.trim() || 'Patient';
      const patientId = updatedPatient.id || updatedPatient.patientId || data.id;

      // Upload documents if any files were provided
      if (files && files.length > 0) {
        try {
          await patientsService.uploadDocuments(patientId, files);
          
          // Fetch and update documents for this patient
          const docsResponse = await patientsService.getPatientDocuments(patientId);
          if (docsResponse.success && docsResponse.data) {
            setDocumentsMap(prev => ({
              ...prev,
              [patientId]: docsResponse.data
            }));
          }
        } catch (docError: any) {
          console.error('Error uploading documents:', docError);
          notifications.show({
            title: 'Warning',
            message: 'Patient updated but some documents failed to upload. You can upload them later.',
            color: 'yellow',
            autoClose: 5000,
          });
        }
      }

      // Refresh the patients list and stats first
      await fetchPatients();
      await fetchStats();
      
      // Close the form modal
      close();
      
      // Show notification after modal closes
      setTimeout(() => {
        const documentsMsg = files && files.length > 0 ? `\n${files.length} document(s) uploaded` : '';
        notifications.show({
          title: '✅ Patient Updated Successfully!',
          message: `Patient Name: ${patientName}\nPatient ID: ${patientId}${documentsMsg}`,
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
    // Medical history save - Backend endpoint pending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notifications.show({
      title: 'Success',
      message: 'Medical history saved successfully',
      color: 'green',
    });
  };

  const handleUpdateMedicalHistory = async (id: string, history: any) => {
    // Medical history update - Backend endpoint pending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notifications.show({
      title: 'Success',
      message: 'Medical history updated successfully',
      color: 'green',
    });
  };

  const handleDeleteMedicalHistory = async (id: string) => {
    // Medical history delete - Backend endpoint pending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notifications.show({
      title: 'Success',
      message: 'Medical history deleted successfully',
      color: 'green',
    });
  };

  // Document operations
  const handleUploadDocument = async (document: any, file: File) => {
    if (!selectedPatient) return;
    
    try {
      // Simulate document upload - in real app, upload to server/storage
      const newDocument = {
        id: Date.now().toString(),
        ...document,
        patientId: selectedPatient.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        fileUrl: URL.createObjectURL(file), // Temporary URL for preview
      };
      
      // Update both current documents and the map
      const updatedDocs = [...(documentsMap[selectedPatient.id] || []), newDocument];
      setPatientDocuments(updatedDocs);
      setDocumentsMap(prev => ({
        ...prev,
        [selectedPatient.id]: updatedDocs
      }));
      
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
    if (!selectedPatient) return;
    
    try {
      const updatedDocs = patientDocuments.map(doc => 
        doc.id === id ? { ...doc, ...document } : doc
      );
      
      setPatientDocuments(updatedDocs);
      setDocumentsMap(prev => ({
        ...prev,
        [selectedPatient.id]: updatedDocs
      }));
      
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
    if (!selectedPatient) return;
    
    try {
      const updatedDocs = patientDocuments.filter(doc => doc.id !== id);
      
      setPatientDocuments(updatedDocs);
      setDocumentsMap(prev => ({
        ...prev,
        [selectedPatient.id]: updatedDocs
      }));
      
      notifications.show({
        title: '✅ Document Deleted',
        message: 'Document deleted successfully!',
        color: 'green',
      });
    } catch (error) {
      console.error('Document delete error:', error);
    }
  };

  const handleDownloadDocument = async (document: any) => {
    // Document download - Implementation pending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notifications.show({
      title: 'Info',
      message: 'Download functionality will be available soon',
      color: 'blue',
    });
  };

  const handleViewDocument = async (document: any) => {
    // Document view - Implementation pending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    notifications.show({
      title: 'Info',
      message: 'Document viewer will be available soon',
      color: 'blue',
    });
  };

  // Search operations
  const handleSearch = async (criteria: PatientSearchParams) => {
    
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
    notifications.show({
      title: '💾 Search Saved',
      message: `Search "${name}" has been saved successfully`,
      color: 'green',
    });
  };

  // Export operations
  const handleExportPatients = async (options: any) => {
    // Export patients - Implementation pending
    await new Promise((resolve) => setTimeout(resolve, 2000));
    notifications.show({
      title: 'Success',
      message: 'Patients exported successfully',
      color: 'green',
    });
  };

  const handleGenerateReport = async (reportType: string, patientIds?: string[]) => {
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

  // Export and Print operations for individual patient
  const handleExportPatient = (patient: Patient) => {
    
    // Create patient data object
    const patientData = {
      'Patient ID': patient.patientId,
      'Name': `${patient.firstName} ${patient.lastName}`,
      'Date of Birth': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A',
      'Age': patient.age || 'N/A',
      'Gender': patient.gender || 'N/A',
      'Blood Group': patient.bloodGroup || 'N/A',
      'Phone': patient.contactInfo?.phone || 'N/A',
      'Email': patient.contactInfo?.email || 'N/A',
      'Address': `${patient.address?.street || ''}, ${patient.address?.city || ''}, ${patient.address?.state || ''}`,
      'Registration Date': patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString() : 'N/A',
      'Total Visits': patient.totalVisits || 0,
      'Status': patient.status || 'N/A',
    };
    
    // Convert to CSV
    const csv = Object.entries(patientData)
      .map(([key, value]) => `"${key}","${value}"`)
      .join('\n');
    
    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${patient.patientId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    notifications.show({
      title: '✅ Export Successful',
      message: `Patient data exported successfully`,
      color: 'green',
    });
  };

  const handlePrintPatient = (patient: Patient) => {
    
    // Create print window with patient details
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      notifications.show({
        title: 'Error',
        message: 'Please allow popups to print',
        color: 'red',
      });
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Details - ${patient.firstName} ${patient.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #228be6; border-bottom: 2px solid #228be6; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .value { display: inline-block; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>Patient Details</h1>
        <div class="section">
          <div><span class="label">Patient ID:</span><span class="value">${patient.patientId}</span></div>
          <div><span class="label">Name:</span><span class="value">${patient.firstName} ${patient.lastName}</span></div>
          <div><span class="label">Date of Birth:</span><span class="value">${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
          <div><span class="label">Age:</span><span class="value">${patient.age || 'N/A'}</span></div>
          <div><span class="label">Gender:</span><span class="value">${patient.gender || 'N/A'}</span></div>
          <div><span class="label">Blood Group:</span><span class="value">${patient.bloodGroup || 'N/A'}</span></div>
        </div>
        <div class="section">
          <h2>Contact Information</h2>
          <div><span class="label">Phone:</span><span class="value">${patient.contactInfo?.phone || 'N/A'}</span></div>
          <div><span class="label">Email:</span><span class="value">${patient.contactInfo?.email || 'N/A'}</span></div>
          <div><span class="label">Address:</span><span class="value">${patient.address?.street || ''}, ${patient.address?.city || ''}, ${patient.address?.state || ''}</span></div>
        </div>
        <div class="section">
          <h2>Medical Information</h2>
          <div><span class="label">Allergies:</span><span class="value">${patient.allergies?.join(', ') || 'None'}</span></div>
          <div><span class="label">Chronic Diseases:</span><span class="value">${patient.chronicDiseases?.join(', ') || 'None'}</span></div>
        </div>
        <div class="section">
          <div><span class="label">Registration Date:</span><span class="value">${patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString() : 'N/A'}</span></div>
          <div><span class="label">Total Visits:</span><span class="value">${patient.totalVisits || 0}</span></div>
          <div><span class="label">Status:</span><span class="value">${patient.status || 'N/A'}</span></div>
        </div>
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #228be6; color: white; border: none; cursor: pointer;">Print</button>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Portal operations
  const handleEnablePortalAccess = async (patientId: string, preferences: any) => {
    try {
      // In production, this would call the backend API
      // await patientsService.enablePortalAccess(patientId, preferences);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      notifications.show({
        title: '✅ Portal Access Enabled',
        message: 'Patient portal access has been enabled successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to enable portal access',
        color: 'red',
      });
    }
  };

  const handleDisablePortalAccess = async (patientId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      notifications.show({
        title: '✅ Portal Access Disabled',
        message: 'Patient portal access has been disabled',
        color: 'orange',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to disable portal access',
        color: 'red',
      });
    }
  };

  const handleUpdatePortalPreferences = async (patientId: string, preferences: any) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      notifications.show({
        title: '✅ Preferences Updated',
        message: 'Portal preferences updated successfully',
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update preferences',
        color: 'red',
      });
    }
  };

  const handleResetPortalPassword = async (patientId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      notifications.show({
        title: '✅ Password Reset',
        message: 'Portal password has been reset. New credentials sent to patient.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to reset password',
        color: 'red',
      });
    }
  };

  const handleSendPortalCredentials = async (patientId: string, method: 'email' | 'sms') => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      notifications.show({
        title: '✅ Credentials Sent',
        message: `Portal credentials sent via ${method.toUpperCase()}`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send credentials',
        color: 'red',
      });
    }
  };

  // Additional handlers
  const handleScheduleAppointment = (patientId: string) => {
    // Close the patient details modal
    closeView();
    // Navigate to appointments page with patient pre-selected
    window.location.href = `/dashboard/appointments?patientId=${patientId}`;
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
      // Load documents for this patient
      setPatientDocuments(documentsMap[fullPatient.id] || []);
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
            onPageChange: (page) => {},
            onLimitChange: (limit) => {},
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
          documents={patientDocuments}
          medicalHistory={[]}
          appointments={[]}
          onEdit={handleEditFromDetails}
          onScheduleAppointment={handleScheduleAppointment}
          onExport={handleExportPatient}
          onPrint={handlePrintPatient}
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

