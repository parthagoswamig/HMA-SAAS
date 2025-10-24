'use client';

import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import React, { useState, useEffect } from 'react';
import { notifications as mantineNotifications } from '@mantine/notifications';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'STAFF' | 'TECHNICIAN';
  department: string;
  licenseNumber?: string;
  specialization?: string;
  profileImage?: string;
  joinedDate: string;
  isActive: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const ProfilePage = () => {
  const [currentTab, setCurrentTab] = useState<
    'profile' | 'password' | 'notifications' | 'security'
  >('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    role: 'DOCTOR',
    department: '',
    licenseNumber: '',
    specialization: '',
    joinedDate: '',
    isActive: true,
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    systemUpdates: true,
    marketingEmails: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user profile on component mount
  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
  }, []);

  const loadProfile = async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProfile(data.data);
        }
      } else {
        console.log('Failed to load profile from API, using defaults');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setNotifications(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const newErrors: Record<string, string> = {};
      if (!profile.firstName) newErrors.firstName = 'First name is required';
      if (!profile.lastName) newErrors.lastName = 'Last name is required';
      if (!profile.email) newErrors.email = 'Email is required';
      if (!profile.phone) newErrors.phone = 'Phone is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setIsEditing(false);
        mantineNotifications.show({
          title: 'Success',
          message: 'Profile updated successfully!',
          color: 'green',
        });
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      mantineNotifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate password form
      const newErrors: Record<string, string> = {};
      if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
      if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
      if (passwordForm.newPassword.length < 8)
        newErrors.newPassword = 'Password must be at least 8 characters';
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        mantineNotifications.show({
          title: 'Success',
          message: 'Password updated successfully!',
          color: 'green',
        });
      } else {
        throw new Error(result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      mantineNotifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update password. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notifications),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        mantineNotifications.show({
          title: 'Success',
          message: 'Notification preferences saved!',
          color: 'green',
        });
      } else {
        throw new Error(result.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      mantineNotifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save preferences. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Loading Profile...</h3>
            <p style={{ color: '#6b7280' }}>Please wait while we load your profile information</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '#dc2626';
      case 'DOCTOR':
        return '#059669';
      case 'NURSE':
        return '#0369a1';
      case 'STAFF':
        return '#7c3aed';
      case 'TECHNICIAN':
        return '#ea580c';
      default:
        return '#6b7280';
    }
  };

  const ProfileForm = () => (
    <form onSubmit={handleProfileSubmit}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Basic Information */}
        <div style={{ gridColumn: 'span 2' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Basic Information
          </h3>
        </div>

        <Input
          label="First Name"
          value={profile.firstName}
          onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
          error={errors.firstName}
          disabled={!isEditing}
          required
        />

        <Input
          label="Last Name"
          value={profile.lastName}
          onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
          error={errors.lastName}
          disabled={!isEditing}
          required
        />

        <Input
          type="email"
          label="Email"
          value={profile.email}
          onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          disabled={!isEditing}
          required
        />

        <Input
          type="tel"
          label="Phone"
          value={profile.phone}
          onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
          error={errors.phone}
          disabled={!isEditing}
          required
        />

        <Input
          type="date"
          label="Date of Birth"
          value={profile.dateOfBirth}
          onChange={(e) => setProfile((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
          disabled={!isEditing}
        />

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
            Gender
          </label>
          <select
            value={profile.gender}
            onChange={(e) => setProfile((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }))}
            disabled={!isEditing}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: isEditing ? 'white' : '#f9fafb',
              color: '#374151',
            }}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Address Information */}
        <div style={{ gridColumn: 'span 2', marginTop: '2rem' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Address Information
          </h3>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <Input
            label="Address"
            value={profile.address}
            onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
            disabled={!isEditing}
          />
        </div>

        <Input
          label="City"
          value={profile.city}
          onChange={(e) => setProfile((prev) => ({ ...prev, city: e.target.value }))}
          disabled={!isEditing}
        />

        <Input
          label="State"
          value={profile.state}
          onChange={(e) => setProfile((prev) => ({ ...prev, state: e.target.value }))}
          disabled={!isEditing}
        />

        <Input
          label="ZIP Code"
          value={profile.zipCode}
          onChange={(e) => setProfile((prev) => ({ ...prev, zipCode: e.target.value }))}
          disabled={!isEditing}
        />

        {/* Professional Information */}
        <div style={{ gridColumn: 'span 2', marginTop: '2rem' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
            }}
          >
            Professional Information
          </h3>
        </div>

        <Input
          label="Department"
          value={profile.department}
          onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
          disabled={!isEditing}
        />

        <Input
          label="License Number"
          value={profile.licenseNumber || ''}
          onChange={(e) => setProfile((prev) => ({ ...prev, licenseNumber: e.target.value }))}
          disabled={!isEditing}
        />

        <div style={{ gridColumn: 'span 2' }}>
          <Input
            label="Specialization"
            value={profile.specialization || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev, specialization: e.target.value }))}
            disabled={!isEditing}
          />
        </div>
      </div>

      {isEditing && (
        <div
          style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  );

  const PasswordForm = () => (
    <Card>
      <h3
        style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}
      >
        Change Password
      </h3>

      <form onSubmit={handlePasswordSubmit}>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              error={errors.currentPassword}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              error={errors.newPassword}
              required
            />
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
              Password must be at least 8 characters long
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <Input
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              error={errors.confirmPassword}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </Card>
  );

  const NotificationsForm = () => (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
          Notification Preferences
        </h3>
        <Button onClick={handleNotificationsSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {[
          {
            key: 'emailNotifications',
            label: 'Email Notifications',
            description: 'Receive notifications via email',
          },
          {
            key: 'smsNotifications',
            label: 'SMS Notifications',
            description: 'Receive notifications via SMS',
          },
          {
            key: 'pushNotifications',
            label: 'Push Notifications',
            description: 'Receive push notifications in browser',
          },
          {
            key: 'appointmentReminders',
            label: 'Appointment Reminders',
            description: 'Get reminded about upcoming appointments',
          },
          {
            key: 'systemUpdates',
            label: 'System Updates',
            description: 'Receive updates about system changes',
          },
          {
            key: 'marketingEmails',
            label: 'Marketing Emails',
            description: 'Receive marketing and promotional emails',
          },
        ].map((item) => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          >
            <div>
              <h4
                style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {item.label}
              </h4>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                {item.description}
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifications[item.key as keyof NotificationSettings]}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked,
                  }))
                }
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                {notifications[item.key as keyof NotificationSettings] ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        ))}
      </div>
    </Card>
  );

  const SecuritySettings = () => (
    <Card>
      <h3
        style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}
      >
        Security Settings
      </h3>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <h4
            style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}
          >
            Two-Factor Authentication
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Add an extra layer of security to your account by requiring a second form of
            authentication.
          </p>
          <Button variant="outline">Enable 2FA</Button>
        </div>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <h4
            style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}
          >
            Active Sessions
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Monitor and manage your active login sessions across devices.
          </p>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Current Session</strong>
                <br />
                Chrome on Windows • New York, NY
              </div>
              <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Active Now</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Manage Sessions
          </Button>
        </div>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #fee2e2',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
          }}
        >
          <h4
            style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: '#dc2626' }}
          >
            Danger Zone
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            These actions are irreversible and will permanently affect your account.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" size="sm">
              Deactivate Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ color: '#dc2626', borderColor: '#dc2626' }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              Profile Settings
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Manage your account information and preferences
            </p>
          </div>
          {currentTab === 'profile' && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>✏️ Edit Profile</Button>
          )}
        </div>

        {/* Profile Overview Card */}
        <Card style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </div>

            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                {profile.firstName} {profile.lastName}
              </h2>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: `${getRoleColor(profile.role)}15`,
                    color: getRoleColor(profile.role),
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}
                >
                  {profile.role}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{profile.department}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                }}
              >
                <span>📧 {profile.email}</span>
                <span>📞 {profile.phone}</span>
                <span>📅 Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { key: 'profile', label: '👤 Profile', desc: 'Personal Information' },
              { key: 'password', label: '🔒 Password', desc: 'Security Settings' },
              { key: 'notifications', label: '🔔 Notifications', desc: 'Preferences' },
              { key: 'security', label: '🛡️ Security', desc: 'Account Security' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as 'profile' | 'password' | 'notifications' | 'security')}
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
                }}
              >
                <div>
                  {tab.label}
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{tab.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {currentTab === 'profile' && (
          <Card>
            <ProfileForm />
          </Card>
        )}

        {currentTab === 'password' && <PasswordForm />}
        {currentTab === 'notifications' && <NotificationsForm />}
        {currentTab === 'security' && <SecuritySettings />}
      </div>
    </Layout>
  );
};

export default ProfilePage;

