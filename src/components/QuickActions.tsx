'use client';

/**
 * Quick Actions Component
 *
 * Provides combined actions like "Approve & Next", "Verify & Next", etc.
 * Speeds up workflow by combining multiple steps.
 */

import React from 'react';
import {
  Button,
  ButtonGroup,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  NavigateNext as NextIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  FastForward as FastForwardIcon,
} from '@mui/icons-material';
import { isFeatureEnabled } from '@/lib/featureFlags';

export interface QuickActionsProps {
  // Primary actions
  onSave?: () => Promise<void> | void;
  onSaveAndClose?: () => Promise<void> | void;
  onApprove?: () => Promise<void> | void;
  onApproveAndNext?: () => Promise<void> | void;
  onVerify?: () => Promise<void> | void;
  onVerifyAndNext?: () => Promise<void> | void;
  onClose?: () => void;

  // State
  loading?: boolean;
  disabled?: boolean;

  // Display options
  variant?: 'staging' | 'analysis' | 'verified' | 'generic';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export default function QuickActions({
  onSave,
  onSaveAndClose,
  onApprove,
  onApproveAndNext,
  onVerify,
  onVerifyAndNext,
  onClose,
  loading = false,
  disabled = false,
  variant = 'generic',
  size = 'medium',
  fullWidth = false,
}: QuickActionsProps) {
  const enabled = isFeatureEnabled('quickActions');

  const [executing, setExecuting] = React.useState(false);

  const handleAction = async (action: () => Promise<void> | void) => {
    if (disabled || loading || executing) return;

    setExecuting(true);
    try {
      await action();
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setExecuting(false);
    }
  };

  const isLoading = loading || executing;

  // Fallback to basic buttons if feature disabled
  if (!enabled) {
    return (
      <ButtonGroup size={size} fullWidth={fullWidth}>
        {onClose && (
          <Button onClick={onClose} disabled={disabled}>
            Cancel
          </Button>
        )}
        {onSave && (
          <Button
            variant="contained"
            onClick={() => handleAction(onSave)}
            disabled={disabled || isLoading}
          >
            {isLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
            Save
          </Button>
        )}
      </ButtonGroup>
    );
  }

  // Staging variant - Approve actions
  if (variant === 'staging') {
    return (
      <ButtonGroup size={size} fullWidth={fullWidth} variant="contained">
        {onApprove && (
          <Tooltip title="Approve this event">
            <Button
              onClick={() => handleAction(onApprove)}
              disabled={disabled || isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <ApproveIcon />}
              sx={{ flex: onApproveAndNext ? 1 : 2 }}
            >
              Approve
            </Button>
          </Tooltip>
        )}
        {onApproveAndNext && (
          <Tooltip title="Approve this event and move to the next one">
            <Button
              onClick={() => handleAction(onApproveAndNext)}
              disabled={disabled || isLoading}
              endIcon={<NextIcon />}
              sx={{ flex: 2 }}
            >
              Approve & Next
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    );
  }

  // Analysis variant - Verify actions
  if (variant === 'analysis') {
    return (
      <ButtonGroup size={size} fullWidth={fullWidth} variant="contained">
        {onVerify && (
          <Tooltip title="Verify this event">
            <Button
              onClick={() => handleAction(onVerify)}
              disabled={disabled || isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <ApproveIcon />}
              sx={{ flex: onVerifyAndNext ? 1 : 2 }}
            >
              Verify
            </Button>
          </Tooltip>
        )}
        {onVerifyAndNext && (
          <Tooltip title="Verify this event and move to the next one">
            <Button
              onClick={() => handleAction(onVerifyAndNext)}
              disabled={disabled || isLoading}
              endIcon={<NextIcon />}
              sx={{ flex: 2 }}
            >
              Verify & Next
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    );
  }

  // Generic variant - Save/Close actions
  return (
    <ButtonGroup size={size} fullWidth={fullWidth}>
      {onClose && (
        <Button
          onClick={onClose}
          disabled={disabled || isLoading}
          startIcon={<CloseIcon />}
          sx={{ flex: 1 }}
        >
          Cancel
        </Button>
      )}
      {onSave && (
        <Tooltip title="Save changes (Ctrl/Cmd+S)">
          <Button
            variant="outlined"
            onClick={() => handleAction(onSave)}
            disabled={disabled || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{ flex: 1 }}
          >
            Save
          </Button>
        </Tooltip>
      )}
      {onSaveAndClose && (
        <Tooltip title="Save and close (Ctrl/Cmd+Enter)">
          <Button
            variant="contained"
            onClick={() => handleAction(onSaveAndClose)}
            disabled={disabled || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <FastForwardIcon />}
            sx={{ flex: 2 }}
          >
            Save & Close
          </Button>
        </Tooltip>
      )}
    </ButtonGroup>
  );
}

/**
 * Quick action helper - navigate to next item in array
 */
export function getNextItem<T>(items: T[], currentId: string, getId: (item: T) => string): T | null {
  const currentIndex = items.findIndex(item => getId(item) === currentId);
  if (currentIndex === -1 || currentIndex >= items.length - 1) {
    return null;
  }
  return items[currentIndex + 1];
}

/**
 * Quick action helper - navigate to previous item in array
 */
export function getPreviousItem<T>(items: T[], currentId: string, getId: (item: T) => string): T | null {
  const currentIndex = items.findIndex(item => getId(item) === currentId);
  if (currentIndex <= 0) {
    return null;
  }
  return items[currentIndex - 1];
}
