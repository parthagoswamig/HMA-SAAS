import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style = {},
  fullWidth = false,
}) => {
  const getBaseStyles = () => ({
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    textDecoration: 'none',
    opacity: disabled ? 0.6 : 1,
    ...style,
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        };
      case 'secondary':
        return {
          background: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: '#667eea',
          border: '2px solid #667eea',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
        };
      case 'md':
        return {
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
        };
      case 'lg':
        return {
          padding: '1rem 2rem',
          fontSize: '1.125rem',
        };
      default:
        return {};
    }
  };

  const buttonStyles = {
    ...getBaseStyles(),
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={buttonStyles}
    >
      {children}
    </button>
  );
};

export default Button;
