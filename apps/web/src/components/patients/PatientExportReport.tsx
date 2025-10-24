'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Title,
  Grid,
  Checkbox,
  Alert,
  Tabs,
  Progress,
  Badge,
  Card,
  Divider,
  Timeline,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconDownload,
  IconFileExport,
  // IconFilePdf, // not available
  IconFileSpreadsheet,
  IconShare,
  IconCalendar,
  IconCheck,
  IconFileText,
  IconChartBar,
  IconUser,
  IconStethoscope,
  IconShield,
  IconHistory,
  IconAlertCircle,
  IconReportAnalytics,
} from '@tabler/icons-react';
import { PatientExportOptions, PatientReport } from '../../types/patient';

interface PatientExportReportProps {
  opened: boolean;
  onClose: () => void;
  onExport: (options: PatientExportOptions) => Promise<void>;
  onGenerateReport: (reportType: string, patientIds?: string[]) => Promise<PatientReport>;
  patientCount: number;
  selectedPatientIds?: string[];
}

const exportFormats = [
  { value: 'csv', label: 'CSV File', icon: <IconFileText size="1rem" /> },
  { value: 'excel', label: 'Excel Spreadsheet', icon: <IconFileSpreadsheet size="1rem" /> },
  { value: 'pdf', label: 'PDF Document', icon: <IconFileText size="1rem" /> },
];

const availableFields = [
  {
    group: 'Basic Information',
    fields: [
      { value: 'patientId', label: 'Patient ID' },
      { value: 'firstName', label: 'First Name' },
      { value: 'lastName', label: 'Last Name' },
      { value: 'age', label: 'Age' },
      { value: 'gender', label: 'Gender' },
      { value: 'dateOfBirth', label: 'Date of Birth' },
      { value: 'bloodGroup', label: 'Blood Group' },
      { value: 'maritalStatus', label: 'Marital Status' },
    ],
  },
  {
    group: 'Contact Information',
    fields: [
      { value: 'phone', label: 'Phone Number' },
      { value: 'email', label: 'Email Address' },
      { value: 'address', label: 'Address' },
      { value: 'emergencyContact', label: 'Emergency Contact' },
    ],
  },
  {
    group: 'Medical Information',
    fields: [
      { value: 'allergies', label: 'Allergies' },
      { value: 'chronicDiseases', label: 'Chronic Diseases' },
      { value: 'currentMedications', label: 'Current Medications' },
      { value: 'lastVisitDate', label: 'Last Visit Date' },
      { value: 'totalVisits', label: 'Total Visits' },
    ],
  },
  {
    group: 'Insurance Information',
    fields: [
      { value: 'insuranceProvider', label: 'Insurance Provider' },
      { value: 'policyNumber', label: 'Policy Number' },
      { value: 'coverageAmount', label: 'Coverage Amount' },
      { value: 'insuranceType', label: 'Insurance Type' },
    ],
  },
  {
    group: 'System Information',
    fields: [
      { value: 'registrationDate', label: 'Registration Date' },
      { value: 'status', label: 'Status' },
      { value: 'createdBy', label: 'Created By' },
      { value: 'updatedAt', label: 'Last Updated' },
    ],
  },
];

const reportTypes = [
  {
    type: 'demographics',
    title: 'Demographics Report',
    description:
      'Statistical breakdown of patient demographics including age groups, gender distribution, and geographic data',
    icon: <IconUser size="1.2rem" />,
    color: 'blue',
  },
  {
    type: 'visit_summary',
    title: 'Visit Summary Report',
    description:
      'Comprehensive analysis of patient visits, appointment patterns, and healthcare utilization',
    icon: <IconStethoscope size="1.2rem" />,
    color: 'green',
  },
  {
    type: 'medical_summary',
    title: 'Medical Summary Report',
    description: 'Overview of medical conditions, treatments, medications, and health outcomes',
    icon: <IconHistory size="1.2rem" />,
    color: 'orange',
  },
  {
    type: 'insurance_summary',
    title: 'Insurance Summary Report',
    description: 'Analysis of insurance coverage, billing patterns, and payment trends',
    icon: <IconShield size="1.2rem" />,
    color: 'purple',
  },
];

