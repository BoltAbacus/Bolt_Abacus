import React, { forwardRef } from 'react';
import { useFormValidation } from '@hooks/useFormValidation';
import AccessibleInput from '../AccessibleInput';
import AccessibleButton from '../AccessibleButton';

interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
    message?: string;
  };
}

interface AccessibleFormProps {
  fields: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  submitText?: string;
  loadingText?: string;
  className?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showSubmitButton?: boolean;
  submitButtonProps?: React.ComponentProps<typeof AccessibleButton>;
}

const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  (
    {
      fields,
      initialValues,
      onSubmit,
      submitText = 'Submit',
      loadingText = 'Submitting...',
      className = '',
      validateOnChange = true,
      validateOnBlur = true,
      showSubmitButton = true,
      submitButtonProps = {},
    },
    ref
  ) => {
    const {
      values,
      errors,
      touched,
      isValid,
      isSubmitting,
      getFieldProps,
      handleSubmit,
      setFormRef,
    } = useFormValidation({
      initialValues,
      onSubmit,
      validateOnChange,
      validateOnBlur,
    });

    // Combine refs
    React.useImperativeHandle(ref, () => setFormRef as any);

    const renderField = (field: FormField) => {
      const fieldProps = getFieldProps(field.name as keyof typeof values);

      if (field.type === 'textarea') {
        return (
          <div key={field.name} className="space-y-1">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              value={fieldProps.value}
              onChange={fieldProps.onChange}
              onBlur={fieldProps.onBlur}
              placeholder={field.placeholder}
              required={field.required}
              className={`block w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                fieldProps.error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } px-3 py-2 text-sm`}
              aria-invalid={!!fieldProps.error}
              aria-describedby={fieldProps.error ? `${field.name}-error` : undefined}
              rows={4}
            />
            {fieldProps.error && (
              <p
                id={`${field.name}-error`}
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {fieldProps.error}
              </p>
            )}
          </div>
        );
      }

      if (field.type === 'select') {
        return (
          <div key={field.name} className="space-y-1">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={fieldProps.value}
              onChange={fieldProps.onChange}
              onBlur={fieldProps.onBlur}
              required={field.required}
              className={`block w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                fieldProps.error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } px-3 py-2 text-sm`}
              aria-invalid={!!fieldProps.error}
              aria-describedby={fieldProps.error ? `${field.name}-error` : undefined}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldProps.error && (
              <p
                id={`${field.name}-error`}
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {fieldProps.error}
              </p>
            )}
          </div>
        );
      }

      return (
        <AccessibleInput
          key={field.name}
          id={field.name}
          name={field.name}
          label={field.label}
          type={field.type || 'text'}
          placeholder={field.placeholder}
          required={field.required}
          value={fieldProps.value}
          onChange={fieldProps.onChange}
          onBlur={fieldProps.onBlur}
          error={fieldProps.error}
          helperText={field.validation?.message}
        />
      );
    };

    return (
      <form
        ref={setFormRef}
        onSubmit={handleSubmit}
        className={`space-y-6 ${className}`}
        noValidate
        aria-label="Form"
      >
        {fields.map(renderField)}
        
        {showSubmitButton && (
          <div className="flex justify-end">
            <AccessibleButton
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              ariaLabel={isSubmitting ? loadingText : submitText}
              {...submitButtonProps}
            >
              {isSubmitting ? loadingText : submitText}
            </AccessibleButton>
          </div>
        )}
      </form>
    );
  }
);

AccessibleForm.displayName = 'AccessibleForm';

export default AccessibleForm;
