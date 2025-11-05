'use client';
import Link from 'next/link';
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>HMS SaaS</h1>
      <p>Choose a module:</p>
      <ul>
        <li><Link href="/(dashboard)/patients">Patients</Link></li>
        <li><Link href="/(dashboard)/appointments">Appointments</Link></li>
        <li><Link href="/(dashboard)/invoices">Invoices</Link></li>
      </ul>
    </main>
  );
}