export default function PatientExportReport({
  opened,
  onClose,
  onExport,
  onGenerateReport,
  patientCount,
  selectedPatientIds = [],
}: PatientExportReportProps) {
  const [activeTab, setActiveTab] = useState('export');
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const exportForm = useForm<PatientExportOptions>({
    initialValues: {
      format: 'csv',
      includeFields: ['patientId', 'firstName', 'lastName', 'phone', 'email', 'registrationDate'],
      includeVisitHistory: false,
      includeMedicalHistory: false,
      includeDocuments: false,
      dateRange: undefined,
    },
    validate: {
      format: (value) => (!value ? 'Export format is required' : null),
      includeFields: (value) => (!value.length ? 'At least one field must be selected' : null),
    },
  });

  const handleExport = async (values: PatientExportOptions) => {
    try {
      setLoading(true);
      setExportProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onExport(values);

      clearInterval(progressInterval);
      setExportProgress(100);

      notifications.show({
        title: 'Export Successful',
        message: `Patient data has been exported to ${values.format.toUpperCase()} format successfully.`,
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });

      setTimeout(() => {
        setExportProgress(0);
        onClose();
      }, 1000);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Export Failed',
        message: 'Failed to export patient data. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      setGeneratingReport(reportType);
      const report = await onGenerateReport(reportType, selectedPatientIds);

      notifications.show({
        title: 'Report Generated',
        message: `${reportTypes.find((r) => r.type === reportType)?.title} has been generated successfully.`,
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });

      // In a real application, this would typically open or download the report
      console.log('Generated report:', report);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Report Generation Failed',
        message: 'Failed to generate report. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const selectAllFields = (groupFields: string[]) => {
    const currentFields = exportForm.values.includeFields;
    const allGroupSelected = groupFields.every((field) => currentFields.includes(field));

    if (allGroupSelected) {
      // Deselect all from this group
      exportForm.setFieldValue(
        'includeFields',
        currentFields.filter((field) => !groupFields.includes(field))
      );
    } else {
      // Select all from this group
      const newFields = [...new Set([...currentFields, ...groupFields])];
      exportForm.setFieldValue('includeFields', newFields);
    }
  };

  const getSelectedFieldsCount = () => exportForm.values.includeFields.length;

  // Export Tab
  const ExportTab = () => (
    <form onSubmit={exportForm.onSubmit(handleExport)}>
      <Stack gap="lg">
        {/* Export Summary */}
        <Alert icon={<IconFileExport size="1rem" />} color="blue">
          <Group justify="space-between">
            <Text size="sm">
              Ready to export{' '}
              {selectedPatientIds.length > 0 ? selectedPatientIds.length : patientCount} patient
              records
            </Text>
            <Badge variant="light">{getSelectedFieldsCount()} fields selected</Badge>
          </Group>
        </Alert>

        {/* Format Selection */}
        <Paper p="md" withBorder>
          <Title order={4} mb="md">
            Export Format
          </Title>
          <Grid>
            {exportFormats.map((format) => (
              <Grid.Col key={format.value} span={{ base: 12, md: 4 }}>
                <Card
                  withBorder
                  p="md"
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      exportForm.values.format === format.value
                        ? 'var(--mantine-color-blue-0)'
                        : undefined,
                    borderColor:
                      exportForm.values.format === format.value
                        ? 'var(--mantine-color-blue-5)'
                        : undefined,
                  }}
                  onClick={() => exportForm.setFieldValue('format', format.value as any)}
                >
                  <Group>
                    <ThemeIcon
                      variant={exportForm.values.format === format.value ? 'filled' : 'light'}
                      color="blue"
                    >
                      {format.icon}
                    </ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">
                        {format.label}
                      </Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Paper>

        {/* Field Selection */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Select Fields to Export</Title>
            <Text size="sm" c="dimmed">
              {getSelectedFieldsCount()} of{' '}
              {availableFields.reduce((sum, group) => sum + group.fields.length, 0)} fields selected
            </Text>
          </Group>

          <Stack gap="md">
            {availableFields.map((group) => {
              const groupFields = group.fields.map((f) => f.value);
              const allSelected = groupFields.every((field) =>
                exportForm.values.includeFields.includes(field)
              );

              return (
                <div key={group.group}>
                  <Group justify="space-between" mb="sm">
                    <Text fw={500} size="sm">
                      {group.group}
                    </Text>
                    <Button variant="subtle" size="xs" onClick={() => selectAllFields(groupFields)}>
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Group>
                  <Grid>
                    {group.fields.map((field) => (
                      <Grid.Col key={field.value} span={{ base: 12, md: 6 }}>
                        <Checkbox
                          label={field.label}
                          checked={exportForm.values.includeFields.includes(field.value)}
                          onChange={(event) => {
                            const currentFields = exportForm.values.includeFields;
                            if (event.currentTarget.checked) {
                              exportForm.setFieldValue('includeFields', [
                                ...currentFields,
                                field.value,
                              ]);
                            } else {
                              exportForm.setFieldValue(
                                'includeFields',
                                currentFields.filter((f) => f !== field.value)
                              );
                            }
                          }}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                  {group !== availableFields[availableFields.length - 1] && <Divider mt="md" />}
                </div>
              );
            })}
          </Stack>
        </Paper>

        {/* Additional Options */}
        <Paper p="md" withBorder>
          <Title order={4} mb="md">
            Additional Data
          </Title>
          <Stack gap="sm">
            <Checkbox
              label="Include Visit History"
              description="Export patient visit records and medical encounters"
              {...exportForm.getInputProps('includeVisitHistory', { type: 'checkbox' })}
            />
            <Checkbox
              label="Include Medical History"
              description="Export medical history, allergies, and chronic conditions"
              {...exportForm.getInputProps('includeMedicalHistory', { type: 'checkbox' })}
            />
            <Checkbox
              label="Include Documents"
              description="Export patient document references and metadata"
              {...exportForm.getInputProps('includeDocuments', { type: 'checkbox' })}
            />
          </Stack>
        </Paper>

        {/* Date Range Filter */}
        <Paper p="md" withBorder>
          <Title order={4} mb="md">
            Date Range Filter (Optional)
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DatePickerInput
                label="Start Date"
                placeholder="Select start date"
                value={exportForm.values.dateRange?.startDate}
                onChange={(date) => exportForm.setFieldValue('dateRange.startDate', date ? new Date(date) : null)}
                leftSection={<IconCalendar size="1rem" />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DatePickerInput
                label="End Date"
                placeholder="Select end date"
                value={exportForm.values.dateRange?.endDate}
                onChange={(date) => exportForm.setFieldValue('dateRange.endDate', date ? new Date(date) : null)}
                leftSection={<IconCalendar size="1rem" />}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Export Progress */}
        {loading && (
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Exporting Data...</Text>
              <Text size="sm" c="dimmed">
                {exportProgress}%
              </Text>
            </Group>
            <Progress value={exportProgress} animated />
          </Paper>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} leftSection={<IconDownload size="1rem" />}>
            Export Data
          </Button>
        </Group>
      </Stack>
    </form>
  );

  // Reports Tab
  const ReportsTab = () => (
    <Stack gap="lg">
      <Alert icon={<IconReportAnalytics size="1rem" />} color="blue">
        Generate comprehensive reports with insights and analytics about your patient data.
      </Alert>

      <Grid>
        {reportTypes.map((report) => (
          <Grid.Col key={report.type} span={{ base: 12, md: 6 }}>
            <Card withBorder p="lg" h="100%">
              <Group align="flex-start" mb="md">
                <ThemeIcon size="xl" variant="light" color={report.color}>
                  {report.icon}
                </ThemeIcon>
                <div style={{ flex: 1 }}>
                  <Text fw={600} mb="xs">
                    {report.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {report.description}
                  </Text>
                </div>
              </Group>

              <Group justify="space-between" mt="auto">
                <Badge variant="light" color={report.color}>
                  {selectedPatientIds.length > 0 ? selectedPatientIds.length : patientCount}{' '}
                  patients
                </Badge>
                <Button
                  size="sm"
                  variant="light"
                  color={report.color}
                  loading={generatingReport === report.type}
                  onClick={() => handleGenerateReport(report.type)}
                  leftSection={<IconDownload size="0.8rem" />}
                >
                  Generate
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Report History */}
      <Paper p="md" withBorder>
        <Title order={4} mb="md">
          Recent Reports
        </Title>
        <Timeline active={1} bulletSize={24} lineWidth={2}>
          <Timeline.Item bullet={<IconFileText size="0.8rem" />} title="Demographics Report">
            <Text c="dimmed" size="sm">
              Generated on March 15, 2024
            </Text>
            <Text size="sm" mt={4}>
              Complete demographic analysis with 2,847 patients
            </Text>
            <Group mt="xs">
              <Button variant="subtle" size="xs" leftSection={<IconDownload size="0.7rem" />}>
                Download
              </Button>
              <Button variant="subtle" size="xs" leftSection={<IconShare size="0.7rem" />}>
                Share
              </Button>
            </Group>
          </Timeline.Item>

          <Timeline.Item
            bullet={<IconFileSpreadsheet size="0.8rem" />}
            title="Visit Summary Report"
          >
            <Text c="dimmed" size="sm">
              Generated on March 10, 2024
            </Text>
            <Text size="sm" mt={4}>
              Monthly visit analysis and appointment trends
            </Text>
            <Group mt="xs">
              <Button variant="subtle" size="xs" leftSection={<IconDownload size="0.7rem" />}>
                Download
              </Button>
              <Button variant="subtle" size="xs" leftSection={<IconShare size="0.7rem" />}>
                Share
              </Button>
            </Group>
          </Timeline.Item>

          <Timeline.Item bullet={<IconChartBar size="0.8rem" />} title="Insurance Analysis">
            <Text c="dimmed" size="sm">
              Generated on March 5, 2024
            </Text>
            <Text size="sm" mt={4}>
              Insurance coverage and billing analysis
            </Text>
            <Group mt="xs">
              <Button variant="subtle" size="xs" leftSection={<IconDownload size="0.7rem" />}>
                Download
              </Button>
              <Button variant="subtle" size="xs" leftSection={<IconShare size="0.7rem" />}>
                Share
              </Button>
            </Group>
          </Timeline.Item>
        </Timeline>
      </Paper>
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconFileExport size="1.2rem" />
          <Text fw={600}>Export & Reports</Text>
        </Group>
      }
      size="xl"
    >
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'export')}>
        <Tabs.List>
          <Tabs.Tab value="export" leftSection={<IconDownload size="0.8rem" />}>
            Export Data
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<IconReportAnalytics size="0.8rem" />}>
            Generate Reports
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="export" pt="md">
          <ExportTab />
        </Tabs.Panel>

        <Tabs.Panel value="reports" pt="md">
          <ReportsTab />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
