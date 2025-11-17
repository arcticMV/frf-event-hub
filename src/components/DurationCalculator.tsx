'use client';

/**
 * Duration Calculator Component
 *
 * Calculates event duration from start/end dates.
 * Shows ongoing status and elapsed time.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Timeline as OngoingIcon,
} from '@mui/icons-material';
import { calculateDuration, getDurationFromNow, isOngoing } from '@/lib/dateParser';
import { isFeatureEnabled } from '@/lib/featureFlags';

export interface DurationCalculatorProps {
  startDate: string;      // datetime-local format
  endDate?: string;       // datetime-local format
  isOngoing?: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange?: (value: string) => void;
  onIsOngoingChange?: (value: boolean) => void;
  disabled?: boolean;
  showOngoingToggle?: boolean;
}

export default function DurationCalculator({
  startDate,
  endDate,
  isOngoing: isOngoingProp = false,
  onStartDateChange,
  onEndDateChange,
  onIsOngoingChange,
  disabled = false,
  showOngoingToggle = true,
}: DurationCalculatorProps) {
  const [calculatedDuration, setCalculatedDuration] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<string>('');
  const [eventIsOngoing, setEventIsOngoing] = useState(isOngoingProp);

  const enabled = isFeatureEnabled('durationCalculator');

  // Update ongoing status
  useEffect(() => {
    setEventIsOngoing(isOngoingProp);
  }, [isOngoingProp]);

  // Calculate duration when dates change
  useEffect(() => {
    if (!enabled || !startDate) {
      setCalculatedDuration('');
      return;
    }

    try {
      const start = new Date(startDate);
      const now = new Date();

      // If event hasn't started yet
      if (start > now) {
        setCalculatedDuration('Event not started yet');
        setElapsedTime('');
        return;
      }

      // If event has ended
      if (endDate) {
        const end = new Date(endDate);
        const duration = calculateDuration(start, end);
        setCalculatedDuration(`Duration: ${duration.humanReadable}`);
        setElapsedTime(`Ended ${getDurationFromNow(end)}`);
      }
      // If event is ongoing
      else if (eventIsOngoing || isOngoing(start)) {
        const duration = calculateDuration(start, now);
        setCalculatedDuration(`Ongoing for: ${duration.humanReadable}`);
        setElapsedTime(`Started ${getDurationFromNow(start)}`);
      }
      // If event has start date but no end date and not marked as ongoing
      else {
        setCalculatedDuration('');
        setElapsedTime(`Started ${getDurationFromNow(start)}`);
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
      setCalculatedDuration('');
    }
  }, [startDate, endDate, eventIsOngoing, enabled]);

  // Update elapsed time every minute
  useEffect(() => {
    if (!enabled || !eventIsOngoing) return;

    const timer = setInterval(() => {
      if (startDate) {
        const start = new Date(startDate);
        const now = new Date();
        if (start <= now) {
          const duration = calculateDuration(start, now);
          setCalculatedDuration(`Ongoing for: ${duration.humanReadable}`);
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [startDate, eventIsOngoing, enabled]);

  // Handle "Mark as Ended" quick action
  const handleMarkAsEnded = () => {
    const now = new Date().toISOString().slice(0, 16);
    if (onEndDateChange) {
      onEndDateChange(now);
    }
    if (onIsOngoingChange) {
      onIsOngoingChange(false);
    }
    setEventIsOngoing(false);
  };

  if (!enabled) {
    // Fallback to basic datetime inputs
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          type="datetime-local"
          label="Event Start"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          disabled={disabled}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        {onEndDateChange && (
          <TextField
            type="datetime-local"
            label="Event End (Optional)"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={disabled}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Start Date */}
      <TextField
        type="datetime-local"
        label="Event Start"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        disabled={disabled}
        fullWidth
        InputLabelProps={{ shrink: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <TimeIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Ongoing Toggle */}
      {showOngoingToggle && onIsOngoingChange && (
        <FormControlLabel
          control={
            <Switch
              checked={eventIsOngoing}
              onChange={(e) => {
                const ongoing = e.target.checked;
                onIsOngoingChange(ongoing);
                setEventIsOngoing(ongoing);
                // Clear end date if marking as ongoing
                if (ongoing && onEndDateChange) {
                  onEndDateChange('');
                }
              }}
              disabled={disabled}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <OngoingIcon fontSize="small" />
              <Typography variant="body2">Event is ongoing</Typography>
            </Box>
          }
        />
      )}

      {/* End Date (only show if not ongoing) */}
      {!eventIsOngoing && onEndDateChange && (
        <TextField
          type="datetime-local"
          label="Event End (Optional)"
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value)}
          disabled={disabled}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TimeIcon />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* Duration Display */}
      {calculatedDuration && (
        <Alert
          severity={eventIsOngoing ? 'info' : 'success'}
          icon={eventIsOngoing ? <OngoingIcon /> : <TimeIcon />}
          sx={{ py: 0.5 }}
          action={
            eventIsOngoing && onEndDateChange ? (
              <Chip
                size="small"
                label="Mark as Ended"
                onClick={handleMarkAsEnded}
                disabled={disabled}
                sx={{ fontSize: '0.75rem' }}
              />
            ) : undefined
          }
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {calculatedDuration}
            </Typography>
            {elapsedTime && (
              <Typography variant="caption" color="text.secondary">
                {elapsedTime}
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
}
