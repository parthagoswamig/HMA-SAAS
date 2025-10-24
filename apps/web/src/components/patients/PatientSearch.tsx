'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Select,
  Button,
  Paper,
  Grid,
  NumberInput,
  Accordion,
  ActionIcon,
  SegmentedControl,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import {
  IconSearch,
  IconX,
  IconRefresh,
  IconDeviceFloppy,
  IconCalendar,
  IconUser,
  IconPhone,
  IconMail,
  IconShield,
  IconStethoscope,
  IconBookmark,
} from '@tabler/icons-react';
import { PatientSearchParams } from '../../types/patient';
import { Gender, BloodGroup, Status } from '../../types/common';

interface PatientSearchProps {
  opened: boolean;
  onClose: () => void;
  onSearch: (criteria: PatientSearchParams) => void;
  onSaveSearch: (name: string, criteria: PatientSearchParams) => void;
  savedSearches?: Array<{ id: string; name: string; criteria: PatientSearchParams }>;
  currentCriteria?: PatientSearchParams;
}

const initialCriteria: PatientSearchParams = {
  searchTerm: '',
  patientId: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  bloodGroup: undefined,
  gender: undefined,
  status: undefined,
  insuranceType: '',
  registrationDateFrom: undefined,
  registrationDateTo: undefined,
  lastVisitDateFrom: undefined,
  lastVisitDateTo: undefined,
  ageFrom: undefined,
  ageTo: undefined,
  hasAllergies: undefined,
  hasChronicDiseases: undefined,
  hasInsurance: undefined,
  doctorId: '',
  departmentId: '',
};

