'use client';

import { useState } from 'react';
import {
  Stepper,
  Card,
  Title,
  Text,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Radio,
  Checkbox,
} from '@mantine/core';
import { IconBuilding, IconUser, IconCreditCard, IconCheck } from '@tabler/icons-react';

export default function RegisterHospitalPage() {
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Hospital Information
    hospitalName: '',
    hospitalType: '',
    registrationNumber: '',
    licenseNumber: '',
    email: '',
    phone: '',
    website: '',

    // Step 2: Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

    // Step 3: Admin User
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',

    // Step 4: Subscription
    plan: '',
    billingCycle: 'monthly',
    agreeToTerms: false,
  });

  const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    try {
      // Step 1: Create tenant
      const tenantPayload = {
        name: formData.hospitalName,
        type: formData.hospitalType,
        email: formData.email,
        phone: formData.phone,
        subscriptionPlan: formData.plan,
        settings: {
          website: formData.website,
          licenseNumber: formData.licenseNumber,
          registrationNumber: formData.registrationNumber,
          address: {
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        },
      };

      const tenantResponse = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantPayload),
      });

      if (!tenantResponse.ok) {
        throw new Error('Failed to create tenant');
      }

      const tenant = await tenantResponse.json();

      // Step 2: Register admin user
      const userPayload = {
        email: formData.adminEmail,
        password: formData.adminPassword,
        firstName: formData.adminFirstName,
        lastName: formData.adminLastName,
        phone: formData.adminPhone,
        tenantId: tenant.id,
        role: 'HOSPITAL_ADMIN',
      };

      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to register admin user');
      }

      // Move to completion step
      nextStep();
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        shadow="xl"
        padding="xl"
        radius="md"
        style={{
          width: '100%',
          maxWidth: '900px',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
          <Title order={1} mb="xs">
            Register Your Hospital
          </Title>
          <Text c="dimmed">Join HMS SAAS and modernize your healthcare facility</Text>
        </div>

        {/* Stepper */}
        <Stepper active={active} onStepClick={setActive} mb="xl">
          <Stepper.Step
            label="Hospital Info"
            description="Basic details"
            icon={<IconBuilding size={18} />}
          >
            <Stack gap="md" mt="xl">
              <TextInput
                label="Hospital/Clinic Name"
                placeholder="Enter your hospital name"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                required
              />

              <Select
                label="Facility Type"
                placeholder="Select type"
                data={[
                  { value: 'hospital', label: 'Hospital' },
                  { value: 'clinic', label: 'Clinic' },
                  { value: 'diagnostic_center', label: 'Diagnostic Center' },
                  { value: 'pharmacy', label: 'Pharmacy' },
                  { value: 'laboratory', label: 'Laboratory' },
                ]}
                value={formData.hospitalType}
                onChange={(value) => setFormData({ ...formData, hospitalType: value || '' })}
                required
              />

              <Group grow>
                <TextInput
                  label="Registration Number"
                  placeholder="Hospital registration no."
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
                <TextInput
                  label="License Number"
                  placeholder="Medical license no."
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </Group>

              <Group grow>
                <TextInput
                  label="Email"
                  placeholder="contact@hospital.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <TextInput
                  label="Phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Group>

              <TextInput
                label="Website (Optional)"
                placeholder="https://www.yourhospital.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Address" description="Location details">
            <Stack gap="md" mt="xl">
              <TextInput
                label="Address Line 1"
                placeholder="Street address"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                required
              />

              <TextInput
                label="Address Line 2 (Optional)"
                placeholder="Apartment, suite, etc."
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              />

              <Group grow>
                <TextInput
                  label="City"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
                <TextInput
                  label="State/Province"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </Group>

              <Group grow>
                <TextInput
                  label="Postal Code"
                  placeholder="ZIP/Postal code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
                <Select
                  label="Country"
                  placeholder="Select country"
                  data={[
                    { value: 'US', label: 'United States' },
                    { value: 'UK', label: 'United Kingdom' },
                    { value: 'CA', label: 'Canada' },
                    { value: 'AU', label: 'Australia' },
                    { value: 'IN', label: 'India' },
                  ]}
                  value={formData.country}
                  onChange={(value) => setFormData({ ...formData, country: value || '' })}
                  required
                />
              </Group>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Admin User"
            description="Create account"
            icon={<IconUser size={18} />}
          >
            <Stack gap="md" mt="xl">
              <Text size="sm" c="dimmed">
                Create the main administrator account for your hospital
              </Text>

              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="John"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                  required
                />
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                  required
                />
              </Group>

              <TextInput
                label="Admin Email"
                placeholder="admin@hospital.com"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                required
              />

              <TextInput
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                value={formData.adminPhone}
                onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                required
              />

              <TextInput
                label="Password"
                placeholder="Create a strong password"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                required
              />

              <TextInput
                label="Confirm Password"
                placeholder="Re-enter password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Subscription"
            description="Choose plan"
            icon={<IconCreditCard size={18} />}
          >
            <Stack gap="md" mt="xl">
              <Text size="sm" c="dimmed" mb="md">
                Select a subscription plan that fits your needs. You can upgrade or downgrade
                anytime.
              </Text>

              <Radio.Group
                value={formData.plan}
                onChange={(value) => setFormData({ ...formData, plan: value })}
                label="Select Your Plan"
                required
              >
                <Stack mt="xs" gap="sm">
                  <Card shadow="sm" padding="md" withBorder>
                    <Radio
                      value="free"
                      label={
                        <div>
                          <Text fw={600}>Free Trial - $0/month</Text>
                          <Text size="sm" c="dimmed">
                            30 days free • Up to 5 users • 100 patients • Basic features
                          </Text>
                        </div>
                      }
                    />
                  </Card>

                  <Card shadow="sm" padding="md" withBorder>
                    <Radio
                      value="basic"
                      label={
                        <div>
                          <Text fw={600}>Basic - $99/month</Text>
                          <Text size="sm" c="dimmed">
                            Up to 20 users • 1,000 patients • Core HMS features
                          </Text>
                        </div>
                      }
                    />
                  </Card>

                  <Card shadow="sm" padding="md" withBorder>
                    <Radio
                      value="professional"
                      label={
                        <div>
                          <Text fw={600}>Professional - $299/month</Text>
                          <Text size="sm" c="dimmed">
                            Up to 100 users • 10,000 patients • Advanced features • Priority support
                          </Text>
                        </div>
                      }
                    />
                  </Card>

                  <Card shadow="sm" padding="md" withBorder>
                    <Radio
                      value="enterprise"
                      label={
                        <div>
                          <Text fw={600}>Enterprise - Custom Pricing</Text>
                          <Text size="sm" c="dimmed">
                            Unlimited users • Unlimited patients • All features • Dedicated support
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Stack>
              </Radio.Group>

              <Radio.Group
                value={formData.billingCycle}
                onChange={(value) => setFormData({ ...formData, billingCycle: value })}
                label="Billing Cycle"
                mt="xl"
              >
                <Group mt="xs">
                  <Radio value="monthly" label="Monthly" />
                  <Radio value="yearly" label="Yearly (Save 20%)" />
                </Group>
              </Radio.Group>

              <Checkbox
                mt="xl"
                label="I agree to the Terms of Service and Privacy Policy"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                required
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Completed>
            <Stack align="center" gap="md" mt="xl" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconCheck size={48} color="white" />
              </div>
              <Title order={2}>Registration Complete!</Title>
              <Text c="dimmed">
                Your hospital has been successfully registered. You will receive a confirmation
                email shortly.
              </Text>
              <Button
                size="lg"
                mt="md"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                onClick={() => (window.location.href = '/login')}
              >
                Go to Login
              </Button>
            </Stack>
          </Stepper.Completed>
        </Stepper>

        {/* Navigation Buttons */}
        {active < 4 && (
          <Group justify="space-between" mt="xl">
            <Button variant="default" onClick={prevStep} disabled={active === 0}>
              Back
            </Button>
            <Button
              onClick={active === 3 ? handleSubmit : nextStep}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {active === 3 ? 'Complete Registration' : 'Next Step'}
            </Button>
          </Group>
        )}
      </Card>
    </div>
  );
}
