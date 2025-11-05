'use client';

import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

/**
 * ResponsiveGrid - Responsive grid layout with customizable breakpoints
 * Usage: <ResponsiveGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>...</ResponsiveGrid>
 */
export default function ResponsiveGrid({
  children,
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = 'gap-4',
  className = '',
}: ResponsiveGridProps) {
  const gridCols = `
    grid-cols-${cols.base || 1}
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
}
