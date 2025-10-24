'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleGrid } from '@mantine/core';
import {
  getModulesForRole,
  getRoleDisplayName,
  getRoleBadgeColor,
  type UserRole as RBACUserRole,
} from '@/lib/rbac';
import { User } from '../../types/common';

export default function EnhancedDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    pendingBills: 0,
    activeDoctors: 0,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Stats will be fetched from API - showing zeros until implemented
    setStats({
      totalPatients: 0,
      todaysAppointments: 0,
      pendingBills: 0,
      activeDoctors: 0,
    });

    // TODO: Fetch real stats from API
    // fetchDashboardStats().then(data => setStats(data));
  }, [router]);

  const accessibleModules = useMemo(() => {
    if (!user?.role) return [];
    const filtered = getModulesForRole(user.role as RBACUserRole);
    console.log(`[Dashboard] Modules for ${user.role}:`, filtered.length, 'modules');
    return filtered;
  }, [user]);

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '3rem',
            borderRadius: '15px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
          }}
        >
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const modules = accessibleModules;

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-400 min-h-full rounded-2xl p-0 w-full max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-400 via-pink-300 to-pink-300 text-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-t-2xl mb-4 sm:mb-6 md:mb-8 relative overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            filter: 'blur(50px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            filter: 'blur(30px)',
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-3">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold m-0 bg-gradient-to-r from-white to-blue-50 bg-clip-text text-transparent">
              Welcome back, {user.firstName}! 👋
            </h1>
            <span
              className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white shadow-lg w-fit"
              style={{ background: getRoleBadgeColor(user.role as RBACUserRole) }}
            >
              {getRoleDisplayName(user.role as RBACUserRole)}
            </span>
          </div>
          <p className="text-sm sm:text-base opacity-90 m-0">
            Here&apos;s what&apos;s happening at {(user as any).tenant?.name || 'Hospital'} today •{' '}
            {modules.length} modules available
          </p>
        </div>
      </div>

      {/* Quick Stats - Role-based */}
      <SimpleGrid 
        cols={{ base: 1, sm: 2, lg: 4 }} 
        spacing={{ base: 'sm', sm: 'md', md: 'lg' }}
        style={{ marginBottom: '2rem', padding: '0 1rem' }}
      >
        {(user.role === 'PATIENT'
          ? [
              {
                label: 'My Appointments',
                value: stats.todaysAppointments,
                color: '#4ecdc4',
                icon: '📅',
                bg: 'rgba(78, 205, 196, 0.1)',
              },
              {
                label: 'Pending Bills',
                value: stats.pendingBills,
                color: '#45b7d1',
                icon: '💰',
                bg: 'rgba(69, 183, 209, 0.1)',
              },
              {
                label: 'Medical Records',
                value: 0,
                color: '#ff6b6b',
                icon: '📋',
                bg: 'rgba(255, 107, 107, 0.1)',
              },
              {
                label: 'Prescriptions',
                value: 0,
                color: '#96ceb4',
                icon: '💊',
                bg: 'rgba(150, 206, 180, 0.1)',
              },
            ]
          : [
              {
                label: 'Total Patients',
                value: stats.totalPatients,
                color: '#ff6b6b',
                icon: '👥',
                bg: 'rgba(255, 107, 107, 0.1)',
              },
              {
                label: "Today's Appointments",
                value: stats.todaysAppointments,
                color: '#4ecdc4',
                icon: '📅',
                bg: 'rgba(78, 205, 196, 0.1)',
              },
              {
                label: 'Pending Bills',
                value: stats.pendingBills,
                color: '#45b7d1',
                icon: '💰',
                bg: 'rgba(69, 183, 209, 0.1)',
              },
              {
                label: 'Active Doctors',
                value: stats.activeDoctors,
                color: '#96ceb4',
                icon: '👨‍⚕️',
                bg: 'rgba(150, 206, 180, 0.1)',
              },
            ]
        ).map((stat, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-95 p-5 md:p-6 rounded-2xl shadow-lg border border-white border-opacity-20 transition-all duration-300 cursor-pointer backdrop-blur-sm hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 text-sm mb-2 font-medium truncate">
                  {stat.label}
                </p>
                <p
                  className="text-3xl md:text-4xl font-extrabold m-0 bg-clip-text text-transparent"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className="text-4xl md:text-5xl p-3 rounded-xl flex-shrink-0"
                style={{
                  background: stat.bg,
                  boxShadow: `0 4px 20px ${stat.color}33`,
                }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </SimpleGrid>

      {/* HMS Modules - Only for Staff/Admin, not Patients */}
      {user.role !== 'PATIENT' && (
        <div className="mb-6 sm:mb-8 md:mb-12 px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
            <h2 className="text-slate-800 text-xl md:text-2xl font-bold m-0 bg-gradient-to-r from-red-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              HMS Modules ({modules.filter((m) => m.active).length}/{modules.length} Active)
            </h2>
            <div className="flex gap-3 md:gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2 bg-teal-50 px-3 md:px-4 py-2 rounded-full border border-teal-200">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-sm text-emerald-600 font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 md:px-4 py-2 rounded-full border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600 font-medium">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
          <SimpleGrid 
            cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            spacing={{ base: 'sm', sm: 'md', md: 'lg' }}
          >
            {modules.map((module, index) => (
              <Link
                key={index}
                href={module.active ? module.href : '#'}
                style={{ textDecoration: 'none', pointerEvents: module.active ? 'auto' : 'none' }}
              >
                <div
                  style={{
                    background: module.active
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(249, 250, 251, 0.9)',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    boxShadow: module.active
                      ? '0 8px 32px rgba(0,0,0,0.1)'
                      : '0 4px 16px rgba(0,0,0,0.05)',
                    border: module.active
                      ? '1px solid rgba(255,255,255,0.2)'
                      : '1px solid rgba(229, 231, 235, 0.8)',
                    transition: 'all 0.3s ease',
                    cursor: module.active ? 'pointer' : 'not-allowed',
                    opacity: module.active ? 1 : 0.6,
                    position: 'relative',
                    backdropFilter: 'blur(10px)',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (module.active) {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (module.active) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  {/* Active Indicator Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: module.active ? '#4ecdc4' : '#9ca3af',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      width: '4px',
                      height: '100%',
                      background: module.active
                        ? `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`
                        : '#e5e7eb',
                      borderRadius: '2px',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      marginLeft: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2.25rem',
                        background: module.active ? `${module.color}15` : '#f3f4f6',
                        padding: '0.65rem',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: module.active
                          ? `0 4px 20px ${module.color}25`
                          : '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      {module.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          color: module.active ? '#1f2937' : '#6b7280',
                          fontSize: '1.05rem',
                          fontWeight: '600',
                          margin: '0 0 0.5rem 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {module.title}
                      </h3>
                      <p
                        style={{
                          color: '#6b7280',
                          fontSize: '0.85rem',
                          margin: '0 0 1rem 0',
                          lineHeight: '1.4',
                        }}
                      >
                        {module.description}
                      </p>
                      <div
                        style={{
                          color: module.active ? module.color : '#9ca3af',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: module.active ? `${module.color}15` : '#f3f4f6',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          display: 'inline-block',
                          border: module.active
                            ? `1px solid ${module.color}25`
                            : '1px solid #e5e7eb',
                        }}
                      >
                        {module.stats}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </SimpleGrid>
        </div>
      )}

      {/* Patient Quick Actions - Only for Patients */}
      {user.role === 'PATIENT' && (
        <div
          style={{
            marginBottom: '3rem',
            padding: '0 2rem',
          }}
        >
          <h2
            style={{
              color: '#1e293b',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                title: 'My Health Records',
                desc: 'View your complete medical history',
                href: '/dashboard/my-records',
                icon: '📋',
                color: '#ff6b6b',
              },
              {
                title: 'My Appointments',
                desc: 'Manage your upcoming appointments',
                href: '/dashboard/my-appointments',
                icon: '📅',
                color: '#4ecdc4',
              },
              {
                title: 'My Bills',
                desc: 'View and pay your medical bills',
                href: '/dashboard/my-bills',
                icon: '💰',
                color: '#45b7d1',
              },
              {
                title: 'Book Appointment',
                desc: 'Schedule a new appointment',
                href: '/dashboard/appointments',
                icon: '🗓️',
                color: '#96ceb4',
              },
            ].map((action, index) => (
              <Link key={index} href={action.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2rem',
                        background: `${action.color}15`,
                        padding: '0.75rem',
                        borderRadius: '12px',
                        boxShadow: `0 4px 20px ${action.color}25`,
                      }}
                    >
                      {action.icon}
                    </div>
                    <h3
                      style={{
                        color: '#1f2937',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: 0,
                      }}
                    >
                      {action.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      margin: 0,
                      lineHeight: '1.5',
                    }}
                  >
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '2rem 2rem',
          color: '#64748b',
          fontSize: '0.9rem',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          margin: '0 2rem',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <p style={{ margin: 0, fontWeight: '500' }}>
          🏥 HMS SAAS - Complete Hospital Management System
        </p>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8 }}>
          Built with ❤️ for modern healthcare facilities
        </p>
      </div>
    </div>
  );
}
