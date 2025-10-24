'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Table,
  Modal,
  Text,
  Tabs,
  Card,
  Avatar,
  ActionIcon,
  Stack,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Progress,
  NumberInput,
  Textarea,
  // Switch,
  Divider,
  // Alert,
  Timeline,
  // List,
  Indicator,
  // RingProgress,
  // Stepper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
// import { DatePickerInput } from '@mantine/dates';
import insuranceService from '../../../services/insurance.service';
import {
  MantineDonutChart,
  SimpleAreaChart,
  SimpleBarChart,
  SimpleLineChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  // IconTrash,
  IconShield,
  // IconUser,
  // IconUsers,
  // IconCalendar,
  // IconClock,
  // IconStethoscope,
  // IconHeart,
  // IconActivity,
  IconChartBar,
  // IconTrendingUp,
  // IconTrendingDown,
  // IconMedicalCross,
  // IconNurse,
  // IconPill,
  // IconDroplet,
  // IconThermometer,
  // IconLungs,
  // IconFileText,
  IconPrinter,
  // IconDownload,
  IconRefresh,
  // IconUserCheck,
  // IconBedFilled,
  IconClipboard,
  // IconReport,
  // IconCalendarEvent,
  // IconPhone,
  // IconMail,
  // IconMapPin,
  IconCash,
  IconCreditCard,
  // IconReceipt,
  IconCheck,
  IconX,
  // IconAlertCircle,
  // IconArrowUp,
  // IconArrowDown,
  // IconHome,
  // IconTransfer,
  // IconEmergencyBed,
  IconBuildingBank,
  IconFileUpload,
  IconClockHour4,
  // IconCheckbox,
  // IconAlertTriangle,
  // IconPhotoCheck,
  // IconNotes,
  // IconFilter,
  // IconSortDescending,
  IconExternalLink,
  // IconCalendarStats,
  // IconCurrency,
  IconPercentage,
  // IconShieldCheck,
  // IconShieldX,
  // IconClockPause,
  // IconFileCheck,
  // IconFileX,
  IconAlarm,
} from '@tabler/icons-react';

// Types
interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  type: 'mediclaim' | 'corporate' | 'government' | 'tpa';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  cashlessLimit: number;
  reimbursementTurnover: number; // days
  activeStatus: boolean;
  contractStartDate: string;
  contractEndDate: string;
  totalPolicies: number;
  totalClaims: number;
  totalApproved: number;
  totalRejected: number;
  averageApprovalTime: number; // hours
  approvalRate: number; // percentage
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  policyNumber: string;
  providerId: string;
  providerName: string;
  claimType: 'cashless' | 'reimbursement';
  status: 'pending' | 'approved' | 'rejected' | 'investigating' | 'partial' | 'settled';
  priority: 'high' | 'medium' | 'low';
  submissionDate: string;
  approvalDate?: string;
  settlementDate?: string;
  admissionDate: string;
  dischargeDate?: string;
  diagnosis: string;
  procedure?: string;
  totalBillAmount: number;
  claimedAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  deductible: number;
  copayment: number;
  rejectionReason?: string;
  documents: Array<{
    type: string;
    name: string;
    uploadDate: string;
    status: 'pending' | 'verified' | 'rejected';
  }>;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
    updatedBy: string;
  }>;
}

interface PolicyDetails {
  id: string;
  policyNumber: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  policyType: 'individual' | 'family' | 'corporate';
  planName: string;
  coverageAmount: number;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  dependents: Array<{
    name: string;
    relation: string;
    age: number;
  }>;
  benefits: Array<{
    category: string;
    coverageLimit: number;
    utilisedAmount: number;
  }>;
  exclusions: string[];
  claimsHistory: number;
  totalUtilised: number;
}

