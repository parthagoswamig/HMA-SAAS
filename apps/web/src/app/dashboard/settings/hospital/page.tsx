'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  TextInput,
} from '@mantine/core';
import Layout from '../../../components/Layout';
import {
  IconBuilding,
  IconUsers,
  IconShield,
  IconUpload,
  IconRefresh,
  IconClock,
} from '@tabler/icons-react';

interface HospitalSettings {
  // General Info
  name: string;
  slug: string;
  type: string;
  email: string;
  phone: string;
  website: string;

  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Branding
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;

  // Configuration
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;

  // Features
  appointmentsEnabled: boolean;
  laboratoryEnabled: boolean;
  pharmacyEnabled: boolean;
  billingEnabled: boolean;
  inventoryEnabled: boolean;
  reportingEnabled: boolean;

  // Limits
  maxUsers: number;
  maxPatients: number;
  maxAppointments: number;
  storageGB: number;

  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  billingAlerts: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const HospitalSettingsPage = () => {
  const [currentTab, setCurrentTab] = useState<'general' | 'branding' | 'features' | '_notifications' | 'security'>('general');
  const [settings, setSettings] = useState<HospitalSettings>({
    // General Info
    name: '',
    slug: '',
    type: 'HOSPITAL',
    email: '',
    phone: '',
    website: '',

    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

    // Branding
    logoUrl: '',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',

    // Configuration
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en',

    // Features
    appointmentsEnabled: true,
    laboratoryEnabled: true,
    pharmacyEnabled: true,
    billingEnabled: true,
    inventoryEnabled: true,
    reportingEnabled: true,

    // Limits
    maxUsers: 100,
    maxPatients: 10000,
    maxAppointments: 500,
    storageGB: 100,

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    billingAlerts: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    loadHospitalSettings();
  }, []);

  const loadHospitalSettings = async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/hospital/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } else {
        console.log('Failed to load hospital settings from API, using defaults');
      }
    } catch (error) {
      console.error('Error loading hospital settings:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSaveSettings = async (category: string) => {
    setIsLoading(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/hospital/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setSaveStatus({
          type: 'success',
          message: `${category} settings saved successfully!`,
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: null, message: '' });
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (category: string): boolean => {
    switch (category) {
      case 'General':
        if (!settings.name.trim()) {
          setSaveStatus({ type: 'error', message: 'Hospital name is required' });
          return false;
        }
        if (!settings.email.trim()) {
          setSaveStatus({ type: 'error', message: 'Hospital email is required' });
          return false;
        }
        if (!settings.phone.trim()) {
          setSaveStatus({ type: 'error', message: 'Hospital phone is required' });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSaveWithValidation = async (category: string) => {
    if (!validateForm(category)) {
      return;
    }
    await handleSaveSettings(category);
  };

  if (isInitialLoading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
            <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Loading Hospital Settings...</h3>
            <p style={{ color: '#6b7280' }}>Please wait while we load your hospital configuration</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <IconBuilding size={28} />
              Hospital Settings & Configuration
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage hospital information, branding, features, and operational settings
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" leftSection={<IconRefresh size={16} />}>
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {saveStatus.type && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor: saveStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${saveStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: saveStatus.type === 'success' ? '#166534' : '#dc2626',
          }}>
            {saveStatus.message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'general', label: '🏥 General', desc: 'Basic Info' },
              { key: 'branding', label: '🎨 Branding', desc: 'Visual Identity' },
              { key: 'features', label: '⚙️ Features', desc: 'Modules & Limits' },
              { key: '_notifications', label: '🔔 Notifications', desc: 'Alerts & Reminders' },
              { key: 'security', label: '🔒 Security', desc: 'Access Control' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'general' | 'branding' | 'features' | '_notifications' | 'security')}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: currentTab === tab.key ? '#667eea' : '#6b7280',
                  borderBottom: currentTab === tab.key ? '2px solid #667eea' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                <div>{tab.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* General Settings Tab */}
        {currentTab === 'general' && (
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Basic Information
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <TextInput
                  label="Hospital Name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  required
                />

                <TextInput
                  label="Slug"
                  value={settings.slug}
                  onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                  description="Used in URLs (e.g., citygeneral.hmssaas.com)"
                  required
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Facility Type
                  </label>
                  <select
                    value={settings.type}
                    onChange={(e) => setSettings({ ...settings, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINIC">Clinic</option>
                    <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
                  </select>
                </div>

                <TextInput
                  type="email"
                  label="Email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  required
                />

                <TextInput
                  label="Phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  required
                />
              </div>

              <TextInput
                label="Website"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              />

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem', marginTop: '2rem' }}>
                Address Information
              </h3>

              <TextInput
                label="Address Line 1"
                value={settings.addressLine1}
                onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
                style={{ marginBottom: '1rem' }}
              />

              <TextInput
                label="Address Line 2"
                value={settings.addressLine2}
                onChange={(e) => setSettings({ ...settings, addressLine2: e.target.value })}
                style={{ marginBottom: '1rem' }}
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <TextInput
                  label="City"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                />

                <TextInput
                  label="State/Province"
                  value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                />

                <TextInput
                  label="Postal Code"
                  value={settings.postalCode}
                  onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                />

                <TextInput
                  label="Country"
                  value={settings.country}
                  onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Regional Settings
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="INR">Indian Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Time Format
                  </label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#374151',
                    }}
                  >
                    <option value="12h">12 Hour (AM/PM)</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}>
                <Button onClick={() => handleSaveWithValidation('General')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Branding Tab */}
        {currentTab === 'branding' && (
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Visual Identity
              </h3>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Hospital Logo
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                }}>
                  <IconUpload size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    Upload hospital logo (Recommended: 200x200px, PNG or JPG)
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Primary Color
                  </label>
                  <TextInput
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    style={{
                      width: '100%',
                      height: '48px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Secondary Color
                  </label>
                  <TextInput
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    style={{
                      width: '100%',
                      height: '48px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Preview your brand colors:
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: settings.primaryColor,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                  }}>
                    Primary
                  </div>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: settings.secondaryColor,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                  }}>
                    Secondary
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}>
                <Button onClick={() => handleSaveSettings('Branding')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Branding Settings'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Features Tab */}
        {currentTab === 'features' && (
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Enabled Features
              </h3>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Appointments Module
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Enable online appointment booking and scheduling
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.appointmentsEnabled}
                      onChange={(e) => setSettings({ ...settings, appointmentsEnabled: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Laboratory Module
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Lab tests, results, and management
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.laboratoryEnabled}
                      onChange={(e) => setSettings({ ...settings, laboratoryEnabled: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Pharmacy Module
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Medicine inventory and dispensing
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.pharmacyEnabled}
                      onChange={(e) => setSettings({ ...settings, pharmacyEnabled: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Billing Module
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Invoicing, payments, and financial tracking
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.billingEnabled}
                      onChange={(e) => setSettings({ ...settings, billingEnabled: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Inventory Module
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Medical supplies and equipment management
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.inventoryEnabled}
                      onChange={(e) => setSettings({ ...settings, inventoryEnabled: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Reporting & Analytics
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Advanced reports and data visualization
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.reportingEnabled}
                      onChange={(e) => setSettings({ ...settings, reportingEnabled: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    Usage Limits
                  </h4>
                  <span style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    PROFESSIONAL PLAN
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      Maximum Users
                    </label>
                    <TextInput
                      type="number"
                      value={settings.maxUsers}
                      onChange={(e) => setSettings({ ...settings, maxUsers: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="1000"
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        backgroundColor: '#e5e7eb',
                        color: '#6b7280',
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Upgrade plan to increase limit
                    </p>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      Maximum Patients
                    </label>
                    <TextInput
                      type="number"
                      value={settings.maxPatients}
                      onChange={(e) => setSettings({ ...settings, maxPatients: parseInt(e.target.value) || 0 })}
                      min="100"
                      max="100000"
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        backgroundColor: '#e5e7eb',
                        color: '#6b7280',
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Upgrade plan to increase limit
                    </p>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      Storage (GB)
                    </label>
                    <TextInput
                      type="number"
                      value={settings.storageGB}
                      onChange={(e) => setSettings({ ...settings, storageGB: parseInt(e.target.value) || 0 })}
                      min="10"
                      max="1000"
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        backgroundColor: '#e5e7eb',
                        color: '#6b7280',
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Upgrade plan to increase limit
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}>
                <Button onClick={() => handleSaveSettings('Features')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Feature Settings'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {currentTab === '_notifications' && (
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Notification Preferences
              </h3>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Email Notifications
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Receive notifications via email
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      SMS Notifications
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Receive notifications via SMS
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Appointment Reminders
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Send automatic appointment reminders to patients
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.appointmentReminders}
                      onChange={(e) => setSettings({ ...settings, appointmentReminders: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Billing Alerts
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      Get notified about pending payments and invoices
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <TextInput
                      type="checkbox"
                      checked={settings.billingAlerts}
                      onChange={(e) => setSettings({ ...settings, billingAlerts: e.target.checked })}
                      style={{ width: '1.5rem', height: '1.5rem', marginLeft: '1rem' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}>
                <Button onClick={() => handleSaveSettings('Notifications')} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Security Tab */}
        {currentTab === 'security' && (
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Security Settings
              </h3>

              <div style={{
                padding: '1rem',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                marginBottom: '2rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '0.5rem',
                }}>
                  🔒 Security Configuration
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1rem' }}>
                  Contact your system administrator to modify security settings
                </p>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <Button variant="outline" style={{ justifyContent: 'flex-start' }}>
                  <IconShield size={16} style={{ marginRight: '0.5rem' }} />
                  Two-Factor Authentication (Coming Soon)
                </Button>

                <Button variant="outline" style={{ justifyContent: 'flex-start' }}>
                  <IconClock size={16} style={{ marginRight: '0.5rem' }} />
                  Session Timeout Settings (Coming Soon)
                </Button>

                <Button variant="outline" style={{ justifyContent: 'flex-start' }}>
                  <IconUsers size={16} style={{ marginRight: '0.5rem' }} />
                  IP Whitelist (Coming Soon)
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default HospitalSettingsPage;



