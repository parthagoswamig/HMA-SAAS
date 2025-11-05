'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data: any = await apiFetch('/stripe-billing/plans');
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const res: any = await apiFetch('/stripe-billing/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to start subscription. Please try again.');
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Subscription Plans</h1>
        <p className="text-gray-600 mt-2">Choose the perfect plan for your hospital</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transition-all bg-white"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{(plan.priceCents / 100).toFixed(0)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            {plan.features && (
              <div className="mt-6 space-y-3">
                {Object.entries(plan.features as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="flex items-center text-sm">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => subscribe(plan.id)}
              disabled={subscribing === plan.id}
              className="mt-6 w-full px-6 py-3 rounded-xl border-2 border-blue-600 bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {subscribing === plan.id ? 'Redirecting...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscription plans available at the moment.</p>
        </div>
      )}
    </div>
  );
}
