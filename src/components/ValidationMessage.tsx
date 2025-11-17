'use client';

/**
 * Validation Message Component
 *
 * Displays field-level validation errors with clear visual feedback.
 */

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export interface ValidationMessageProps {
  error?: string;
  warning?: string;
  info?: string;
  show?: boolean;
}

export default function ValidationMessage({
  error,
  warning,
  info,
  show = true,
}: ValidationMessageProps) {
  if (!show || (!error && !warning && !info)) {
    return null;
  }

  if (error) {
    return (
      <Typography
        variant="caption"
        color="error"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <ErrorIcon sx={{ fontSize: 14 }} />
        {error}
      </Typography>
    );
  }

  if (warning) {
    return (
      <Typography
        variant="caption"
        color="warning.main"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <WarningIcon sx={{ fontSize: 14 }} />
        {warning}
      </Typography>
    );
  }

  if (info) {
    return (
      <Typography
        variant="caption"
        color="info.main"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <InfoIcon sx={{ fontSize: 14 }} />
        {info}
      </Typography>
    );
  }

  return null;
}

/**
 * Form-level validation summary
 */
export interface ValidationSummaryProps {
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export function ValidationSummary({ errors, warnings }: ValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;
  const warningCount = warnings ? Object.keys(warnings).length : 0;

  if (errorCount === 0 && warningCount === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      {errorCount > 0 && (
        <Alert severity="error" sx={{ mb: 1 }}>
          <AlertTitle>Please fix the following errors:</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <strong>{field}:</strong> {message}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {warningCount > 0 && warnings && (
        <Alert severity="warning">
          <AlertTitle>Warnings:</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(warnings).map(([field, message]) => (
              <li key={field}>
                <strong>{field}:</strong> {message}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
}
