import React from 'react';
import { Stack, Text, Button, ThemeIcon, Box } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 48 : size === 'md' ? 64 : 80;
  const titleSize = size === 'sm' ? 'lg' : size === 'md' ? 'xl' : 'h2';

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: size === 'sm' ? '200px' : size === 'md' ? '300px' : '400px',
        padding: '2rem',
      }}
    >
      <Stack align="center" gap="md" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <ThemeIcon size={iconSize} radius="xl" variant="light" color="gray">
          {icon || <IconInbox size={iconSize * 0.6} />}
        </ThemeIcon>

        <Stack gap="xs" align="center">
          <Text size={titleSize} fw={600} c="dimmed">
            {title}
          </Text>

          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>

        {action && (
          <Button onClick={action.onClick} mt="sm">
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default EmptyState;
