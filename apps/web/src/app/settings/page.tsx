'use client';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState, useEffect, useCallback } from 'react';

interface SystemSettings {
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  hospitalEmail: string;
  hospitalWebsite: string;
  licenseNumber: string;
  timeZone: string;
  language: string;
  currency: string;
  dateFormat: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireSymbols: boolean;
  twoFactorEnabled: boolean;
  backupFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  retentionPeriod: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  labResultAlerts: boolean;
  emergencyAlerts: boolean;
  systemMaintenanceNotices: boolean;
  billingReminders: boolean;
}

interface IntegrationSettings {
  labIntegration: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  radiologyIntegration: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    endpoint: string;
  };
  paymentGateway: {
    enabled: boolean;
    provider: string;
    publicKey: string;
    secretKey: string;
  };
  smsGateway: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    sender: string;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const SettingsPage = () => {
  const [currentTab, setCurrentTab] = useState<
    'general' | 'security' | 'notifications' | 'integrations' | 'backup' | 'users'
  >('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    hospitalEmail: '',
    hospitalWebsite: '',
    licenseNumber: '',
    timeZone: 'America/New_York',
    language: 'English',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireSymbols: true,
    twoFactorEnabled: false,
    backupFrequency: 'DAILY',
    retentionPeriod: 365,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    labResultAlerts: true,
    emergencyAlerts: true,
    systemMaintenanceNotices: true,
    billingReminders: true,
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    labIntegration: {
      enabled: false,
      provider: 'LabCorp',
      apiKey: '',
      endpoint: 'https://api.labcorp.com/v1',
    },
    radiologyIntegration: {
      enabled: false,
      provider: 'RadiologyPartners',
      apiKey: '',
      endpoint: 'https://api.radiologypartners.com/v1',
    },
    paymentGateway: {
      enabled: true,
      provider: 'Stripe',
      publicKey: 'pk_test_...',
      secretKey: '••••••••••••',
    },
    smsGateway: {
      enabled: true,
      provider: 'Twilio',
      apiKey: '••••••••••••',
      sender: 'HMS-ALERT',
    },
  });

  // Load settings from API on component mount
  const loadSettings = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSystemSettings(data.data.system || systemSettings);
          setNotificationSettings(data.data.notifications || notificationSettings);
          setIntegrationSettings(data.data.integrations || integrationSettings);
        }
      } else {
        // Use default settings if API fails
        console.log('Failed to load settings from API, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
    } finally {
      setIsInitialLoading(false);
    }
  }, [systemSettings, notificationSettings, integrationSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (category: string) => {
    setIsLoading(true);
    setSaveStatus({ type: null, message: '' });

    try {
      let settingsToSave: any = {};

      switch (category) {
        case 'General':
          settingsToSave = { system: systemSettings };
          break;
        case 'Security':
          settingsToSave = { system: systemSettings };
          break;
        case 'Notification':
          settingsToSave = { notifications: notificationSettings };
          break;
        case 'Integration':
          settingsToSave = { integrations: integrationSettings };
          break;
        case 'Backup':
          settingsToSave = { system: systemSettings };
          break;
        default:
          settingsToSave = {
            system: systemSettings,
            notifications: notificationSettings,
            integrations: integrationSettings,
          };
      }

      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
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
        if (!systemSettings.hospitalName.trim()) {
          setSaveStatus({ type: 'error', message: 'Hospital name is required' });
          return false;
        }
        if (!systemSettings.hospitalEmail.trim()) {
          setSaveStatus({ type: 'error', message: 'Hospital email is required' });
          return false;
        }
        break;
      case 'Security':
        if (systemSettings.sessionTimeout < 5) {
          setSaveStatus({ type: 'error', message: 'Session timeout must be at least 5 minutes' });
          return false;
        }
        if (systemSettings.passwordMinLength < 6) {
          setSaveStatus({ type: 'error', message: 'Password must be at least 6 characters' });
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

  const SettingGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3
        style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}
      >
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '1rem' }}>{children}</div>
    </div>
  );

  const ToggleSetting = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: disabled ? '#f9fafb' : 'white',
      }}
    >
      <div style={{ flex: 1 }}>
        <h4
          style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}
        >
          {label}
        </h4>
        {description && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{description}</p>
        )}
      </div>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            width: '1.5rem',
            height: '1.5rem',
            marginLeft: '1rem',
          }}
        />
      </label>
    </div>
  );

  if (isInitialLoading) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Loading Settings...</h3>
            <p style={{ color: '#6b7280' }}>Please wait while we load your system configuration</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Settings & Configuration
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage system settings, integrations, and hospital configuration
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary">📤 Export Config</Button>
            <Button variant="outline">🔄 Reset to Defaults</Button>
          </div>
        </div>

        {/* Status Messages */}
        {saveStatus.type && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: saveStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${saveStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: saveStatus.type === 'success' ? '#166534' : '#dc2626',
            }}
          >
            {saveStatus.message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'general', label: '🏥 General', desc: 'Hospital Info' },
              { key: 'security', label: '🔐 Security', desc: 'Access & Auth' },
              { key: 'notifications', label: '🔔 Notifications', desc: 'Alerts & Messages' },
              { key: 'integrations', label: '🔗 Integrations', desc: 'Third-party APIs' },
              { key: 'backup', label: '💾 Backup', desc: 'Data Protection' },
              { key: 'users', label: '👥 User Management', desc: 'Roles & Permissions' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'general' | 'security' | 'notifications' | 'integrations' | 'backup' | 'users')}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: currentTab === tab.key ? '#667eea' : '#6b7280',
                  borderBottom:
                    currentTab === tab.key ? '2px solid #667eea' : '2px solid transparent',
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
            <SettingGroup title="Hospital Information">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem',
                }}
              >
                <Input
                  label="Hospital Name"
                  value={systemSettings.hospitalName}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, hospitalName: e.target.value }))
                  }
                  required
                />
                <Input
                  label="License Number"
                  value={systemSettings.licenseNumber}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, licenseNumber: e.target.value }))
                  }
                  required
                />
              </div>

              <Input
                label="Hospital Address"
                value={systemSettings.hospitalAddress}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, hospitalAddress: e.target.value }))
                }
                required
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                <Input
                  type="tel"
                  label="Phone Number"
                  value={systemSettings.hospitalPhone}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, hospitalPhone: e.target.value }))
                  }
                  required
                />
                <Input
                  type="email"
                  label="Email Address"
                  value={systemSettings.hospitalEmail}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, hospitalEmail: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Website"
                  value={systemSettings.hospitalWebsite}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, hospitalWebsite: e.target.value }))
                  }
                />
              </div>
            </SettingGroup>

            <SettingGroup title="Regional Settings">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Time Zone
                  </label>
                  <select
                    value={systemSettings.timeZone}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({ ...prev, timeZone: e.target.value }))
                    }
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
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Language
                  </label>
                  <select
                    value={systemSettings.language}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({ ...prev, language: e.target.value }))
                    }
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
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Currency
                  </label>
                  <select
                    value={systemSettings.currency}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({ ...prev, currency: e.target.value }))
                    }
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
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Date Format
                  </label>
                  <select
                    value={systemSettings.dateFormat}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({ ...prev, dateFormat: e.target.value }))
                    }
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
              </div>
            </SettingGroup>

            <SettingGroup title="System Options">
              <ToggleSetting
                label="Maintenance Mode"
                description="Put the system in maintenance mode to prevent user access during updates"
                checked={systemSettings.maintenanceMode}
                onChange={(checked) =>
                  setSystemSettings((prev) => ({ ...prev, maintenanceMode: checked }))
                }
              />

              <ToggleSetting
                label="Allow New Registrations"
                description="Allow new users to register accounts"
                checked={systemSettings.allowRegistrations}
                onChange={(checked) =>
                  setSystemSettings((prev) => ({ ...prev, allowRegistrations: checked }))
                }
              />

              <ToggleSetting
                label="Require Email Verification"
                description="Require users to verify their email address before accessing the system"
                checked={systemSettings.requireEmailVerification}
                onChange={(checked) =>
                  setSystemSettings((prev) => ({ ...prev, requireEmailVerification: checked }))
                }
              />
            </SettingGroup>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button onClick={() => handleSaveWithValidation('General')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save General Settings'}
              </Button>
            </div>
          </Card>
        )}

        {/* Security Settings Tab */}
        {currentTab === 'security' && (
          <Card>
            <SettingGroup title="Authentication Settings">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                <Input
                  type="number"
                  label="Session Timeout (minutes)"
                  value={systemSettings.sessionTimeout.toString()}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value) || 0,
                    }))
                  }
                />

                <Input
                  type="number"
                  label="Max Login Attempts"
                  value={systemSettings.maxLoginAttempts.toString()}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      maxLoginAttempts: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </SettingGroup>

            <SettingGroup title="Password Requirements">
              <Input
                type="number"
                label="Minimum Password Length"
                value={systemSettings.passwordMinLength.toString()}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    passwordMinLength: parseInt(e.target.value) || 0,
                  }))
                }
                style={{ maxWidth: '200px' }}
              />

              <ToggleSetting
                label="Require Special Characters"
                description="Passwords must contain at least one special character (!@#$%^&*)"
                checked={systemSettings.passwordRequireSymbols}
                onChange={(checked) =>
                  setSystemSettings((prev) => ({ ...prev, passwordRequireSymbols: checked }))
                }
              />

              <ToggleSetting
                label="Enable Two-Factor Authentication"
                description="Require two-factor authentication for all user accounts"
                checked={systemSettings.twoFactorEnabled}
                onChange={(checked) =>
                  setSystemSettings((prev) => ({ ...prev, twoFactorEnabled: checked }))
                }
              />
            </SettingGroup>

            <SettingGroup title="System Security">
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b',
                }}
              >
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '0.5rem',
                  }}
                >
                  🔒 Security Audit
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1rem' }}>
                  Last security scan: {new Date().toLocaleDateString()} - No issues found
                </p>
                <Button size="sm" variant="outline">
                  Run Security Scan
                </Button>
              </div>
            </SettingGroup>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button onClick={() => handleSaveWithValidation('Security')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {currentTab === 'notifications' && (
          <Card>
            <SettingGroup title="Global Notification Settings">
              <ToggleSetting
                label="Email Notifications"
                description="Enable email notifications system-wide"
                checked={notificationSettings.emailNotifications}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />

              <ToggleSetting
                label="SMS Notifications"
                description="Enable SMS notifications system-wide"
                checked={notificationSettings.smsNotifications}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, smsNotifications: checked }))
                }
              />

              <ToggleSetting
                label="Push Notifications"
                description="Enable browser push notifications"
                checked={notificationSettings.pushNotifications}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                }
              />
            </SettingGroup>

            <SettingGroup title="Specific Notification Types">
              <ToggleSetting
                label="Appointment Reminders"
                description="Send reminders to patients about upcoming appointments"
                checked={notificationSettings.appointmentReminders}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, appointmentReminders: checked }))
                }
                disabled={
                  !notificationSettings.emailNotifications && !notificationSettings.smsNotifications
                }
              />

              <ToggleSetting
                label="Lab Result Alerts"
                description="Notify doctors when lab results are available"
                checked={notificationSettings.labResultAlerts}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, labResultAlerts: checked }))
                }
                disabled={!notificationSettings.emailNotifications}
              />

              <ToggleSetting
                label="Emergency Alerts"
                description="Send immediate alerts for emergency situations"
                checked={notificationSettings.emergencyAlerts}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, emergencyAlerts: checked }))
                }
              />

              <ToggleSetting
                label="System Maintenance Notices"
                description="Notify users about scheduled system maintenance"
                checked={notificationSettings.systemMaintenanceNotices}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    systemMaintenanceNotices: checked,
                  }))
                }
              />

              <ToggleSetting
                label="Billing Reminders"
                description="Send payment reminders to patients"
                checked={notificationSettings.billingReminders}
                onChange={(checked) =>
                  setNotificationSettings((prev) => ({ ...prev, billingReminders: checked }))
                }
                disabled={
                  !notificationSettings.emailNotifications && !notificationSettings.smsNotifications
                }
              />
            </SettingGroup>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button onClick={() => handleSaveSettings('Notification')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          </Card>
        )}

        {/* Integrations Tab */}
        {currentTab === 'integrations' && (
          <Card>
            <SettingGroup title="Laboratory Integration">
              <ToggleSetting
                label="Enable Lab Integration"
                description="Connect with external laboratory systems for test orders and results"
                checked={integrationSettings.labIntegration.enabled}
                onChange={(checked) =>
                  setIntegrationSettings((prev) => ({
                    ...prev,
                    labIntegration: { ...prev.labIntegration, enabled: checked },
                  }))
                }
              />

              {integrationSettings.labIntegration.enabled && (
                <div style={{ marginLeft: '2rem', display: 'grid', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <Input
                      label="Provider"
                      value={integrationSettings.labIntegration.provider}
                      onChange={(e) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          labIntegration: { ...prev.labIntegration, provider: e.target.value },
                        }))
                      }
                    />
                    <Input
                      type="password"
                      label="API Key"
                      value={integrationSettings.labIntegration.apiKey}
                      onChange={(e) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          labIntegration: { ...prev.labIntegration, apiKey: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <Input
                    label="API Endpoint"
                    value={integrationSettings.labIntegration.endpoint}
                    onChange={(e) =>
                      setIntegrationSettings((prev) => ({
                        ...prev,
                        labIntegration: { ...prev.labIntegration, endpoint: e.target.value },
                      }))
                    }
                  />
                  <Button size="sm" variant="outline" style={{ width: 'fit-content' }}>
                    Test Connection
                  </Button>
                </div>
              )}
            </SettingGroup>

            <SettingGroup title="Payment Gateway">
              <ToggleSetting
                label="Enable Payment Processing"
                description="Accept online payments from patients"
                checked={integrationSettings.paymentGateway.enabled}
                onChange={(checked) =>
                  setIntegrationSettings((prev) => ({
                    ...prev,
                    paymentGateway: { ...prev.paymentGateway, enabled: checked },
                  }))
                }
              />

              {integrationSettings.paymentGateway.enabled && (
                <div style={{ marginLeft: '2rem', display: 'grid', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <Input
                      label="Provider"
                      value={integrationSettings.paymentGateway.provider}
                      onChange={(e) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          paymentGateway: { ...prev.paymentGateway, provider: e.target.value },
                        }))
                      }
                    />
                    <Input
                      label="Public Key"
                      value={integrationSettings.paymentGateway.publicKey}
                      onChange={(e) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          paymentGateway: { ...prev.paymentGateway, publicKey: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <Input
                    type="password"
                    label="Secret Key"
                    value={integrationSettings.paymentGateway.secretKey}
                    onChange={(e) =>
                      setIntegrationSettings((prev) => ({
                        ...prev,
                        paymentGateway: { ...prev.paymentGateway, secretKey: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
            </SettingGroup>

            <SettingGroup title="SMS Gateway">
              <ToggleSetting
                label="Enable SMS Service"
                description="Send SMS notifications and reminders"
                checked={integrationSettings.smsGateway.enabled}
                onChange={(checked) =>
                  setIntegrationSettings((prev) => ({
                    ...prev,
                    smsGateway: { ...prev.smsGateway, enabled: checked },
                  }))
                }
              />

              {integrationSettings.smsGateway.enabled && (
                <div style={{ marginLeft: '2rem', display: 'grid', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <Input
                      label="Provider"
                      value={integrationSettings.smsGateway.provider}
                      onChange={(e) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          smsGateway: { ...prev.smsGateway, provider: e.target.value },
                        }))
                      }
                    />
                    <Input
                      label="Sender ID"
                      value={integrationSettings.smsGateway.sender}
                      onChange={(e) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          smsGateway: { ...prev.smsGateway, sender: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <Input
                    type="password"
                    label="API Key"
                    value={integrationSettings.smsGateway.apiKey}
                    onChange={(e) =>
                      setIntegrationSettings((prev) => ({
                        ...prev,
                        smsGateway: { ...prev.smsGateway, apiKey: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
            </SettingGroup>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button onClick={() => handleSaveSettings('Integration')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Integration Settings'}
              </Button>
            </div>
          </Card>
        )}

        {/* Backup Tab */}
        {currentTab === 'backup' && (
          <Card>
            <SettingGroup title="Backup Configuration">
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Backup Frequency
                </label>
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      backupFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY',
                    }))
                  }
                  style={{
                    width: '300px',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                  }}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <Input
                type="number"
                label="Retention Period (days)"
                value={systemSettings.retentionPeriod.toString()}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    retentionPeriod: parseInt(e.target.value) || 0,
                  }))
                }
                style={{ maxWidth: '300px' }}
              />
            </SettingGroup>

            <SettingGroup title="Backup Status">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#166534',
                          marginBottom: '0.25rem',
                        }}
                      >
                        ✅ Last Backup Successful
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#166534', margin: 0 }}>
                        {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} - Size: 2.4 GB
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      15
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Backups</div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      36.2 GB
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Size</div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      99.9%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Success Rate</div>
                  </div>
                </div>
              </div>
            </SettingGroup>

            <SettingGroup title="Manual Actions">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="primary">🗄️ Create Backup Now</Button>
                <Button variant="outline">📤 Export Data</Button>
                <Button variant="secondary">📥 Restore from Backup</Button>
              </div>
            </SettingGroup>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <Button onClick={() => handleSaveSettings('Backup')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Backup Settings'}
              </Button>
            </div>
          </Card>
        )}

        {/* User Management Tab */}
        {currentTab === 'users' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                User Management & Roles
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Manage user roles, permissions, and access control settings. This advanced module
                allows you to configure role-based access control (RBAC) for your hospital
                management system.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button variant="primary">👥 Manage Users</Button>
                <Button variant="outline">🔐 Configure Roles</Button>
                <Button variant="secondary">📋 Permission Matrix</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
