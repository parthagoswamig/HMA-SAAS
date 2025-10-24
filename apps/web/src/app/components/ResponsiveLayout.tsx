'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import type React from 'react';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  title: string;
  href: string;
  icon: string;
  roles: string[];
  badge?: string;
}

const ResponsiveLayout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New appointment scheduled', time: '5 min ago', type: 'info' },
    { id: 2, title: 'Lab results available', time: '10 min ago', type: 'success' },
    { id: 3, title: 'Emergency alert: Bed 205', time: '15 min ago', type: 'urgent' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [currentUser] = useState({
    name: 'Dr. Sarah Johnson',
    role: 'DOCTOR',
    email: 'sarah.johnson@hospital.com',
    avatar: '👩‍⚕️',
    initials: 'SJ',
  });

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    },
    {
      title: 'Patients',
      href: '/patients',
      icon: '👥',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    },
    {
      title: 'Appointments',
      href: '/appointments',
      icon: '📅',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    },
    {
      title: 'Medical Records',
      href: '/medical-records',
      icon: '📋',
      roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    },
    {
      title: 'Prescriptions',
      href: '/prescriptions',
      icon: '💊',
      roles: ['ADMIN', 'DOCTOR', 'PHARMACIST'],
    },
    {
      title: 'Lab Tests',
      href: '/lab-tests',
      icon: '🧪',
      roles: ['ADMIN', 'DOCTOR', 'LAB_TECHNICIAN'],
    },
    {
      title: 'Radiology',
      href: '/radiology',
      icon: '🩻',
      roles: ['ADMIN', 'DOCTOR', 'RADIOLOGIST'],
    },
    {
      title: 'Telemedicine',
      href: '/telemedicine',
      icon: '💻',
      roles: ['ADMIN', 'DOCTOR'],
      badge: 'New',
    },
    {
      title: 'Billing',
      href: '/billing',
      icon: '💰',
      roles: ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'],
    },
    {
      title: 'Staff',
      href: '/staff',
      icon: '👨‍⚕️',
      roles: ['ADMIN', 'HOSPITAL_ADMIN'],
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: '📈',
      roles: ['ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'],
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: '⚙️',
      roles: ['ADMIN', 'HOSPITAL_ADMIN'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentUser.role));

  const isActive = (href: string) => pathname.startsWith(href);

  // Handle responsive design
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('mobile-menu-button');

        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      const notificationMenu = document.getElementById('notification-menu');

      if (userMenu && !userMenu.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }

      if (notificationMenu && !notificationMenu.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sidebarWidth = isMobile ? '100%' : sidebarOpen ? '280px' : '80px';
  const mainMarginLeft = isMobile ? '0' : sidebarOpen ? '280px' : '80px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        style={{
          width: sidebarWidth,
          maxWidth: isMobile ? '320px' : 'none',
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: isMobile ? 'fixed' : 'fixed',
          height: '100vh',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: isMobile ? '2px 0 10px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: sidebarOpen && !isMobile ? '1.5rem' : '1rem',
              fontWeight: 'bold',
            }}
          >
            {sidebarOpen && !isMobile ? 'HMS SAAS' : 'HMS'}
          </Link>
        </div>

        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              right: '-12px',
              top: '100px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1001,
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        )}

        {/* Navigation */}
        <nav style={{ padding: '1rem 0' }}>
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen || isMobile ? 'flex-start' : 'center',
                padding: '0.875rem 1.5rem',
                color: isActive(item.href) ? 'white' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                background: isActive(item.href) ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRight: isActive(item.href) ? '4px solid white' : 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: '1.2rem',
                  marginRight: sidebarOpen || isMobile ? '0.75rem' : '0',
                }}
              >
                {item.icon}
              </span>

              {(sidebarOpen || isMobile) && (
                <>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#ef4444',
                        borderRadius: '12px',
                        marginLeft: '0.5rem',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        {(sidebarOpen || isMobile) && (
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              width: '100%',
              padding: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.1)',
            }}
          >
            <Link
              href="/profile"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem',
                  fontSize: '1.2rem',
                }}
              >
                {currentUser.avatar}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: mainMarginLeft,
          transition: 'margin-left 0.3s ease',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: `calc(100% - ${mainMarginLeft})`,
        }}
      >
        {/* Header */}
        <header
          style={{
            background: 'white',
            padding: isMobile ? '1rem' : '1rem 2rem',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  id="mobile-menu-button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    marginRight: '1rem',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#667eea',
                  }}
                >
                  ☰
                </button>
              )}

              <div>
                <h1
                  style={{
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0,
                  }}
                >
                  {isMobile ? 'HMS' : 'Hospital Management System'}
                </h1>
              </div>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}
            >
              {/* Search (Desktop only) */}
              {!isMobile && (
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    style={{
                      padding: '0.5rem 0.75rem 0.5rem 2rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      width: '200px',
                      outline: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    🔍
                  </span>
                </div>
              )}

              {/* Notifications */}
              <div style={{ position: 'relative' }} id="notification-menu">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    position: 'relative',
                  }}
                >
                  🔔
                  {notifications.length > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '0.75rem',
                        height: '0.75rem',
                        fontSize: '0.625rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: isMobile ? '280px' : '320px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    <div
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e2e8f0',
                        fontWeight: '600',
                        color: '#1f2937',
                      }}
                    >
                      Notifications
                    </div>

                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #f3f4f6',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) =>
                          (e.currentTarget.style.background = '#f8fafc')
                        }
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) =>
                          (e.currentTarget.style.background = 'white')
                        }
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor:
                              notification.type === 'urgent'
                                ? '#ef4444'
                                : notification.type === 'success'
                                  ? '#10b981'
                                  : '#3b82f6',
                            marginTop: '0.25rem',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              color: '#1f2937',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {notification.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                      }}
                    >
                      <Link
                        href="/notifications"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        }}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div style={{ position: 'relative' }} id="user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.9rem',
                    }}
                  >
                    {currentUser.avatar}
                  </div>
                  {!isMobile && (
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1f2937' }}>
                      {currentUser.name}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '200px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1f2937' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {currentUser.email}
                      </div>
                    </div>

                    <div style={{ padding: '0.5rem 0' }}>
                      <Link
                        href="/profile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 1rem',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          (e.currentTarget.style.background = '#f8fafc')
                        }
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          (e.currentTarget.style.background = 'white')
                        }
                      >
                        👤 Profile Settings
                      </Link>

                      <Link
                        href="/help"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 1rem',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          (e.currentTarget.style.background = '#f8fafc')
                        }
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          (e.currentTarget.style.background = 'white')
                        }
                      >
                        ❓ Help & Support
                      </Link>

                      <hr
                        style={{
                          margin: '0.5rem 0',
                          border: 'none',
                          borderTop: '1px solid #e2e8f0',
                        }}
                      />

                      <Link
                        href="/auth/login"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 1rem',
                          color: '#dc2626',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          (e.currentTarget.style.background = '#fef2f2')
                        }
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                          (e.currentTarget.style.background = 'white')
                        }
                      >
                        🚪 Sign Out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '1rem' : '2rem',
            overflow: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
