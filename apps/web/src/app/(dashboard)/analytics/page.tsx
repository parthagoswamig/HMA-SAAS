'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const k: any = await apiFetch('/analytics/kpis');
        const t: any = await apiFetch('/analytics/trend/monthly');
        setKpis(k);
        setTrend(t);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
      
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="Total Patients" value={kpis.patients} />
          <Card label="Invoice Total" value={`₹${kpis.invoiceTotal.toLocaleString()}`} />
          <Card label="Revenue" value={`₹${(kpis.revenueCents / 100).toFixed(2)}`} />
          <Card label="ARPU" value={`₹${(kpis.arpuCents / 100).toFixed(2)}`} />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6 border">
        <h2 className="text-xl font-medium mb-4">Monthly Revenue Trend</h2>
        {trend.length > 0 ? (
          <div className="space-y-2">
            {trend.map((r, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="text-sm font-medium text-gray-700">{r.month}</span>
                <span className="text-sm font-bold text-green-600">
                  ₹{((r.revenuecents || 0) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No revenue data available</p>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl shadow p-6 border bg-white hover:shadow-lg transition-shadow">
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
