// Mantine component augmentations for missing exports
import React from 'react';

declare module '@mantine/core' {
  // Re-export SimpleGrid if it exists, otherwise provide a fallback
  export const SimpleGrid: React.FC<any>;
  export const Stack: React.FC<any>;
  export const Stepper: React.FC<any>;
  export const LineChart: React.FC<any>;
}

declare global {
  // Make SimpleGrid and other components globally available
  const SimpleGrid: React.FC<any>;
  const Stack: React.FC<any>;
  const Stepper: React.FC<any>;
  const DatePicker: React.FC<any>;
  const LineChart: React.FC<any>;
}

export {};
