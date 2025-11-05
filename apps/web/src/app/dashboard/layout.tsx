'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  AppShell,
  AppShellNavbar,
  AppShellHeader,
  Group,
  Text,
  Button,
  UnstyledButton,
  Tooltip,
  Avatar,
  Menu,
  ActionIcon,
  NavLink,
  ScrollArea,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendarEvent,
  IconStethoscope,
  IconBuildingHospital,
  IconAmbulance,
  IconFlask,
  IconMicroscope,
  IconPills,
  IconVaccine,
  IconScissors,
  IconShield,
  IconCalculator,
  IconCash,
  IconShieldCheck,
  IconUser,
  IconHeart,
  IconPackage,
  IconDeviceComputerCamera,
  IconKey,
  IconMessage,
  IconChartBar,
  IconSearch,
  IconPlug,
  IconRobot,
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconBell,
  IconUserCircle,
} from '@tabler/icons-react';
import { UserRole } from '@/lib/rbac';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpened, setMobileOpened] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading spinner while checking auth
  if (!user) {
    return <LoadingSpinner fullScreen message="Loading Dashboard..." />;
  }

  // Define all modules with role-based access control
  const allModules: {
    title: string;
    href: string;
    icon: any;
    active: boolean;
    color: string;
    requiredRoles: UserRole[];
  }[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: IconLayoutDashboard,
      active: true,
      color: '#3b82f6',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RESIDENT',
        'NURSE',
        'LAB_TECHNICIAN',
        'RADIOLOGIST',
        'PHARMACIST',
        'RECEPTIONIST',
        'ACCOUNTANT',
        'HR_MANAGER',
        'INVENTORY_MANAGER',
        'PATIENT',
      ],
    },
    {
      title: 'Patient Management',
      href: '/dashboard/patients',
      icon: IconUsers,
      active: true,
      color: '#3b82f6',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RESIDENT',
        'NURSE',
        'RECEPTIONIST',
      ],
    },
    {
      title: 'Appointments',
      href: '/dashboard/appointments',
      icon: IconCalendarEvent,
      active: true,
      color: '#10b981',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RESIDENT',
        'NURSE',
        'RECEPTIONIST',
        'PATIENT',
      ],
    },
    {
      title: 'OPD Management',
      href: '/dashboard/opd',
      icon: IconStethoscope,
      active: true,
      color: '#8b5cf6',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RESIDENT',
        'NURSE',
        'RECEPTIONIST',
      ],
    },
    {
      title: 'IPD Management',
      href: '/dashboard/ipd',
      icon: IconBuildingHospital,
      active: true,
      color: '#ef4444',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'NURSE',
      ],
    },
    {
      title: 'Emergency',
      href: '/dashboard/emergency',
      icon: IconAmbulance,
      active: true,
      color: '#dc2626',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'NURSE',
      ],
    },
    {
      title: 'Laboratory',
      href: '/dashboard/laboratory',
      icon: IconFlask,
      active: true,
      color: '#06b6d4',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RESIDENT',
        'LAB_TECHNICIAN',
        'NURSE',
      ],
    },
    {
      title: 'Radiology',
      href: '/dashboard/radiology',
      icon: IconMicroscope,
      active: true,
      color: '#0891b2',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RADIOLOGIST',
      ],
    },
    {
      title: 'Pathology',
      href: '/dashboard/pathology',
      icon: IconVaccine,
      active: true,
      color: '#0e7490',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'LAB_TECHNICIAN',
      ],
    },
    {
      title: 'Pharmacy',
      href: '/dashboard/pharmacy',
      icon: IconPills,
      active: true,
      color: '#84cc16',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'PHARMACIST',
        'DOCTOR',
        'SPECIALIST',
      ],
    },
    {
      title: 'Surgery',
      href: '/dashboard/surgery',
      icon: IconScissors,
      active: true,
      color: '#be123c',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'NURSE',
      ],
    },
    {
      title: 'Billing & Invoices',
      href: '/dashboard/billing',
      icon: IconCalculator,
      active: true,
      color: '#f59e0b',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'ACCOUNTANT',
        'RECEPTIONIST',
      ],
    },
    {
      title: 'Finance',
      href: '/dashboard/finance',
      icon: IconCash,
      active: true,
      color: '#d97706',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'ACCOUNTANT'],
    },
    {
      title: 'Insurance',
      href: '/dashboard/insurance',
      icon: IconShieldCheck,
      active: true,
      color: '#0284c7',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'ACCOUNTANT',
        'INSURANCE_PROVIDER',
      ],
    },
    {
      title: 'Staff Management',
      href: '/dashboard/staff',
      icon: IconUser,
      active: true,
      color: '#ec4899',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'HR_MANAGER'],
    },
    {
      title: 'HR Management',
      href: '/dashboard/hr',
      icon: IconHeart,
      active: true,
      color: '#db2777',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'HR_MANAGER'],
    },
    {
      title: 'EMR',
      href: '/dashboard/emr',
      icon: IconHeart,
      active: true,
      color: '#7c3aed',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'RESIDENT',
        'NURSE',
      ],
    },
    {
      title: 'Inventory',
      href: '/dashboard/inventory',
      icon: IconPackage,
      active: true,
      color: '#2563eb',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'INVENTORY_MANAGER',
        'PHARMACIST',
      ],
    },
    {
      title: 'Telemedicine',
      href: '/dashboard/telemedicine',
      icon: IconDeviceComputerCamera,
      active: true,
      color: '#059669',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'PATIENT',
      ],
    },
    {
      title: 'Patient Portal',
      href: '/dashboard/patient-portal',
      icon: IconKey,
      active: true,
      color: '#0d9488',
      requiredRoles: ['PATIENT'],
    },
    {
      title: 'Communications',
      href: '/dashboard/communications',
      icon: IconMessage,
      active: true,
      color: '#8b5cf6',
      requiredRoles: [
        'SUPER_ADMIN',
        'TENANT_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'SPECIALIST',
        'NURSE',
        'RECEPTIONIST',
      ],
    },
    {
      title: 'Reports & Analytics',
      href: '/dashboard/reports',
      icon: IconChartBar,
      active: true,
      color: '#6366f1',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'ACCOUNTANT', 'DOCTOR'],
    },
    {
      title: 'Quality Management',
      href: '/dashboard/quality',
      icon: IconShield,
      active: true,
      color: '#10b981',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN'],
    },
    {
      title: 'Research',
      href: '/dashboard/research',
      icon: IconSearch,
      active: true,
      color: '#6366f1',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'SPECIALIST'],
    },
    {
      title: 'Integration',
      href: '/dashboard/integration',
      icon: IconPlug,
      active: true,
      color: '#64748b',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
    },
    {
      title: 'AI Assistant',
      href: '/dashboard/ai-assistant',
      icon: IconRobot,
      active: true,
      color: '#8b5cf6',
      requiredRoles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'SPECIALIST'],
    },
    {
      title: 'My Health Records',
      href: '/dashboard/my-records',
      icon: IconHeart,
      active: true,
      color: '#4caf50',
      requiredRoles: ['PATIENT'],
    },
    {
      title: 'My Appointments',
      href: '/dashboard/my-appointments',
      icon: IconCalendarEvent,
      active: true,
      color: '#2196f3',
      requiredRoles: ['PATIENT'],
    },
    {
      title: 'My Bills',
      href: '/dashboard/my-bills',
      icon: IconCash,
      active: true,
      color: '#ff9800',
      requiredRoles: ['PATIENT'],
    },
  ];

  // Filter modules based on user role
  const modules = user?.role
    ? allModules.filter(
        (module) =>
          module.requiredRoles.includes(user.role as UserRole) || user.role === 'SUPER_ADMIN'
      )
    : [];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <AppShell
      navbar={{
        width: sidebarCollapsed ? 80 : 280,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened },
      }}
      header={{
        height: { base: 60, sm: 65, md: 70 },
      }}
      padding={{ base: 'xs', sm: 'sm', md: 'md' }}
    >
      <AppShellNavbar
        p="md"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          backgroundAttachment: 'fixed',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <ScrollArea h="100%">
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                textAlign: sidebarCollapsed ? 'center' : 'left',
                marginBottom: '2rem',
                padding: sidebarCollapsed ? '0.5rem' : '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Text
                size="md"
                fw={700}
                c="white"
                style={{
                  fontSize: sidebarCollapsed ? '1.2rem' : '1.3rem',
                  marginBottom: sidebarCollapsed ? '0' : '0.5rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {sidebarCollapsed ? '🏥' : '🏥 HMS SAAS'}
              </Text>
              {!sidebarCollapsed && (
                <Text size="sm" c="rgba(255,255,255,0.9)">
                  Hospital Management System
                </Text>
              )}
            </div>

            {modules.map((module) => {
              const Icon = module.icon;
              const active = isActive(module.href);

              return (
                <Tooltip
                  key={module.href}
                  label={module.title}
                  position="right"
                  disabled={!sidebarCollapsed}
                >
                  <div
                    style={{
                      marginBottom: '0.25rem',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <NavLink
                      component="a"
                      href={module.active ? module.href : '#'}
                      label={!sidebarCollapsed ? module.title : ''}
                      aria-label={module.title}
                      aria-current={active ? 'page' : undefined}
                      leftSection={
                        <div
                          style={{
                            background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            border: active
                              ? '1px solid rgba(255,255,255,0.3)'
                              : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <Icon size={16} color={active ? 'white' : 'rgba(255,255,255,0.9)'} />
                        </div>
                      }
                      active={active}
                      style={{
                        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        marginBottom: '2px',
                        color: active ? 'white' : 'rgba(255,255,255,0.9)',
                        pointerEvents: module.active ? 'auto' : 'none',
                        opacity: module.active ? 1 : 0.6,
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        transition: 'all 0.3s ease',
                        border: active
                          ? '1px solid rgba(255,255,255,0.2)'
                          : '1px solid transparent',
                        backdropFilter: active ? 'blur(10px)' : 'none',
                        boxShadow: active ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
                      }}
                      onClick={(e) => {
                        if (!module.active) {
                          e.preventDefault();
                        } else {
                          // Close mobile menu on navigation
                          if (mobileOpened) {
                            setMobileOpened(false);
                          }
                        }
                      }}
                    />
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </ScrollArea>

        <div
          style={{
            marginTop: 'auto',
            padding: '1rem 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Menu shadow="lg" width={220} position="right-end">
            <Menu.Target>
              <UnstyledButton
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Avatar
                    size="md"
                    color="blue"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '2px solid white',
                    }}
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                </div>
                {!sidebarCollapsed && (
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <Text size="sm" fw={600} c="white">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text size="xs" c="rgba(255,255,255,0.7)">
                      {user.role}
                    </Text>
                  </div>
                )}
                {!sidebarCollapsed && <IconChevronDown size={16} color="rgba(255,255,255,0.8)" />}
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              <Menu.Item
                leftSection={<IconUserCircle size={16} color="#667eea" />}
                onClick={() => router.push('/profile')}
                style={{
                  borderRadius: '8px',
                  marginBottom: '0.25rem',
                }}
              >
                <div>
                  <Text size="sm" fw={500}>
                    Profile
                  </Text>
                  <Text size="xs" c="dimmed">
                    View your profile
                  </Text>
                </div>
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={16} color="#667eea" />}
                onClick={() => router.push('/settings')}
                style={{
                  borderRadius: '8px',
                  marginBottom: '0.25rem',
                }}
              >
                <div>
                  <Text size="sm" fw={500}>
                    Settings
                  </Text>
                  <Text size="xs" c="dimmed">
                    App preferences
                  </Text>
                </div>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} color="#ef4444" />}
                onClick={handleLogout}
                color="red"
                style={{
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <div>
                  <Text size="sm" fw={500}>
                    Logout
                  </Text>
                  <Text size="xs" c="dimmed">
                    Sign out of your account
                  </Text>
                </div>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </AppShellNavbar>

      <AppShellHeader
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          backgroundAttachment: 'fixed',
        }}
      >
        <Group justify="space-between" h="100%" px={{ base: 'xs', sm: 'sm', md: 'md' }}>
          <Group gap="sm">
            {/* Mobile burger - shows on mobile/tablet */}
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setMobileOpened(!mobileOpened)}
              hiddenFrom="md"
              style={{
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: mobileOpened ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              ☰
            </Button>
            {/* Desktop collapse button - shows on desktop only */}
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              visibleFrom="md"
              style={{
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: sidebarCollapsed ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              ☰
            </Button>
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <Text size="md" fw={600}>
                {modules.find((m) => isActive(m.href))?.title || 'Dashboard'}
              </Text>
            </div>
          </Group>

          <Group>
            <ActionIcon
              variant="light"
              size="md"
              style={{
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <IconBell size={18} color="white" />
            </ActionIcon>
            <Button
              variant="light"
              onClick={() => router.push('/dashboard')}
              style={{
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              Back to Dashboard
            </Button>
          </Group>
        </Group>
      </AppShellHeader>

      <AppShell.Main
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          minHeight: '100vh',
          position: 'relative',
          backgroundAttachment: 'fixed',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            borderRadius: '0 0 8px 8px',
          }}
        />
        <div
          style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            minHeight: 'calc(100vh - 70px)',
            borderRadius: '16px 16px 0 0',
            margin: '1rem',
            marginTop: '0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
