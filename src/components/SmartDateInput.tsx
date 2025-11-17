'use client';

/**
 * Smart Date Input Component
 *
 * Provides natural language date parsing alongside standard datetime input.
 * Users can type "tomorrow 3pm" or use the datetime picker.
 */

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { parseNaturalDate, formatDateForDisplay } from '@/lib/dateParser';
import { isFeatureEnabled } from '@/lib/featureFlags';

export interface SmartDateInputProps {
  value: string;                    // datetime-local format (YYYY-MM-DDTHH:mm)
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function SmartDateInput({
  value,
  onChange,
  label = 'Date & Time',
  required = false,
  error = false,
  helperText,
  disabled = false,
  fullWidth = true,
}: SmartDateInputProps) {
  const [naturalInput, setNaturalInput] = useState('');
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const enabled = isFeatureEnabled('smartDateParser');

  // Handle natural language input
  const handleNaturalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setNaturalInput(input);
    setParseSuccess(null);
    setParseError(null);

    if (!input.trim()) {
      return;
    }

    // Try to parse
    const parsed = parseNaturalDate(input);
    if (parsed) {
      onChange(parsed.formatted);
      setParseSuccess(`Parsed as: ${formatDateForDisplay(parsed.date)} (${parsed.parsedAs})`);

      // Clear natural input after 1 second
      setTimeout(() => {
        setNaturalInput('');
        setParseSuccess(null);
      }, 1500);
    } else {
      setParseError('Could not parse date. Try "tomorrow 3pm", "in 2 hours", or "Jan 17 2025"');
    }
  };

  // Clear both inputs
  const handleClear = () => {
    onChange('');
    setNaturalInput('');
    setParseSuccess(null);
    setParseError(null);
  };

  // Quick preset buttons
  const presets = [
    { label: 'Now', fn: () => new Date() },
    { label: '1h ago', fn: () => new Date(Date.now() - 60 * 60 * 1000) },
    { label: 'Tomorrow', fn: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    }},
  ];

  const handlePreset = (fn: () => Date) => {
    const date = fn();
    const formatted = date.toISOString().slice(0, 16);
    onChange(formatted);
  };

  if (!enabled) {
    // Fallback to standard datetime input
    return (
      <TextField
        type="datetime-local"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
        fullWidth={fullWidth}
        InputLabelProps={{ shrink: true }}
      />
    );
  }

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* Standard datetime input */}
      <TextField
        type="datetime-local"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
        fullWidth={fullWidth}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: value && !disabled ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
      />

      {/* Natural language input */}
      <Box sx={{ mt: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder='Or type: "tomorrow 3pm", "in 2 hours", "Jan 17 2025"'
          value={naturalInput}
          onChange={handleNaturalInputChange}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Quick presets */}
        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {presets.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              size="small"
              onClick={() => handlePreset(preset.fn)}
              disabled={disabled}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>

        {/* Parse success message */}
        {parseSuccess && (
          <Alert severity="success" sx={{ mt: 1, py: 0 }}>
            <Typography variant="caption">{parseSuccess}</Typography>
          </Alert>
        )}

        {/* Parse error message */}
        {parseError && (
          <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
            <Typography variant="caption">{parseError}</Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
}
