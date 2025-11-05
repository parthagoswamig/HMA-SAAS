'use client';
import { useEffect, useState } from 'react';
import { http } from '@/lib/api-client';

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    http.get('/invoices').then(res => setRows(res.data.items || []));
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h2>Invoices</h2>
      <ul>{rows.map((r:any)=> <li key={r.id}>₹{r.amount} — {r.status}</li>)}</ul>
    </main>
  );
}
