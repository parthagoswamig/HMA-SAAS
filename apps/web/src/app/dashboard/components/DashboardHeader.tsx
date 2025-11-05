'use client';

import { useRouter } from 'next/navigation';
import { Group, Button, Text, Breadcrumbs, Anchor } from '@mantine/core';
import { IconLayoutDashboard, IconChevronRight } from '@tabler/icons-react';

interface DashboardHeaderProps {
  title?: string;
  items?: { title: string; href?: string }[];
  showBackButton?: boolean;
}

export function DashboardHeader({
  title = 'Dashboard',
  items = [],
  showBackButton = true,
}: DashboardHeaderProps) {
  const router = useRouter();

  const breadcrumbItems = [{ title: 'Dashboard', href: '/dashboard' }, ...items].filter(Boolean);

  return (
    <div className="mb-6">
      <Group justify="space-between" mb="md">
        <div>
          <Text fw={700} size="xl">
            {title}
          </Text>
          <Breadcrumbs separator={<IconChevronRight size={16} />} mt={4}>
            {breadcrumbItems.map((item, index) => (
              <Anchor
                key={index}
                href={item.href}
                underline="never"
                c={index === breadcrumbItems.length - 1 ? 'blue' : 'dimmed'}
                fw={index === breadcrumbItems.length - 1 ? 500 : 400}
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
        </div>

        {showBackButton && (
          <Button
            variant="light"
            leftSection={<IconLayoutDashboard size={16} />}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        )}
      </Group>
    </div>
  );
}