// Mock data
const _mockInsuranceProviders: InsuranceProvider[] = [
  {
    id: '1',
    name: 'Star Health Insurance',
    code: 'STAR',
    type: 'mediclaim',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh@starhealth.com',
    address: 'Chennai, Tamil Nadu',
    cashlessLimit: 500000,
    reimbursementTurnover: 15,
    activeStatus: true,
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    totalPolicies: 1250,
    totalClaims: 892,
    totalApproved: 756,
    totalRejected: 136,
    averageApprovalTime: 48,
    approvalRate: 84.8,
  },
  {
    id: '2',
    name: 'ICICI Lombard',
    code: 'ICICI',
    type: 'mediclaim',
    contactPerson: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya@icicilombard.com',
    address: 'Mumbai, Maharashtra',
    cashlessLimit: 750000,
    reimbursementTurnover: 12,
    activeStatus: true,
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    totalPolicies: 980,
    totalClaims: 672,
    totalApproved: 612,
    totalRejected: 60,
    averageApprovalTime: 36,
    approvalRate: 91.1,
  },
  {
    id: '3',
    name: 'Max Bupa Health',
    code: 'MAXBUPA',
    type: 'mediclaim',
    contactPerson: 'Amit Singh',
    phone: '+91 76543 21098',
    email: 'amit@maxbupa.com',
    address: 'Delhi, NCR',
    cashlessLimit: 1000000,
    reimbursementTurnover: 10,
    activeStatus: true,
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    totalPolicies: 1456,
    totalClaims: 1124,
    totalApproved: 1034,
    totalRejected: 90,
    averageApprovalTime: 42,
    approvalRate: 92.0,
  },
  {
    id: '4',
    name: 'Medi Assist TPA',
    code: 'MEDIASSIST',
    type: 'tpa',
    contactPerson: 'Sunita Patel',
    phone: '+91 65432 10987',
    email: 'sunita@mediassist.com',
    address: 'Hyderabad, Telangana',
    cashlessLimit: 300000,
    reimbursementTurnover: 18,
    activeStatus: true,
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    totalPolicies: 567,
    totalClaims: 423,
    totalApproved: 356,
    totalRejected: 67,
    averageApprovalTime: 54,
    approvalRate: 84.2,
  },
];

const _mockInsuranceClaims: InsuranceClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM2024001',
    patientId: 'P2024001',
    patientName: 'Rajesh Kumar',
    patientAge: 45,
    patientGender: 'Male',
    policyNumber: 'STAR123456789',
    providerId: '1',
    providerName: 'Star Health Insurance',
    claimType: 'cashless',
    status: 'approved',
    priority: 'high',
    submissionDate: '2024-01-10T08:30:00Z',
    approvalDate: '2024-01-12T14:20:00Z',
    admissionDate: '2024-01-10T08:30:00Z',
    dischargeDate: '2024-01-15T10:00:00Z',
    diagnosis: 'Acute Myocardial Infarction',
    procedure: 'Angioplasty',
    totalBillAmount: 450000,
    claimedAmount: 450000,
    approvedAmount: 425000,
    rejectedAmount: 25000,
    deductible: 10000,
    copayment: 15000,
    documents: [
      {
        type: 'Discharge Summary',
        name: 'discharge_summary.pdf',
        uploadDate: '2024-01-15',
        status: 'verified',
      },
      {
        type: 'Medical Bills',
        name: 'medical_bills.pdf',
        uploadDate: '2024-01-15',
        status: 'verified',
      },
    ],
    timeline: [
      {
        date: '2024-01-10T08:30:00Z',
        status: 'submitted',
        description: 'Claim submitted',
        updatedBy: 'Hospital Staff',
      },
      {
        date: '2024-01-12T14:20:00Z',
        status: 'approved',
        description: 'Claim approved',
        updatedBy: 'Insurance Officer',
      },
    ],
  },
  {
    id: '2',
    claimNumber: 'CLM2024002',
    patientId: 'P2024002',
    patientName: 'Sunita Patel',
    patientAge: 38,
    patientGender: 'Female',
    policyNumber: 'ICICI987654321',
    providerId: '2',
    providerName: 'ICICI Lombard',
    claimType: 'reimbursement',
    status: 'pending',
    priority: 'medium',
    submissionDate: '2024-01-14T16:45:00Z',
    admissionDate: '2024-01-12T14:15:00Z',
    dischargeDate: '2024-01-18T11:00:00Z',
    diagnosis: 'Elective Cholecystectomy',
    procedure: 'Laparoscopic Cholecystectomy',
    totalBillAmount: 125000,
    claimedAmount: 125000,
    approvedAmount: 0,
    rejectedAmount: 0,
    deductible: 5000,
    copayment: 12500,
    documents: [
      {
        type: 'Discharge Summary',
        name: 'discharge_summary.pdf',
        uploadDate: '2024-01-18',
        status: 'verified',
      },
      {
        type: 'Medical Bills',
        name: 'medical_bills.pdf',
        uploadDate: '2024-01-18',
        status: 'pending',
      },
    ],
    timeline: [
      {
        date: '2024-01-14T16:45:00Z',
        status: 'submitted',
        description: 'Claim submitted',
        updatedBy: 'Hospital Staff',
      },
    ],
  },
  {
    id: '3',
    claimNumber: 'CLM2024003',
    patientId: 'P2024003',
    patientName: 'Mohammed Ali',
    patientAge: 62,
    patientGender: 'Male',
    policyNumber: 'MAX456789123',
    providerId: '3',
    providerName: 'Max Bupa Health',
    claimType: 'cashless',
    status: 'investigating',
    priority: 'high',
    submissionDate: '2024-01-13T11:30:00Z',
    admissionDate: '2024-01-13T10:45:00Z',
    diagnosis: 'Total Knee Replacement',
    procedure: 'Total Knee Arthroplasty',
    totalBillAmount: 280000,
    claimedAmount: 280000,
    approvedAmount: 0,
    rejectedAmount: 0,
    deductible: 8000,
    copayment: 20000,
    documents: [
      {
        type: 'Pre-authorization',
        name: 'preauth.pdf',
        uploadDate: '2024-01-13',
        status: 'verified',
      },
      { type: 'Medical Reports', name: 'reports.pdf', uploadDate: '2024-01-13', status: 'pending' },
    ],
    timeline: [
      {
        date: '2024-01-13T11:30:00Z',
        status: 'submitted',
        description: 'Pre-authorization submitted',
        updatedBy: 'Hospital Staff',
      },
      {
        date: '2024-01-14T09:15:00Z',
        status: 'investigating',
        description: 'Under medical review',
        updatedBy: 'Medical Officer',
      },
    ],
  },
];

