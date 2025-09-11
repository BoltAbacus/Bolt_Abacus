import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';

interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

interface FieldValidation<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

interface FormValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  validationRules?: Partial<Record<keyof T, ValidationRule<any>>>;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

/**
 * Enhanced form validation hook with Zod schema support
 */
export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) {
  const {
    initialValues,
    validationSchema,
    validationRules = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options;

  const [state, setState] = useState<FormValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isValid: true,
    isSubmitting: false,
    isDirty: false,
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  // Validate a single field
  const validateField = useCallback((fieldName: keyof T, value: any): string | null => {
    // Zod schema validation
    if (validationSchema) {
      try {
        const fieldSchema = validationSchema.shape[fieldName as string];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || 'Invalid value';
        }
      }
    }

    // Custom validation rules
    const rule = validationRules[fieldName];
    if (rule) {
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return rule.message || `${String(fieldName)} is required`;
      }

      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          return rule.message || `${String(fieldName)} must be at least ${rule.minLength} characters`;
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          return rule.message || `${String(fieldName)} must be no more than ${rule.maxLength} characters`;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          return rule.message || `${String(fieldName)} format is invalid`;
        }
      }

      if (rule.custom) {
        return rule.custom(value);
      }
    }

    return null;
  }, [validationSchema, validationRules]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const fieldName in state.values) {
      const error = validateField(fieldName, state.values[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    }

    setState(prev => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [state.values, validateField]);

  // Set field value
  const setValue = useCallback((fieldName: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [fieldName]: value };
      const newDirty = { ...prev.dirty, [fieldName]: true };
      const isDirty = Object.values(newDirty).some(Boolean);

      let newErrors = { ...prev.errors };
      if (validateOnChange) {
        const error = validateField(fieldName, value);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
      }

      return {
        ...prev,
        values: newValues,
        dirty: newDirty,
        isDirty,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateField, validateOnChange]);

  // Set field touched
  const setTouched = useCallback((fieldName: keyof T, touched = true) => {
    setState(prev => {
      const newTouched = { ...prev.touched, [fieldName]: touched };
      
      let newErrors = { ...prev.errors };
      if (validateOnBlur && touched) {
        const error = validateField(fieldName, prev.values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
      }

      return {
        ...prev,
        touched: newTouched,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateField, validateOnBlur]);

  // Reset form
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      dirty: {},
      isValid: true,
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialValues]);

  // Submit form
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!onSubmit) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    // Mark all fields as touched
    const allTouched = Object.keys(state.values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);

    setState(prev => ({ ...prev, touched: allTouched }));

    // Validate form
    if (validateOnSubmit && !validateForm()) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      return;
    }

    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [onSubmit, state.values, validateOnSubmit, validateForm]);

  // Get field props for input components
  const getFieldProps = useCallback((fieldName: keyof T) => {
    return {
      value: state.values[fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValue(fieldName, e.target.value);
      },
      onBlur: () => {
        setTouched(fieldName, true);
      },
      error: state.errors[fieldName] || null,
      touched: state.touched[fieldName] || false,
      dirty: state.dirty[fieldName] || false,
    };
  }, [state, setValue, setTouched]);

  // Set form ref
  const setFormRef = useCallback((ref: HTMLFormElement | null) => {
    formRef.current = ref;
  }, []);

  return {
    ...state,
    setValue,
    setTouched,
    validateField,
    validateForm,
    reset,
    handleSubmit,
    getFieldProps,
    setFormRef,
  };
}

export default useFormValidation;
