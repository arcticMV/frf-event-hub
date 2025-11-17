/**
 * Form Autosave Hook
 *
 * Automatically saves form data to localStorage to prevent data loss.
 * Restores drafts on page reload.
 */

import { useEffect, useCallback, useState } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';

const AUTOSAVE_INTERVAL = 5000; // 5 seconds
const DRAFT_KEY_PREFIX = 'frf-draft-';

export interface AutosaveOptions {
  key: string;              // Unique key for this form
  data: any;                // Form data to save
  enabled?: boolean;        // Enable/disable autosave
  interval?: number;        // Save interval in ms
  onRestore?: (data: any) => void;  // Called when draft is restored
}

/**
 * Autosave hook for form data
 */
export function useAutosave({
  key,
  data,
  enabled = true,
  interval = AUTOSAVE_INTERVAL,
  onRestore,
}: AutosaveOptions) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const storageKey = `${DRAFT_KEY_PREFIX}${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    if (!isFeatureEnabled('formAutosave') || !enabled) {
      return;
    }

    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Failed to check for draft:', error);
    }
  }, [storageKey, enabled]);

  // Auto-save data at intervals
  useEffect(() => {
    if (!isFeatureEnabled('formAutosave') || !enabled || !data) {
      return;
    }

    const timer = setInterval(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Failed to autosave:', error);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [storageKey, data, enabled, interval]);

  /**
   * Restore draft from localStorage
   */
  const restoreDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const { data: draftData, timestamp } = JSON.parse(savedDraft);
        if (onRestore) {
          onRestore(draftData);
        }
        setDraftRestored(true);
        setHasDraft(false);
        return { data: draftData, timestamp };
      }
    } catch (error) {
      console.error('Failed to restore draft:', error);
    }
    return null;
  }, [storageKey, onRestore]);

  /**
   * Clear saved draft
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setDraftRestored(false);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [storageKey]);

  /**
   * Discard draft without restoring
   */
  const discardDraft = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  return {
    hasDraft,
    draftRestored,
    restoreDraft,
    clearDraft,
    discardDraft,
  };
}

/**
 * Component to show draft restoration prompt
 */
export interface DraftPromptProps {
  hasDraft: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  draftTimestamp?: string;
}