const _mockPolicyDetails: PolicyDetails[] = [
  {
    id: '1',
    policyNumber: 'STAR123456789',
    patientId: 'P2024001',
    patientName: 'Rajesh Kumar',
    providerId: '1',
    providerName: 'Star Health Insurance',
    policyType: 'individual',
    planName: 'Star Comprehensive',
    coverageAmount: 500000,
    premiumAmount: 24000,
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    status: 'active',
    dependents: [],
    benefits: [
      { category: 'Hospitalization', coverageLimit: 500000, utilisedAmount: 125000 },
      { category: 'Day Care Procedures', coverageLimit: 50000, utilisedAmount: 0 },
      { category: 'Maternity', coverageLimit: 75000, utilisedAmount: 0 },
    ],
    exclusions: ['Cosmetic Surgery', 'Dental Treatment', 'Pre-existing conditions (first year)'],
    claimsHistory: 2,
    totalUtilised: 125000,
  },
];

const InsuranceManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('claims');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedClaimType, setSelectedClaimType] = useState<string>('');
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [_selectedPolicy, _setSelectedPolicy] = useState<PolicyDetails | null>(null);

  // API data state
  const [_claims, _setClaims] = useState<InsuranceClaim[]>([]);
  const [_stats, _setStats] = useState<any>(null);
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      _setLoading(true);
      _setError(null);
      await Promise.all([fetchClaims(), fetchStats()]);
    } catch (err: any) {
      console.error('Error loading insurance data:', err);
      _setError(err.response?.data?.message || err.message || 'Failed to load insurance data');
    } finally {
      _setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const filters = {
        status: selectedStatus || undefined,
        providerId: selectedProvider || undefined,
        search: searchQuery || undefined,
      };
      const response = await insuranceService.getClaims(filters);
      // Handle different response structures
      const claimsData = Array.isArray(response.data) ? response.data : response.data?.items || [];
      _setClaims(claimsData as InsuranceClaim[]);
    } catch (err: any) {
      console.warn(
        'Error fetching claims (using empty data):',
        err.response?.data?.message || err.message
      );
      _setClaims([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await insuranceService.getStats();
      _setStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching insurance stats (using default values):',
        err.response?.data?.message || err.message
      );
      _setStats({
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        totalClaimAmount: 0,
        approvedAmount: 0,
      });
    }
  };

  useEffect(() => {
    if (!_loading) {
      fetchClaims();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedProvider, selectedStatus]);

  // Modal states
  const [claimDetailOpened, { open: openClaimDetail, close: closeClaimDetail }] =
    useDisclosure(false);
  const [newClaimOpened, { open: openNewClaim, close: closeNewClaim }] = useDisclosure(false);
  const [_policyDetailOpened, { open: _openPolicyDetail, close: _closePolicyDetail }] =
    useDisclosure(false);
  const [_providerDetailOpened, { open: _openProviderDetail, close: _closeProviderDetail }] =
    useDisclosure(false);

  // Filter claims
  const filteredClaims = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (claim) => {
        const matchesSearch =
          claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProvider = !selectedProvider || claim.providerId === selectedProvider;
        const matchesStatus = !selectedStatus || claim.status === selectedStatus;
        const matchesType = !selectedClaimType || claim.claimType === selectedClaimType;

        return matchesSearch && matchesProvider && matchesStatus && matchesType;
      }
    );
  }, [searchQuery, selectedProvider, selectedStatus, selectedClaimType]);

  const handleViewClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    openClaimDetail();
  };

  const _handleViewPolicy = (policy: PolicyDetails) => {
    _setSelectedPolicy(policy);
    _openPolicyDetail();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'yellow';
      case 'investigating':
        return 'orange';
      case 'partial':
        return 'blue';
      case 'settled':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Insurance stats
  const insuranceStats = {
    totalClaims: 0 /* TODO: Fetch from API */,
    pendingClaims: [].filter(/* TODO: Fetch from API */ (c) => c.status === 'pending').length,
    approvedClaims: [].filter(/* TODO: Fetch from API */ (c) => c.status === 'approved').length,
    rejectedClaims: [].filter(/* TODO: Fetch from API */ (c) => c.status === 'rejected').length,
    totalClaimedAmount: [].reduce(/* TODO: Fetch from API */ (acc, c) => acc + c.claimedAmount, 0),
    totalApprovedAmount: [].reduce(
      /* TODO: Fetch from API */ (acc, c) => acc + c.approvedAmount,
      0
    ),
    averageProcessingTime: Math.round(
      [].reduce(/* TODO: Fetch from API */ (acc, c) => acc + (c.approvalDate ? 48 : 24), 0) /
        0 /* TODO: Fetch from API */
    ),
    approvalRate: Math.round(
      ([].filter(/* TODO: Fetch from API */ (c) => c.status === 'approved').length /
        0) /* TODO: Fetch from API */ *
        100
    ),
  };

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Insurance & TPA Management</Title>
          <Text c="dimmed" size="sm">
            Manage insurance claims, policies, and third-party administrators
          </Text>
        </div>
        <Group>
          <Button variant="light" leftSection={<IconRefresh size={16} />}>
            Refresh Data
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openNewClaim}>
            New Claim
          </Button>
        </Group>
      </Group>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 8 }} mb="lg" spacing="sm">
        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="blue" size="lg" radius="md" variant="light">
              <IconClipboard size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {insuranceStats.totalClaims}
              </Text>
              <Text size="xs" c="dimmed">
                Total Claims
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="yellow" size="lg" radius="md" variant="light">
              <IconClockHour4 size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {insuranceStats.pendingClaims}
              </Text>
              <Text size="xs" c="dimmed">
                Pending
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="green" size="lg" radius="md" variant="light">
              <IconCheck size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {insuranceStats.approvedClaims}
              </Text>
              <Text size="xs" c="dimmed">
                Approved
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="red" size="lg" radius="md" variant="light">
              <IconX size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {insuranceStats.rejectedClaims}
              </Text>
              <Text size="xs" c="dimmed">
                Rejected
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="teal" size="lg" radius="md" variant="light">
              <IconCash size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                ₹{(insuranceStats.totalClaimedAmount / 100000).toFixed(1)}L
              </Text>
              <Text size="xs" c="dimmed">
                Claimed
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="lime" size="lg" radius="md" variant="light">
              <IconCreditCard size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                ₹{(insuranceStats.totalApprovedAmount / 100000).toFixed(1)}L
              </Text>
              <Text size="xs" c="dimmed">
                Approved
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="purple" size="lg" radius="md" variant="light">
              <IconAlarm size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {insuranceStats.averageProcessingTime}h
              </Text>
              <Text size="xs" c="dimmed">
                Avg Process
              </Text>
            </div>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="center">
            <ThemeIcon color="cyan" size="lg" radius="md" variant="light">
              <IconPercentage size={20} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>
                {insuranceStats.approvalRate}%
              </Text>
              <Text size="xs" c="dimmed">
                Approval Rate
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="claims" leftSection={<IconClipboard size={16} />}>
            Insurance Claims
          </Tabs.Tab>
          <Tabs.Tab value="policies" leftSection={<IconShield size={16} />}>
            Policy Management
          </Tabs.Tab>
          <Tabs.Tab value="providers" leftSection={<IconBuildingBank size={16} />}>
            Providers & TPA
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Insurance Claims Tab */}
        <Tabs.Panel value="claims">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search claims..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Provider"
                data={[].map(/* TODO: Fetch from API */ (p) => ({ value: p.id, label: p.name }))}
                value={selectedProvider}
                onChange={setSelectedProvider}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'investigating', label: 'Investigating' },
                  { value: 'settled', label: 'Settled' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Type"
                data={[
                  { value: 'cashless', label: 'Cashless' },
                  { value: 'reimbursement', label: 'Reimbursement' },
                ]}
                value={selectedClaimType}
                onChange={setSelectedClaimType}
                clearable
              />
            </Group>

            {/* Claims Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Claim #</Table.Th>
                    <Table.Th>Patient</Table.Th>
                    <Table.Th>Provider</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Diagnosis</Table.Th>
                    <Table.Th>Claimed Amount</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Submission Date</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredClaims.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
                        <EmptyState
                          icon={<IconShield size={48} />}
                          title="No insurance records"
                          description="Add insurance information"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <Table.Tr key={claim.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {claim.claimNumber}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Avatar color="blue" radius="xl" size="sm">
                              {claim.patientName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {claim.patientName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {claim.patientAge}Y, {claim.patientGender}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {claim.providerName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {claim.policyNumber}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm" tt="uppercase">
                            {claim.claimType}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {claim.diagnosis}
                            </Text>
                            {claim.procedure && (
                              <Text size="xs" c="dimmed">
                                {claim.procedure}
                              </Text>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              ₹{claim.claimedAmount.toLocaleString()}
                            </Text>
                            {claim.approvedAmount > 0 && (
                              <Text size="xs" c="green">
                                Approved: ₹{claim.approvedAmount.toLocaleString()}
                              </Text>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge color={getStatusColor(claim.status)} variant="light" size="sm">
                              {claim.status.toUpperCase()}
                            </Badge>
                            {claim.status === 'pending' && <Indicator color="orange" size={8} />}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={getPriorityColor(claim.priority)}
                            variant="outline"
                            size="sm"
                          >
                            {claim.priority.toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate(claim.submissionDate)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewClaim(claim)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="purple">
                              <IconFileUpload size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="orange">
                              <IconPrinter size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        {/* Policy Management Tab */}
        <Tabs.Panel value="policies">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Active Policies
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (policy) => (
                  <Card
                    key={policy.id}
                    padding="lg"
                    radius="md"
                    withBorder
                    onClick={() => _handleViewPolicy(policy)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600} size="lg">
                          {policy.planName}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {policy.policyNumber}
                        </Text>
                      </div>
                      <Badge color={policy.status === 'active' ? 'green' : 'red'} variant="light">
                        {policy.status.toUpperCase()}
                      </Badge>
                    </Group>

                    <Group mb="md">
                      <Avatar color="blue" size="md" radius="xl">
                        {policy.patientName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {policy.patientName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {policy.providerName}
                        </Text>
                      </div>
                    </Group>

                    <div className="mb-md">
                      <Text size="sm" c="dimmed" mb="xs">
                        Coverage Utilization
                      </Text>
                      <Progress
                        value={(policy.totalUtilised / policy.coverageAmount) * 100}
                        size="lg"
                        color={policy.totalUtilised > policy.coverageAmount * 0.8 ? 'red' : 'blue'}
                      />
                      <Group justify="space-between" mt="xs">
                        <Text size="xs" c="dimmed">
                          ₹{policy.totalUtilised.toLocaleString()} used
                        </Text>
                        <Text size="xs" c="dimmed">
                          ₹{policy.coverageAmount.toLocaleString()} total
                        </Text>
                      </Group>
                    </div>

                    <SimpleGrid cols={2} spacing="sm" mb="md">
                      <div>
                        <Text size="xs" c="dimmed">
                          Policy Type
                        </Text>
                        <Text size="sm" fw={500} tt="capitalize">
                          {policy.policyType}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">
                          Claims
                        </Text>
                        <Text size="sm" fw={500}>
                          {policy.claimsHistory}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">
                          Start Date
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(policy.startDate)}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" c="dimmed">
                          End Date
                        </Text>
                        <Text size="sm" fw={500}>
                          {formatDate(policy.endDate)}
                        </Text>
                      </div>
                    </SimpleGrid>

                    <Group justify="space-between">
                      <Text size="sm" fw={600} c="green">
                        ₹{policy.coverageAmount.toLocaleString()}
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Providers & TPA Tab */}
        <Tabs.Panel value="providers">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Insurance Providers & TPA
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {[].map(
                /* TODO: Fetch from API */ (provider) => (
                  <Card key={provider.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Group mb="xs">
                          <ThemeIcon color="blue" variant="light">
                            <IconBuildingBank size={20} />
                          </ThemeIcon>
                          <div>
                            <Text fw={600} size="lg">
                              {provider.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {provider.code} • {provider.type.toUpperCase()}
                            </Text>
                          </div>
                        </Group>
                      </div>
                      <Badge color={provider.activeStatus ? 'green' : 'red'} variant="light">
                        {provider.activeStatus ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Contact Person
                        </Text>
                        <Text size="sm" fw={500}>
                          {provider.contactPerson}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Phone
                        </Text>
                        <Text size="sm" fw={500}>
                          {provider.phone}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Cashless Limit
                        </Text>
                        <Text size="sm" fw={500} c="green">
                          ₹{provider.cashlessLimit.toLocaleString()}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Approval Rate
                        </Text>
                        <Text
                          size="sm"
                          fw={500}
                          c={provider.approvalRate > 85 ? 'green' : 'orange'}
                        >
                          {provider.approvalRate}%
                        </Text>
                      </Group>
                    </Stack>

                    <Divider mb="md" />

                    <SimpleGrid cols={3} spacing="sm" mb="md">
                      <div style={{ textAlign: 'center' }}>
                        <Text size="lg" fw={700} c="blue">
                          {provider.totalPolicies}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Policies
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="lg" fw={700} c="orange">
                          {provider.totalClaims}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Claims
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text size="lg" fw={700} c="green">
                          {provider.totalApproved}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Approved
                        </Text>
                      </div>
                    </SimpleGrid>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Avg Processing: {provider.averageApprovalTime}h
                      </Text>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="purple">
                          <IconExternalLink size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                )
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Analytics Tab */}
        <Tabs.Panel value="analytics">
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="md">
            {/* Claims Status Distribution */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Claims Status Distribution
              </Title>
              <MantineDonutChart
                data={[
                  { name: 'Approved', value: 1, color: 'green' },
                  { name: 'Pending', value: 1, color: 'yellow' },
                  { name: 'Rejected', value: 1, color: 'red' },
                  { name: 'Under Review', value: 1, color: 'blue' },
                ]}
                size={200}
                thickness={30}
                withLabels
              />
            </Card>

            {/* Provider Performance */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Provider Approval Rates
              </Title>
              <SimpleBarChart
                data={[
                  { provider: 'Max Bupa', rate: 92.0 },
                  { provider: 'Star Health', rate: 88.5 },
                  { provider: 'ICICI Lombard', rate: 85.0 },
                  { provider: 'HDFC Ergo', rate: 90.0 },
                ]}
                dataKey="provider"
                series={[{ name: 'rate', color: 'blue.6' }]}
              />
            </Card>

            {/* Monthly Claims Trend */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Monthly Claims Trend
              </Title>
              <SimpleLineChart
                data={[
                  { month: 'Jan', claims: 125, approved: 112 },
                  { month: 'Feb', claims: 138, approved: 125 },
                  { month: 'Mar', claims: 145, approved: 132 },
                  { month: 'Apr', claims: 152, approved: 140 },
                  { month: 'May', claims: 160, approved: 148 },
                  { month: 'Jun', claims: 155, approved: 142 },
                ]}
                dataKey="month"
                series={[
                  { name: 'claims', color: 'blue.6', label: 'Claims' },
                  { name: 'approved', color: 'green.6', label: 'Approved' },
                ]}
              />
            </Card>

            {/* Claim Amount Analysis */}
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Claim Amount Analysis
              </Title>
              <SimpleAreaChart
                data={[
                  { month: 'Jan', claimed: 2500000, approved: 2200000 },
                  { month: 'Feb', claimed: 2800000, approved: 2450000 },
                  { month: 'Mar', claimed: 3100000, approved: 2750000 },
                  { month: 'Apr', claimed: 2900000, approved: 2600000 },
                  { month: 'May', claimed: 3300000, approved: 2950000 },
                  { month: 'Jun', claimed: 3500000, approved: 3100000 },
                ]}
                dataKey="month"
                series={[
                  { name: 'claimed', color: 'orange.6' },
                  { name: 'approved', color: 'green.6' },
                ]}
              />
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      {/* Claim Detail Modal */}
      <Modal opened={claimDetailOpened} onClose={closeClaimDetail} title="Claim Details" size="xl">
        {selectedClaim && (
          <ScrollArea h={600}>
            <Stack gap="md">
              {/* Claim Header */}
              <Card padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <div>
                    <Title order={3}>{selectedClaim.claimNumber}</Title>
                    <Text c="dimmed">
                      {selectedClaim.patientName} • {selectedClaim.providerName}
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Badge color={getStatusColor(selectedClaim.status)} variant="light">
                        {selectedClaim.status.toUpperCase()}
                      </Badge>
                      <Badge color={getPriorityColor(selectedClaim.priority)} variant="outline">
                        {selectedClaim.priority.toUpperCase()}
                      </Badge>
                    </Group>
                  </div>
                  <Group>
                    <Button variant="light" leftSection={<IconEdit size={16} />}>
                      Update Status
                    </Button>
                    <Button variant="light" leftSection={<IconPrinter size={16} />}>
                      Print
                    </Button>
                  </Group>
                </Group>

                <SimpleGrid cols={4} spacing="md">
                  <div>
                    <Text size="sm" c="dimmed">
                      Policy Number
                    </Text>
                    <Text fw={500}>{selectedClaim.policyNumber}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Claim Type
                    </Text>
                    <Text fw={500} tt="capitalize">
                      {selectedClaim.claimType}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Admission Date
                    </Text>
                    <Text fw={500}>{formatDate(selectedClaim.admissionDate)}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Submission Date
                    </Text>
                    <Text fw={500}>{formatDate(selectedClaim.submissionDate)}</Text>
                  </div>
                </SimpleGrid>
              </Card>

              {/* Medical Information */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={5} mb="md">
                  Medical Information
                </Title>
                <SimpleGrid cols={2} spacing="md">
                  <div>
                    <Text size="sm" c="dimmed" fw={500} mb="xs">
                      Diagnosis
                    </Text>
                    <Text>{selectedClaim.diagnosis}</Text>
                  </div>
                  {selectedClaim.procedure && (
                    <div>
                      <Text size="sm" c="dimmed" fw={500} mb="xs">
                        Procedure
                      </Text>
                      <Text>{selectedClaim.procedure}</Text>
                    </div>
                  )}
                </SimpleGrid>
              </Card>

              {/* Financial Information */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={5} mb="md">
                  Financial Breakdown
                </Title>
                <SimpleGrid cols={2} spacing="md">
                  <div>
                    <Text size="sm" c="dimmed">
                      Total Bill Amount
                    </Text>
                    <Text size="xl" fw={700} c="blue">
                      ₹{selectedClaim.totalBillAmount.toLocaleString()}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Claimed Amount
                    </Text>
                    <Text size="xl" fw={700} c="orange">
                      ₹{selectedClaim.claimedAmount.toLocaleString()}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Approved Amount
                    </Text>
                    <Text size="xl" fw={700} c="green">
                      ₹{selectedClaim.approvedAmount.toLocaleString()}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Rejected Amount
                    </Text>
                    <Text size="xl" fw={700} c="red">
                      ₹{selectedClaim.rejectedAmount.toLocaleString()}
                    </Text>
                  </div>
                </SimpleGrid>

                <Divider my="md" />

                <SimpleGrid cols={2} spacing="md">
                  <div>
                    <Text size="sm" c="dimmed">
                      Deductible
                    </Text>
                    <Text fw={500}>₹{selectedClaim.deductible.toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Co-payment
                    </Text>
                    <Text fw={500}>₹{selectedClaim.copayment.toLocaleString()}</Text>
                  </div>
                </SimpleGrid>
              </Card>

              {/* Documents */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={5} mb="md">
                  Submitted Documents
                </Title>
                <Stack gap="sm">
                  {selectedClaim.documents.map((doc, index) => (
                    <Group
                      key={index}
                      justify="space-between"
                      p="sm"
                      style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}
                    >
                      <div>
                        <Text size="sm" fw={500}>
                          {doc.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {doc.type} • {formatDate(doc.uploadDate)}
                        </Text>
                      </div>
                      <Badge
                        color={
                          doc.status === 'verified'
                            ? 'green'
                            : doc.status === 'rejected'
                              ? 'red'
                              : 'yellow'
                        }
                        variant="light"
                        size="sm"
                      >
                        {doc.status.toUpperCase()}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Card>

              {/* Timeline */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={5} mb="md">
                  Claim Timeline
                </Title>
                <Timeline active={selectedClaim.timeline.length - 1} bulletSize={24} lineWidth={2}>
                  {selectedClaim.timeline.map((item, index) => (
                    <Timeline.Item
                      key={index}
                      bullet={<IconCheck size={12} />}
                      title={item.status.toUpperCase()}
                    >
                      <Text c="dimmed" size="sm">
                        {item.description}
                      </Text>
                      <Text size="xs" mt={4}>
                        {formatDateTime(item.date)} • {item.updatedBy}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>

              {/* Action Buttons */}
              <Group justify="flex-end">
                <Button variant="light" onClick={closeClaimDetail}>
                  Close
                </Button>
                <Button variant="light" leftSection={<IconFileUpload size={16} />}>
                  Upload Documents
                </Button>
                <Button leftSection={<IconEdit size={16} />}>Update Claim</Button>
              </Group>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* New Claim Modal */}
      <Modal
        opened={newClaimOpened}
        onClose={closeNewClaim}
        title="Submit New Insurance Claim"
        size="lg"
      >
        <Stack gap="md">
          <SimpleGrid cols={2} spacing="md">
            <Select
              label="Patient"
              placeholder="Select patient"
              data={[
                { value: 'P001', label: 'Rajesh Kumar' },
                { value: 'P002', label: 'Sunita Patel' },
                { value: 'P003', label: 'Mohammed Ali' },
              ]}
              searchable
              required
            />
            <Select
              label="Insurance Provider"
              placeholder="Select provider"
              data={[].map(/* TODO: Fetch from API */ (p) => ({ value: p.id, label: p.name }))}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="md">
            <TextInput label="Policy Number" placeholder="Enter policy number" required />
            <Select
              label="Claim Type"
              placeholder="Select type"
              data={[
                { value: 'cashless', label: 'Cashless' },
                { value: 'reimbursement', label: 'Reimbursement' },
              ]}
              required
            />
          </SimpleGrid>

          <Textarea label="Diagnosis" placeholder="Enter primary diagnosis" required />

          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Total Bill Amount"
              placeholder="Enter amount"
              leftSection="₹"
              required
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              data={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              defaultValue="medium"
              required
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewClaim}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Claim Submitted',
                  message: 'Insurance claim has been successfully submitted',
                  color: 'green',
                });
                closeNewClaim();
              }}
            >
              Submit Claim
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default InsuranceManagement;
