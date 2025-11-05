import React from 'react';
import { TextInput, NumberInput } from '@mantine/core';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  min?: number;
  max?: number;
  step?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required,
  disabled,
  style,
  min,
  max,
  step,
  ...props
}) => {
  // For number inputs, use NumberInput component
  if (type === 'number') {
    return (
      <NumberInput
        label={label}
        placeholder={placeholder}
        value={value as number}
        onChange={(val) => {
          if (onChange) {
            const syntheticEvent = {
              target: { value: val?.toString() || '' }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
        }}
        required={required}
        disabled={disabled}
        style={style}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }

  // For other input types, use TextInput
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value as string}
      onChange={onChange}
      type={type}
      required={required}
      disabled={disabled}
      style={style}
      {...props}
    />
  );
};

export default Input;
