'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const r = useRouter();
  const { login, setTenant } = useAuth();
  const [email, setEmail] = useState('');
  const [tenant, setTenantLocal] = useState('default');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: any) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      setTenant(tenant);
      await login(email, password, tenant);
      r.push('/'); // go dashboard
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: '40px auto' }}>
      <h1>Login</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Tenant (slug)" value={tenant} onChange={e=>setTenantLocal(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button disabled={loading} type="submit">{loading ? '...' : 'Login'}</button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
    </main>
  );
}