export default function PatientSearch({
  opened,
  onClose,
  onSearch,
  onSaveSearch,
  savedSearches = [],
  currentCriteria = initialCriteria,
}: PatientSearchProps) {
  const [saveSearchOpened, { open: openSaveSearch, close: closeSaveSearch }] = useDisclosure(false);
  const [searchName, setSearchName] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  const form = useForm<PatientSearchParams>({
    initialValues: currentCriteria,
  });

  const [debouncedSearchTerm] = useDebouncedValue(form.values.searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleQuickSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleQuickSearch = () => {
    const criteria = { ...form.values, searchTerm: debouncedSearchTerm };
    onSearch(criteria);
  };

  const handleAdvancedSearch = () => {
    onSearch(form.values);
  };

  const handleReset = () => {
    form.setValues(initialCriteria);
    onSearch(initialCriteria);
  };

  const handleSaveSearch = () => {
    if (searchName.trim()) {
      onSaveSearch(searchName, form.values);
      setSearchName('');
      closeSaveSearch();
    }
  };

  const loadSavedSearch = (criteria: PatientSearchParams) => {
    form.setValues(criteria);
    onSearch(criteria);
  };

  const hasActiveFilters = () => {
    return Object.values(form.values).some((value) => {
      if (value === undefined || value === null || value === '') return false;
      if (typeof value === 'boolean') return value;
      return true;
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(form.values).filter((value) => {
      if (value === undefined || value === null || value === '') return false;
      if (typeof value === 'boolean') return value;
      return true;
    }).length;
  };


  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <IconSearch size="1.2rem" />
            <div>
              <Text fw={600}>Advanced Patient Search</Text>
              {hasActiveFilters() && (
                <Text size="sm" c="dimmed">
                  {getActiveFiltersCount()} filter(s) applied
                </Text>
              )}
            </div>
          </Group>
        }
        size="lg"
      >
        <Stack gap="lg">
          {/* Quick Search */}
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Text fw={500} size="sm">
                Quick Search
              </Text>
              <TextInput
                placeholder="Search by name, ID, phone, email..."
                leftSection={<IconSearch size="1rem" />}
                {...form.getInputProps('searchTerm')}
                rightSection={
                  form.values.searchTerm && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => form.setFieldValue('searchTerm', '')}
                    >
                      <IconX size="1rem" />
                    </ActionIcon>
                  )
                }
              />
            </Stack>
          </Paper>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Paper p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Text fw={500} size="sm">
                  Saved Searches
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconBookmark size="0.8rem" />}
                  onClick={openSaveSearch}
                >
                  Save Current
                </Button>
              </Group>
              <Group gap="xs">
                {savedSearches.map((search) => (
                  <Button
                    key={search.id}
                    variant="outline"
                    size="xs"
                    onClick={() => loadSavedSearch(search.criteria)}
                  >
                    {search.name}
                  </Button>
                ))}
              </Group>
            </Paper>
          )}

          {/* Advanced Filters */}
          <Accordion multiple value={expandedSections} onChange={setExpandedSections}>
            {/* Basic Information */}
            <Accordion.Item value="basic">
              <Accordion.Control icon={<IconUser size="1rem" />}>
                Basic Information
              </Accordion.Control>
              <Accordion.Panel>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Patient ID"
                      placeholder="Enter patient ID"
                      {...form.getInputProps('patientId')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Status"
                      placeholder="Select status"
                      data={Object.values(Status).map((s) => ({
                        value: s,
                        label: s.replace('_', ' '),
                      }))}
                      {...form.getInputProps('status')}
                      clearable
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="First Name"
                      placeholder="Enter first name"
                      {...form.getInputProps('firstName')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Last Name"
                      placeholder="Enter last name"
                      {...form.getInputProps('lastName')}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Gender"
                      placeholder="Select gender"
                      data={Object.values(Gender).map((g) => ({ value: g, label: g }))}
                      {...form.getInputProps('gender')}
                      clearable
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
                </Grid>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Contact Information */}
            <Accordion.Item value="contact">
              <Accordion.Control icon={<IconPhone size="1rem" />}>
                Contact Information
              </Accordion.Control>
              <Accordion.Panel>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      leftSection={<IconPhone size="1rem" />}
                      {...form.getInputProps('phone')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Email Address"
                      placeholder="Enter email address"
                      leftSection={<IconMail size="1rem" />}
                      {...form.getInputProps('email')}
                    />
                  </Grid.Col>
                </Grid>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Age Range */}
            <Accordion.Item value="age">
              <Accordion.Control icon={<IconCalendar size="1rem" />}>Age Range</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Filter patients by age range
                  </Text>
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="Age From"
                        placeholder="Min age"
                        min={0}
                        max={120}
                        {...form.getInputProps('ageFrom')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="Age To"
                        placeholder="Max age"
                        min={0}
                        max={120}
                        {...form.getInputProps('ageTo')}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Date Ranges */}
            <Accordion.Item value="dates">
              <Accordion.Control icon={<IconCalendar size="1rem" />}>
                Date Filters
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Registration Date
                    </Text>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                          label="From"
                          placeholder="Select start date"
                          {...form.getInputProps('registrationDateFrom')}
                          leftSection={<IconCalendar size="1rem" />}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                          label="To"
                          placeholder="Select end date"
                          {...form.getInputProps('registrationDateTo')}
                          leftSection={<IconCalendar size="1rem" />}
                        />
                      </Grid.Col>
                    </Grid>
                  </div>

                  <div>
                    <Text size="sm" fw={500} mb="sm">
                      Last Visit Date
                    </Text>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                          label="From"
                          placeholder="Select start date"
                          {...form.getInputProps('lastVisitDateFrom')}
                          leftSection={<IconCalendar size="1rem" />}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <DatePickerInput
                          label="To"
                          placeholder="Select end date"
                          {...form.getInputProps('lastVisitDateTo')}
                          leftSection={<IconCalendar size="1rem" />}
                        />
                      </Grid.Col>
                    </Grid>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Medical Conditions */}
            <Accordion.Item value="medical">
              <Accordion.Control icon={<IconStethoscope size="1rem" />}>
                Medical Conditions
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Group>
                    <Checkbox
                      label="Has Allergies"
                      checked={form.values.hasAllergies === true}
                      indeterminate={form.values.hasAllergies === undefined}
                      onChange={(event) =>
                        form.setFieldValue(
                          'hasAllergies',
                          event.currentTarget.checked
                            ? true
                            : form.values.hasAllergies === true
                              ? undefined
                              : false
                        )
                      }
                    />
                    <Checkbox
                      label="Has Chronic Diseases"
                      checked={form.values.hasChronicDiseases === true}
                      indeterminate={form.values.hasChronicDiseases === undefined}
                      onChange={(event) =>
                        form.setFieldValue(
                          'hasChronicDiseases',
                          event.currentTarget.checked
                            ? true
                            : form.values.hasChronicDiseases === true
                              ? undefined
                              : false
                        )
                      }
                    />
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Insurance */}
            <Accordion.Item value="insurance">
              <Accordion.Control icon={<IconShield size="1rem" />}>
                Insurance Information
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Group>
                    <SegmentedControl
                      data={[
                        { label: 'All', value: 'all' },
                        { label: 'Insured', value: 'true' },
                        { label: 'Uninsured', value: 'false' },
                      ]}
                      value={
                        form.values.hasInsurance === undefined
                          ? 'all'
                          : form.values.hasInsurance
                            ? 'true'
                            : 'false'
                      }
                      onChange={(value) =>
                        form.setFieldValue(
                          'hasInsurance',
                          value === 'all' ? undefined : value === 'true'
                        )
                      }
                    />
                  </Group>

                  <Select
                    label="Insurance Type"
                    placeholder="Select insurance type"
                    data={[
                      { value: 'government', label: 'Government' },
                      { value: 'private', label: 'Private' },
                      { value: 'corporate', label: 'Corporate' },
                    ]}
                    {...form.getInputProps('insuranceType')}
                    clearable
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          {/* Action Buttons */}
          <Group justify="space-between" mt="xl">
            <Group>
              <Button
                variant="outline"
                onClick={handleReset}
                leftSection={<IconRefresh size="1rem" />}
              >
                Reset
              </Button>
              {!savedSearches.some(
                (s) => JSON.stringify(s.criteria) === JSON.stringify(form.values)
              ) && (
                <Button
                  variant="subtle"
                  onClick={openSaveSearch}
                  leftSection={<IconBookmark size="1rem" />}
                >
                  Save Search
                </Button>
              )}
            </Group>

            <Group>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAdvancedSearch} leftSection={<IconSearch size="1rem" />}>
                Search
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Save Search Modal */}
      <Modal opened={saveSearchOpened} onClose={closeSaveSearch} title="Save Search" size="sm">
        <Stack gap="md">
          <TextInput
            label="Search Name"
            placeholder="Enter a name for this search"
            value={searchName}
            onChange={(e) => setSearchName(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeSaveSearch}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSearch}
              disabled={!searchName.trim()}
              leftSection={<IconDeviceFloppy size="1rem" />}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
