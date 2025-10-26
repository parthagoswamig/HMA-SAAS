'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  LoadingOverlay,
  Alert,
  Card,
  Badge,
  Text,
  NumberInput,
  Switch,
  Divider,
  ThemeIcon,
  List,
  Progress,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { 
  IconCreditCard, 
  IconAlertCircle, 
  IconCheck,
  IconX,
  IconStar,
  IconTrendingUp,
} from '@tabler/icons-react';

interface SubscriptionManagementFormProps {
  opened: boolean;
  onClose: () => void;
  subscription?: any;
  onSuccess: () => void;
}

const SubscriptionManagementForm: React.FC<SubscriptionManagementFormProps> = ({
  opened,
  onClose,
  subscription,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    // Subscription Details
    planId: '',
    planName: '',
    billingCycle: 'monthly',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    autoRenew: true,
    status: 'active',
    
    // Billing Information
    paymentMethod: '',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    
    // Features & Limits
    maxUsers: 0,
    maxPatients: 0,
    maxStorage: 0,
    maxBranches: 0,
    features: [] as string[],
    
    // Pricing
    basePrice: 0,
    discount: 0,
    tax: 0,
    totalAmount: 0,
    
    // Add-ons
    addons: [] as string[],
    addonsCost: 0,
    
    // Contact
    billingEmail: '',
    billingPhone: '',
    accountManager: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened) {
      fetchPlans();
      
      if (subscription) {
        // Edit mode - populate form
        setFormData({
          ...formData,
          ...subscription,
          startDate: subscription.startDate ? new Date(subscription.startDate) : new Date(),
          endDate: subscription.endDate ? new Date(subscription.endDate) : new Date(),
        });
      } else {
        resetForm();
      }
    }
  }, [opened, subscription]);

  const fetchPlans = async () => {
    // Mock plans - would fetch from API
    const mockPlans = [
      {
        value: 'basic',
        label: 'Basic Plan',
        price: 99,
        features: ['Up to 10 users', '1000 patients', '10GB storage', 'Basic support'],
      },
      {
        value: 'professional',
        label: 'Professional Plan',
        price: 299,
        features: ['Up to 50 users', '10000 patients', '100GB storage', 'Priority support', 'Advanced analytics'],
      },
      {
        value: 'enterprise',
        label: 'Enterprise Plan',
        price: 999,
        features: ['Unlimited users', 'Unlimited patients', '1TB storage', '24/7 support', 'Custom features', 'API access'],
      },
    ];
    setPlans(mockPlans);
  };

  const resetForm = () => {
    setFormData({
      planId: '',
      planName: '',
      billingCycle: 'monthly',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      autoRenew: true,
      status: 'active',
      paymentMethod: '',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingCountry: '',
      maxUsers: 0,
      maxPatients: 0,
      maxStorage: 0,
      maxBranches: 0,
      features: [],
      basePrice: 0,
      discount: 0,
      tax: 0,
      totalAmount: 0,
      addons: [],
      addonsCost: 0,
      billingEmail: '',
      billingPhone: '',
      accountManager: '',
    });
    setFormErrors({});
  };

  const calculateTotal = () => {
    const subtotal = formData.basePrice + formData.addonsCost;
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * formData.tax) / 100;
    const total = taxableAmount + taxAmount;
    
    setFormData(prev => ({ ...prev, totalAmount: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.basePrice, formData.discount, formData.tax, formData.addonsCost]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.planId) errors.planId = 'Plan is required';
    if (!formData.billingCycle) errors.billingCycle = 'Billing cycle is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    
    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber) errors.cardNumber = 'Card number is required';
      if (!formData.cardholderName) errors.cardholderName = 'Cardholder name is required';
      if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) errors.cvv = 'CVV is required';
    }
    
    if (!formData.billingEmail) errors.billingEmail = 'Billing email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      errors.billingEmail = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields correctly',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      // Would call API to save subscription
      const response = { success: true };

      if (response.success) {
        notifications.show({
          title: 'Success',
          message: subscription ? 'Subscription updated successfully' : 'Subscription created successfully',
          color: 'green',
          icon: <IconCreditCard />,
        });
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error submitting subscription:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to save subscription',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const billingCycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi_annual', label: 'Semi-Annual' },
    { value: 'annual', label: 'Annual' },
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'invoice', label: 'Invoice' },
  ];

  const addonsOptions = [
    { value: 'sms_pack', label: 'SMS Package (1000 SMS/month)' },
    { value: 'email_pack', label: 'Email Package (5000 emails/month)' },
    { value: 'extra_storage', label: 'Extra Storage (100GB)' },
    { value: 'api_access', label: 'API Access' },
    { value: 'custom_reports', label: 'Custom Reports' },
    { value: 'training', label: 'Training Package' },
    { value: 'priority_support', label: 'Priority Support' },
  ];

  const selectedPlan = plans.find(p => p.value === formData.planId);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={subscription ? 'Edit Subscription' : 'Manage Subscription'}
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          <Alert icon={<IconCreditCard size={20} />} color="blue" variant="light">
            Manage your hospital subscription plan and billing information.
          </Alert>

          {/* Plan Selection */}
          <div>
            <Text size="sm" fw={500} mb="xs">Select Plan</Text>
            <Grid>
              {plans.map((plan) => (
                <Grid.Col span={{ base: 12, sm: 4 }} key={plan.value}>
                  <Card
                    padding="md"
                    radius="md"
                    withBorder
                    style={{
                      borderColor: formData.planId === plan.value ? 'var(--mantine-color-blue-6)' : undefined,
                      borderWidth: formData.planId === plan.value ? 2 : 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        planId: plan.value,
                        planName: plan.label,
                        basePrice: plan.price,
                        features: plan.features,
                      });
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={600}>{plan.label}</Text>
                        {plan.value === 'professional' && (
                          <Badge color="orange" leftSection={<IconStar size={12} />}>
                            Popular
                          </Badge>
                        )}
                      </Group>
                      <Text size="xl" fw={700}>${plan.price}/mo</Text>
                      <Divider />
                      <List
                        size="sm"
                        spacing="xs"
                        icon={
                          <ThemeIcon color="green" size={20} radius="xl">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        }
                      >
                        {plan.features.map((feature: string, index: number) => (
                          <List.Item key={index}>
                            <Text size="sm">{feature}</Text>
                          </List.Item>
                        ))}
                      </List>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
            {formErrors.planId && (
              <Text color="red" size="sm" mt="xs">{formErrors.planId}</Text>
            )}
          </div>

          {/* Billing Cycle */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Billing Cycle"
                placeholder="Select billing cycle"
                required
                data={billingCycles}
                value={formData.billingCycle}
                onChange={(value) => setFormData({ ...formData, billingCycle: value || 'monthly' })}
                error={formErrors.billingCycle}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Payment Method"
                placeholder="Select payment method"
                required
                data={paymentMethods}
                value={formData.paymentMethod}
                onChange={(value) => setFormData({ ...formData, paymentMethod: value || '' })}
                error={formErrors.paymentMethod}
              />
            </Grid.Col>
          </Grid>

          {/* Payment Details (for credit card) */}
          {formData.paymentMethod === 'credit_card' && (
            <>
              <Divider label="Card Information" />
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    error={formErrors.cardNumber}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Cardholder Name"
                    placeholder="Enter name on card"
                    required
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                    error={formErrors.cardholderName}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Expiry Date"
                    placeholder="MM/YY"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    error={formErrors.expiryDate}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="CVV"
                    placeholder="123"
                    required
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    error={formErrors.cvv}
                    maxLength={4}
                  />
                </Grid.Col>
              </Grid>
            </>
          )}

          {/* Subscription Period */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Start Date"
                placeholder="Select start date"
                required
                value={formData.startDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, startDate: dateValue });
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="End Date"
                placeholder="Select end date"
                required
                value={formData.endDate}
                onChange={(value) => {
                  const dateValue = value ? new Date(value) : new Date();
                  setFormData({ ...formData, endDate: dateValue });
                }}
                minDate={formData.startDate}
              />
            </Grid.Col>
          </Grid>

          <Switch
            label="Auto-renew subscription"
            checked={formData.autoRenew}
            onChange={(event) => setFormData({ 
              ...formData, 
              autoRenew: event.currentTarget.checked 
            })}
          />

          {/* Add-ons */}
          <div>
            <Text size="sm" fw={500} mb="xs">Add-ons (Optional)</Text>
            <Stack gap="xs">
              {addonsOptions.map((addon) => (
                <Card key={addon.value} padding="xs" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Switch
                        checked={formData.addons.includes(addon.value)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setFormData({ 
                              ...formData, 
                              addons: [...formData.addons, addon.value],
                              addonsCost: formData.addonsCost + 50, // Mock price
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              addons: formData.addons.filter(a => a !== addon.value),
                              addonsCost: formData.addonsCost - 50,
                            });
                          }
                        }}
                      />
                      <Text size="sm">{addon.label}</Text>
                    </Group>
                    <Text size="sm" fw={500}>+$50/mo</Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          </div>

          {/* Billing Contact */}
          <Divider label="Billing Contact" />
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Billing Email"
                placeholder="Enter billing email"
                required
                value={formData.billingEmail}
                onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                error={formErrors.billingEmail}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Billing Phone"
                placeholder="Enter billing phone"
                value={formData.billingPhone}
                onChange={(e) => setFormData({ ...formData, billingPhone: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          {/* Pricing Summary */}
          <Card padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Text fw={600}>Pricing Summary</Text>
              <Divider />
              <Group justify="space-between">
                <Text size="sm">Base Plan ({formData.planName || 'None selected'})</Text>
                <Text size="sm" fw={500}>${formData.basePrice}/mo</Text>
              </Group>
              {formData.addons.length > 0 && (
                <Group justify="space-between">
                  <Text size="sm">Add-ons</Text>
                  <Text size="sm" fw={500}>${formData.addonsCost}/mo</Text>
                </Group>
              )}
              {formData.discount > 0 && (
                <Group justify="space-between">
                  <Text size="sm" c="green">Discount ({formData.discount}%)</Text>
                  <Text size="sm" fw={500} c="green">
                    -${((formData.basePrice + formData.addonsCost) * formData.discount / 100).toFixed(2)}
                  </Text>
                </Group>
              )}
              {formData.tax > 0 && (
                <Group justify="space-between">
                  <Text size="sm">Tax ({formData.tax}%)</Text>
                  <Text size="sm" fw={500}>
                    ${((formData.basePrice + formData.addonsCost - (formData.basePrice + formData.addonsCost) * formData.discount / 100) * formData.tax / 100).toFixed(2)}
                  </Text>
                </Group>
              )}
              <Divider />
              <Group justify="space-between">
                <Text fw={600}>Total</Text>
                <Text size="xl" fw={700} c="blue">
                  ${formData.totalAmount.toFixed(2)}/mo
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Current Usage (if editing) */}
          {subscription && (
            <Card padding="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={600}>Current Usage</Text>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="sm" c="dimmed">Users</Text>
                    <Progress value={75} mb="xs" />
                    <Text size="xs">75 of 100 users</Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="sm" c="dimmed">Storage</Text>
                    <Progress value={45} mb="xs" color="green" />
                    <Text size="xs">45GB of 100GB</Text>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          )}

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {subscription ? 'Update Subscription' : 'Subscribe'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default SubscriptionManagementForm;
