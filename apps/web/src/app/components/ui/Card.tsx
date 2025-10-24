import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  style = {},
  variant = 'default',
  padding = 'md',
  onClick,
  header,
  footer,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'bordered':
        return {
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
        };
      case 'elevated':
        return {
          border: 'none',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        };
      case 'flat':
        return {
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
        };
      default:
        return {
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: '0' };
      case 'sm':
        return { padding: '1rem' };
      case 'md':
        return { padding: '1.5rem' };
      case 'lg':
        return { padding: '2rem' };
      default:
        return { padding: '1.5rem' };
    }
  };

  const cardStyles = {
    backgroundColor: variant === 'flat' ? 'transparent' : 'white',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...getVariantStyles(),
    ...getPaddingStyles(),
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = cardStyles.boxShadow || '';
        }
      }}
    >
      {/* Header */}
      {(title || subtitle || header) && (
        <div
          style={{
            marginBottom: title || subtitle ? '1rem' : '0',
            paddingBottom: title || subtitle ? '1rem' : '0',
            borderBottom: title || subtitle ? '1px solid #f1f5f9' : 'none',
          }}
        >
          {header}
          {title && (
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              style={{
                margin: '0',
                fontSize: '0.875rem',
                color: '#6b7280',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
