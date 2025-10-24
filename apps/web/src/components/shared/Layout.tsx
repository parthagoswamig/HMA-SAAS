'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Text,
  Burger,
  Group,
  ScrollArea,
  UnstyledButton,
  Box,
  Avatar,
  Menu,
  ActionIcon,
  Badge,
  Indicator,
  Container,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLayoutGrid,
  IconUsers,
  IconUser,
  IconStethoscope,
  IconPill,
  IconCurrency,
  IconShieldX,
  IconCalendar,
  IconChartBar,
  IconSettings,
  IconBell,
  IconX,
  IconShieldCheck,
  IconFileText,
  IconAmbulance,
  IconMessage,
} from '@tabler/icons-react';
import { UserRole } from '../../types/common';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  notifications?: number;
  onLogout?: () => void;
}

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  roles?: UserRole[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    icon: <IconLayoutGrid size="1.2rem" />,
    href: '/dashboard',
  },
  {
    label: 'Patient Management',
    icon: <IconUsers size="1.2rem" />,
    href: '/patients',
    children: [
      { label: 'Patient Registry', icon: <IconUsers size="1rem" />, href: '/patients/registry' },
      { label: 'Medical Records', icon: <IconFileText size="1rem" />, href: '/patients/records' },
      { label: 'Patient Portal', icon: <IconUser size="1rem" />, href: '/patients/portal' },
    ],
  },
  {
    label: 'Staff Management',
    icon: <IconUser size="1.2rem" />,
    href: '/staff',
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { label: 'Staff Directory', icon: <IconUsers size="1rem" />, href: '/staff/directory' },
      { label: 'Schedules', icon: <IconCalendar size="1rem" />, href: '/staff/schedules' },
      { label: 'Performance', icon: <IconChartBar size="1rem" />, href: '/staff/performance' },
    ],
  },
  {
    label: 'OPD Management',
    icon: <IconStethoscope size="1.2rem" />,
    href: '/opd',
    children: [
      { label: 'Consultations', icon: <IconStethoscope size="1rem" />, href: '/opd/consultations' },
      { label: 'Queue Management', icon: <IconCalendar size="1rem" />, href: '/opd/queue' },
      { label: 'Prescriptions', icon: <IconPill size="1rem" />, href: '/opd/prescriptions' },
    ],
  },
  {
    label: 'IPD Management',
    icon: <IconSettings size="1.2rem" />,
    href: '/ipd',
    children: [
      { label: 'Admissions', icon: <IconSettings size="1rem" />, href: '/ipd/admissions' },
      { label: 'Bed Management', icon: <IconSettings size="1rem" />, href: '/ipd/beds' },
      { label: 'Nursing Charts', icon: <IconSettings size="1rem" />, href: '/ipd/nursing' },
    ],
  },
  {
    label: 'Laboratory',
    icon: <IconSettings size="1.2rem" />,
    href: '/laboratory',
    children: [
      { label: 'Test Orders', icon: <IconSettings size="1rem" />, href: '/laboratory/orders' },
      { label: 'Results', icon: <IconSettings size="1rem" />, href: '/laboratory/results' },
      { label: 'Quality Control', icon: <IconShieldCheck size="1rem" />, href: '/laboratory/qc' },
    ],
  },
  {
    label: 'Radiology & PACS',
    icon: <IconSettings size="1.2rem" />,
    href: '/radiology',
    children: [
      { label: 'Imaging Orders', icon: <IconSettings size="1rem" />, href: '/radiology/orders' },
      { label: 'PACS Viewer', icon: <IconSettings size="1rem" />, href: '/radiology/viewer' },
      { label: 'Reports', icon: <IconSettings size="1rem" />, href: '/radiology/reports' },
    ],
  },
  {
    label: 'Pharmacy',
    icon: <IconPill size="1.2rem" />,
    href: '/pharmacy',
    children: [
      { label: 'Inventory', icon: <IconSettings size="1rem" />, href: '/pharmacy/inventory' },
      { label: 'Dispensing', icon: <IconPill size="1rem" />, href: '/pharmacy/dispensing' },
      { label: 'Procurement', icon: <IconSettings size="1rem" />, href: '/pharmacy/procurement' },
    ],
  },
  {
    label: 'Billing & Revenue',
    icon: <IconCurrency size="1.2rem" />,
    href: '/billing',
    children: [
      { label: 'Invoicing', icon: <IconFileText size="1rem" />, href: '/billing/invoices' },
      { label: 'Payments', icon: <IconCurrency size="1rem" />, href: '/billing/payments' },
      { label: 'Insurance Claims', icon: <IconShieldX size="1rem" />, href: '/billing/insurance' },
    ],
  },
  {
    label: 'Appointments',
    icon: <IconCalendar size="1.2rem" />,
    href: '/appointments',
    children: [
      { label: 'Schedule', icon: <IconCalendar size="1rem" />, href: '/appointments/schedule' },
      { label: 'Queue Management', icon: <IconUsers size="1rem" />, href: '/appointments/queue' },
      { label: 'Walk-ins', icon: <IconUser size="1rem" />, href: '/appointments/walkins' },
    ],
  },
  {
    label: 'Telemedicine',
    icon: <IconSettings size="1.2rem" />,
    href: '/telemedicine',
    children: [
      {
        label: 'Video Consultations',
        icon: <IconSettings size="1rem" />,
        href: '/telemedicine/consultations',
      },
      {
        label: 'Remote Monitoring',
        icon: <IconSettings size="1rem" />,
        href: '/telemedicine/monitoring',
      },
    ],
  },
  {
    label: 'Emergency',
    icon: <IconAmbulance size="1.2rem" />,
    href: '/emergency',
    badge: 'LIVE',
    children: [
      { label: 'Triage', icon: <IconSettings size="1rem" />, href: '/emergency/triage' },
      { label: 'Critical Care', icon: <IconSettings size="1rem" />, href: '/emergency/critical' },
      { label: 'Bed Availability', icon: <IconSettings size="1rem" />, href: '/emergency/beds' },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: <IconChartBar size="1.2rem" />,
    href: '/reports',
    children: [
      {
        label: 'Financial Reports',
        icon: <IconCurrency size="1rem" />,
        href: '/reports/financial',
      },
      {
        label: 'Clinical Reports',
        icon: <IconStethoscope size="1rem" />,
        href: '/reports/clinical',
      },
      {
        label: 'Operational KPIs',
        icon: <IconChartBar size="1rem" />,
        href: '/reports/operational',
      },
    ],
  },
  {
    label: 'Communications',
    icon: <IconMessage size="1.2rem" />,
    href: '/communications',
    children: [
      {
        label: 'SMS/WhatsApp',
        icon: <IconMessage size="1rem" />,
        href: '/communications/messaging',
      },
      {
        label: 'Notifications',
        icon: <IconBell size="1rem" />,
        href: '/communications/notifications',
      },
      { label: 'Campaigns', icon: <IconMessage size="1rem" />, href: '/communications/campaigns' },
    ],
  },
  {
    label: 'AI Assistant',
    icon: <IconSettings size="1.2rem" />,
    href: '/ai-assistant',
    badge: 'BETA',
    children: [
      {
        label: 'Clinical Decision Support',
        icon: <IconSettings size="1rem" />,
        href: '/ai-assistant/clinical',
      },
      {
        label: 'Predictive Analytics',
        icon: <IconSettings size="1rem" />,
        href: '/ai-assistant/analytics',
      },
    ],
  },
  {
    label: 'Administration',
    icon: <IconSettings size="1.2rem" />,
    href: '/admin',
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { label: 'Tenant Management', icon: <IconSettings size="1rem" />, href: '/admin/tenants' },
      { label: 'User Management', icon: <IconUsers size="1rem" />, href: '/admin/users' },
      { label: 'System Settings', icon: <IconSettings size="1rem" />, href: '/admin/settings' },
      { label: 'Audit Logs', icon: <IconFileText size="1rem" />, href: '/admin/audit' },
    ],
  },
];

