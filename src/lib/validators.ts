/**
 * Client-Side Validation Rules
 *
 * Real-time validation for form fields.
 * Provides inline error messages as users type.
 */

import { isFeatureEnabled } from './featureFlags';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  required: (fieldName: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined;
    },
    message: `${fieldName} is required`,
  }),

  minLength: (length: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => value.length >= length,
    message: `${fieldName} must be at least ${length} characters`,
  }),

  maxLength: (length: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => value.length <= length,
    message: `${fieldName} must be no more than ${length} characters`,
  }),

  riskScore: (): ValidationRule => ({
    validate: (value: number) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 10;
    },
    message: 'Risk score must be between 0 and 10',
  }),

  confidence: (): ValidationRule => ({
    validate: (value: number) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 1;
    },
    message: 'Confidence must be between 0 and 1',
  }),

  latitude: (): ValidationRule => ({
    validate: (value: number) => {
      const num = Number(value);
      return !isNaN(num) && num >= -90 && num <= 90;
    },
    message: 'Latitude must be between -90 and 90',
  }),

  longitude: (): ValidationRule => ({
    validate: (value: number) => {
      const num = Number(value);
      return !isNaN(num) && num >= -180 && num <= 180;
    },
    message: 'Longitude must be between -180 and 180',
  }),

  positiveNumber: (fieldName: string): ValidationRule => ({
    validate: (value: number) => {
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    },
    message: `${fieldName} must be a positive number`,
  }),

  email: (): ValidationRule => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message: 'Please enter a valid email address',
  }),

  url: (): ValidationRule => ({
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Please enter a valid URL',
  }),
};

/**
 * Validate a value against multiple rules
 */
export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  if (!isFeatureEnabled('realTimeValidation')) {
    return { isValid: true };
  }

  for (const rule of rules) {
    if (!rule.validate(value)) {
      return {
        isValid: false,
        error: rule.message,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate multiple fields
 */
export function validateForm(fields: Record<string, { value: any; rules: ValidationRule[] }>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, { value, rules }] of Object.entries(fields)) {
    const result = validateField(value, rules);
    if (!result.isValid) {
      errors[fieldName] = result.error || 'Invalid value';
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Event-specific validation
 */
export const EVENT_VALIDATORS = {
  title: [
    VALIDATION_RULES.required('Title'),
    VALIDATION_RULES.minLength(3, 'Title'),
    VALIDATION_RULES.maxLength(200, 'Title'),
  ],

  summary: [
    VALIDATION_RULES.required('Summary'),
    VALIDATION_RULES.minLength(10, 'Summary'),
  ],

  category: [
    VALIDATION_RULES.required('Category'),
  ],

  severity: [
    VALIDATION_RULES.required('Severity'),
  ],

  location: [
    VALIDATION_RULES.required('Location'),
  ],

  country: [
    VALIDATION_RULES.required('Country'),
  ],
};

/**
 * AI Analysis-specific validation
 */
export const ANALYSIS_VALIDATORS = {
  riskScore: [
    VALIDATION_RULES.required('Risk Score'),
    VALIDATION_RULES.riskScore(),
  ],

  confidence: [
    VALIDATION_RULES.required('Confidence'),
    VALIDATION_RULES.confidence(),
  ],

  primaryCategory: [
    VALIDATION_RULES.required('Primary Risk Category'),
  ],

  latitude: [
    VALIDATION_RULES.latitude(),
  ],

  longitude: [
    VALIDATION_RULES.longitude(),
  ],

  impactRadius: [
    VALIDATION_RULES.positiveNumber('Impact Radius'),
  ],

  affectedPopulation: [
    VALIDATION_RULES.positiveNumber('Affected Population'),
  ],
};
