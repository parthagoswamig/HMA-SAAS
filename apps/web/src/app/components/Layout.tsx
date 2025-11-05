'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser] = useState({
    name: 'Dr. John Smith',
    role: 'DOCTOR',
    email: 'john.smith@hospital.com',
    avatar: '/avatar-placeholder.jpg',
  });

  const menuItems = [
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
      title: 'Lab Tests',
      href: '/lab-tests',
      icon: '🧪',
      roles: ['ADMIN', 'DOCTOR', 'LAB_TECHNICIAN'],
    },
    {
      title: 'Radiology & Imaging',
      href: '/radiology',
      icon: '🩻',
      roles: ['ADMIN', 'DOCTOR', 'RADIOLOGIST'],
    },
    {
      title: 'Prescriptions & Pharmacy',
      href: '/prescriptions',
      icon: '💊',
      roles: ['ADMIN', 'DOCTOR', 'PHARMACIST'],
    },
    {
      title: 'Telemedicine',
      href: '/telemedicine',
      icon: '🎥',
      roles: ['ADMIN', 'DOCTOR'],
    },
    {
      title: 'Notifications',
      href: '/notifications',
      icon: '🔔',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    },
    {
      title: 'Inventory',
      href: '/inventory',
      icon: '📦',
      roles: ['ADMIN', 'INVENTORY_MANAGER', 'PHARMACIST'],
    },
    {
      title: 'Emergency Management',
      href: '/emergency',
      icon: '🚨',
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'SECURITY'],
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
      title: 'Settings',
      href: '/settings',
      icon: '⚙️',
      roles: ['ADMIN', 'HOSPITAL_ADMIN'],
    },
    {
      title: 'Users',
      href: '/users',
      icon: '👥',
      roles: ['ADMIN', 'HOSPITAL_ADMIN'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(currentUser.role));

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 h-screen z-[1000]
          bg-gradient-to-b from-indigo-600 to-purple-600
          text-white overflow-y-auto
          transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? 'w-64 translate-x-0'
              : 'w-0 lg:w-20 -translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-white border-opacity-10 text-center">
          <Link
            href="/dashboard"
            className="text-white no-underline font-bold text-lg sm:text-xl lg:text-2xl"
          >
            {sidebarOpen ? 'HMS SAAS' : 'HMS'}
          </Link>
        </div>

        {/* Toggle Button - Desktop only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            hidden lg:flex
            absolute -right-3 top-24
            bg-white text-indigo-600
            border-none rounded-full
            w-6 h-6 cursor-pointer
            items-center justify-center
            text-xs shadow-md z-[1001]
            hover:bg-gray-100 transition-colors
          "
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Navigation */}
        <nav className="py-2 sm:py-4">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`
                flex items-center px-4 sm:px-6 py-3
                no-underline transition-all duration-200
                hover:bg-white hover:bg-opacity-10
                ${
                  isActive(item.href)
                    ? 'text-white bg-white bg-opacity-10 border-r-4 border-white'
                    : 'text-white text-opacity-80 border-r-4 border-transparent'
                }
              `}
            >
              <span className={`text-lg sm:text-xl ${sidebarOpen ? 'mr-3' : 'mr-0'}`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span className="text-sm sm:text-base font-medium">{item.title}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="absolute bottom-0 w-full p-3 sm:p-4 border-t border-white border-opacity-10 bg-black bg-opacity-10">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-2 sm:mr-3 text-base sm:text-lg">
                👨‍⚕️
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-semibold truncate">{currentUser.name}</div>
                <div className="text-xs opacity-80 truncate">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-20 transition-all duration-300">
        {/* Header */}
        <header className="bg-white px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 m-0 truncate">
                <span className="hidden sm:inline">Hospital Management System</span>
                <span className="sm:hidden">HMS</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Link
                href="/notifications"
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors no-underline flex items-center justify-center relative"
              >
                <span className="text-lg sm:text-xl">🔔</span>
                {/* Unread notification badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 text-xs font-semibold flex items-center justify-center min-w-[1rem] sm:min-w-[1.25rem] border-2 border-white">
                  3
                </span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 sm:gap-2 text-gray-800 no-underline"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm sm:text-base">
                  👨‍⚕️
                </div>
                <span className="hidden md:inline text-xs sm:text-sm font-medium truncate max-w-[100px] lg:max-w-none">{currentUser.name}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
