import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import './globals.css';
import Providers from './providers';
import SkipToContent from '@/components/ui/SkipToContent';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: 'HMS SAAS - Hospital Management System',
  description:
    'Comprehensive Hospital Management System with 20+ modules for modern healthcare facilities',
  keywords: ['hospital', 'management', 'healthcare', 'medical', 'patient', 'EMR', 'EHR'],
  authors: [{ name: 'HMS SAAS' }],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <ColorSchemeScript />
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className={inter.className}
        style={{ margin: 0, fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <SkipToContent />
        <div id="main-content">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
