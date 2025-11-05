'use client';

import { Modal } from '@mantine/core';
import { ReactNode } from 'react';

interface ResponsiveModalProps {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: string | number;
  fullScreen?: boolean;
}

/**
 * ResponsiveModal - Modal that adapts to mobile viewports
 * Automatically becomes fullscreen on mobile devices
 */
export default function ResponsiveModal({
  opened,
  onClose,
  title,
  children,
  size = 'lg',
  fullScreen = false,
}: ResponsiveModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      fullScreen={fullScreen}
      classNames={{
        content: 'max-h-[90vh] overflow-y-auto',
        body: 'p-3 sm:p-4 md:p-6',
        header: 'p-3 sm:p-4 md:p-6',
        title: 'text-sm sm:text-base md:text-lg font-semibold',
      }}
      styles={{
        content: {
          maxHeight: '90vh',
        },
      }}
    >
      {children}
    </Modal>
  );
}
