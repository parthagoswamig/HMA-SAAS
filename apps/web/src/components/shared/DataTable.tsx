'use client';

import React, { useState } from 'react';
import {
  Table,
  Container,
  Text,
  TextInput,
  Select,
  Button,
  Pagination,
  ActionIcon,
  Box,
  Paper,
  Flex,
  Loader,
  Group,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconRefresh,
  IconDownload,
  IconEye,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { TableColumn, SortOption, FilterOption } from '../../types/common';

interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn[];
  loading?: boolean;
  error?: string;
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  filters?: FilterOption[];
  onSort?: (sort: SortOption) => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  actions?: {
    view?: (record: T) => void;
    edit?: (record: T) => void;
    delete?: (record: T) => void;
    custom?: Array<{
      label: string;
      icon: React.ReactNode;
      action: (record: T) => void;
      color?: string;
    }>;
  };
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  emptyMessage?: string;
  rowClassName?: (record: T) => string;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  error,
  title,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination,
  filters,
  onSort,
  onFilter,
  onSearch,
  onRefresh,
  onExport,
  actions,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data available',
  rowClassName,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: unknown) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value) {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (!sortable) return;

    const direction =
      sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSort: SortOption = { field, direction };
    setSortConfig(newSort);

    if (onSort) {
      onSort(newSort);
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);

    if (onSelectionChange) {
      const selectedData = data.filter((item) => newSelected.has(item.id));
      onSelectionChange(selectedData);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? new Set(data.map((item) => item.id)) : new Set<string>();
    setSelectedRows(newSelected);

    if (onSelectionChange) {
      const selectedData = checked ? data : [];
      onSelectionChange(selectedData);
    }
  };

  // Render table header
  const renderHeader = () => (
    <Box mb="md">
      <Flex justify="space-between" align="center" mb="sm">
        {title && (
          <Text size="xl" fw={600}>
            {title}
          </Text>
        )}

        <Group>
          {onRefresh && (
            <ActionIcon variant="outline" size="lg" onClick={onRefresh} loading={loading}>
              <IconRefresh size="1rem" />
            </ActionIcon>
          )}

          {onExport && (
            <Button variant="outline" leftSection={<IconDownload size="1rem" />} onClick={onExport}>
              Export
            </Button>
          )}
        </Group>
      </Flex>

      {(searchable || filterable) && (
        <Group mb="sm">
          {searchable && (
            <TextInput
              placeholder="Search..."
              leftSection={<IconSearch size="1rem" />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
          )}

          {filterable && filters && (
            <Group>
              <IconFilter size="1rem" />
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  placeholder={filter.label}
                  data={filter.options || []}
                  value={(activeFilters[filter.key] as string) || null}
                  onChange={(value) => handleFilterChange(filter.key, value)}
                  clearable
                  w={150}
                />
              ))}
            </Group>
          )}
        </Group>
      )}
    </Box>
  );

  // Render table rows
  const renderRows = () => {
    if (loading) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
            <Flex justify="center" align="center" p="xl">
              <Loader size="md" />
              <Text ml="sm">Loading...</Text>
            </Flex>
          </Table.Td>
        </Table.Tr>
      );
    }

    if (error) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
            <Text ta="center" c="red" p="xl">
              {error}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    }

    if (data.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
            <Text ta="center" c="dimmed" p="xl">
              {emptyMessage}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    }

    return data.map((record) => (
      <Table.Tr
        key={record.id}
        className={rowClassName?.(record)}
        bg={selectedRows.has(record.id) ? 'blue.0' : undefined}
      >
        {selectable && (
          <Table.Td>
            <input
              type="checkbox"
              checked={selectedRows.has(record.id)}
              onChange={(e) => handleRowSelect(record.id, e.target.checked)}
            />
          </Table.Td>
        )}

        {columns.map((column) => (
          <Table.Td key={column.key}>
            {column.render
              ? column.render(record[column.key as keyof T], record)
              : String(record[column.key as keyof T] || '')}
          </Table.Td>
        ))}

        {actions && (
          <Table.Td>
            <Group gap="xs">
              {actions.view && (
                <ActionIcon variant="subtle" size="sm" onClick={() => actions.view!(record)}>
                  <IconEye size="1rem" />
                </ActionIcon>
              )}

              {actions.edit && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => actions.edit!(record)}
                  color="blue"
                >
                  <IconEdit size="1rem" />
                </ActionIcon>
              )}

              {actions.delete && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => actions.delete!(record)}
                  color="red"
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              )}

              {actions.custom?.map((customAction, idx) => (
                <ActionIcon
                  key={idx}
                  variant="subtle"
                  size="sm"
                  onClick={() => customAction.action(record)}
                  color={customAction.color}
                  title={customAction.label}
                >
                  {customAction.icon}
                </ActionIcon>
              ))}
            </Group>
          </Table.Td>
        )}
      </Table.Tr>
    ));
  };

  return (
    <Container fluid>
      <Paper shadow="sm" p="md">
        {renderHeader()}

        <Table.ScrollContainer minWidth={800}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {selectable && (
                  <Table.Th>
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedRows.size === data.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Table.Th>
                )}

                {columns.map((column) => (
                  <Table.Th
                    key={column.key}
                    style={{
                      cursor: sortable && column.sortable ? 'pointer' : 'default',
                      width: column.width,
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <Group gap="xs">
                      <Text fw={600}>{column.title}</Text>
                      {sortable && column.sortable && (
                        <>
                          {sortConfig?.field === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <IconSortAscending size="1rem" />
                            ) : (
                              <IconSortDescending size="1rem" />
                            )
                          ) : null}
                        </>
                      )}
                    </Group>
                  </Table.Th>
                ))}

                {actions && (
                  <Table.Th>
                    <Text fw={600}>Actions</Text>
                  </Table.Th>
                )}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>{renderRows()}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {pagination && (
          <Flex justify="space-between" align="center" mt="md">
            <Text size="sm" c="dimmed">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              entries
            </Text>

            <Group>
              <Select
                value={pagination.limit.toString()}
                onChange={(value) => pagination.onLimitChange(parseInt(value || '10'))}
                data={[
                  { value: '10', label: '10' },
                  { value: '25', label: '25' },
                  { value: '50', label: '50' },
                  { value: '100', label: '100' },
                ]}
                w={80}
              />

              <Pagination
                value={pagination.page}
                onChange={pagination.onPageChange}
                total={Math.ceil(pagination.total / pagination.limit)}
                siblings={1}
                boundaries={1}
              />
            </Group>
          </Flex>
        )}
      </Paper>
    </Container>
  );
}
