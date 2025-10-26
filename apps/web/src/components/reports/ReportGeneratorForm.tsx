'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  LoadingOverlay,
  Alert,
  MultiSelect,
  Checkbox,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconFileAnalytics, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import reportsService from '../../services/reports.service';

interface ReportGeneratorFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportGeneratorForm: React.FC<ReportGeneratorFormProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    reportType: '',
    reportFormat: 'pdf',
    dateRange: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
    },
    filters: {
      departments: [] as string[],
      categories: [] as string[],
      statuses: [] as string[],
    },
    includeCharts: true,
    includeDetails: true,
    includeSummary: true,
    groupBy: '',
    sortBy: 'date',
    emailReport: false,
    emailRecipients: [] as string[],
    scheduleReport: false,
    scheduleFrequency: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchDepartments();
      resetForm();
    }
  }, [opened]);

  const fetchDepartments = async () => {
    // Mock departments - would fetch from API
    const deptList = [
      { value: 'emergency', label: 'Emergency' },
      { value: 'opd', label: 'Out-Patient' },
      { value: 'ipd', label: 'In-Patient' },
      { value: 'laboratory', label: 'Laboratory' },
      { value: 'radiology', label: 'Radiology' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'surgery', label: 'Surgery' },
      { value: 'finance', label: 'Finance' },
    ];
    setDepartments(deptList);
  };

  const resetForm = () => {
    setFormData({
      reportType: '',
      reportFormat: 'pdf',
      dateRange: {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date(),
      },
      filters: {
        departments: [],
        categories: [],
        statuses: [],
      },
      includeCharts: true,
      includeDetails: true,
      includeSummary: true,
      groupBy: '',
      sortBy: 'date',
      emailReport: false,
      emailRecipients: [],
      scheduleReport: false,
      scheduleFrequency: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.reportType) errors.reportType = 'Report type is required';
    if (!formData.dateRange.startDate) errors.startDate = 'Start date is required';
    if (!formData.dateRange.endDate) errors.endDate = 'End date is required';
    
    if (formData.dateRange.startDate > formData.dateRange.endDate) {
      errors.dateRange = 'Start date must be before end date';
    }

    if (formData.scheduleReport && !formData.scheduleFrequency) {
      errors.scheduleFrequency = 'Schedule frequency is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateReport = async () => {
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
        dateRange: {
          startDate: formData.dateRange.startDate.toISOString(),
          endDate: formData.dateRange.endDate.toISOString(),
        },
      };

      // Call the appropriate report method based on reportType
      let response;
      const filters = {
        startDate: formData.dateRange.startDate.toISOString(),
        endDate: formData.dateRange.endDate.toISOString(),
      };
      
      switch (formData.reportType) {
        case 'patient':
          response = await reportsService.getPatientReport(filters);
          break;
        case 'appointment':
          response = await reportsService.getAppointmentReport(filters);
          break;
        case 'revenue':
          response = await reportsService.getRevenueReport(filters);
          break;
        case 'lab':
          response = await reportsService.getLabReport(filters);
          break;
        case 'pharmacy':
          response = await reportsService.getPharmacyReport(filters);
          break;
        default:
          response = await reportsService.getDashboard();
      }

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Report generated successfully',
          color: 'green',
          icon: <IconFileAnalytics />,
        });
        
        // Download report if available
        if (response.data?.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        }
        
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to generate report',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'patient_summary', label: 'Patient Summary Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'expense', label: 'Expense Report' },
    { value: 'appointment', label: 'Appointments Report' },
    { value: 'admission', label: 'Admissions Report' },
    { value: 'discharge', label: 'Discharge Report' },
    { value: 'laboratory', label: 'Laboratory Report' },
    { value: 'radiology', label: 'Radiology Report' },
    { value: 'pharmacy', label: 'Pharmacy Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'staff_performance', label: 'Staff Performance Report' },
    { value: 'department_wise', label: 'Department-wise Report' },
    { value: 'insurance_claims', label: 'Insurance Claims Report' },
    { value: 'audit_trail', label: 'Audit Trail Report' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'html', label: 'HTML' },
    { value: 'json', label: 'JSON' },
  ];

  const groupByOptions = [
    { value: 'date', label: 'Date' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'department', label: 'Department' },
    { value: 'category', label: 'Category' },
    { value: 'status', label: 'Status' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'patient', label: 'Patient' },
  ];

  const scheduleFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Generate Report"
      size="lg"
      closeOnClickOutside={false}
    >
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        <Alert icon={<IconFileAnalytics size={20} />} color="blue" variant="light">
          Configure report parameters and generate comprehensive analytics reports.
        </Alert>

        {/* Report Type and Format */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <Select
              label="Report Type"
              placeholder="Select report type"
              required
              data={reportTypes}
              value={formData.reportType}
              onChange={(value) => setFormData({ ...formData, reportType: value || '' })}
              error={formErrors.reportType}
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label="Format"
              placeholder="Select format"
              required
              data={reportFormats}
              value={formData.reportFormat}
              onChange={(value) => setFormData({ ...formData, reportFormat: value || 'pdf' })}
            />
          </Grid.Col>
        </Grid>

        {/* Date Range */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              label="Start Date"
              placeholder="Select start date"
              required
              value={formData.dateRange.startDate}
              onChange={(value) => {
                const dateValue = value ? new Date(value) : new Date();
                setFormData({ 
                  ...formData, 
                  dateRange: { 
                    ...formData.dateRange, 
                    startDate: dateValue 
                  } 
                });
              }}
              error={formErrors.startDate}
              maxDate={new Date()}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              label="End Date"
              placeholder="Select end date"
              required
              value={formData.dateRange.endDate}
              onChange={(value) => {
                const dateValue = value ? new Date(value) : new Date();
                setFormData({ 
                  ...formData, 
                  dateRange: { 
                    ...formData.dateRange, 
                    endDate: dateValue 
                  } 
                });
              }}
              error={formErrors.endDate}
              minDate={formData.dateRange.startDate}
              maxDate={new Date()}
            />
          </Grid.Col>
        </Grid>
        {formErrors.dateRange && (
          <Text color="red" size="sm">{formErrors.dateRange}</Text>
        )}

        {/* Filters */}
        <MultiSelect
          label="Filter by Departments"
          placeholder="Select departments"
          data={departments}
          value={formData.filters.departments}
          onChange={(value) => setFormData({ 
            ...formData, 
            filters: { ...formData.filters, departments: value } 
          })}
          searchable
        />

        {/* Report Options */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Group By"
              placeholder="Select grouping"
              data={groupByOptions}
              value={formData.groupBy}
              onChange={(value) => setFormData({ ...formData, groupBy: value || '' })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Sort By"
              placeholder="Select sorting"
              data={[
                { value: 'date', label: 'Date' },
                { value: 'amount', label: 'Amount' },
                { value: 'count', label: 'Count' },
                { value: 'name', label: 'Name' },
              ]}
              value={formData.sortBy}
              onChange={(value) => setFormData({ ...formData, sortBy: value || 'date' })}
            />
          </Grid.Col>
        </Grid>

        {/* Include Options */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>Include in Report:</Text>
          <Group>
            <Checkbox
              label="Charts & Graphs"
              checked={formData.includeCharts}
              onChange={(event) => setFormData({ 
                ...formData, 
                includeCharts: event.currentTarget.checked 
              })}
            />
            <Checkbox
              label="Detailed Data"
              checked={formData.includeDetails}
              onChange={(event) => setFormData({ 
                ...formData, 
                includeDetails: event.currentTarget.checked 
              })}
            />
            <Checkbox
              label="Summary Statistics"
              checked={formData.includeSummary}
              onChange={(event) => setFormData({ 
                ...formData, 
                includeSummary: event.currentTarget.checked 
              })}
            />
          </Group>
        </Stack>

        {/* Schedule Report */}
        <Stack gap="xs">
          <Checkbox
            label="Schedule this report"
            checked={formData.scheduleReport}
            onChange={(event) => setFormData({ 
              ...formData, 
              scheduleReport: event.currentTarget.checked 
            })}
          />
          
          {formData.scheduleReport && (
            <Select
              label="Frequency"
              placeholder="Select frequency"
              required
              data={scheduleFrequencies}
              value={formData.scheduleFrequency}
              onChange={(value) => setFormData({ 
                ...formData, 
                scheduleFrequency: value || '' 
              })}
              error={formErrors.scheduleFrequency}
            />
          )}
        </Stack>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateReport} 
            loading={loading}
            leftSection={<IconDownload size={16} />}
          >
            Generate Report
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ReportGeneratorForm;
