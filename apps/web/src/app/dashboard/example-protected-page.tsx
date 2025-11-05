'use client';

/**
 * EXAMPLE PROTECTED PAGE
 * This demonstrates how to implement RBAC, API calls, and loading states
 *
 * To use this pattern in your existing pages:
 * 1. Import the necessary components and hooks
 * 2. Wrap your page component with withRBAC HOC
 * 3. Use the custom API hooks for data fetching
 * 4. Add loading/error/empty states
 */

import { withRBAC, Permission } from '@/lib/rbac/RBACProvider';
import { usePatients } from '@/lib/api/hooks';
// import {
//   TableSkeleton,
//   EmptyState,
//   ErrorState
// } from '@/components/shared/LoadingStates';
// import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button, Table, Paper, Group, Title } from '@mantine/core';

function ExampleProtectedPage() {
  // Use custom hook for data fetching with automatic caching
  const { data: patients, isLoading, error, refetch } = usePatients({});

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Title order={2} mb="xl">
          Patients
        </Title>
        <div>Loading patients...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div>
          <h3>Failed to load patients</h3>
          <p>{(error as any).message || 'An error occurred while fetching data'}</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!patients || (patients as any[]).length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <div>
          <h3>No patients found</h3>
          <p>Start by adding your first patient to the system</p>
          <Button onClick={() => console.log('Open add patient modal')}>Add Patient</Button>
        </div>
      </div>
    );
  }

  // Success state with data
  return (
    <div style={{ padding: '2rem' }}>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Patients ({(patients as any[]).length})</Title>
        <Button onClick={() => console.log('Open add patient modal')}>Add Patient</Button>
      </Group>

      <Paper shadow="sm" p="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(patients as any[]).map((patient: any) => (
              <Table.Tr key={patient.id}>
                <Table.Td>{patient.id}</Table.Td>
                <Table.Td>{patient.name}</Table.Td>
                <Table.Td>{patient.email}</Table.Td>
                <Table.Td>{patient.phone}</Table.Td>
                <Table.Td>
                  <Button size="xs" variant="light">
                    View
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}

// Protect the page with RBAC - only users with VIEW_PATIENTS permission can access
export default withRBAC(ExampleProtectedPage, [Permission.VIEW_PATIENTS]);
