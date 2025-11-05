'use client';
import { useEffect, useState } from 'react';
import { http } from '@/lib/api-client';
export default function LabTestsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { http.get('/lab-tests').then(res => setRows(res.items || [])).catch(e => console.error(e)); }, []);
  return (<main style={{ padding: 24 }}><h2>Lab Tests</h2><pre>{JSON.stringify(rows,null,2)}</pre></main>);
}
