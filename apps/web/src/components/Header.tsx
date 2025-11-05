'use client';
import { useAuth } from '@/lib/auth-store';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Header() {
  const { user, loadMe, logout, tenant, setTenant } = useAuth();
  useEffect(() => { loadMe(); }, []);

  return (
    <header style={{ display:'flex', gap:16, alignItems:'center', padding:12, borderBottom:'1px solid #eee' }}>
      <Link href="/">HMS SaaS</Link>
      <nav style={{ display:'flex', gap:12, fontSize:14 }}>
        <Link href="/(dashboard)/patients">Patients</Link>
        <Link href="/(dashboard)/appointments">Appointments</Link>
        <Link href="/(dashboard)/invoices">Invoices</Link>
        <Link href="/(dashboard)/doctors">Doctors</Link>
        <Link href="/(dashboard)/lab-tests">Lab Tests</Link>
        <Link href="/(dashboard)/inventory-items">Inventory</Link>
        <Link href="/(dashboard)/pharmacy-drugs">Pharmacy</Link>
        <Link href="/(dashboard)/analytics">Analytics</Link>
        <Link href="/(dashboard)/billing">Billing</Link>
        <Link href="/(dashboard)/admin/rbac">RBAC</Link>
      </nav>
      <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
        <input
          style={{ padding: 6 }}
          value={tenant}
          onChange={(e)=>setTenant(e.target.value)}
          placeholder="tenant slug"
          title="Tenant slug"
        />
        {user ? (
          <>
            <span>{user.firstName} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </header>
  );
}
