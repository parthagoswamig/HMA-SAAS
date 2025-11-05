import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  label,
  error,
  icon,
  className = '',
  style = {},
  size = 'md',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
        };
      case 'md':
        return {
          padding: '0.75rem 1rem',
          fontSize: '1rem',
        };
      case 'lg':
        return {
          padding: '1rem 1.25rem',
          fontSize: '1.125rem',
        };
      default:
        return {};
    }
  };

  const inputStyles = {
    width: '100%',
    border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: disabled ? '#f9fafb' : 'white',
    color: disabled ? '#9ca3af' : '#374151',
    boxSizing: 'border-box' as const,
    ...getSizeStyles(),
    ...style,
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem',
              color: '#9ca3af',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={className}
          style={{
            ...inputStyles,
            paddingLeft: icon ? '3rem' : inputStyles.paddingLeft,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
            e.target.style.boxShadow = 'none';
            if (onBlur) onBlur(e);
          }}
        />
      </div>

      {error && (
        <p
          style={{
            color: '#ef4444',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            marginBottom: '0',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