export default function Layout({ children, user, notifications = 0, onLogout }: LayoutProps) {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const [activeItem, setActiveItem] = useState<string>('');

  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const NavItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const isActive = activeItem === item.href;

    return (
      <Box key={item.href}>
        <UnstyledButton
          onClick={() => {
            setActiveItem(item.href);
            if (opened) toggle(); // Close mobile menu on navigation
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '10px 12px',
            paddingLeft: 12 + level * 16,
            borderRadius: 6,
            color: isActive ? '#1976d2' : '#333',
            backgroundColor: isActive ? '#e3f2fd' : 'transparent',
            textDecoration: 'none',
            fontSize: 'clamp(0.875rem, 1vw, 1rem)',
            marginBottom: 4,
            minHeight: '44px',
          }}
        >
          <Group gap="sm" style={{ width: '100%' }}>
            {item.icon}
            <Text size="sm" fw={isActive ? 600 : 400}>
              {item.label}
            </Text>
            {item.badge && (
              <Badge size="xs" variant="filled" color="red">
                {item.badge}
              </Badge>
            )}
          </Group>
        </UnstyledButton>

        {item.children && (
          <Box ml="md" mt="xs">
            {item.children.map((child) => (
              <NavItem key={child.href} item={child} level={level + 1} />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      header={{ height: { base: 56, sm: 60, md: 64 } }}
      padding={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: 'xs', sm: 'sm', md: 'md' }} justify="space-between">
          <Group gap="sm">
            <Burger hiddenFrom="md" opened={opened} onClick={toggle} size="sm" />

            <Group gap="sm">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                HMS
              </Box>
              <Text fw={600} size="md" visibleFrom="sm">
                Hospital Management System
              </Text>
              <Text fw={600} size="sm" hiddenFrom="sm">
                HMS
              </Text>
            </Group>
          </Group>

          <Group gap="sm">
            <Indicator
              inline
              label={notifications > 0 ? notifications : null}
              size={16}
              disabled={notifications === 0}
            >
              <ActionIcon variant="subtle" size="lg">
                <IconBell size="1.2rem" />
              </ActionIcon>
            </Indicator>

            {user && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="sm">
                      <Avatar src={user.avatar} alt={user.name} radius="xl" size="sm" />
                      <Box style={{ flex: 1 }} visibleFrom="sm">
                        <Text size="sm" fw={500}>
                          {user.name}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {user.role.replace('_', ' ').toLowerCase()}
                        </Text>
                      </Box>
                      <Box visibleFrom="sm"><IconX size="0.9rem" /></Box>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconUser size="0.9rem" />}
                    onClick={() => {
                      console.log('Profile clicked - navigating to /profile');
                      setActiveItem('/profile');
                      router.push('/profile');
                    }}
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconSettings size="0.9rem" />}
                    onClick={() => {
                      console.log('Settings clicked - navigating to /settings');
                      setActiveItem('/settings');
                      router.push('/settings');
                    }}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" icon={<IconX size="0.9rem" />} onClick={onLogout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={{ base: 'xs', sm: 'sm', md: 'md' }}>
        <ScrollArea style={{ height: 'calc(100vh - 120px)', maxWidth: '100%' }}>
          <Stack gap="xs">
            {filteredNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        <Container fluid style={{ maxWidth: '100%', padding: 0 }}>{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
