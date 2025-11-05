// Global type augmentations to handle dynamic properties and reduce type errors
// This file provides flexible typing for objects that may have varying structures

declare global {
  // Augment common interfaces to allow additional properties
  interface Window {
    [key: string]: any;
  }
}

// Allow any property access on these common types
declare module '@mantine/core' {
  export interface InputProps {
    [key: string]: any;
  }

  export interface MenuItemProps {
    [key: string]: any;
  }

  export interface SelectProps {
    [key: string]: any;
  }

  export interface ButtonProps {
    [key: string]: any;
  }
}

// Export empty to make this a module
export {};
