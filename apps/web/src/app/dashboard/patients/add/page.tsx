'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mantine/core';

export default function AddPatientPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add New Patient</h1>
      <p>Patient registration form will be displayed here.</p>
      <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  );
}
