'use client';

import { MantineProvider } from '@mantine/core';
import { QueryProvider } from '@/lib/api/queryClient';
import { RBACProvider } from '@/lib/rbac/RBACProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <QueryProvider>
        <RBACProvider>{children}</RBACProvider>
      </QueryProvider>
    </MantineProvider>
  );
}
