'use client';
import { useEffect, useState } from 'react';
import { http } from '@/lib/api-client';

export default function AppointmentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    http.get('/appointments').then(res => setRows(res.data.items || []));
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h2>Appointments</h2>
      <ul>{rows.map((r:any)=> <li key={r.id}>{r.patientId} @ {new Date(r.startAt).toLocaleString()}</li>)}</ul>
    </main>
  );
}
