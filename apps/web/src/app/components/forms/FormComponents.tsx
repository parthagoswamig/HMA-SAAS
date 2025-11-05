'use client';
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Form validation utilities
export const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  phone: (value: string) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters long`;
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters long`;
  },

  numeric: (value: string) => {
    if (!value) return null;
    return /^\d+$/.test(value) ? null : 'Must contain only numbers';
  },

  alphanumeric: (value: string) => {
    if (!value) return null;
    return /^[a-zA-Z0-9]+$/.test(value) ? null : 'Must contain only letters and numbers';
  },

  date: (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? null : 'Please enter a valid date';
  },

  futureDate: (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today ? null : 'Date must be in the future';
  },

  pastDate: (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    return date < today ? null : 'Date must be in the past';
  },

  match: (otherValue: string, fieldName: string) => (value: string) => {
    return value === otherValue ? null : `Must match ${fieldName}`;
  },

  range: (min: number, max: number) => (value: string) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Must be a valid number';
    return num >= min && num <= max ? null : `Must be between ${min} and ${max}`;
  },
};

// Form field configuration interface
export interface FieldConfig {
  name: string;
  title: string;
  label?: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio';
  placeholder?: string;
  validators?: Array<(value: any) => string | null>;
  options?: Array<{ value: string; title: string; label?: string }>;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  icon?: string;
  helpText?: string;
}

// Dynamic form component
interface DynamicFormProps {
  title?: string;
  description?: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  layout?: 'single' | 'two-column';
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  description,
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  isLoading = false,
  layout = 'single',
}) => {
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: initialValues[field.name] || (field.type === 'checkbox' ? false : ''),
      }),
      {}
    )
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: any): string | null => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field?.validators) return null;

    for (const validator of field.validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field.name, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange =
    (fieldName: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value =
        e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

      setValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Clear error when user starts typing
      if (errors[fieldName] && touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    };

  const handleBlur = (fieldName: string) => () => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, values[fieldName]);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {});
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: FieldConfig) => {
    const fieldError = touched[field.name] ? errors[field.name] : undefined;
    const fieldValue = values[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              {field.label || field.title}{' '}
              {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <select
              value={fieldValue}
              onChange={handleInputChange(field.name)}
              onBlur={handleBlur(field.name)}
              disabled={field.disabled}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${fieldError ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: field.disabled ? '#f9fafb' : 'white',
                color: '#374151',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
            >
              <option value="">Select {field.label || field.title}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label || option.title}
                </option>
              ))}
            </select>
            {fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#ef4444' }}>
                {fieldError}
              </p>
            )}
            {field.helpText && !fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                {field.helpText}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              {field.label || field.title}{' '}
              {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              value={fieldValue}
              onChange={handleInputChange(field.name)}
              onBlur={handleBlur(field.name)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              rows={field.rows || 3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${fieldError ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: field.disabled ? '#f9fafb' : 'white',
                color: '#374151',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                resize: 'vertical',
              }}
            />
            {fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#ef4444' }}>
                {fieldError}
              </p>
            )}
            {field.helpText && !fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                {field.helpText}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#374151',
              }}
            >
              <input
                type="checkbox"
                checked={fieldValue}
                onChange={handleInputChange(field.name)}
                onBlur={handleBlur(field.name)}
                disabled={field.disabled}
                style={{
                  marginRight: '0.5rem',
                  width: '1rem',
                  height: '1rem',
                }}
              />
              {field.label || field.title}{' '}
              {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#ef4444' }}>
                {fieldError}
              </p>
            )}
            {field.helpText && !fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                {field.helpText}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.name} style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              {field.label || field.title}{' '}
              {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                  }}
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={handleInputChange(field.name)}
                    onBlur={handleBlur(field.name)}
                    disabled={field.disabled}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {option.label || option.title}
                </label>
              ))}
            </div>
            {fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#ef4444' }}>
                {fieldError}
              </p>
            )}
            {field.helpText && !fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                {field.helpText}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} style={{ marginBottom: '1.5rem' }}>
            <Input
              type={field.type}
              label={field.label || field.title}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={handleInputChange(field.name)}
              onBlur={handleBlur(field.name)}
              error={fieldError}
              disabled={field.disabled}
              required={field.required}
              icon={field.icon}
            />
            {field.helpText && !fieldError && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                {field.helpText}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        {title && (
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              layout === 'two-column' ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
            gap: '1.5rem',
          }}
        >
          {fields.map(renderField)}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            justifyContent: 'flex-end',
          }}
        >
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Example usage component for Patient Registration
export const PatientRegistrationForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const patientFields: FieldConfig[] = [
    {
      name: 'firstName',
      title: 'First Name',
      type: 'text',
      placeholder: 'Enter first name',
      validators: [validators.required, validators.minLength(2)],
      required: true,
      icon: '👤',
    },
    {
      name: 'lastName',
      title: 'Last Name',
      type: 'text',
      placeholder: 'Enter last name',
      validators: [validators.required, validators.minLength(2)],
      required: true,
      icon: '👤',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'email',
      placeholder: 'Enter email address',
      validators: [validators.required, validators.email],
      required: true,
      icon: '📧',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter phone number',
      validators: [validators.required, validators.phone],
      required: true,
      icon: '📞',
    },
    {
      name: 'dateOfBirth',
      title: 'Date of Birth',
      type: 'date',
      validators: [validators.required, validators.pastDate],
      required: true,
      icon: '📅',
    },
    {
      name: 'gender',
      title: 'Gender',
      type: 'select',
      options: [
        { value: 'MALE', title: 'Male' },
        { value: 'FEMALE', title: 'Female' },
        { value: 'OTHER', title: 'Other' },
      ],
      validators: [validators.required],
      required: true,
    },
    {
      name: 'address',
      title: 'Address',
      type: 'textarea',
      placeholder: 'Enter full address',
      rows: 3,
      validators: [validators.required],
      required: true,
    },
    {
      name: 'emergencyContactName',
      title: 'Emergency Contact Name',
      type: 'text',
      placeholder: 'Enter emergency contact name',
      validators: [validators.required],
      required: true,
      icon: '🚨',
    },
    {
      name: 'emergencyContactPhone',
      title: 'Emergency Contact Phone',
      type: 'tel',
      placeholder: 'Enter emergency contact phone',
      validators: [validators.required, validators.phone],
      required: true,
      icon: '📞',
    },
    {
      name: 'insuranceNumber',
      title: 'Insurance Number',
      type: 'text',
      placeholder: 'Enter insurance number (optional)',
      validators: [validators.alphanumeric],
      helpText: 'Optional: Enter health insurance number if available',
    },
    {
      name: 'allergies',
      title: 'Known Allergies',
      type: 'textarea',
      placeholder: 'List any known allergies',
      rows: 2,
      helpText: 'Please list any known allergies or write "None"',
    },
    {
      name: 'consentToTreatment',
      title: 'I consent to medical treatment',
      type: 'checkbox',
      validators: [validators.required],
      required: true,
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Patient registered:', values);
      alert('Patient registered successfully!');
    } catch {
      alert('Failed to register patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicForm
      title="Patient Registration"
      description="Please fill in all required information to register a new patient"
      fields={patientFields}
      onSubmit={handleSubmit}
      submitLabel="Register Patient"
      isLoading={isLoading}
      layout="two-column"
    />
  );
};

export default DynamicForm;
